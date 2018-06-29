define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, Utilities
){
	return {
		//	summary:
		//		Extensión de MapLayer para que escuche los cambios de BBox.
		//	description:
		//		Permite escuchar los cambios de BBox directamente desde el módulo del mapa.
		constructor: function(args) {

			this.config = {
				timeoutBBox: 200
			};
		},

		_initialize: function() {

			this.actions.BBOX_CHANGED = 'bBoxChanged';

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.mapChannel, this.actions.BBOX_CHANGED),
				callback: '_subBBoxChanged'
			});
		},

		_subBBoxChanged: function(res) {

			if (this._mapInstance && (!this.bounds || !Utilities.isEqual(this.bounds, res.bbox))) {

				clearTimeout(this.timeoutBBoxHandler);
				this.timeoutBBoxHandler = setTimeout(lang.hitch(this, this._bBoxChanged, res.bbox), this.timeoutBBox);
			}
		},

		_bBoxChanged: function(bbox) {

			this.bounds = bbox;

			this._redraw({
				bbox: {
					"topLeftLat": this.bounds._northEast.lat,
					"topLeftLon": this.bounds._southWest.lng,
					"bottomRightLat": this.bounds._southWest.lat,
					"bottomRightLon": this.bounds._northEast.lng
				}
			});
		}
	};
});
