define([
	"app/base/views/extensions/_EditionLayerCategoryView"
	, "app/base/views/extensions/_EditionLayerView"
	, "app/designs/textSearchList/main/ServiceOGC"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_HierarchicalDragAndDrop"
], function (
	_EditionLayerCategoryView
	, _EditionLayerView
	, ServiceOGCMain
	, redmicConfig
	, declare
	, lang
	, _HierarchicalDragAndDrop
){
	return declare([ServiceOGCMain, _EditionLayerView, _EditionLayerCategoryView], {
		//	summary:
		//		Step de categorización de capas. Permite anidar y mover entre categorías,
		//		así como crear nuevas categorias.

		constructor: function (args) {

			this.config = {
				_items: {},
				browserExts: [_HierarchicalDragAndDrop],
				listButtonsEdition: [],
				target: redmicConfig.services.serviceOGC,
				actions: {
					DESERIALIZE: "deserialize"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				idProperty: "id",
				selectorChannel: this.getChannel(),
				selectionTarget: this.getChannel(),
				initialDataSave: true,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: redmicConfig.viewPaths.serviceOGCCatalogDetails,
							condition: "url"
						}]
					}
				},
				noSeeSelect: true
			}, this.browserConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.browser.getChannel("REFRESHED"),
				callback: "_subBrowserRefreshed"
			},{
				channel : this.browser.getChannel("DRAG_AND_DROP"),
				callback: "_subDragAndDrop"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.DESERIALIZE),
				callback: "_subDeserialize"
			});
		},

		_subBrowserRefreshed: function(res) {

			this._browserRefreshed();
		},

		_subDragAndDrop: function(res) {

			this._addOrDeleteItem(res);

			this._emitChangeResults(this._results);
		},

		_addOrDeleteItem: function(res) {

			var draggedItem = res.item,
				itemId = draggedItem.id,
				parentId = draggedItem.parentId || null;

			if (this._items[itemId]) {
				delete this._items[itemId];
			} else {
				this._items[itemId] = parentId;
			}

			this._convertItemsInArray();
		},

		_convertItemsInArray: function() {

			this._results = [];

			for (var key in this._items) {

				this._results.push({
					id: parseInt(key, 10),
					parent: this._items[key]
				});
			}
		},

		_emitChangeResults: function(value) {

			if (this.propertyName) {
				var obj = {};
				obj[this.propertyName] = value;

				this._emitEvt('SET_PROPERTY_VALUE', obj);
			} else {
				this._emitEvt('REFRESH_STATUS');
			}
		},

		_subDeserialize: function(res) {

			this._instanceDataToResult(res.data);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		},

		_browserRefreshed: function(obj) {

		},

		_instanceDataToResult: function(data) {

		},

		_resetStep: function() {

			this._restoreToInitialStatus();
		},

		_clearStep: function() {

			this._restoreToInitialStatus();
		},

		_restoreToInitialStatus: function() {

			this._publish(this.browser.getChannel("REFRESH"), {
				initData: true
			});

			this._results = [];
			this._items = {};

			this._isCompleted = false;
		}
	});
});
