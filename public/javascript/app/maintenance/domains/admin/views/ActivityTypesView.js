define([
	"app/base/views/extensions/_EditionView"
	, "app/base/views/extensions/_FormInDialogView"
	, "app/designs/textSearchFacetsList/main/Domain"
	, 'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ActivityTypeList"
], function(
	_EditionView
	, _FormInDialogView
	, DomainMain
	, redmicConfig
	, declare
	, lang
	, templateList
){
	return declare([DomainMain, _EditionView, _FormInDialogView], {
		// summary:
		// 	Vista de ActivityType.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				listButtonsEdition: [{
					icon: "fa-edit",
					btnId: "edit",
					title: "edit",
					option: "default"
				}],
				title: this.i18n.activityType,
				target: this.services.activityType
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				template: "maintenance/domains/admin/views/templates/forms/ActivityTypes"
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				template: templateList,
				orderConfig: {
					options: [
						{value: "name"},
						{value: "activityField.name", label: this.i18n.activityField}/*,
						{value: "updated"}*/
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.activityType
			}, this.facetsConfig || {}]);
		}
	});
});
