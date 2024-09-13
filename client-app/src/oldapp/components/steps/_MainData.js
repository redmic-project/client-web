define([
	"app/base/views/extensions/_AddForm"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
], function (
	_AddForm
	, ContentPane
	, declare
	, lang
	, aspect
	, _Module
	, _Show
){
	return declare([_Module, _Show, ContentPane, _AddForm], {
		//	summary:
		//		Step

		constructor: function (args) {

			this.config = {
				// WizardStep params
				idProperty: "id"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setMainDataConfigurations));
		},

		_setMainDataConfigurations: function() {

			this.formConfig = this._merge([{
				validCompleteModel: false
			}, this.formConfig || {}]);
		},

		_doFlush: function() {

			this._emitEvt('SUBMIT');
		},

		_formSubmitted: function(res) {

			var obj = {
				step: this.stepId,
				results: null,
				status: true
			};

			if (res.data) {
				this._results = res.data;
				obj.results = (this.getStepResults && this.getStepResults()) || this._results;
			} else if (res.error) {
				obj.status = false;
				obj.error = res.error;
			}

			this._emitEvt('FLUSH', obj);
		},

		_formStatus: function(status) {

			this._isCompleted = status.isValid;

			this._results = true;

			this._emitEvt('REFRESH_STATUS');
		},

		_instanceDataToResult: function(data) {

			!this.modelChannel && this._emitEvt('SET_DATA', {
				data: data/*,
				onlyInputForm: true*/
			});
		},

		getNodeToShow: function() {

			return this.containerNode;
		},

		_resetStep: function(initialData) {

			this._publish(this.form.getChannel("RESET"));
		},

		_clearStep: function() {

			this._publish(this.form.getChannel("CLEAR"));
		}
	});
});
