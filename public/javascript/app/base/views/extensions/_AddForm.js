define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/form/_CreateInternalKeypad"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/_ListenModelHasChanged"

	, "./_AddFormItfc"
], function (
	declare
	, lang
	, aspect
	, _CreateInternalKeypad
	, FormContainerImpl
	, _ListenModelHasChanged

	, _AddFormItfc
){
	return declare(_AddFormItfc, {
		//	summary:
		//		Extensión para añadir formulario a las vistas

		constructor: function (args) {

			this.config = {
				formEvents: {
					ENABLE_BUTTON: "enableButton",
					DISABLE_BUTTON: "disableButton",
					SHOW_FORM: "showForm",
					SET_DATA: "setData",
					SUBMIT: "submit",
					SAVED: "saved"
				},
				formActions: {},
				propsToClean: ["id"]
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setFormConfigurations));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixFormEventsAndActions));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeForm));

			aspect.after(this, "_createForm", lang.hitch(this, this._afterCreateForm));
			aspect.after(this, "_createFormSubscriptions", lang.hitch(this, this._addFormSubscriptions));
			aspect.after(this, "_createFormPublications", lang.hitch(this, this._addFormPublications));
		},

		_mixFormEventsAndActions: function () {

			lang.mixin(this.events, this.formEvents);
			lang.mixin(this.actions, this.formActions);

			delete this.formEvents;
			delete this.formActions;
		},

		_setFormConfigurations: function() {

			this.formConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty
			}, this.formConfig || {}]);
		},

		_initializeForm: function() {

			this.formDefinition = this._createFormDefinition();
		},

		_createFormDefinition: function() {

			return declare([FormContainerImpl, _ListenModelHasChanged, _CreateInternalKeypad]);
		},

		_createForm: function(formConfig) {

			this._deleteForm();

			this.form = new this.formDefinition(this._merge([this.formConfig || {}, formConfig || {}]));

			this._createFormSubscriptions();
			this._createFormPublications();
		},

		_deleteForm: function() {

			if (this._formSubscriptions) {
				this._removeSubscriptions(this._formSubscriptions);
			}

			if (this._formPublications) {
				this._removePublications(this._formPublications);
			}

			if (this.form) {
				this._publish(this.form.getChannel("HIDE"));
				this._publish(this.form.getChannel("DISCONNECT"));

				delete this.form;
			}
		},

		_createFormSubscriptions: function() {

			this._formSubscriptions = this._setSubscriptions([{
				channel : this.form.getChannel("SUBMITTED"),
				callback: "_subFormSubmitted"
			},{
				channel : this.form.getChannel("GOT_IS_VALID_STATUS"),
				callback: "_subFormStatus"
			},{
				channel: this.form.getChannel("CANCELLED"),
				callback: "_subFormCancelled"
			},{
				channel: this.form.getChannel('RESETTED'),
				callback: "_subFormResetted"
			},{
				channel: this.form.getChannel('HIDDEN'),
				callback: "_subFormHidden"
			}]);
		},

		_createFormPublications: function() {

			var publications = [{
				event: 'SHOW_FORM',
				channel: this.form.getChannel("SHOW")
			},{
				event: 'SET_DATA',
				channel: this.form.getChannel("SET_DATA")
			},{
				event: 'SUBMIT',
				channel: this.form.getChannel("SUBMIT")
			},{
				event: 'SAVED',
				channel: this.form.getChannel("SAVED")
			}];

			if (this.form.actions.ENABLE_BUTTON) {
				publications.push({
					event: 'ENABLE_BUTTON',
					channel: this.form.getChannel("ENABLE_BUTTON")
				},{
					event: 'DISABLE_BUTTON',
					channel: this.form.getChannel("DISABLE_BUTTON")
				});
			}

			this._formPublications = this._setPublications(publications);
		},

		_subFormSubmitted: function(response) {

			this._formSubmitted(response);
		},

		_subFormCancelled: function(response) {

			this._formCancelled(response);
		},

		_subFormStatus: function(response) {

			this._formStatus(response);
		},

		_subFormResetted: function(response) {

			this._formResetted(response);
		},

		_subFormHidden: function(response) {

			this._formHidden(response);
		}
	});
});
