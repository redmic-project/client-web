define([
	'app/designs/textSearchFacetsList/main/Administrative'
	, 'app/base/views/extensions/_EditionWizardView'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/DeviceList'
], function(
	AdministrativeMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, templateList
){
	return declare([AdministrativeMain, _EditionWizardView], {
		//	summary:
		//		Vista de Device.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.deviceAdd,
				target: this.services.device,
				title: this.i18n.devices
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: 'edition',
							icons: [{
								icon: 'fa-edit',
								btnId: 'edit',
								title: 'edit',
								option: 'default',
								href: this.viewPaths.deviceEdit
							}]
						}]
					}
				},
				orderConfig: {
					options: [
						{value: 'name'},
						{value: 'model'},
						{value: 'updated'}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.device
			}, this.facetsConfig || {}]);
		}
	});
});
