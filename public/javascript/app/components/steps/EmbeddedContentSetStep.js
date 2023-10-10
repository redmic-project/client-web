define([
	'app/base/views/extensions/_EditionFormList'
	, 'app/components/steps/_RememberDeleteItems'
	, 'app/designs/formList/layout/Layout'
	, 'app/designs/formList/main/FormListByStep'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/EmbeddedContentSet'
], function(
	_EditionFormList
	, _RememberDeleteItems
	, Layout
	, Controller
	, declare
	, lang
	, TemplateList
) {

	return declare([Layout, Controller, _EditionFormList, _RememberDeleteItems], {
		//	summary:
		//		Step de ActivityEmbeddedContent.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.activityEmbeddedContents,
				title: this.i18n.associatedEmbeddedContents,

				propToRead: 'embeddedContents',

				ownChannel: 'embeddedContentSetStep'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList
				}
			}, this.browserConfig || {}]);

			this._once(this._buildChannel(this.modelChannel, 'gotPropertySchema'), lang.hitch(this, function(res) {

				this.formConfig = this._merge([{
					modelSchema: res.schema,
					template: 'administrative/views/templates/forms/ActivityEmbeddedContent'
				}, this.formConfig || {}]);
			}));

			this._publish(this._buildChannel(this.modelChannel, 'getPropertySchema'), {
				key: 'embeddedContents/{i}'
			});
		}
	});
});
