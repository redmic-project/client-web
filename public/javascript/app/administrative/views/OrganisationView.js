define([
	"app/designs/textSearchFacetsList/main/Organisation"
	, "app/base/views/extensions/_EditionWizardView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	OrganisationMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
){
	return declare([OrganisationMain, _EditionWizardView], {
		// summary:
		// 	Vista de Organisation.
		// description:
		// 	Muestra la información.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.organisationAdd,
				target: redmicConfig.services.organisation,
				perms: null
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.organisationEdit
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.organisationDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
