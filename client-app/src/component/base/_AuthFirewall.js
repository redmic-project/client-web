define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/util/Credentials"
	, "src/util/GuestChecker"
], function(
	declare
	, lang
	, aspect
	, Credentials
	, GuestChecker
){
	return declare(null, {
		//	summary:
		//		Extension de _Module.
		//	description:
		//

		constructor: function(args) {

			aspect.before(this, "_setSubscription", lang.hitch(this, this._setSubscriptionChecker));
			aspect.before(this, "_setPublication", lang.hitch(this, this._setPublicationChecker));
		},

		_setSubscriptionChecker: function(subscription) {

			// TODO esta manera de bloquear acciones a los invitados es un poco chapucera, por ahora se permite
			// pasar a 'destroy', pero habrá que replantearlo para hacerlo bien
			if (Credentials.get("userRole") === "ROLE_GUEST" &&
				subscription.channel.indexOf(this.ownChannel) !== -1 &&
				subscription.channel.indexOf('destroy') === -1) {

				subscription.callback = "_subAuthFailed";
			}

			return [subscription];
		},

		_setPublicationChecker: function(publication) {

			if (Credentials.get("userRole") === "ROLE_GUEST") {
				publication.callback = "_pubAuthFailed";
			}

			return [publication];
		},

		_subAuthFailed: function() {

			GuestChecker.protectFromGuests();
		},

		_pubAuthFailed: function() {

		}
	});
});
