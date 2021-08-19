define([
	"app/designs/textSearchFacetsList/main/Domain"
	, "app/base/views/extensions/_EditionWizardView"
	, 'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ParameterList"
], function(
	DomainMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, templateList
){
	return declare([DomainMain, _EditionWizardView], {
		// summary:
		// 	Vista de Parameter.
		// description:
		// 	Muestra la información.

		// config: Object
		// 	Opciones y asignaciones por defecto.
		// title: String
		// 	Título de la vista.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.parameterAdd,
				target: this.services.parameter,
				title: this.i18n.parameter
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.parameterEdit
							}]
						}]
					}
				},
				orderConfig: {
					options: [
						{value: "name"},
						{value: "acronym"},
						{value: "parameterType.name", label: this.i18n.parameterType}/*,
						{value: "updated"}*/
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.parameter
			}, this.facetsConfig || {}]);
		}
	});
});
