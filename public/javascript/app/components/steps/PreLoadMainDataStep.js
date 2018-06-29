define([
	"app/components/steps/MainDataStep"
	, "app/components/viewCustomization/loadFile/models/LoadFileModel"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	MainDataStep
	, modelSchema
	, declare
	, lang
){
	return declare(MainDataStep, {
		//	summary:
		//		Step de pre-carga de datos.

		constructor: function (args) {

			this.config = {
				modelSchema: modelSchema,
				formTemplate: "components/viewCustomization/loadFile/views/templates/LoadFile",
				target: this.formPreLoadMainDataStep,
				label: this.i18n.loadData,

				ownChannel: "preLoadMainDataStep"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.setDataInitial && this._emitEvt('SET_PROPERTY_VALUE', this.setDataInitial);
		},

		_clearWizardStep: function() {

			this.inherited(arguments);

			this.setDataInitial && this._emitEvt('SET_PROPERTY_VALUE', this.setDataInitial);
		},

		_getNextStepId: function(currentStep, stepResults) {

			return "relationData";
		},

		_instanceDataToResult: function(data) {

		},

		_pubNewStatus: function() {

			this.inherited(arguments);

			this._publish(this._buildChannel(this.statusChannel, this.actions.NEW_STATUS), {
				step: this.stepId,
				status: this.statusStep
			});
		}
	});
});
