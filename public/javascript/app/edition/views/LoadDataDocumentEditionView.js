define([
	"app/components/steps/RelationDataSetStep"
	, "app/components/steps/PreLoadMainDataStep"
	, "app/edition/views/dataLoader/_BaseLoadDataToActivityEdition"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	RelationDataSetStep
	, PreLoadMainDataStep
	, _BaseLoadDataToActivityEdition
	, declare
	, lang
){
	return declare([_BaseLoadDataToActivityEdition], {
		//	summary:
		//		Edición para la carga de datos de documentos.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				_clearStepsByErrorTask: ["loadFile", "relationData"],
				primaryTitleLoad: this.i18n.loadDocument,
				secondaryTitleLoad: null,
				serviceSocket: "document",
				target: "document"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.currentStep = "loadFile";
			this.steps = {
				loadFile: {
					definition: PreLoadMainDataStep,
					props: {
						setDataInitial: {
							separator: '|'
						}
					}
				},
				relationData: {
					definition: declare([RelationDataSetStep])
				}
			};
		},

		_createObjInitializeTask: function(results) {

			return {
				parameters: {
					fileName: results.loadFile.fileName,
					delimiter: results.loadFile.separator
				}
			};
		},

		_beforeShow: function() {

			this._emitShowForm();

			return this.inherited(arguments);
		}
	});
});
