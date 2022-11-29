define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/Utils'
	, './_Page'
], function (
	declare
	, lang
	, Config
	, Utils
	, _Page
) {

	var leafletSelector = Config.selector.map,
		leafletControlSelector = leafletSelector + ' div.leaflet-control-container ',
		placenamesSelector = leafletControlSelector + 'a.fa-map-marker',
		baseMapSelector = leafletControlSelector + 'div.leaflet-control-layers',
		zoomSelector = leafletControlSelector + 'div.leaflet-control-zoom',
		navbarSelector = leafletControlSelector + 'div.leaflet-control-navbar ',
		layersSelector = leafletSelector + ' div.leaflet-pane.leaflet-overlay-pane ';

	return declare(_Page, {

		goHomePosition: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(navbarSelector + ' a.leaflet-control-navbar-home'))
					.sleep(Config.timeout.shortSleep);
			};
		},

		goPreviousPosition: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(navbarSelector + ' a.leaflet-control-navbar-back'))
					.sleep(Config.timeout.shortSleep);
			};
		},

		goNextPosition: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(navbarSelector + ' a.leaflet-control-navbar-fwd'))
					.sleep(Config.timeout.shortSleep);
			};
		},

		increaseZoom: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(zoomSelector + ' a.leaflet-control-zoom-in'))
					.sleep(Config.timeout.shortSleep);
			};
		},

		decreaseZoom: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(zoomSelector + ' a.leaflet-control-zoom-out'))
					.sleep(Config.timeout.shortSleep);
			};
		},

		_getZoom: function() {

			return function() {

				return this.parent
					.findByCssSelector('div.leaflet-pane.leaflet-map-pane div.leaflet-proxy.leaflet-zoom-animated')
						.getAttribute('style');
			};
		},

		getZoom: function() {

			return lang.partial(function(self) {

				return this.parent
					.then(self._getZoom())
					.then(function(value) {

						value = value.match(/scale\(\d+\)/g)[0];
						value = value.replace(/\D/g, '');

						return parseInt(value, 10);
					});
			}, this);
		},

		getLayersCount: function() {

			return function() {

				return this.parent
					.sleep(Config.timeout.longSleep)
					.findAllByCssSelector(layersSelector + ' > *')
						.then(function(children) {
							return children.length;
						});
			};
		},

		openPlacenamesBrowser: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(placenamesSelector));
			};
		},

		locatePlacenameInMap: function(value) {

			return function() {

				return this.parent
					.findByCssSelector('div.dijitDialogSingleChild div.dijitContentPane > :first-child')
						.then(Utils.setInputValue(
							'div.containerTextSearch input.inputSearch',
							value
						))
						.then(Utils.clickDisplayedElement('div.containerTextSearch div.buttonSearch'))
						.then(Utils.clickElement('div div.rowsContainer > :first-child i.fa-map-marker'))
						.end();
			};
		},

		changeBaseMap: function(index) {

			return function() {

				return this.parent
					.findByCssSelector(baseMapSelector + ' a.fa-globe')
						.then(function(element) {

							return this.parent
								.moveMouseTo(element);
						})
						.end()
					.then(Utils.clickElement(baseMapSelector + ' form label:nth-child(' + index + ') div.thumbCaption'))
					.findByCssSelector(leafletSelector)
						.then(function(element) {

							return this.parent
								.moveMouseTo(element);
						})
						.end();
			};
		},

		getBasemapUrl: function() {

			return function() {

				return this.parent
					.findByCssSelector('div.leaflet-pane.leaflet-map-pane div.leaflet-tile-container.leaflet-zoom-animated > img')
						.getAttribute('src');
			};
		},

		expandMiniMap: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement('a.leaflet-control-minimap-toggle-display.minimized-topright'));
			};
		},

		collapseMiniMap: function() {

			return function() {

				return this.parent
					.then(Utils.clickElement('a.leaflet-control-minimap-toggle-display'));
			};
		},

		dragMiniMap: function() {

			return function() {

				return this.parent
					.findByCssSelector('div.leaflet-control-minimap.leaflet-container div.leaflet-pane.leaflet-map-pane')
						.moveMouseTo(10, 10)
						.doubleClick();
			};
		},

		dragArea: function() {

			return lang.partial(function(self) {

				var minPX = 100,
					maxPX = 500;

				return this.parent
					.findByCssSelector('div.leaflet-control-measure > a')
						.moveMouseTo(10, 10)
						.end()
					.then(Utils.clickElement('div.leaflet-control-measure-interaction a.js-start'))
					.then(self.clickMapOnPoint(minPX, minPX))
					.then(self.clickMapOnPoint(minPX, maxPX))
					.then(self.clickMapOnPoint(maxPX, maxPX))
					.then(self.clickMapOnPoint(maxPX, minPX))
					.then(self.clickMapOnPoint(minPX, minPX))
					.then(Utils.clickElement('div.leaflet-control-measure-interaction a.js-finish'))
					.then(Utils.clickElement('div.leaflet-measure-resultpopup a.leaflet-popup-close-button'));
			}, this);
		},

		clickMapOnPoint: function(x, y) {

			return lang.partial(function(coordsObj) {

				return this.parent
					.findByCssSelector(Config.selector.map)
						.then(lang.partial(function(coords, element) {

							return this.parent
								.moveMouseTo(element, coords.x , coords.y)
								.clickMouseButton(0);
						}, coordsObj))
						.end();
			}, {
				x: x,
				y: y
			});
		}
	});
});
