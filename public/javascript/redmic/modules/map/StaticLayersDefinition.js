define({
	//	summary:
	//		Definiciones estáticas de capas para el módulo Map.
	//	description:
	//		Contiene la definición de las diferentes capas base y superpuestas, en formato compatible con Leaflet.
	//		Para declarar una capa como base, se debe indicar con la propiedad 'basemap: true'. Soporta ordenación
	//		mediante la propiedad 'order' (valores enteros >= 1).
	//		Para declarar una capa como opcional (superpuesta pero cargada automáticamente, permitiendo su
	//		desactivación), se debe indicar con la propiedad 'optional: true'.

	'topografico': {
		basemap: true,
		protocol: 'WMS-C',
		url: 'https://{s}.grafcan.es/ServicioWMS/MTI',
		props: {
			layers: 'WMS_MTI',
			format: 'image/png',
			subdomains: ['idecan2', 'idecan3'],
			uppercase: true,
			attribution: '<a href="https://www.grafcan.es" target="_blank" title="GRAFCAN">GRAFCAN</a>',
			minZoom: 5,
			maxZoom: 21
		}
	},

	'ortofoto': {
		basemap: true,
		protocol: 'WMS-C',
		url: 'https://{s}.grafcan.es/ServicioWMS/OrtoExpress_bat',
		props: {
			layers: 'WMS_OrtoExpress',
			format: 'image/jpeg',
			uppercase: true,
			subdomains: ['idecan1', 'idecan3'],
			attribution: '<a href="https://www.grafcan.es" target="_blank" title="GRAFCAN">GRAFCAN</a>',
			minZoom: 5,
			maxZoom: 21
		}
	},

	'eoc-map': {
		basemap: true,
		order: 1,
		protocol: 'TMS',
		url: 'https://tiles.geoservice.dlr.de/service/tms/1.0.0/{layers}@{crs}@{format}/{z}/{x}/{y}.{format}',
		props: {
			layers: 'eoc:basemap',
			tms: true,
			crs: 'EPSG:4326',
			format: 'png',
			attribution: '<a href="https://geoservice.dlr.de" target="_blank" title="Earth Observation Center (EOC) of the German Aerospace Center (DLR)">EOC Geoservice</a>',
			minZoom: 1,
			maxZoom: 15
		}
	},

	'eoc-overlay': {
		optional: true,
		protocol: 'TMS',
		url: 'https://tiles.geoservice.dlr.de/service/tms/1.0.0/{layers}@{crs}@{format}/{z}/{x}/{y}.{format}',
		props: {
			layers: 'eoc:baseoverlay',
			tms: true,
			crs: 'EPSG:4326',
			format: 'png',
			attribution: '<a href="https://geoservice.dlr.de" target="_blank" title="Earth Observation Center (EOC) of the German Aerospace Center (DLR)">EOC Geoservice</a>',
			minZoom: 1,
			maxZoom: 15
		}
	},

	'grid5000m': {
		protocol: 'WMS-C',
		url: 'https://atlas.redmic.es/geoserver/gg/wms',
		props: {
			layers: 'grid5000m',
			format: 'image/png',
			transparent: true,
			tiled: true,
			attribution: '<a href="https://redmic.es" target="_blank" title="Repositorio de datos marinos integrados de Canarias">REDMIC</a>',
			minZoom: 7,
			maxZoom: 12
		}
	},

	'grid1000m': {
		protocol: 'WMS-C',
		url: 'https://atlas.redmic.es/geoserver/gg/wms',
		props: {
			layers: 'grid1000m',
			format: 'image/png',
			transparent: true,
			tiled: true,
			attribution: '<a href="https://redmic.es" target="_blank" title="Repositorio de datos marinos integrados de Canarias">REDMIC</a>',
			minZoom: 10,
			maxZoom: 15
		}
	},

	'grid500m': {
		protocol: 'WMS-C',
		url: 'https://atlas.redmic.es/geoserver/gg/wms',
		props: {
			layers: 'grid500m',
			format: 'image/png',
			transparent: true,
			tiled: true,
			attribution: '<a href="https://redmic.es" target="_blank" title="Repositorio de datos marinos integrados de Canarias">REDMIC</a>',
			minZoom: 11,
			maxZoom: 16
		}
	},

	'grid100m': {
		protocol: 'WMS-C',
		url: 'https://atlas.redmic.es/geoserver/gg/wms',
		props: {
			layers: 'grid100m',
			format: 'image/png',
			transparent: true,
			tiled: true,
			attribution: '<a href="https://redmic.es" target="_blank" title="Repositorio de datos marinos integrados de Canarias">REDMIC</a>',
			minZoom: 14,
			maxZoom: 19
		}
	}
});
