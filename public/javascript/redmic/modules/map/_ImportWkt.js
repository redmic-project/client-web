define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'leaflet/leaflet'
	, 'wicket/wicket-leaflet'
], function(
	declare
	, lang
	, aspect
	, L
	, wicket
) {

	return declare(null, {
		//	summary:
		//		Extensión que ofrece capacidades de traducción desde WKT hacia GeoJSON y capas Leaflet
		//	description:
		//		Utiliza la librería Wicket para hacer la traducción de formato.

		constructor: function(args) {

			this.config = {
				importWktEvents: {
					ADD_WKT: 'addWkt'
				},
				importWktActions: {
					ADD_WKT: 'addWkt',
					WKT_ADDED: 'wktAdded'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_mixEventsAndActions', lang.hitch(this, this._mixImportWktEventsAndActions));
			aspect.before(this, '_defineSubscriptions', lang.hitch(this, this._defineImportWktSubscriptions));
			aspect.before(this, '_definePublications', lang.hitch(this, this._defineImportWktPublications));
			aspect.before(this, '_initialize', lang.hitch(this, this._initializeImportWkt));
		},

		_mixImportWktEventsAndActions: function() {

			lang.mixin(this.events, this.importWktEvents);
			lang.mixin(this.actions, this.importWktActions);

			delete this.importWktEvents;
			delete this.importWktActions;
		},

		_defineImportWktSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_WKT'),
				callback: '_subAddWkt'
			});
		},

		_defineImportWktPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_WKT',
				channel: this.getChannel('WKT_ADDED')
			});
		},

		_initializeImportWkt: function() {

			this._wicket = new wicket.Wkt();
		},

		_readWkt: function(wkt) {

			this._wicket.read(wkt);
		},

		_getGeoJsonFeatureFromWkt: function(wkt) {

			this._readWkt(wkt);
			return this._wicket.toJson();
		},

		_getLeafletLayerFromWkt: function(wkt) {

			this._readWkt(wkt);
			return this._wicket.toObject();
		},

		_subAddWkt: function(req) {

			var newLayer = this._getLeafletLayerFromWkt(req.wkt);

			if (!newLayer) {
				return;
			}

			this._addMapLayer({
				layer: newLayer,
				optional: true,
				id: req.id
			});

			var bounds = newLayer.getBounds();
			if (this._getShown()) {
				this.fitBounds(bounds);
			} else {
				this._onceEvt('BBOX_CHANGE', lang.hitch(this, this.fitBounds, bounds));
			}

			this._emitEvt('ADD_WKT', {
				layer: newLayer
			});
		}
	});
});
