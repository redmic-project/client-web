define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'app/designs/list/Controller'
	, 'app/designs/list/layout/Layout'
	, 'src/component/browser/_DragAndDrop'
	, 'src/component/browser/bars/Total'
	, 'src/redmicConfig'
	, 'templates/AtlasList'
], function(
	declare
	, lang
	, aspect
	, Controller
	, Layout
	, _DragAndDrop
	, Total
	, redmicConfig
	, ListTemplate
) {

	return declare(null, {
		//	summary:
		//		Gestión de capas temáticas de atlas cargadas en el mapa.

		constructor: function(args) {

			this.config = {
				pathSeparator: '.',
				parentProperty: 'parent',
				addThemesBrowserFirst: false,
				omitThemesBrowser: false
			};

			lang.mixin(this, this.config, args);

			if (this.omitThemesBrowser) {
				return;
			}

			this._prepareThemesBrowserCallbacks();
		},

		_prepareThemesBrowserCallbacks: function() {

			aspect.before(this, '_afterSetConfigurations', lang.hitch(this, this._themesBrowserAfterSetConfigurations));
			aspect.before(this, '_initialize', lang.hitch(this, this._initializeThemesBrowser));
			aspect.before(this, '_defineSubscriptions', lang.hitch(this, this._defineThemesBrowserSubscriptions));

			var aspectMethod = this.addThemesBrowserFirst ? 'before' : 'after';
			aspect[aspectMethod](this, '_addTabs', lang.hitch(this, this._addThemesBrowserTabs));

			aspect.before(this, '_reportDeselection', lang.hitch(this, this._themesBrowserReportDeselection));
			aspect.before(this, '_reportClearSelection', lang.hitch(this, this._themesBrowserReportClearSelection));
		},

		_themesBrowserAfterSetConfigurations: function() {

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
								icon: 'fa-info-circle',
								btnId: 'details',
								title: this.i18n.navigateToLayerInfo,
								href: redmicConfig.viewPaths.ogcServiceDetails
							},{
								icon: 'fa-arrows-v',
								btnId: 'elevation',
								title: 'showElevation',
								condition: function(item) { return !!item.originalItem.elevationDimension; },
								returnItem: true
							},{
								icon: 'fa-map-o',
								btnId: 'legend',
								title: 'showLegend',
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
								title: 'toggleLayerVisibility',
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

		_addThemesBrowserTabs: function() {

			if (!this.addTabChannel) {
				console.error('Missing channel to add themes tab at module "%s"', this.getChannel());
				return;
			}

			this._publish(this.addTabChannel, {
				title: this.i18n.selectedLayers,
				iconClass: 'fa fa-map-o',
				channel: this._themesBrowser.getChannel()
			});
		},

		_subThemesBrowserButtonEvent: function(objReceived) {

			var btnId = objReceived.btnId,
				item = objReceived.item;

			if (btnId === 'addLayer') {
				this._onThemesBrowserAddLayerButtonClick(objReceived);
			} else if (btnId === 'remove') {
				this._onThemesBrowserRemoveLayerButtonClick(item);
			} else if (btnId === 'elevation') {
				this._onThemesBrowserElevationButtonClick(objReceived);
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

		_onThemesBrowserElevationButtonClick: function(obj) {

			this._showLayerElevation(obj);
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
		},

		_themesBrowserReportDeselection: function(id) {

			this._publish(this._themesBrowser.getChildChannel('browser', 'REMOVE'), {
				ids: [id]
			});
		},

		_themesBrowserReportClearSelection: function() {

			this._publish(this._themesBrowser.getChildChannel('browser', 'CLEAR'));
		}
	});
});
