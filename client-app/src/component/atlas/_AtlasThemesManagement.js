define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/dom-class'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/browser/_AddTotalBarComponent'
	, 'src/design/browser/_BrowserWithTopbarDesignLayout'
	, 'src/redmicConfig'
	, 'templates/AtlasList'
], function(
	declare
	, lang
	, aspect
	, domClass
	, _Module
	, _Show
	, _Store
	, _AddTotalBarComponent
	, _BrowserWithTopbarDesignLayout
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
				omitThemesBrowser: false,
				animatedClass: 'animate__animated',
				animatedOnSelect: 'animate__headShake',

				_activeLayers: {} // indicador sobre si la capa está activada en el mapa o no
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

			aspect.after(this, '_activateLayer', lang.hitch(this, this._themesBrowserActivateLayer));
			aspect.after(this, '_deactivateLayer', lang.hitch(this, this._themesBrowserDeactivateLayer));
		},

		_themesBrowserAfterSetConfigurations: function() {

			this.themesBrowserConfig = this._merge([{
				ownChannel: 'themesBrowser',
				parentChannel: this.getChannel(),
				enabledBrowserExtensions: {
					dragAndDrop: true
				},
				browserConfig: {
					template: ListTemplate,
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
								condition: function(atlasLayerItem) {

									return !!atlasLayerItem.atlasItem.elevationDimension;
								},
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

			const ThemesBrowserDefinition = declare([_Module, _Show, _Store, _BrowserWithTopbarDesignLayout,
				_AddTotalBarComponent]);

			this._themesBrowser = new ThemesBrowserDefinition(this.themesBrowserConfig);
		},

		_defineThemesBrowserSubscriptions: function() {

			const browserInstance = this._themesBrowser.getComponentInstance('browser');

			this.subscriptionsConfig.push({
				channel: browserInstance.getChannel('BUTTON_EVENT'),
				callback: '_subThemesBrowserButtonEvent'
			},{
				channel: browserInstance.getChannel('DRAG_AND_DROP'),
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

			var item = response.item;

			if (!item) {
				return;
			}

			var indexList = response.indexList,
				indexOld = response.indexOld;

			if (indexList === null || isNaN(indexList) || indexList === indexOld) {
				return;
			}

			var movedDown = indexList > indexOld,
				automaticDrag = response.automaticDrag;

			if (!automaticDrag) {
				this._emitEvt('TRACK', {
					event: 'reorder_layer',
					layer_name: item.label,
					layer_order: indexList
				});
			}

			this._publish(this.getMapChannel('REORDER_LAYERS'), {
				layerId: this._createLayerId(item.atlasItem),
				index: response.indexList,
				movedDown: movedDown
			});
		},

		_onThemesBrowserAddLayerButtonClick: function(obj) {

			var atlasLayerItem = obj.item,
				state = obj.state,
				rowNode = obj.node;

			if (!state) {
				this._emitEvt('TRACK', {
					event: 'disable_layer',
					layer_name: atlasLayerItem.label
				});

				domClass.remove(rowNode, [this.animatedClass, this.animatedOnSelect]);

				this._deactivateLayer(atlasLayerItem);
			} else {
				this._emitEvt('TRACK', {
					event: 'enable_layer',
					layer_name: atlasLayerItem.label
				});

				domClass.add(rowNode, [this.animatedClass, this.animatedOnSelect]);

				this._activateLayer(atlasLayerItem);
			}
		},

		_onThemesBrowserRemoveLayerButtonClick: function(atlasLayerItem) {

			var parentItem = atlasLayerItem.atlasItem[this.parentProperty],
				path = 'r' + this.pathSeparator + parentItem.id + this.pathSeparator + atlasLayerItem.id;

			this._emitEvt('TRACK', {
				event: 'remove_layer',
				layer_name: atlasLayerItem.label
			});

			this._emitEvt('DESELECT', [path]);
		},

		_onThemesBrowserElevationButtonClick: function(obj) {

			var layerItem = obj.item,
				layerLabel = layerItem && layerItem.label;

			this._emitEvt('TRACK', {
				event: 'show_layer_elevations',
				layer_name: layerLabel
			});

			this._showLayerElevation(obj);
		},

		_onThemesBrowserLegendButtonClick: function(obj) {

			var layerItem = obj.item,
				layerLabel = layerItem && layerItem.label;

			this._emitEvt('TRACK', {
				event: 'show_layer_legend',
				layer_name: layerLabel
			});

			this._toggleShowLayerLegend(obj);
		},

		_onThemesBrowserFitBoundsButtonClick: function(item) {

			var layerLabel = item && item.label;

			this._emitEvt('TRACK', {
				event: 'fit_layer_bounds',
				layer_name: layerLabel
			});

			this._fitBounds(item);
		},

		_fitBounds: function(atlasLayerItem) {

			var geometry = atlasLayerItem.atlasItem.geometry;
			if (!geometry) {
				return;
			}

			var coordinates = geometry.coordinates[0],
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

			const browserInstance = this._themesBrowser.getComponentInstance('browser');

			this._publish(browserInstance.getChannel('REMOVE'), {
				ids: [id]
			});
		},

		_themesBrowserReportClearSelection: function() {

			const browserInstance = this._themesBrowser.getComponentInstance('browser');

			this._publish(browserInstance.getChannel('CLEAR'));
		},

		_cleanRowSecondaryContainer: function(layerId, container) {

			// TODO se usa para conectar con aspect desde las otras extensiones
		},

		_themesBrowserActivateLayer: function(_ret, args) {

			var atlasLayerItem = args[0];

			if (!atlasLayerItem) {
				return;
			}

			var itemId = atlasLayerItem.id,
				mapLayerId = atlasLayerItem.mapLayerId;

			this._activeLayers[mapLayerId] = true;

			const browserInstance = this._themesBrowser.getComponentInstance('browser');

			this._publish(browserInstance.getChannel('UPDATE_DRAGGABLE_ITEM_ORDER'), {
				id: itemId,
				index: 0
			});

			this._publish(browserInstance.getChannel('ENABLE_DRAG_AND_DROP'), {
				id: itemId
			});
		},

		_themesBrowserDeactivateLayer: function(_ret, args) {

			var atlasLayerItem = args[0];

			if (!atlasLayerItem) {
				return;
			}

			var itemId = atlasLayerItem.id,
				mapLayerId = atlasLayerItem.mapLayerId;

			this._activeLayers[mapLayerId] = false;

			const browserInstance = this._themesBrowser.getComponentInstance('browser');

			this._publish(browserInstance.getChannel('DISABLE_DRAG_AND_DROP'), {
				id: itemId
			});
		}
	});
});
