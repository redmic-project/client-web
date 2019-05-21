define({
	//	summary:
	//		Definiciones de capas base para los mapas de Leaflet.
	//	description:
	//		Contiene la definición de las capas base para instanciarlas desde OpenLayers.

	'topografico': {
		type: 'wmts',
		url: 'https://{s}.grafcan.es/ServicioWMS/MTI',
		props: {
			layers: 'WMS_MTI',
			format: 'image/png',
			subdomains: ['idecan2', 'idecan3'],
			uppercase: true,
			attribution: '<a href="https://www.grafcan.es" target="_blank" title="GRAFCAN">GRAFCAN</a>',
			minZoom: 5,
			maxZoom: 21,
			tiled: true
		}
	},

	'ortofoto': {
		type: 'wmts',
		url: 'https://{s}.grafcan.es/ServicioWMS/OrtoUrb_bat',
		props: {
			layers: 'WMS_OrtoExpressUrb',
			format: 'image/jpeg',
			uppercase: true,
			subdomains: ['idecan3'],
			attribution: '<a href="https://www.grafcan.es" target="_blank" title="GRAFCAN">GRAFCAN</a>',
			minZoom: 5,
			maxZoom: 21,
			tiled: true
		}
	},

	'redmic': {
		type: 'wmts',
		url: 'https://atlas.redmic.es/geoserver/basemap/wms',
		props: {
			layers: 'Redmic',
			format: 'image/jpeg',
			uppercase: true,
			attribution: '<a href="http://www.oag-fundacion.org" target="_blank" title="Observatorio Ambiental Granadilla">OAG</a>',
			minZoom: 1,
			maxZoom: 18,
			tiled: true
		}
	},

	'eoc-map': {
		type: 'tileLayer',
		url: 'https://tiles.geoservice.dlr.de/service/tms/1.0.0/{layers}@{crs}@{format}/{z}/{x}/{-y}.{format}',
		props: {
			layers: 'eoc:basemap',
			crs: 'EPSG:4326',
			format: 'png',
			attribution: '<a href="https://geoservice.dlr.de" target="_blank" title="Earth Observation Center (EOC) of the German Aerospace Center (DLR)">EOC Geoservice</a>',
			minZoom: 1,
			maxZoom: 15
		}
	},

	'eoc-overlay': {
		type: 'tileLayer',
		url: 'https://tiles.geoservice.dlr.de/service/tms/1.0.0/{layers}@{crs}@{format}/{z}/{x}/{-y}.{format}',
		props: {
			layers: 'eoc:baseoverlay',
			crs: 'EPSG:4326',
			format: 'png',
			attribution: '<a href="https://geoservice.dlr.de" target="_blank" title="Earth Observation Center (EOC) of the German Aerospace Center (DLR)">EOC Geoservice</a>',
			minZoom: 1,
			maxZoom: 15
		}
	}
});
