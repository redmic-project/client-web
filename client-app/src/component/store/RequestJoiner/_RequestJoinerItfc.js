define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Itfc"
], function(
	declare
	, lang
	, _Itfc
) {

	return declare(_Itfc, {
		//	summary:
		//		Interfaz de RequestJoiner.
		//	description:
		//		Define los métodos que debe poseer la implementación.


		_getMethodsToImplement: function() {

			return lang.mixin(this.inherited(arguments), {
				"_onNewRequest": {},
				"_parseDataByTarget": {},
				"_expandQueryWithPreviousResponse": {},
				"_getRequestAction": {},
				"_checkRequestsCanBeParallel": {},
				"_getQueryObjForParallelRequests": {},
				"_getQueryObjForSequentialRequests": {}
			});
		}
	});
});
