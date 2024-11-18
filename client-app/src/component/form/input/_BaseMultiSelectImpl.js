define([
	'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector'
	, "src/component/base/_Store"
	, "src/component/base/_ShowInTooltip"
	, "src/component/base/_ShowOnEvt"
	, "src/component/form/input/Input"
	, "src/component/layout/listMenu/ListMenu"
], function(
	redmicConfig
	, declare
	, lang
	, aspect
	, put
	, _Store
	, _ShowInTooltip
	, _ShowOnEvt
	, Input
	, ListMenu
){
	return declare([Input, _Store], {
		//	summary:
		//		Implementación de input Select.

		constructor: function(args) {

			this.config = {
				multiSelectEvents: {
					SHOW_ITEM: "showItemGrid",
					HIDE_ITEM: "hideItemGrid",
					ADD_ITEM: "addItemGrid",
					REMOVE_ITEM: "removeItemGrid",
					CLEAR_ITEMS: "clearItems",
					DESELECT_TOTAL_ITEMS: "deselectTotalItems",
					CHANGE_ITEMS: "changeItems",
					SELECT_ITEM: "selectItem"
				},
				_inputProps: {
					labelAttr: "name",
					idProperty: "id"
				},
				propertyName: "name",
				pathSeparator: '.'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setBaseMultiSelectConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeBaseMultiSelect));
			aspect.after(this, "_createNodesAndInstance", this._afterCreateInstance);
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixBaseMultiSelectEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineBaseMultiSelectSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineBaseMultiSelectPublications));
		},

		_setBaseMultiSelectConfigurations: function() {

			this.optionConfig = this._merge([{
				parentChannel: this.getChannel(),
				select: {
					'default': {}
				},
				multipleSelected: true,
				timeClose: 100,
				hideOnClickItem: false,
				classTooltip: "tooltipButtonMenu tooltipButtonChart"
			}, this.optionConfig || {}]);
		},

		_initializeBaseMultiSelect: function() {

			this.optionListMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.optionConfig);

			if (this._inputProps.target) {
				this.target = redmicConfig.services[this._inputProps.target] || this._inputProps.target;
			}

			if (this._inputProps.targetDependence) {
				this.target = redmicConfig.services[this._inputProps.targetDependence];
			}
		},

		_mixBaseMultiSelectEventsAndActions: function () {

			lang.mixin(this.events, this.multiSelectEvents);

			delete this.multiSelectEvents;
		},

		_defineBaseMultiSelectSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.optionListMenu.getChannel("EVENT_ITEM"),
				callback: "_subListEventItem"
			});
		},

		_defineBaseMultiSelectPublications: function() {

			this.publicationsConfig.push({
				event: "SHOW_ITEM",
				channel: this.optionListMenu.getChannel("SHOW_ITEM")
			},{
				event: "HIDE_ITEM",
				channel: this.optionListMenu.getChannel("HIDE_ITEM")
			},{
				event: "ADD_ITEM",
				channel: this.optionListMenu.getChannel("ADD_ITEM")
			},{
				event: "REMOVE_ITEM",
				channel: this.optionListMenu.getChannel("REMOVE_ITEM")
			},{
				event: "CLEAR_ITEMS",
				channel: this.optionListMenu.getChannel("CLEAR_ITEMS")
			},{
				event: "SELECT_ITEM",
				channel: this.optionListMenu.getChannel("SELECT_ITEM")
			},{
				event: "DESELECT_TOTAL_ITEMS",
				channel: this.optionListMenu.getChannel("DESELECT_TOTAL_ITEMS")
			},{
				event: "CHANGE_ITEMS",
				channel: this.optionListMenu.getChannel("CHANGE_ITEMS")
			});
		},

		_createInputInstance: function() {

			put(this.containerInput, '.multiSelect');

			this.contentVisibleNode = put(this.containerInput, 'div.contentClick');

			this._createInputContent();

			this.contentVisibleNode && this._publish(this.optionListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.contentVisibleNode
			});

			return false;
		},

		_createInputContent: function() {

			put(this.contentVisibleNode, 'i.fa.fa-list-ul');
			put(this.contentVisibleNode, 'i.fa.fa-angle-down');
		},

		_afterCreateInstance: function() {

			if (this._optionsPending) {
				this._addItems(this._optionsPending);
				this._optionsPending = null;
			}
		},

		_shown: function() {

			this.propertyNameDependence && this.inherited(arguments);

			this.showLabel();

			if (this._inputProps.target && !this._inputProps.omitRequest && !this._inputProps.targetDependence) {
				this._emitPost();
			}
		},

		_dependenceIdProperty: function(res) {

			if (res.value) {
				this._emitGet(res.value);
			}
		},

		_emitGet: function(value) {

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: value
			});
		},

		_emitPost: function() {

			this._publish(this._buildChannel(this.storeChannel, this.actions.REQUEST), {
				target: this.target,
				method: 'POST',
				requesterId: this.getOwnChannel(),
				action: '_search'
			});
		},

		_valueChanged: function(res) {

			var value = res.value || res[this.propertyName];

			this._emitChanged(value);
		},

		_reset: function() {

			this._status(null);
			this._emitEvt('DESELECT_TOTAL_ITEMS');
		},

		_clear: function() {

			this._status(null);
			this._emitEvt('DESELECT_TOTAL_ITEMS');
		},

		_itemAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target) {
				var propertyPathSplit = this._inputProps.propertyPath.split(this.pathSeparator),
					property = res.data;

				for (var key in propertyPathSplit) {
					property = property[propertyPathSplit[key]];
				}

				this._addItems(property);
			}
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.target === this.target) {
				var data = res.data.data || res.data;

				this._emitEvt('CLEAR_ITEMS');

				this._addItems(data);
			}
		},

		_addItems: function(data) {

		},

		_subListEventItem: function(res) {

			var obj = res.selection;

			this._setValue(obj);

			this._status(obj);
		},

		_setValue: function(value) {

			var obj = {};
			obj[this.propertyName] = value;

			this._emitSetValue(obj);
		},

		_enable: function(obj) {

			this._publish(this.optionListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.contentVisibleNode
			});

			put(this.contentVisibleNode, '!disable');
		},

		_disable: function(obj) {

			this._publish(this.optionListMenu.getChannel("DELETE_EVT"));

			put(this.contentVisibleNode, '.disable');
		},

		_status: function(obj) {

			if (obj && obj.length) {
				put(this.contentVisibleNode, '.active');
			} else {
				put(this.contentVisibleNode, '!active');
			}
		}
	});
});
