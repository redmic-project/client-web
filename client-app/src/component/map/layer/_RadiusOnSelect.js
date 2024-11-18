define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/map/layer/_RadiusCommons"
], function(
	declare
	, lang
	, aspect
	, _RadiusCommons
){
	return declare(_RadiusCommons, {
		//	summary:
		//		Extensión de MapLayer para dibujar el radio de un marcador al seleccionarlo.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_selectExistingMarker', lang.hitch(this, this._selectExistingMarkerRadiusOnSelect));
			aspect.after(this, '_deselect', lang.hitch(this, this._deselectRadiusOnSelect));
			aspect.after(this, '_clearSelection', lang.hitch(this, this._clearSelectionRadiusOnSelect));
		},

		_selectExistingMarkerRadiusOnSelect: function(originalReturn, originalArgs) {

			var marker = originalArgs[0],
				itemId = originalArgs[1];

			this._drawRadius(itemId, this._getFeatureLatLng(itemId), this._getFeatureRadius(itemId));
		},

		_deselectRadiusOnSelect: function(originalReturn, originalArgs) {

			var itemId = originalArgs[0];

			this._eraseRadius(itemId);
		},

		_clearSelectionRadiusOnSelect: function() {

			this._eraseRadius();
		}
	});
});
