define([
	"app/components/steps/_DateRelationData"
	, "app/components/steps/_DataListAndSaveRelationData"
	, "app/components/steps/RelationDataSetStep"
	, "app/components/steps/PreLoadMainDataStep"
	, "app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/edition/views/dataLoader/_BaseLoadDataToActivityEdition"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/layout/wizard/_CompleteBySelection"
	, "templates/AnimalList"
	, "templates/PlatformList"
], function(
	_DateRelationData
	, _DataListAndSaveRelationData
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
	, Pagination
	, _CompleteBySelection
	, animalList
	, platformList
){
	return declare([_BaseLoadDataToActivityEdition], {
		//	summary:
		//		Edición para la carga de datos de actividades de categoría TR.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				_clearStepsByErrorTask: ["loadFile", "relationData"],
				primaryTitleAdd: this.i18n.addLoadDataMobileToActivity,
				primaryTitleLoad: this.i18n.loadDataToActivity,
				secondaryTitleLoad: "{name}",
				target: "activityTracking",
				serviceSocket: "tracking"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.currentStep = "selectElement";
			this.steps = {
				selectElement: {
					definition:declare([Layout, Controller, _AddFilter, _CompleteBySelection]),
					props: {
						browserExts: [_Select],
						label: this.i18n.selectElement,
						title: this.i18n.selectElement,
						idProperty: 'uuid',
						_newAdditionalData: function(res) {

							var activityCategory = res.activityCategory;

							if (activityCategory === "at") {
								this.target = redmicConfig.services.animal;
								template = animalList;
							} else if (activityCategory === "pt"){
								this.target = redmicConfig.services.platform;
								template = platformList;
							}

							this._publish(this.browser.getChannel('UPDATE_TEMPLATE'), {
								template: template
							});

							this._emitEvt('UPDATE_TARGET', {
								target: this.target
							});

							this._emitEvt('REFRESH');
						},
						browserConfig: {
							template: animalList,
							bars: [{
								instance: Pagination
							}]
						}
					},
					getNextStepId: "loadFile"
				},
				loadFile: {
					definition: PreLoadMainDataStep
				},
				relationData: {
					definition: declare([RelationDataSetStep, _DataListAndSaveRelationData, _DateRelationData])
				}
			};
		},

		_loadModeConfig: function() {

			this.currentStep = "loadFile";
			delete this.steps.selectElement;

			this.inherited(arguments);
		},

		_pathVariableIdIsObject: function() {

			this._data = {
				uuid: this.pathVariableId[this.idProperty]
			};

			this._emitShowForm();
		},

		_createObjInitializeTask: function(results) {

			var element;

			if (results.selectElement) {
				element = results.selectElement;
			} else if (this._data && this._data.uuid) {
				element = this._data.uuid;
			}

			return {
				parameters: {
					activityId: this.pathVariableId.activityid,
					elementUuid: element,
					fileName: results.loadFile.fileName,
					delimiter: results.loadFile.separator
				}
			};
		},

		_updateTitle: function(data) {

			this._publish(this.editor.getChannel("SET_PROPS"), {
				title: {
					primary: this.titleWizard.primary,
					secondary: lang.replace(this.titleWizard.secondary, data)
				}
			});
		}
	});
});
