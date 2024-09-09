define([
	'src/redmicConfig'
	, 'dijit/_TemplatedMixin'
	, 'dijit/_WidgetBase'
	, 'dijit/_WidgetsInTemplateMixin'
	, 'dijit/layout/ContentPane'
	, 'dojo/text!./templates/ExternalUserBase.html'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/_base/kernel'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'

	, 'dijit/form/Form'
	, 'dijit/form/ValidationTextBox'
	, 'dijit/form/Button'
], function(
	redmicConfig
	, _TemplatedMixin
	, _WidgetBase
	, _WidgetsInTemplateMixin
	, ContentPane
	, baseTemplate
	, declare
	, lang
	, kernel
	, _Module
	, _Show
) {

	return declare([_Module, _Show, ContentPane], {
		//	Summary:
		//		Vista base de aplicación externa
		//
		//	Description:
		//		Permite proporcionar los métodos comunes de las vista register, login, resetting,
		//		termsAndConditions y whatIsRedmic
		//
		//	replaceReg: regExp
		//		Delimitador para reemplazar la plantilla específica dentro de la plantilla base

		'class': 'fWidth fHeight',

		constructor: function (args) {

			this.config = {
				baseTemplateProps: {
					_onShowWhatIsRedmic: lang.hitch(this, this._onShowWhatIsRedmic),
					_getManagerNode: this._getManagerNode,
					_changeLang: this._changeLang
				},
				baseClass: '',
				replaceReg: /\%\[([^\]]+)\]/g,
				whatIsRedmicPath: '/what-is-redmic',
				loginPath: '/login'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			lang.mixin(this.templateProps, this.baseTemplateProps);
			delete this.baseTemplateProps;

			var template = { template : this.templateProps.templateString };

			this.templateProps.templateString = lang.replace(baseTemplate, template, this.replaceReg);

			this.template = new declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], this.templateProps)();

			this.addChild(this.template);

			this._showVersion();

			this.inherited(arguments);
		},

		_showVersion: function() {

			if (this.template.versionNumber) {
				this.template.versionNumber.innerHTML = redmicConfig.getEnvVariableValue('envVersion');
			}
		},

		_changeLang: function(evt) {

			globalThis.location.href = globalThis.location.protocol + '//' + evt.target.dataset.dojoProps + '.' +
				globalThis.location.hostname.replace(kernel.locale + '.', '');
		},

		_onShowWhatIsRedmic: function(event) {
			// summary:
			//		Función que muestra información de redmic.
			//	tags:
			//		callback private

			event.stopPropagation();

			var path = this.whatIsRedmicPath;

			if (globalThis.location.pathname.includes(path)) {
				globalThis.location.href = this.loginPath;
			} else {
				globalThis.location.href = path;
			}
		}
	});
});
