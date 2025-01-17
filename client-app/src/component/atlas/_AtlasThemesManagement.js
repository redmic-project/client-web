define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/dom-class'
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
	, domClass
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

			var item = response.item;

			if (!item) {
				return;
			}

			var indexList = response.indexList,
				indexOld = response.indexOld;

			if (indexList === null || isNaN(indexList) || indexList === indexOld) {
				return;
			}

			var movedDown = indexList > indexOld;

			this._publish(this.getMapChannel('REORDER_LAYERS'), {
				layerId: this._createLayerId(response.item.atlasItem),
				index: response.indexList,
				movedDown: movedDown
			});
		},

		_onThemesBrowserAddLayerButtonClick: function(obj) {

			var atlasLayerItem = obj.item,
				mapLayerId = atlasLayerItem.mapLayerId,
				state = obj.state,
				rowNode = obj.node;

			if (!state) {
				domClass.remove(rowNode, [this.animatedClass, this.animatedOnSelect]);

				this._deactivateLayer(atlasLayerItem);
				this._activeLayers[mapLayerId] = false;
			} else {
				domClass.add(rowNode, [this.animatedClass, this.animatedOnSelect]);

				this._activateLayer(atlasLayerItem);
				this._activeLayers[mapLayerId] = true;
			}
		},

		_onThemesBrowserRemoveLayerButtonClick: function(atlasLayerItem) {

			var parentItem = atlasLayerItem.atlasItem[this.parentProperty],
				path = 'r' + this.pathSeparator + parentItem.id + this.pathSeparator + atlasLayerItem.id;

			this._emitEvt('DESELECT', [path]);
		},

		_onThemesBrowserElevationButtonClick: function(obj) {

			this._showLayerElevation(obj);
		},

		_onThemesBrowserLegendButtonClick: function(obj) {

			this._toggleShowLayerLegend(obj);
		},

		_onThemesBrowserFitBoundsButtonClick: function(item) {

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

			this._publish(this._themesBrowser.getChildChannel('browser', 'REMOVE'), {
				ids: [id]
			});
		},

		_themesBrowserReportClearSelection: function() {

			this._publish(this._themesBrowser.getChildChannel('browser', 'CLEAR'));
		},

		_cleanRowSecondaryContainer: function(layerId, container) {

			// TODO se usa para conectar con aspect desde las otras extensiones
		},

		_themesBrowserActivateLayer: function(_ret, args) {

			var atlasLayerItem = args[0];

			if (!atlasLayerItem) {
				return;
			}

			var itemId = atlasLayerItem.id;

			this._publish(this._themesBrowser.getChildChannel('browser', 'UPDATE_DRAGGABLE_ITEM_ORDER'), {
				id: itemId,
				index: 0
			});

			this._publish(this._themesBrowser.getChildChannel('browser', 'ENABLE_DRAG_AND_DROP'), {
				id: itemId
			});
		},

		_themesBrowserDeactivateLayer: function(_ret, args) {

			var atlasLayerItem = args[0];

			if (!atlasLayerItem) {
				return;
			}

			var itemId = atlasLayerItem.id;

			this._publish(this._themesBrowser.getChildChannel('browser', 'DISABLE_DRAG_AND_DROP'), {
				id: itemId
			});
		}
	});
});
