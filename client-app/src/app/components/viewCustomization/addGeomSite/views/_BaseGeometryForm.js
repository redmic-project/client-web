define([
	"app/components/steps/MainDataStep"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
], function (
	MainDataStep
	, declare
	, lang
	, aspect
	, Deferred
){
	return declare(MainDataStep, {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {

				geometryFormEvents: {
					REFRESH_STATUS: "refreshStatus",
					ADD_LAYER: "addLayer",
					SET_FORM_PROPERTY: "setFormProperty"
				},

				geometryFormActions: {
					FORM_STATUS: "formStatus",
					DATA_TO_RESULT: "dataToResult",
					SUBMIT: "submit",
					SUBMITTED: "submitted",
					CLEAR: "clear",
					RESET: "reset"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setGeometryFormConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeGeometryForm));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineGeometryFormSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineGeometryFormPublications));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixGeometryFormEventsAndActions));
			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setGeometryFormOwnCallbacksForEvents));
		},

		_setGeometryFormConfigurations: function() {

			this.layerImplConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target
			}, this.layerImplConfig || {}]);
		},

		_initializeGeometryForm: function() {

			this.layerImplConfig.mapChannel = this.mapChannel;
		},

		_mixGeometryFormEventsAndActions: function () {

			lang.mixin(this.events, this.geometryFormEvents);
			lang.mixin(this.actions, this.geometryFormActions);
			delete this.geometryFormEvents;
			delete this.geometryFormActions;
		},

		_setGeometryFormOwnCallbacksForEvents: function() {

			//this._onEvt('HIDE', lang.hitch(this, this._afterHide));
		},

		_defineGeometryFormSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.layerImpl.getChannel("DRAGGED"),
				callback: "_subDrawnOrDragged"
			},{
				channel : this.layerImpl.getChannel("DRAWN"),
				callback: "_subDrawnOrDragged"
			},{
				channel : this.form.getChannel("VALUE_CHANGED"),
				callback: "_subFormChanged"
			},{
				channel : this.getChannel("DATA_TO_RESULT"),
				callback: "_subDataToResult"
			},{
				channel: this.getChannel("SUBMIT"),
				callback: "_subSubmit"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			});
		},

		_defineGeometryFormPublications: function () {

			this.publicationsConfig.push({
				event: 'REFRESH_STATUS',
				channel: this.getChannel("FORM_STATUS"),
				callback: "_pubFormStatus"
			},{
				event: 'SET_FORM_PROPERTY',
				channel: this.form.getChannel("SET_PROPERTY_VALUE")
			});
		},

		postCreate: function() {

			this._once(this.form.getChannel("SHOWN"), lang.hitch(this, this._onceFormShown));

			this._emitEvt('ADD_LAYER', {layer: this.layerImpl});

			this.inherited(arguments);
		},

		_beforeShow: function() {

			if (this.formShown) {
				return;
			}

			this.beforeShowDfd = new Deferred();

			return this.beforeShowDfd;
		},

		_onceFormShown: function() {

			this.formShown = true;

			if (this.beforeShowDfd && !this.beforeShowDfd.isFulfilled()) {
				this.beforeShowDfd.resolve();
			}
		},

		_pubFormStatus: function(channel) {

			this._publish(channel, {
				_isCompleted: this._isCompleted
			});
		},

		_subDrawnOrDragged: function(obj) {

		},

		_subFormChanged: function(change) {

			this._formChanged(change);

			if (change.value.length > 2) {
				this._emitEvt("LOADED");
			}
		},

		_subDataToResult: function(res) {

			this._defaultData = res;
		},

		_subSubmit: function(res) {

			this._publish(this.form.getChannel("SUBMIT"));
		},

		_formSubmitted: function(res) {

			if (res.error) {
				var description = "Error";

				if (error && error.description) {
					description = error.description;
				}

				this._emitEvt('COMMUNICATION', {
					level: "error",
					description: description
				});
			} else {

				this._publish(this.getChannel("SUBMITTED"), res);
			}
		},

		_afterHide: function() {

			this._clear();
		},

		_subClear: function() {

			this._clear();
		},

		_clear: function() {

			this._publish(this.form.getChannel("CLEAR"));

			this._publish(this.layerImpl.getChannel("CLEAR"));
		},

		_subReset: function() {

			this._reset();
		},

		_reset: function() {

			this._publish(this.form.getChannel("CLEAR"));
			this._publish(this.layerImpl.getChannel("CLEAR"));

			this._defaultData && this._publish(this.form.getChannel("SET_DATA"), this._defaultData);
		}
	});
});
