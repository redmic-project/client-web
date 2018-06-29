define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/Map'
	, 'tests/support/Utils'
	, './_Commons'
], function (
	declare
	, lang
	, Config
	, MapPage
	, Utils
	, _Commons
) {

	var indexPage,
		basemaps = ['Redmic', 'WMS_MTI', 'OrtoExpressUrb'],

		assert = intern.getPlugin('chai').assert;

	return declare(_Commons, {

		suiteDefinition: {
			before: function() {

				indexPage = new MapPage(this);
				this.externalContext.setIndexPage(indexPage);
			},

			tests: {

				Should_AddMarkerPlacenames_When_ClickedOnRowInList: function() {

					return this.remote
						.then(indexPage.openPlacenamesBrowser())
						.then(indexPage.locatePlacenameInMap('Santa María'))
						.then(Utils.childrenInNode('div.map div.awesome-marker-icon-purple', 1));
				},

				Should_ChangeBasemap_When_SelectNewBasemap: function() {

					var context = this.remote,
						checkBasemapURL = function(basemapId, value) {

							var regex = new RegExp(basemapId, 'g');

							assert.match(value, regex, 'No se han encontrado teselas de la capa base cargada');
						};

					for (var i = 0; i < basemaps.length; i++) {
						var basemapId = basemaps[i];

						context = context
							.then(indexPage.changeBaseMap(i + 1))
							.then(indexPage.getBasemapUrl())
							.then(lang.partial(checkBasemapURL, basemapId));
					}

					return context;
				},

				Should_ChangePositionMap_When_ChangeMiniMap: function() {

					var values = {};

					return this.remote
						.then(indexPage.getBasemapUrl())
						.then(lang.partial(function(values, url) {

							values.urlOld = url;
						}, values))
						.then(indexPage.expandMiniMap())
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.dragMiniMap())
						.sleep(Config.timeout.shortSleep)
						.then(indexPage.getBasemapUrl())
						.then(lang.partial(function(values, url) {

							assert.notStrictEqual(url, values.urlOld, 'El mapa no cambio de posición');
						}, values));
				},

				Should_ChangeZoomMap_When_ClickedInMoreZoom: function() {

					var values = {};

					return this.remote
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							values.zoomOld = zoom;
						}, values))
						.then(indexPage.increaseZoom())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							assert.isAbove(zoom, values.zoomOld, 'El zoom no cambio');
						}, values));
				},

				Should_ChangeZoomMap_When_ClickedInLessZoom: function() {

					var values = {};

					return this.remote
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							values.zoomOld = zoom;
						}, values))
						.then(indexPage.decreaseZoom())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							assert.isBelow(zoom, values.zoomOld, 'El zoom no cambio');
						}, values));
				},

				Should_ChangeZoomMap_When_ClickedInZoomDefault: function() {

					var values = {};

					return this.remote
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							values.zoomDefault = zoom;
						}, values))
						.then(indexPage.decreaseZoom())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							values.zoomOld = zoom;
						}, values))
						.then(indexPage.goHomePosition())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							assert.strictEqual(zoom, values.zoomDefault, 'No es el zoom por defecto');
						}, values));
				},

				Should_ChangeZoomMap_When_ClickedInBackZoomAndClickedInForwardZoom: function() {

					var values = {};

					return this.remote
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							values.zoomBack = zoom;
						}, values))
						.then(indexPage.decreaseZoom())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							values.zoomOld = zoom;
							assert.notStrictEqual(zoom, values.zoomBack, 'El zoom no cambio');
						}, values))
						.then(indexPage.goPreviousPosition())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							assert.strictEqual(zoom, values.zoomBack, 'No es el zoom anterior');
						}, values))
						.then(indexPage.goNextPosition())
						.then(indexPage.getZoom())
						.then(lang.partial(function(values, zoom) {

							assert.strictEqual(zoom, values.zoomOld, 'No es el zoom posterior');
						}, values));
				}

				// Hacer uno para min y max zoom
				// Hacer uno para añadir marcador con coordenadas
			}
		}
	});
});
