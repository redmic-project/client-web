define([
	"app/designs/textSearchFacetsList/main/Platform"
	, "app/base/views/extensions/_EditionWizardView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	PlatformMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
){
	return declare([PlatformMain, _EditionWizardView], {
		// summary:
		// 	Vista de Platform.
		// description:
		// 	Muestra la información.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.platformAdd,
				target: redmicConfig.services.platform,
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
								href: this.viewPaths.platformEdit
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.platformDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
