define([
	"app/designs/details/main/Contact"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	Contact
	, redmicConfig
	, declare
	, lang
){
	return declare(Contact, {
		//	summary:
		//

		_setConfigurations: function() {

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.contactEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.contact;
		}
	});
});
