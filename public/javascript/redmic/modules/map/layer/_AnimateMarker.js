define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector/put'
], function(
	declare
	, lang
	, put
){
	return declare(null, {
		//	summary:
		//		Extensión de MapLayer para añada animación.

		constructor: function(args) {

			this.config = {
				animatedMarkerClass: 'animated',
				markerAnimationClass: 'bounce'
			};

			lang.mixin(this, this.config, args);
		},

		_animateMarker: function(req) {

			var markerId = req.markerId,
				marker = this._getMarkerById(markerId),
				markerIcon = marker && marker._icon;

			if (markerIcon) {
				this._initAnimateMarker(markerIcon);

				return true;
			}
		},

		_initAnimateMarker: function(markerIcon) {

			var animationClasses = '.' + this.animatedMarkerClass + '.' + this.markerAnimationClass,
				animatedContainer = put(markerIcon.parentNode, 'div' + animationClasses);

			put(animatedContainer, markerIcon);

			animatedContainer.addEventListener('animationend', lang.hitch(this, function(icon, container) {

				delete this._markerAnimationHandler;
				put(container.parentNode, icon);
				put('!', container);
			}, markerIcon, animatedContainer), false);
		}
	});
});
