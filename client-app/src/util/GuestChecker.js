define([
	'alertify/alertify.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/i18n!app/nls/translation"
	, "src/util/Credentials"
], function(
	alertify
	, declare
	, lang
	, i18n
	, Credentials
){
	var obj = declare(null, {
		//	summary:
		//		Comprobador del usuario, para saber si es invitado o registrado.
		//	description:
		//		Muestra avisos y demás enfocados a los usuarios invitados.

		//	guestRole: String
		//		Nombre del rol que identifica a los invitados.
		guestRole: "ROLE_GUEST",

		//	banIcon: String
		//		Icono de prohibición que acompaña al mensaje.
		banIcon: '<i class="fa fa-ban fa-2x iconBanAlertify"></i>',

		//	banMessage: String
		//		Mensaje de prohibición para los invitados.
		banMessageDocument: '<span class="verticalAlignAlertify">' + i18n.banGuestMessageDocument +
			'<a href="/register"> ' + i18n.registerAuthFailed + ' </a>' + i18n.banGuestMessageDocument2 +
			'<a href="/terms-and-conditions"> ' + i18n.useCondition + ' </a></span>',

		banMessage: '<span class="verticalAlignAlertify">' + i18n.banGuestMessage +
			'<a href="/register"> ' + i18n.registerAuthFailed + ' </a>' + i18n.banGuestMessage2 +
			'<a href="/terms-and-conditions"> ' + i18n.useCondition + ' </a></span>',

		title: i18n.titleAlert,

		constructor: function(args) {

		},

		protectURLFromGuests: function(/*string*/ url) {
			//	summary:
			//		Si el usuario es invitado, cambia su comportamiento.
			//	url:
			//		URL a controlar.

			if (Credentials.userIsGuest()) {
				alertify.alert(this.title, this.banIcon + this.banMessageDocument);
			} else {
				globalThis.open(url + '?access_token=' + Credentials.get("accessToken"),'_blank');
			}
		},

		protectFromGuests: function() {
			//	summary:
			//		Si el usuario es invitado, cambia su comportamiento.
			//

			var userIsGuest = Credentials.userIsGuest();
			if (userIsGuest) {
				alertify.alert(this.title, this.banIcon + this.banMessage);
			}
			return !userIsGuest;
		}

	});

	return new obj();
});
