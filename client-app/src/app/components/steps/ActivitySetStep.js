define([
	'app/designs/doubleList/main/textSearchAndDoubleList'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ActivityList'
], function (
	Main
	, redmicConfig
	, declare
	, lang
	, templateList
) {

	return declare(Main, {
		//	summary:
		//		Step de ServiceOGC.

		constructor: function(args) {

			this.config = {
				// WizardStep params
				label: this.i18n.activities,
				title: this.i18n.activities,
				title2: this.i18n.activitiesSelected,

				labelAttr: 'activity',

				// General params
				target: redmicConfig.services.activity,

				ownChannel: 'activitySetStep'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserLeftConfig = this._merge([{
				browserConfig: {
					template: templateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: 'info',
								href: redmicConfig.viewPaths.activityDetails
							},{
								icon: 'fa-arrow-right',
								btnId: 'addItem',
								classIcon: 'blueIcon',
								returnItem: true
							}]
						}
					}
				}
			}, this.browserLeftConfig || {}]);

			this.browserRightConfig = this._merge([{
				browserConfig:{
					template: templateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-trash-o',
								btnId: 'remove',
								callback: '_removeItem',
								classIcon: 'redIcon',
								returnItem: true
							},{
								icon: 'fa-info-circle',
								btnId: 'details',
								title: 'info',
								href: redmicConfig.viewPaths.activityDetails
							}]
						}
					}
				}
			}, this.browserRightConfig || {}]);
		}
	});
});
