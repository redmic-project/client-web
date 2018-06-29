define([
	"app/designs/textSearchFacetsList/main/Administrative"
	, "app/base/views/extensions/_EditionWizardView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/AnimalList"
], function(
	AdministrativeMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, AnimalListTemplate
){
	return declare([AdministrativeMain, _EditionWizardView], {
		// summary:
		// 		Vista de animal.
		// description:
		// 	Muestra la información.

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.animal,
				title: this.i18n.animals,
				addPath: this.viewPaths.animalAdd,
				perms: null
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: AnimalListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.animalEdit
							}]
						}/*,{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.animalDetails
						}*/]
					}
				},
				orderConfig: {
					options: [
						{value: "name"},
						{value: "scientificName"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: {
					"sex": {
						'open': true,
						"terms": {
							"field": "sex.name",
							"size": 20
						}
					},
					"lifeStage": {
						'open': true,
						"terms": {
							"field": "lifeStage.name",
							"size": 20
						}
					}
				}
			}, this.facetsConfig || {}]);
		}
	});
});