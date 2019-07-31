define([
	"app/base/views/extensions/_EditionWizardView"
	, "app/base/views/extensions/_FormInDialogView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	_EditionWizardView
	, _FormInDialogView
	, redmicConfig
	, declare
	, lang
	, aspect
){
	return declare([_EditionWizardView, _FormInDialogView], {
		//	summary:
		//		Extensión para las vistas de edición de datos relativos a capas.
		//	description:
		//		Añade funcionalidades de edición a la vista.
		//		Ha de declararse junto con una extensión que aporte los métodos
		//		en los que se apoya.

		constructor: function(args) {

			this.config = {
				editionLayerEvents: {
					UPDATE: "update"
				},
				editionLayerActions: {}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixEditionLayerEventsAndActions));
			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setEditionLayerConfigurations));
		},

		_setEditionLayerConfigurations: function() {

			this.formConfig = this._merge([{
				template: "maintenance/views/templates/forms/CategoryLayer",
				modelTarget: redmicConfig.services.atlasCategoryEdition
			}, this.formConfig || {}]);

			this.listButtonsEdition = [{
				groupId: "edition",
				icons:[{
					icon: "fa-refresh",
					btnId: "update",
					title: "update",
					returnItem: true,
					option: "default",
					condition: "urlSource"
				},{
					icon: "fa-edit",
					btnId: "edit",
					title: "edit",
					href: this.viewPaths.serviceOGCEdit,
					option: "default",
					condition: "urlSource"
				},{
					icon: "fa-edit",
					btnId: "categoryEdit",
					title: "edit",
					returnItem: true,
					option: "default",
					condition: this._checkItemIsCategory
				},{
					icon: "fa-trash-o",
					btnId: "remove",
					title: "remove",
					returnItem: true
				}]
			}];
		},

		_mixEditionLayerEventsAndActions: function() {

			lang.mixin(this.events, this.editionLayerEvents);
			lang.mixin(this.actions, this.editionLayerActions);

			delete this.editionLayerEvents;
			delete this.editionLayerActions;
		},

		_defineEditionSubscriptions: function () {

			this.inherited(arguments);

			if (this.editor) {
				this.subscriptionsConfig.push({
					channel: this.editor.getChannel("SUBMITTED"),
					callback: "_subSubmitted"
				});
			}
		},

		_defineEditionPublications: function() {

			this.inherited(arguments);

			if (this.editor) {
				this.publicationsConfig.push({
					event: 'SAVED',
					channel: this.editor.getChannel("SAVED")
				},{
					event: 'SHOW_FORM',
					channel: this.editor.getChannel("SHOW")
				});
			}
		},

		_setEditionOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('UPDATE', lang.hitch(this, this._updateElement));
		},

		_updateElement: function(layer) {

			var layerName = layer.name,
				layerSource = layer.urlSource,
				target = lang.replace(redmicConfig.services.atlasLayerRefresh, layer);

			var data = {
				urlSource: layerSource,
				name: layerName
			};

			this._emitEvt('SAVE', {
				target: target,
				data: data,
				idInTarget: true
			});
		},

		_subRemoved: function(res) {

			this._emitEvt('REFRESH');
		},

		_checkItemIsCategory: function(item) {

			return !item.urlSource;
		},

		_removeCallback: function(evt) {

			var item = evt.item,
				itemId = item.id,
				target;

			if (itemId.indexOf('category') !== -1) {
				target = redmicConfig.services.atlasCategoryEdition;
			} else {
				target = redmicConfig.services.atlasLayerEdition;
			}

			this._emitEvt('REMOVE', {
				target: target,
				id: itemId
			});
		},

		_updateCallback: function(evt) {

			var layer = evt.item;
			this._emitEvt('UPDATE', layer);
		},

		_categoryEditCallback: function(res) {

			var category = res.item;

			this._emitEvt('SHOW_FORM', {
				data: category,
				node: this._getNodeForForm()
			});
		},

		_getNodeForForm: function() {

			return this.domNode;
		},

		_subSubmitted: function(res) {

			if (res.error) {
				return;
			}

			var data = res.data,
				itemId = data[this.idProperty],
				target = redmicConfig.services.atlasCategoryEdition + '/' + itemId;

			delete data[this.idProperty];

			this._emitEvt('LOADING', {
				global: true
			});

			this._emitEvt('SAVE', {
				target: target,
				data: data,
				idInTarget: true
			});
		},

		_subSaved: function(result) {

			this._emitEvt('LOADED');
 			this._emitEvt('REFRESH');

 			var savedObj = this._getSavedObjToPublish ? this._getSavedObjToPublish(result) : result;

 			this._emitEvt('SAVED', savedObj);
		}
	});
});
