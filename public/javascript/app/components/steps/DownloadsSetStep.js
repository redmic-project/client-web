define([
	'app/base/views/extensions/_EditionFormList'
	, 'app/components/steps/_RememberDeleteItems'
	, 'app/designs/formList/layout/Layout'
	, 'app/designs/formList/main/FormListByStep'
	, 'app/maintenance/models/DownloadsServiceOGCModel'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/DownloadsSet'
], function (
	_EditionFormList
	, _RememberDeleteItems
	, Layout
	, Controller
	, modelSchema
	, declare
	, lang
	, TemplateList
) {

	return declare([Layout, Controller, _EditionFormList, _RememberDeleteItems], {
		//	summary:
		//		Step de ServiceOGC.

		constructor: function (args) {

			this.config = {
				label: this.i18n.downloads,
				title: this.i18n.downloadsAssociated,

				propToRead: 'downloads',

				ownChannel: 'downloadsSetStep'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelSchema: modelSchema,
				template: 'maintenance/views/templates/forms/Downloads'
			}, this.formConfig || {}]);
		}
	});
});
