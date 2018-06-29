define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Base de extensiones de MapLayer para dibujar radios en marcadores.

		constructor: function(args) {

			this.config = {
				color: 'red',

				_circlesById: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, 'clear', lang.hitch(this, this._clearRadiusCommons));
		},

		_getFeatureLatLng: function(itemId) {

			var marker = this._getMarkerById(itemId),
				latLng = marker ? marker.getLatLng() : null;

			return latLng;
		},

		_getFeatureRadius: function(itemId) {

			var marker = this._getMarkerById(itemId),
				feature = marker ? marker.feature : null;

			return this._getRadiusFromData(feature);
		},

		_getRadiusFromData: function(data) {

			var dataProps = data ? data.properties : null,
				radius = dataProps ? dataProps.radius : 0;

			return radius;
		},

		_drawRadius: function(id, latLng, radius) {

			if (this._circlesById[id] || id === undefined) {
				return;
			}

			this._createCircle(id, latLng, radius);

			this._emitEvt('ADD_LAYER', {
				layer: this._circlesById[id]
			});
		},

		_createCircle: function(/*Integer*/ id, /*Object?*/ latLng, /*Number?*/ radius) {

			var layer = L.circle(latLng || L.latLng(0, 0), radius || 0, {
				color: this.color
			});

			this._circlesById[id] = layer;

			return layer;
		},

		_eraseRadius: function(/*any?*/ id) {

			if (id !== undefined) {
				if (this._circlesById[id]) {
					this._emitEvt('REMOVE_LAYER', {
						layer: this._circlesById[id]
					});
					delete this._circlesById[id];
				}
			} else {
				for (var key in this._circlesById) {
					this._eraseRadius(key);
				}
			}
		},

		_clearRadiusCommons: function() {

			this._eraseRadius();
		}
	});
});
