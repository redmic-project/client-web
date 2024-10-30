define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'app/designs/list/Controller'
	, 'app/designs/list/layout/Layout'
	, 'src/component/browser/_DragAndDrop'
	, 'src/component/browser/bars/Total'
	, 'templates/AtlasList'
], function(
	declare
	, lang
	, aspect
	, Controller
	, Layout
	, _DragAndDrop
	, Total
	, ListTemplate
) {

	return declare(null, {
		//	summary:
		//		Gestión de capas temáticas de atlas cargadas en el mapa.

		constructor: function(args) {

			this.config = {
				pathSeparator: '.',
				parentProperty: 'parent'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_initialize', lang.hitch(this, this._initializeThemesBrowser));
			aspect.before(this, '_defineSubscriptions', lang.hitch(this, this._defineThemesBrowserSubscriptions));
		},

		_afterSetConfigurations: function() {

			this._setThemesBrowserConfiguration();
		},

		_setThemesBrowserConfiguration: function() {

			this.themesBrowserConfig = this._merge([{
				parentChannel: this.getChannel(),
				classByList: '.borderList',
				browserExts: [_DragAndDrop],
				browserConfig: {
					template: ListTemplate,
					bars: [{
						instance: Total
					}],
					insertInFront: true,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-map-o',
								btnId: 'legend',
								title: 'legend',
								returnItem: true
							},{
								icon: 'fa-map-marker',
								title: 'mapCentering',
								btnId: 'fitBounds',
								returnItem: true
							},{
								icon: 'fa-toggle-on',
								altIcon: 'fa-toggle-off',
								btnId: 'addLayer',
								title: 'layer',
								state: true,
								returnItem: true
							}]
						}
					}
				}
			}, this.themesBrowserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_initializeThemesBrowser: function() {

			var ThemesBrowser = declare([Layout, Controller]);
			this._themesBrowser = new ThemesBrowser(this.themesBrowserConfig);
		},

		_defineThemesBrowserSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._themesBrowser.getChildChannel('browser', 'BUTTON_EVENT'),
				callback: '_subThemesBrowserButtonEvent'
			},{
				channel: this._themesBrowser.getChildChannel('browser', 'DRAG_AND_DROP'),
				callback: '_subThemesBrowserDragAndDrop'
			});
		},

		_subThemesBrowserButtonEvent: function(objReceived) {

			var btnId = objReceived.btnId,
				item = objReceived.item;

			if (btnId === 'addLayer') {
				this._onThemesBrowserAddLayerButtonClick(objReceived);
			} else if (btnId === 'remove') {
				this._onThemesBrowserRemoveLayerButtonClick(item);
			} else if (btnId === 'legend') {
				this._onThemesBrowserLegendButtonClick(objReceived);
			} else if (btnId === 'fitBounds') {
				this._onThemesBrowserFitBoundsButtonClick(item);
			}
		},

		_subThemesBrowserDragAndDrop: function(response) {

			var item = response.item,
				total = response.total,
				indexOld = response.indexOld,
				indexList = response.indexList;

			if (!item && !total && !indexOld && !indexList) {
				return;
			}

			this._publish(this.getMapChannel('REORDER_LAYERS'), {
				layerId: this._createLayerId(response.item.originalItem),
				newPosition: response.total - response.indexList,
				oldPosition: response.total - response.indexOld
			});
		},

		_onThemesBrowserAddLayerButtonClick: function(obj) {

			var item = obj.item,
				state = obj.state,
				order = obj.total - obj.indexList;

			if (!state) {
				this._deactivateLayer(item, order);
			} else {
				this._activateLayer(item, order);
			}
		},

		_onThemesBrowserRemoveLayerButtonClick: function(item) {

			var parentItem = item.originalItem[this.parentProperty],
				path = 'r' + this.pathSeparator + parentItem.id + this.pathSeparator + item.id;

			this._emitEvt('DESELECT', [path]);
		},

		_onThemesBrowserLegendButtonClick: function(obj) {

			this._showLayerLegend(obj);
		},

		_onThemesBrowserFitBoundsButtonClick: function(item) {

			this._fitBounds(item);
		},

		_fitBounds: function(item) {

			if (!item.originalItem.geometry) {
				return;
			}

			var coordinates = item.originalItem.geometry.coordinates[0],
				southWest = this._getLatLng(coordinates[0]),
				northEast = this._getLatLng(coordinates[2]);

 			this._publish(this.getMapChannel('FIT_BOUNDS'), {
				bounds: L.latLngBounds(southWest, northEast)
			});
		},

		_getLatLng: function(coord) {

			return [coord[1], coord[0]];
		}
	});
});
