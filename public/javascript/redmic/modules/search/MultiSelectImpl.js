define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/base/_Store"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "./Search"
], function(
	declare
	, lang
	, aspect
	, put
	, _ShowInTooltip
	, _ShowOnEvt
	, _Store
	, ListMenu
	, Search
){
	return declare([Search, _Store], {
		//	summary:
		//
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		'class': 'multiSelect',

		constructor: function(args) {

			this.config = {
				multiSelectEvents: {
					SHOW_ITEM: "showItemGrid",
					HIDE_ITEM: "hideItemGrid",
					ADD_ITEM: "addItemGrid",
					REMOVE_ITEM: "removeItemGrid",
					CLEAR_ITEMS: "clearItems",
					DESELECT_TOTAL_ITEMS: "deselectTotalItems"
				},
				propertyName: 'multiSelect',
				idProperty: 'id',
				labelAttr: 'name',
				ownChannel: "multiSelectSearch"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setMultiSelectConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeMultiSelect));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixMultiSelectEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineMultiSelectSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineMultiSelectPublications));
		},

		_setMultiSelectConfigurations: function() {

			this.optionConfig = this._merge([{
				parentChannel: this.getChannel(),
				select: {
					'default': {}
				},
				multipleSelected: true,
				hideOnClickItem: false,
				notIndicator: true,
				indicatorLeft: true,
				classTooltip: "tooltipButtonMenu"
			}, this.optionConfig || {}]);
		},

		_initializeMultiSelect: function() {

			this.optionListMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.optionConfig);
		},

		_mixMultiSelectEventsAndActions: function () {

			lang.mixin(this.events, this.multiSelectEvents);

			delete this.multiSelectEvents;
		},

		_defineMultiSelectSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.optionListMenu.getChannel("EVENT_ITEM"),
				callback: "_subListEventItem"
			});
		},

		_defineMultiSelectPublications: function() {

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
				event: "DESELECT_TOTAL_ITEMS",
				channel: this.optionListMenu.getChannel("DESELECT_TOTAL_ITEMS")
			});
		},

		postCreate: function() {

			this._emitRequestMultiSelect();

			this.inherited(arguments);

			this.iconNode = put(this.domNode, 'div');
			put(this.iconNode, 'i.fa.fa-list-ul');
			put(this.iconNode, 'i.fa.fa-angle-down');
		},

		_emitRequestMultiSelect: function() {

			this._emitEvt('REQUEST', {
				target: this._getTarget(),
				method: "POST",
				requesterId: this.getOwnChannel()
			});
		},

		_beforeShow: function() {

			this._publish(this.optionListMenu.getChannel("ADD_EVT"), {
				sourceNode: this.iconNode
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_dataAvailable: function(res) {

			this._emitEvt('CLEAR_ITEMS');

			var data = res.data;

			if (data && data.data) {
				data = data.data;
			}

			for (var i= 0; i < data.length; i++) {
				var item = data[i],
					obj = {
						item: {
							label: item[this.labelAttr],
							value: item[this.idProperty]
						}
					};

				this._emitEvt('ADD_ITEM', obj);
			}
		},

		_reset: function() {

			this._emitEvt('DESELECT_TOTAL_ITEMS', obj);

			this._status(null);
		},

		_subListEventItem: function(res) {

			var obj = res.selection.length ? res.selection : null;

			this._newSearch(obj);

			this._status(obj);
		},

		_status: function(obj) {

			if (obj) {
				put(this.iconNode, '.active');
			} else {
				put(this.iconNode, '!active');
			}
		}
	});
});
