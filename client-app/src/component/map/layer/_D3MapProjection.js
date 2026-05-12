define([
	'd3'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
], function(
	d3
	, declare
	, lang
	, Deferred
) {

	return declare(null, {
		// summary:
		//   Lógica de transformación de gráficos vectoriales para su proyección geográfica, en base al componente
		//   de mapa.

		_getSvgElement: function() {

			return d3.select(this._mapInstance.getPanes().overlayPane).append('svg:svg');
		},

		_getGeoPath: function() {

			const transform = d3.geoTransform({
				point: lang.partial(this._pointTransform, this)
			});

			return d3.geoPath(transform);
		},

		_pointTransform: function(self, x, y) {

			if (!self.mapChannel) {
				return;
			}

			const layerPointDfd = new Deferred();

			self._once(self._buildChannel(self.mapChannel, 'GOT_LAYER_POINT'),
				(res) => layerPointDfd.resolve(res?.layerPoint));

			self._publish(self._buildChannel(self.mapChannel, 'GET_LAYER_POINT'), {
				lat: y,
				lng: x
			});

			layerPointDfd.then((layerPoint) => layerPoint && this.stream.point(layerPoint.x, layerPoint.y));
		}
	});
});
