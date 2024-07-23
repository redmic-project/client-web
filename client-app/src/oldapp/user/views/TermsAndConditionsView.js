define([
	'app/user/views/_ExternalUserBaseView'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/text!./templates/TermsAndConditions.html'
], function(
	_ExternalUserBaseView
	, declare
	, lang
	, template
) {

	return declare(_ExternalUserBaseView, {
		//	summary:
		//		Vista de TermsAndConditions
		//
		//	description:
		//		Permite ver los términos y condiciones de la plataforma

		constructor: function(args) {
			this.config = {
				templateProps: {
					templateString: template,
					i18n: this.i18n,
					_onCloseTermCondition: this._onCloseTermCondition
				},
				ownChannel: 'termsAndConditions'
			};

			lang.mixin(this, this.config, args);
		},

		_onCloseTermCondition: function(/*event*/ evt) {
			// summary:
			//		Función cierra la vista que muestra los términos y condiciones de redmic.
			//
			//	tags:
			//		callback private
			//

			window.history.go(-1);
		}
	});
});
