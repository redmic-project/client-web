define([
	"app/base/views/_View"
	, "app/components/steps/MainDataStep"
	, "app/components/steps/MapSelectAreaStep"
	, "app/components/steps/ProtocolsSetStep"
	, "app/components/steps/ReorderLayerStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_View
	, MainDataStep
	, MapSelectAreaStep
	, ProtocolsSetStep
	, ReorderLayerStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Vista de edición de.
		//	description:
		//		Muestra el wizard para la edición de
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.serviceOGC,
				propsToClean: ["id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newServiceOGC,
				editionTitle: {
					primary: this.i18n.editServiceOGC,
					secondary: "{title}"
				},
				modelTarget: this.target,
				steps: [{
					definition: MainDataStep,
					props: {
						formTemplate: "maintenance/views/templates/forms/ServiceOGC",
						label: this.i18n.info
					}
				},{
					definition: MapSelectAreaStep,
					props: {
						target: redmicConfig.services.serviceOGC,
						propertyName: "latLonBoundsImage",
						skippable: true,
						label: this.i18n.layerImage
					}
				},{
					definition: ReorderLayerStep,
					props: {
						label: this.i18n.categorizeLayer,
						propertyName: "parent",
						browserConfig: {
							draggableItemIds: [parseInt(this.pathVariableId, 10)]
						}
					}
				},{
					definition: ProtocolsSetStep,
					props: {
						propertyName: 'protocols'
					}
				}]
			}, this.editorConfig || {}]);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_onMeOrAncestorShown: function(req) {

			if (this.editor.checkChildChannel("_stepInstances.2")) {
				this._publish(this.editor.getChildChannel("_stepInstances.2.browser", "UPDATE_DRAGGABLE_ITEMS"), {
					items: [parseInt(this.pathVariableId, 10)]
				});
			}
		}
	});
});
