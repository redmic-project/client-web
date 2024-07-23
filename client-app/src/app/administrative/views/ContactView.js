define([
	"app/designs/textSearchFacetsList/main/Administrative"
	, "app/base/views/extensions/_EditionWizardView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ContactList"
], function(
	AdministrativeMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, ContactListTemplate
){
	return declare([AdministrativeMain, _EditionWizardView], {
		// summary:
		// 	Vista de Contact.
		// description:
		// 	Muestra la información.

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.contact,
				title: this.i18n.contacts,
				addPath: this.viewPaths.contactAdd,
				perms: null
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: ContactListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.contactEdit
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.contactDetails
						}]
					}
				},
				orderConfig: {
					options: [
						{value: "id"},
						{value: "firstName"},
						{value: "surname"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.contact
			}, this.facetsConfig || {}]);
		}
	});
});
