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
				},

				_editionGroupId: 'edition'
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixEditionEventsAndActions));
			aspect.after(this, "_afterSetConfigurations",	lang.hitch(this, this._addListButtonsEdition));
			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._setEditionOwnCallbacksForEvents));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineEditionSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineEditionPublications));
		},

		_addListButtonsEdition: function() {

			var browserRowButtons = this._getBrowserButtons(),
				buttons;

			if (browserRowButtons && browserRowButtons.length) {
				buttons = this._mergeInEditionButtons(browserRowButtons);
			} else {
				buttons = lang.clone(this.listButtonsEdition);
			}

			this._setBrowserButtons(buttons);
			delete this.listButtonsEdition;
		},

		_mergeInEditionButtons: function(browserRowButtons) {

			var findIndexCallback = lang.hitch(this, function(button) {

				return button.groupId && button.groupId === this._editionGroupId;
			});

			var rowButtonIndex = browserRowButtons.findIndex(findIndexCallback);

			if (rowButtonIndex !== -1) {
				var rowButtonEditionGroup = browserRowButtons[rowButtonIndex];

				var editionButtonIndex = this.listButtonsEdition.findIndex(findIndexCallback);

				if (editionButtonIndex !== -1) {
					var editionButtonEditionGroup = this.listButtonsEdition[editionButtonIndex];

					rowButtonEditionGroup.icons = rowButtonEditionGroup.icons.concat(editionButtonEditionGroup.icons);
					this.listButtonsEdition.splice(editionButtonIndex, 1);
				}
			} else if (this.listButtonsEdition.length) {
				browserRowButtons = browserRowButtons.concat(this.listButtonsEdition);
			}

			return browserRowButtons;
		},

		_getBrowserButtons: function() {

			var browserConfig = this._getBrowserConfig(),
				rowConfig = browserConfig && browserConfig.rowConfig,
				buttonsConfig = rowConfig && rowConfig.buttonsConfig,
				buttonsList = buttonsConfig && buttonsConfig.listButton;

			if (buttonsList) {
				return buttonsList;
			}

			return [];
		},

		_getBrowserConfig: function() {

			return this.browserConfig;
		},

		_setBrowserConfig: function(browserConfig) {

			this.browserConfig = browserConfig;
		},

		_setBrowserButtons: function(listButton) {

			if (!this.browserConfig || !this.browserConfig.rowConfig || !this.browserConfig.rowConfig.buttonsConfig) {
				console.warn('Tried to add edition buttons to browser row config, but base config was not found!');
				return;
			}

			this.browserConfig.rowConfig.buttonsConfig.listButton = listButton;
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
