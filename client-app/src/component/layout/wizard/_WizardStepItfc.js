define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Itfc"
], function(
	declare
	, lang
	, _Itfc
){
	return declare(_Itfc, {
		//	summary:
		//		Interfaz de _WizardStep.
		//	description:
		//		Define los métodos que debe poseer el módulo o la implementación.

		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_onNewResults": {},
				"_onRefreshTrace": {},
				"_instanceDataToResult": {},
				"_getNextStepId": {},
				"_getPrevStepId": {},
				"_beforeGoingNextStep": {},
				"_resetStep" : {},
				"_clearStep" : {},
				"isStepCompleted": {},
				"getStepResults": {},
				"_newAdditionalData": {},
				"_gotIdProperty": {},
				"_valueChanged": {},
				"_onGotPropertySchema": {}
			});
		}
	});
});
