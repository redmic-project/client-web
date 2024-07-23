define([
	"app/base/views/extensions/_EditionFormList"
	, "app/components/steps/_RememberDeleteItems"
	, "app/designs/formList/layout/Layout"
	, "app/designs/formList/main/FormListByStep"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "templates/CalibrationList"
], function (
	_EditionFormList
	, _RememberDeleteItems
	, Layout
	, Controller
	, redmicConfig
	, declare
	, lang
	, Deferred
	, TemplateList
){
	return declare([Layout, Controller, _EditionFormList, _RememberDeleteItems], {
		//	summary:
		//		Step de Calibration.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.calibrations,
				title: this.i18n.calibrationsAssociated,

				// General params
				items: {
					contact: {
						target: redmicConfig.services.contact,
						required: false
					}
				},
				propToRead: "calibrations",

				ownChannel: "calibrationSetStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-trash",
								btnId: "remove",
								callback: "_removeItem"
							}]
						}
					}
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelTarget: redmicConfig.services.calibration,
				template: "administrative/views/templates/forms/Calibration"
			}, this.formConfig || {}]);
		}
	});
});
