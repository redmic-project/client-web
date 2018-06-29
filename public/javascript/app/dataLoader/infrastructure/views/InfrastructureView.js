define([
	"app/dataLoader/base/_GeographicBase"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "templates/InfrastructureList"
	, "templates/InfrastructurePopup"
], function(
	_GeographicBase
	, redmicConfig
	, declare
	, lang
	, aspect
	, ListTemplate
	, PopupTemplate
){
	return declare([_GeographicBase], {
		//	summary:
		//		Base de vistas de gestión de datos cargados en infraestructuras para una actividad concreta.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				title: this.i18n.infrastructure,

				replaceTarget: redmicConfig.services.infrastructureByActivity,

				addPath: redmicConfig.viewPaths.activityGeoDataAdd,
				editPath: redmicConfig.viewPaths.activityGeoDataEdit,
				loadPath: redmicConfig.viewPaths.activityGeoDataLoad,
				attributesPath: redmicConfig.viewPaths.activityInfrastructureAttributes,

				popupTemplate: PopupTemplate,
				listTemplate: ListTemplate,
				activityCategory: ["if"],

				ownChannel: "infractructure"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-map-marker",
							title: "map centering",
							btnId: "mapCentering",
							returnItem: true
						},{
							icon: "fa-table",
							btnId: "attributes",
							title: "attributes",
							href: this.attributesPath
						},{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.editPath
							}/*,{
								icon: "fa-upload",
								btnId: "load",
								title: "load",
								href: this.loadPath
							}*/]
						}]
					}
				}
			}, this.browserConfig || {}]);
		},

		_replaceVariablesInTargetAndPaths: function() {

			this.inherited(arguments);

			this.attributesPath = this._replaceVariablesInStringWithItem(this.attributesPath);
		}
	});
});
