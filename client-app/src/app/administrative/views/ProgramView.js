define([
	"app/designs/textSearchFacetsList/main/Program"
	, "app/base/views/extensions/_EditionWizardView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	ProgramMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
){
	return declare([ProgramMain, _EditionWizardView], {
		// summary:
		// 	Vista de Program.
		// description:
		// 	Muestra la información.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.programAdd,
				target: redmicConfig.services.program,
				perms: null,
				idProperty: "id"
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
								href: this.viewPaths.programEdit
							},{
								icon: "fa-copy",
								btnId: "copy",
								title: "copy",
								href: this.viewPaths.programAdd
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.programDetails
						},{
							icon: "fa-briefcase",
							btnId: "goToChildren",
							title: "projects",
							href: this.viewPaths.programProject
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);
		}
	});
});
