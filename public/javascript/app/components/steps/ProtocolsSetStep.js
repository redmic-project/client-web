define([
	'app/base/views/extensions/_EditionFormList'
	, 'app/components/steps/_RememberDeleteItems'
	, 'app/designs/formList/layout/Layout'
	, 'app/designs/formList/main/FormListByStep'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ProtocolsSet'
], function (
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
		//		Step de ServiceOGC.

		constructor: function(args) {

			this.config = {
				// WizardStep params
				label: this.i18n.protocols,
				title: this.i18n.protocolsAssociated,

				// General params
				propToRead: 'protocols',
				_createFormInitial: false,

				ownChannel: 'protocolsSetStep'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserConfig: {
					template: TemplateList
				}
			}, this.browserConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_PROPERTY_SCHEMA', {
				key: this.propToRead + '/{i}'
			});
		},

		_onGotPropertySchema: function(subSchema) {

			this.formConfig = this._merge([{
				modelSchema: subSchema,
				template: 'maintenance/views/templates/forms/Protocols'
			}, this.formConfig || {}]);

			this._createForm();

			this._emitEvt('SHOW_FORM', {
				node: this.formNode
			});
		}
	});
});
