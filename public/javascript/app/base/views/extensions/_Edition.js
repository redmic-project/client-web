define([
	'alertify/alertify.min'
	, "app/base/views/extensions/_EditionCommons"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	alertify
	, _EditionCommons
	, declare
	, lang
	, aspect
){
	return declare(_EditionCommons, {
		//	summary:
		//		Extensión para las vistas de edición de datos.
		//	description:
		//		Añade funcionalidades de edición a la vista.
		//		Ha de declararse junto con una extensión que aporte un formulario.

		constructor: function(args) {

			this.config = {
				editionViewEvents: {
					ADD: "add",
					EDIT: "edit",
					COPY: "copy",
					SHOW_FORM: "showForm"
				},
				editionViewActions: {
					UPDATE_TARGET_FORM: "updateTargetForm"
				}
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixEditionEventsAndActions));
			aspect.before(this, "_afterSetConfigurations",	lang.hitch(this, this._addListButtonsEdition));
			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._setEditionOwnCallbacksForEvents));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineEditionSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineEditionPublications));
		},

		_addListButtonsEdition: function() {

			if (this._existListButton()) {
				for (var i = (this._getListButton().length - 1); i >= 0; i--) {
					for (var s = (this.listButtonsEdition.length - 1); s >= 0; s--) {
						if (this._getListButton()[i].groupId == this.listButtonsEdition[s].groupId) {
							for (var k = (this.listButtonsEdition[s].icons.length - 1); k >= 0; k--) {
								this._getListButton()[i].icons.unshift(this.listButtonsEdition[s].icons[k]);
							}

							this.listButtonsEdition.splice(s, 1);
						}
					}
				}

				for (var n = (this.listButtonsEdition.length - 1); n >= 0; n--) {
					this._getListButton().unshift(this.listButtonsEdition[n]);
				}
			} else {
				this._setListButton(lang.clone(this.listButtonsEdition));
			}

			delete this.listButtonsEdition;
		},

		_existListButton: function() {

			var browserConfig = this._getBrowserConfig();

			if (browserConfig && browserConfig.rowConfig && browserConfig.rowConfig.buttonsConfig &&
				browserConfig.rowConfig.buttonsConfig.listButton) {
				return true;
			}

			return null;
		},

		_getListButton: function() {

			return this._getBrowserConfig().rowConfig.buttonsConfig.listButton;
		},

		_getBrowserConfig: function() {

			return this.browserConfig;
		},

		_setBrowserConfig: function(browserConfig) {

			this.browserConfig = browserConfig;
		},

		_setListButton: function(listButton) {

			this._setBrowserConfig(this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: listButton
					}
				}
			}, this._getBrowserConfig() || {}]));
		},

		_mixEditionEventsAndActions: function() {

			lang.mixin(this.events, this.editionViewEvents);
			lang.mixin(this.actions, this.editionViewActions);

			delete this.editionViewEvents;
			delete this.editionViewActions;
		},

		_defineEditionSubscriptions: function () {

		},

		_defineEditionPublications: function() {

		},

		_setEditionOwnCallbacksForEvents: function() {

			this._onEvt('ADD', lang.hitch(this, this._addElement));
			this._onEvt('EDIT', lang.hitch(this, this._editElement));
			this._onEvt('COPY', lang.hitch(this, this._copyElement));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addEditionButtons && this._addEditionButtons();
		},

		_addNewElementCallback: function() {  // TODO: que el evento del widget (botón, input..) emita directamente

			this._emitEvt('ADD');
		},

		_editCallback: function(evt) {

			this._emitEvt('EDIT', evt);
		},

		_removeCallback: function(evt) {

			alertify.confirm(this.i18n.deleteConfirmationTitle, this.i18n.deleteConfirmationMessage,
				lang.hitch(this, function(idProperty) {

				this._emitEvt('REMOVE', {
					id: idProperty,
					target: this.target
				});
			}, evt[this.idProperty]),
			lang.hitch(this, function() {

				this._emitEvt('COMMUNICATION', {
					description: this.i18n.cancelledAlert
				});
			})).set("labels", {
				ok: this.i18n.ok,
				cancel: this.i18n.cancel
			});
		},

		_copyCallback: function(evt) {

			this._emitEvt('COPY', evt);
		},

		_afterRemoved: function(res) {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		},

		_editElement: function(evt) {

			this._showEditForm("edit", evt[this.idProperty]);
		},

		_copyElement: function(evt) {

			this._showEditForm("copy", evt[this.idProperty]);
		}
	});
});
