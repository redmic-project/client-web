define([
	"app/base/views/extensions/_EditionCommons"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "RWidgets/Utilities"
	, 'redmic/modules/base/_ListenQueryParams'
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Persistence"
	, "redmic/modules/layout/wizard/Wizard"
	, "redmic/modules/layout/wizard/_StepNavigation"
	, "redmic/modules/layout/wizard/_StepBreadcrumbs"
], function(
	_EditionCommons
	, _Controller
	, declare
	, lang
	, aspect
	, Deferred
	, Utilities
	, _ListenQueryParams
	, _Store
	, _Persistence
	, Wizard
	, _StepNavigation
	, _StepBreadcrumbs
) {

	return declare([_Controller, _Store, _Persistence, _ListenQueryParams, _EditionCommons], {
		//	summary:
		//		Controller para vistas de detalle.

		constructor: function(args) {

			this.config = {
				idProperty: "id",
				controllerEvents: {
					SHOW_FORM: "showForm",
					EDITION_SUCCESS: "editionSuccess",
					SAVE: "save",
					SAVED: "saved"
				},
				controllerActions: {
					EDITION_SUCCESS: "editionSuccess",
					CLEAR_SELECTION: "clearSelection"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterShow", this._afterShowController);
		},

		_setControllerConfigurations: function() {

			this.editorConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: "Wizard",
				editionTitle: "Edition wizard"
			}, this.editorConfig || {}]);
		},

		_setControllerOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._hideWizard));
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.editor.getChannel("STEPS_CONFIRMED"),
				callback: "_subWizardCompleted"
			},{
				channel : this.editor.getChannel("SHOWN"),
				callback: "_subWizardShown"
			},{
				channel : this.editor.getChannel("HIDDEN"),
				callback: "_subWizardHidden"
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineControllerPublications: function() {

			this.publicationsConfig.push({
				event: 'SHOW_FORM',
				channel: this.editor.getChannel("SHOW")
			},{
				event: 'EDITION_SUCCESS',
				channel : this.editor.getChannel("HIDE")
			},{
				event: 'EDITION_SUCCESS',
				channel : this.editor.getChannel("CLEAR")
			},{
				event: 'EDITION_SUCCESS',
				channel : this.getChannel("EDITION_SUCCESS")
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_initializeController: function() {

			var WizardDefinition = declare([Wizard, _StepBreadcrumbs]).extend(_StepNavigation);

			this.editor = new WizardDefinition(this.editorConfig);
		},

		_afterShowController: function() {

			if (!this._lastPathVariableId || !Utilities.isEqual(this._lastPathVariableId, this.pathVariableId)) {
				this._processOptionsInit();
			} else {
				this._emitShowForm();
			}
		},

		_processOptionsInit: function() {

			this._lastPathVariableId = this.pathVariableId;

			if (!this.pathVariableId) {
				this._goTo404();
				return;
			}

			if (typeof this.pathVariableId === 'object') {
				this._pathVariableIdIsObject();
			} else {
				this._prepareItemEditionOrCreation(this.pathVariableId);
			}
		},

		_prepareItemEditionOrCreation: function(itemId, urlId) {

			if (itemId === 'new') {
				this._emitEvt('GET_QUERY_PARAMS');
			} else {
				this._emitGet(urlId || itemId);
			}
		},

		_gotQueryParams: function(queryParams) {

			var copySource = queryParams['copy-source'];

			if (copySource) {
				this._emitGet(copySource);
			} else {
				this._emitShowForm();
			}
		},

		_emitGet: function(id) {

			this.defaultTarget = this.target;

			if (this._isEditionAndTargetDifferent()) {
				this.target = this._prepareTargetEdition();
			}

			var obj = {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: id
			};

			if (this.type) {
				obj.type = type;
			}

			this._emitEvt('GET', obj);
		},

		_isEditionAndTargetDifferent: function() {

			if ((this.getOwnChannel().indexOf("/load/") == -1 && this.getOwnChannel().indexOf("/edit/") == -1) ||
				this.editionTarget) {
				return false;
			}

			return true;
		},

		_prepareTargetEdition: function() {

			var alternativeEditionTarget;

			if (this.target instanceof Array) {
				alternativeEditionTarget = this.target[0];
			} else {
				alternativeEditionTarget = this.target;
			}

			if (this.pathVariableId && Object.keys(this.pathVariableId).length > 1) {
				return lang.replace(this.editionTarget || alternativeEditionTarget, this.pathVariableId);
			}

			return this.editionTarget;
		},

		_pathVariableIdIsObject: function() {

			// TODO borrar este seteo, que cambia el target para siempre (efecinquitis) y creo que no es necesario
			//this.target = lang.replace(this.target, this.pathVariableId);

			this._prepareItemEditionOrCreation(this.pathVariableId.id, this.pathVariableId[this.idProperty]);
		},

		_emitShowForm: function(item) {

			var obj = {
				node: this._getNodeForForm()
			};

			if (item) {
				obj.data = item;
			}

			this._emitEvt('SHOW_FORM', obj);
		},

		_itemAvailable: function(response) {

			this.target = this.defaultTarget;

			var item = response.data;

			if (this.getOwnChannel().indexOf('add/') !== -1) {
				this._cleanNotDesiredProps(item);
			}

			this._emitShowForm(item);
		},

		_errorAvailable: function(error) {

			this._goTo404();
		},

		_subWizardCompleted: function(response) {

			this._emitEvt('LOADING', {
				global: true
			});

			this._editionSuccessDfd = new Deferred();

			this._editionSuccessDfd.then(lang.hitch(this, this._emitEvt, 'EDITION_SUCCESS'));

			this._wizardComplete(response);
		},

		_wizardComplete: function(response) {

			this._onEvt('SAVED', this._editionSuccessDfd.resolve);

			this._emitEvt('SAVE', {
				data: response.data,
				target: this.editionTarget || this.target
			});
		},

		_subWizardShown: function(response) {

			this._emitEvt('LOADED');
		},

		_subWizardHidden: function(response) {

			this._wizardHidden(response);
		},

		_wizardHidden: function(response) {

			this._lastPathVariableId = null;

			if (this.popupBody) {
				this._publish(this.getChannel("HIDE"));
			} else {
				window.history.go(-1);
			}
		},

		_hideWizard: function() {


		},

		_getNodeForForm: function() {

			return this.domNode;
		},

		_afterSaved: function(result) {

			this._emitEvt('LOADED');
		}
	});
});
