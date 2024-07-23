define([
	"app/base/views/extensions/_LocalSelectionView"
	, "app/components/steps/_ClassificationsRelationData"
	, "app/components/steps/_DateRelationData"
	, "app/components/steps/_DataListAndSaveRelationData"
	, "app/components/steps/_ParametersRelationData"
	, "app/components/steps/ClassificationsStep"
	, "app/components/steps/RelationDataSetStep"
	, "app/components/steps/PreLoadMainDataStep"
	, "app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/edition/views/dataLoader/_BaseLoadDataToActivityEdition"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/browser/_Select"
	, "src/component/layout/wizard/_CompleteBySelection"
	, "templates/DomainList"
], function(
	_LocalSelectionView
	, _ClassificationsRelationData
	, _DateRelationData
	, _DataListAndSaveRelationData
	, _ParametersRelationData
	, ClassificationsStep
	, RelationDataSetStep
	, PreLoadMainDataStep
	, _AddFilter
	, Controller
	, Layout
	, _BaseLoadDataToActivityEdition
	, redmicConfig
	, declare
	, lang
	, _Select
	, _CompleteBySelection
	, templateList
){
	return declare([_BaseLoadDataToActivityEdition], {
		//	summary:
		//		Edición para la carga de datos de actividades de categoría OC.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				_clearStepsByErrorTask: ["loadFile", "objectGroup", "objectGroups", "relationData"],
				secondaryTitleLoad: "{properties.site.name}",
				serviceSocket: "objectcollectingseries",
				target: "activityObjectCollectingSeriesStations"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.currentStep = "loadFile";
			this.steps = {
				loadFile: {
					definition: PreLoadMainDataStep,
					getNextStepId: "objectGroup"
				},
				objectGroup: {
					definition: declare([Layout, Controller, _AddFilter, _CompleteBySelection]),
					props: {
						idProperty: "path",
						browserExts: [_Select],
						label: this.i18n.objectGroup,
						title: this.i18n.objectGroup,
						target: redmicConfig.services.objectType,
						filterConfig: {
							initQuery: {
								terms: {
									level: 1,
									children: false
								}
							},
							refreshToInit: true
						},
						browserConfig: {
							template: templateList
						}
					},
					getNextStepId: "objectGroups"
				},
				objectGroups: {
					definition: declare([ClassificationsStep, _LocalSelectionView]),
					props: {
						label: this.i18n.objectGroup,
						simpleSelection: false
					},
					getNextStepId: "relationData"
				},
				relationData: {
					definition: declare([RelationDataSetStep, _DataListAndSaveRelationData, _ClassificationsRelationData,
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
