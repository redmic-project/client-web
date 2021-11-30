define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "put-selector/put"
	, "./Toolbar"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, put
	, Toolbar
){
	return declare(Toolbar, {
		//	summary:
		//		Herramienta para elegir los grid de los ejes de las gráficas.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				ownChannel: "gridManagement",

				_addedGrid: {},
				gridManagementEvents: {
					SHOW_HORIZONTAL_GRID_AXIS: "showHorizontalGridAxis",
					SHOW_VERTICAL_GRID_AXIS: "showVerticalGridAxis",
					HIDE_HORIZONTAL_GRID_AXIS: "hideHorizontalGridAxis",
					HIDE_VERTICAL_GRID_AXIS: "hideVerticalGridAxis",
					ADD_ITEM_GRID: "addItemGrid",
					REMOVE_ITEM_GRID: "removeItemGrid",
					SELECT_ITEM_GRID: "selectItemGrid",
					DESELECT_ITEM_GRID: "deselectItemGrid"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixGridSelectionEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineGridSelectionSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineGridSelectionPublications));
		},

		_setConfigurations: function() {

			this.gridSelectionConfig = this._merge([{
				parentChannel: this.getChannel(),
				select: {
					'default': {}
				},
				multipleSelected: true,
				classTooltip: "tooltipButtonMenu"
			}, this.gridSelectionConfig || {}]);
		},

		_mixGridSelectionEventsAndActions: function () {

			lang.mixin(this.events, this.gridManagementEvents);

			delete this.gridManagementEvents;
		},

		_initialize: function() {

			this.gridSelectionListMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.gridSelectionConfig);
		},

		_defineGridSelectionSubscriptions: function() {

			if (!this.getChartsContainerChannel) {
				console.error("ChartsContainer channel not defined for tool '%s'", this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel: this.getChartsContainerChannel("AXIS_DRAWN"),
				callback: "_subAxisDrawn",
				options: {
					predicate: lang.hitch(this, function(res) {

						return this._chkIsGridAxis(res) && !this._chkGridAxisIsAdded(res);
					})
				}
			},{
				channel: this.getChartsContainerChannel("AXIS_CLEARED"),
				callback: "_subAxisCleared",
				options: {
					predicate: lang.hitch(this, function(res) {

						return this._chkIsGridAxis(res) && this._chkGridAxisIsAdded(res);
					})
				}
			},{
				channel: this.getChartsContainerChannel("AXIS_SHOWN"),
				callback: "_subAxisShown",
				options: {
					predicate: lang.hitch(this, this._chkIsGridAxis)
				}
			},{
				channel: this.getChartsContainerChannel("AXIS_HIDDEN"),
				callback: "_subAxisHidden",
				options: {
					predicate: lang.hitch(this, this._chkIsGridAxis)
				}
			},{
				channel : this.gridSelectionListMenu.getChannel("EVENT_ITEM"),
				callback: "_subGridSelectionListEventItem"
			});
		},

		_defineGridSelectionPublications: function() {

			this.publicationsConfig.push({
				event: "SHOW_HORIZONTAL_GRID_AXIS",
				channel: this.getChartsContainerChannel("SHOW_HORIZONTAL_GRID_AXIS")
			},{
				event: "SHOW_VERTICAL_GRID_AXIS",
				channel: this.getChartsContainerChannel("SHOW_VERTICAL_GRID_AXIS")
			},{
				event: "HIDE_HORIZONTAL_GRID_AXIS",
				channel: this.getChartsContainerChannel("HIDE_HORIZONTAL_GRID_AXIS")
			},{
				event: "HIDE_VERTICAL_GRID_AXIS",
				channel: this.getChartsContainerChannel("HIDE_VERTICAL_GRID_AXIS")
			},{
				event: "ADD_ITEM_GRID",
				channel: this.gridSelectionListMenu.getChannel("ADD_ITEM")
			},{
				event: "REMOVE_ITEM_GRID",
				channel: this.gridSelectionListMenu.getChannel("REMOVE_ITEM")
			},{
				event: "SELECT_ITEM_GRID",
				channel: this.gridSelectionListMenu.getChannel("SELECT_ITEM")
			},{
				event: "DESELECT_ITEM_GRID",
				channel: this.gridSelectionListMenu.getChannel("DESELECT_ITEM")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this.gridSelectionListNode = put(this.domNode, "i.icon.fr.fr-grid2[title=" + this.i18n.gridManagement +
				"]");

			this._publish(this.gridSelectionListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.gridSelectionListNode
			});
		},

		_subGridSelectionListEventItem: function(res) {

			var axis = res.axis,
				enabled = res.actionSelect;

			if (!axis) {
				return;
			}

			if (axis.indexOf('vertical') !== -1 || axis.indexOf('radial') !== -1) {
				this._emitEvt(enabled ? 'SHOW_VERTICAL_GRID_AXIS' : 'HIDE_VERTICAL_GRID_AXIS');
			} else if (axis.indexOf('horizontal') !== -1) {
				this._emitEvt(enabled ? 'SHOW_HORIZONTAL_GRID_AXIS' : 'HIDE_HORIZONTAL_GRID_AXIS', {
					param: res.value
				});
			} else if (axis.indexOf('angular') !== -1) {
				this._emitEvt(enabled ? 'SHOW_HORIZONTAL_GRID_AXIS' : 'HIDE_HORIZONTAL_GRID_AXIS');
			}
		},

		_chkGridAxisIsAdded: function(res) {

			return !!this._addedGrid[res.axis];
		},

		_subAxisDrawn: function(res) {

			var axis = res.axis;

			this._addedGrid[axis] = true;

			var param = res.parameterName,
				obj = {
					item: {
						value: param,
						label: Utilities.capitalize(param),
						axis: axis
					}
				};

			if (Object.keys(this._addedGrid).length < 3) {
				obj.select = true;
			} else {
				this._emitEvt('HIDE_HORIZONTAL_GRID_AXIS', {
					param: param
				});
			}

			this._emitEvt('ADD_ITEM_GRID', obj);
		},

		_subAxisCleared: function(res) {

			var axis = res.axis;

			delete this._addedGrid[axis];
			this._emitEvt('REMOVE_ITEM_GRID', {
				valueItem: res.parameterName
			});
		},

		_chkIsGridAxis: function(res) {

			return this._isGridAxis(res.axis);
		},

		_subAxisShown: function(res) {

			this._emitEvt('SELECT_ITEM_GRID', {
				valueItem: res.parameterName
			});
		},

		_subAxisHidden: function(res) {

			this._emitEvt('DESELECT_ITEM_GRID', {
				valueItem: res.parameterName
			});
		},

		_isGridAxis: function(axisName) {

			return axisName.indexOf("Grid") !== -1;
		}
	});
});
