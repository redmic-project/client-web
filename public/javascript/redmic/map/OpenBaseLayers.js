define({
	//	summary:
	//		Definiciones de capas base para los mapas de Leaflet.
	//	description:
	//		Contiene la definición de las capas base para heredarse e instanciarlas desde el widget OpenLayers.

	"topografico": {
		type: "wmts",
		url: "https://idecan3.grafcan.es/ServicioWMS/MTI",
		props: {
			layers: 'WMS_MTI',
			format: 'image/png',
			//subdomains: ['2', '3'],
			uppercase: true,
			attribution: "GrafCan",
			minZoom: 5,
			maxZoom: 21,
			tiled: true
		}
	},

	"ortofoto": {
		type: "wmts",
		url: "https://idecan3.grafcan.es/ServicioWMS/OrtoUrb_bat",
		props: {
			layers: 'WMS_OrtoExpressUrb',
			format: 'image/jpeg',
			uppercase: true,
			//subdomains: ['1', '3'],
			attribution: "GrafCan",
			minZoom: 5,
			maxZoom: 21,
			tiled: true
		}
	},

	"redmic": {
		type: "wmts",
		url: "https://atlas.redmic.es/geoserver/basemap/wms",
		props: {
			layers: 'Redmic',
			format: 'image/jpeg',
			uppercase: true,
			//subdomains: ['1', '3'],
			attribution: '<a href="http://www.oag-fundacion.org/" target="_blank" title="Observatorio Ambiental Granadilla">OAG</a>',
			minZoom: 1,
			maxZoom: 18,
			tiled: true
		}
	}/*,

	"redmic": {
		type: "wms",
		url: "https://atlas.redmic.es/Basemap/gwc/service/wms",
		props: {
			layers: "Basemap:basemapOceano",
			format: 'image/jpeg',
			attribution: '<a href="http://www.oag-fundacion.org/" target="_blank" title="Observatorio Ambiental Granadilla">OAG</a>',
			minZoom: 5,
			maxZoom: 18
		}
	}*/
});
