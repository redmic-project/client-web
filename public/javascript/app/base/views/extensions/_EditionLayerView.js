define([
	"app/base/views/extensions/_Edition"
	, "app/base/views/extensions/_FormInDialogView"
	, "app/maintenance/models/CategoryLayerModel"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/store/Persistence"
], function(
	_Edition
	, _FormInDialogView
	, CategoryLayerModel
	, redmicConfig
	, declare
	, lang
	, aspect
	, Persistence
){
	return declare([_Edition, _FormInDialogView], {
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
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeEditionView));
		},

		_setEditionLayerConfigurations: function() {

			this.formConfig = this._merge([{
				template: "maintenance/views/templates/forms/CategoryLayer",
				modelSchema: CategoryLayerModel
			}, this.formConfig || {}]);
		},

		_mixEditionLayerEventsAndActions: function() {

			lang.mixin(this.events, this.editionLayerEvents);
			lang.mixin(this.actions, this.editionLayerActions);

			delete this.editionLayerEvents;
			delete this.editionLayerActions;
		},

		_initializeEditionView: function() {

			this.persistence = new Persistence({
				parentChannel: this.getChannel()
			});
		},

		_defineEditionSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this.persistence.getChannel("REMOVED"),
				callback: "_subRemoved",
				options: {
					predicate: lang.hitch(this, this._chkSuccessful)
				}
			},{
				channel: this.persistence.getChannel("SAVED"),
				callback: "_subSaved",
				options: {
					predicate: lang.hitch(this, this._chkSuccessful)
				}
			});

			if (this.editor) {
				this.subscriptionsConfig.push({
					channel: this.editor.getChannel("SUBMITTED"),
					callback: "_subSubmitted"
				});
			}
		},

		_defineEditionPublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'SAVE',
				channel: this.persistence.getChannel("SAVE")
			});

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

		_updateElement: function(id) {

			var request = {
				'id': id
			};

			this._emitEvt('SAVE', {
				target: redmicConfig.services.serviceOGCRefresh,
				item: request,
				idProperty: this.idProperty
			});
		},

		_subRemoved: function(res) {

			this._emitEvt('REFRESH');
		},

		_checkItemIsCategory: function(item) {

			return !item.urlSource;
		},

		_removeCallback: function(evt) {

			this._emitEvt('REMOVE', evt.id);
		},

		_updateCallback: function(evt) {

			this._emitEvt('UPDATE', evt.id);
		},

		_categoryEditCallback: function(res) {

			this._emitEvt('SHOW_FORM', {
				data: res.item,
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

			var data = res.data;

			this._emitEvt('LOADING', {
				global: true
			});

			this._emitEvt('SAVE', {
				target: redmicConfig.services.serviceOGCCategory,
				item: data,
				idProperty: this.idProperty
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
