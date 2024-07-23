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
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'

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
					_onShowWhatIsRedmic: this._onShowWhatIsRedmic,
					_onCloseWhatIsRedmic: this._onCloseWhatIsRedmic,
					_getManagerNode: this._getManagerNode,
					_changeLang: this._changeLang
				},
				baseClass: '',
				replaceReg: /\%\[([^\]]+)\]/g,
				whatIsRedmicPath: 'what-is-redmic'
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

			window.location.href = window.location.protocol + '//' + evt.target.dataset.dojoProps + '.' +
				window.location.hostname.replace(kernel.locale + '.', '');
		},

		_onShowWhatIsRedmic: function(event) {
			// summary:
			//		Función que muestra información de redmic.
			//		*** Se ejecuta en el ámbito del template
			//
			//	tags:
			//		callback private
			//

			event.stopPropagation();
			var path = 'what-is-redmic';
			if (window.location.href.indexOf(path) < 0) {
				window.location.href = path;
			} else {
				window.history.back();
			}
		},

		_onCloseWhatIsRedmic: function(/*event*/ evt) {
			// summary:
			//		Función que cierra la vista que muestra información de redmic.
			//		*** Se ejecuta en el ámbito del template
			//
			//	tags:
			//		callback private
			//

			setTimeout(lang.hitch(this, function() {
				if (window.location.href.indexOf(this.whatIsRedmicPath) >= 0) {
					window.history.back();
				}
			}), 200);
		}
	});
});
