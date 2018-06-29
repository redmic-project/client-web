define([
	"app/components/steps/_ClassificationsRelationData"
	, "app/components/steps/_DateRelationData"
	, "app/components/steps/_DataListAndSaveRelationData"
	, "app/components/steps/_ParametersRelationData"
	, "app/components/steps/RelationDataSetStep"
	, "app/components/steps/PreLoadMainDataStep"
	, "app/edition/views/dataLoader/_BaseLoadDataToActivityEdition"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_ClassificationsRelationData
	, _DateRelationData
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
		//		Edición para la carga de datos de actividades de categoría AR.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				_clearStepsByErrorTask: ["loadFile", "relationData"],
				primaryTitleAdd: this.i18n.addLoadDataToActivityCategoryAR,
				primaryTitleLoad: this.i18n.addLoadDataToActivityCategoryAR,
				secondaryTitleAdd: "{name}",
				secondaryTitleLoad: "{name}",
				serviceSocket: "area",
				target: "areasByActivity"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.currentStep = "loadFile";
			this.steps = {
				loadFile: {
					definition: PreLoadMainDataStep,
					props: {
						formTemplate: "components/viewCustomization/loadFile/views/templates/ARFile"
					}
				},
				relationData: {
					definition: declare([RelationDataSetStep, _DataListAndSaveRelationData, _ClassificationsRelationData,
						_DateRelationData, _ParametersRelationData])
				}
			};
		},

		_updateTitle: function(data) {

			this._updateTitleInWizard(data);
		},

		_createObjInitializeTask: function(results) {

			return {
				parameters: {
					activityId: this.pathVariableId.activityid,
					fileName: results.loadFile.fileName
				}
			};
		}
	});
});
