define([
	"app/components/steps/_DateRelationData"
	, "app/components/steps/_DataListAndSaveRelationData"
	, "app/components/steps/_ParametersRelationData"
	, "app/components/steps/RelationDataSetStep"
	, "app/components/steps/PreLoadMainDataStep"
	, "app/edition/views/dataLoader/_BaseLoadDataToActivityEdition"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_DateRelationData
	, _DataListAndSaveRelationData
	, _ParametersRelationData
	, RelationDataSetStep
	, PreLoadMainDataStep
	, _BaseLoadDataToActivityEdition
	, declare
	, lang
){
	return declare([_BaseLoadDataToActivityEdition], {
		//	summary:
		//		Edición para la carga de datos de actividades de categoría FT.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				_clearStepsByErrorTask: ["loadFile", "relationData"],
				secondaryTitleLoad: "{properties.site.name}",
				serviceSocket: "timeseries",
				target: "activityTimeSeriesStations"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.currentStep = "loadFile";
			this.steps = {
				loadFile: {
					definition: PreLoadMainDataStep
				},
				relationData: {
					definition: declare([RelationDataSetStep, _DataListAndSaveRelationData,
						_DateRelationData, _ParametersRelationData])
				}
			};
		},

		_createObjInitializeTask: function(results) {

			return {
				parameters: {
					activityId: this.pathVariableId.activityid,
					surveyId: this._data.uuid,
					fileName: results.loadFile.fileName,
					delimiter: results.loadFile.separator
				}
			};
		}
	});
});
