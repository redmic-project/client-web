define([
	'alertify/alertify.min'
	,'app/designs/list/Controller'
	, 'app/designs/list/layout/Layout'
	, 'app/designs/textSearchList/main/ServiceOGC'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Selection'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/browser/_DragAndDrop'
	, 'redmic/modules/browser/_HierarchicalSelect'
	, 'redmic/modules/browser/bars/SelectionBox'
	, 'redmic/modules/browser/bars/Total'
	, 'redmic/modules/layout/templateDisplayer/TemplateDisplayer'
	, 'templates/AtlasList'
	, 'templates/LoadingCustom'
	, 'templates/ServiceOGCAtlasList'
	, 'templates/ServiceOGCAtlasDetails'
	, './_AtlasLayersManagement'
	, './_AtlasLegendManagement'
], function(
	alertify
	, Controller
	, Layout
	, ServiceOGC
	, redmicConfig
	, declare
	, lang
	, Deferred
	, _Module
	, _Selection
	, _Show
	, _ShowInTooltip
	, _Store
	, _DragAndDrop
	, _HierarchicalSelect
	, SelectionBox
	, Total
	, TemplateDisplayer
	, ListTemplate
	, LoadingCustom
	, serviceOGCList
	, templateDetails
	, _AtlasLayersManagement
	, _AtlasLegendManagement
) {

	return declare([_Module, _Show, _Store, _Selection, _AtlasLayersManagement, _AtlasLegendManagement], {
		//	summary:
		//		Módulo de Atlas, con un catálogo de capas para añadir al mapa y un listado de gestión de las añadidas.

		constructor: function(args) {

			this.config = {
				ownChannel: 'atlas',

				events: {
					ADD_LAYER: 'addLayer',
					REMOVE_LAYER: 'removeLayer'
				},

				_itemsSelected: {},
				localTarget: 'localAtlas',
				target: redmicConfig.services.atlasLayer,
				selectionTarget: redmicConfig.services.atlasLayerSelection,
				pathSeparator: '.',
				parentProperty: 'parent',

				_layerInstances: {}, // capas de las que hemos creado instancia (no se borran, se reciclan)
				_layerIdsById: {}, // correspondencia entre ids de las capas con sus layerIds
				_lastOrder: 0 // order de la última capa añadida (para saber donde añadir la siguiente)
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.themesBrowserConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.selectedLayers,
				target: this.localTarget,
				classByList: '.borderList',
				browserExts: [_DragAndDrop],
				browserConfig: {
					template: ListTemplate,
					bars: [{
						instance: Total
					}],
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
							},{
								icon: 'fa-trash-o',
								btnId: 'remove',
								title: 'remove',
								returnItem: true
							}]
						}
					},
					noDataMessage: {
						definition: LoadingCustom,
						props: {
							message: this.i18n.addLayersToLoadInMap,
							iconClass: 'fr fr-layer'
						}
					}
				}
			}, this.themesBrowserConfig || {}]);

			this.catalogConfig = this._merge([{
				parentChannel: this.getChannel(),
				browserExts: [_HierarchicalSelect],
				selectionTarget: this.selectionTarget,
				target: this.target,
				perms: this.perms,
				classByList: '.borderList',
				browserConfig: {
					template: serviceOGCList,
					//noSelectParent: true,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: 'fa-info-circle',
								btnId: 'details',
								style: '[style="position:relative;"]',
								event: 'onmouseover',
								condition: 'urlSource',
								node: true,
								returnItem: true
							}]
						}
					},
					bars: [{
						instance: SelectionBox,
						config: {
							omitShowSelectedOnly: true
						}
					}]
				},
				filterConfig: {
					initQuery: {
						terms: {
							atlas: true
						},
						size: null,
						from: null
					}
				}
			}, this.catalogConfig || {}]);

			this.detailsConfig = this._merge([{
				parentChannel: this.getChannel(),
				template: templateDetails,
				target: 'tooltipDetails',
				'class': 'descriptionTooltip',
				timeClose: 200
			}, this.atlasConfig || {}]);
		},

		_initialize: function() {

			var ThemesBrowser = declare([Layout, Controller]);
			this.themesBrowser = new ThemesBrowser(this.themesBrowserConfig);

			this.catalogView = new ServiceOGC(this.catalogConfig);

			var LayerDetailsTooltip = declare(TemplateDisplayer).extend(_ShowInTooltip);
			this.templateDisplayerDetails = new LayerDetailsTooltip(this.detailsConfig);
		},

		_defineSubscriptions: function() {

			if (!this.getMapChannel) {
				console.error('Map channel not defined for atlas "%s"', this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel : this.getMapChannel('LAYER_REMOVED'),
				callback: '_subLayerRemoved'
			},{
				channel: this.themesBrowser.getChildChannel('browser', 'BUTTON_EVENT'),
				callback: '_subThemesBrowserButtonEvent'
			},{
				channel: this.themesBrowser.getChildChannel('browser', 'DRAG_AND_DROP'),
				callback: '_subThemesBrowserDragAndDrop'
			},{
				channel : this.catalogView.getChildChannel('browser', 'BUTTON_EVENT'),
				callback: '_subCatalogViewButtonEvent'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.getMapChannel('ADD_LAYER')
			},{
				event: 'REMOVE_LAYER',
				channel: this.getMapChannel('REMOVE_LAYER')
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._createDfdToRememberWhileHidden));
			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._createDfdToRememberWhileHidden));
		},

		_createDfdToRememberWhileHidden: function() {

			if (!this._dfdWhenShownAgain) {
				this._dfdWhenShownAgain = new Deferred();
			}
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addTabs(this.addTabChannel);
		},

		_getNodeToShow: function() {

			return this._atlasContainer;
		},

		_addTabs: function(addTabChannel) {

			if (!addTabChannel) {
				console.error('Missing channel to add tabs at Atlas module "%s"', this.getChannel());
				return;
			}

			this._publish(addTabChannel, {
				title: this.i18n.layersCatalog,
				iconClass: 'fr fr-world',
				channel: this.catalogView.getChannel()
			});

			this._publish(addTabChannel, {
				title: this.i18n.selectedLayers,
				iconClass: 'fa fa-map-o',
				channel: this.themesBrowser.getChannel()
			});
		},

		_checkSelectionAfterShown: function() {

			if (this._dfdWhenShownAgain) {
				this._dfdWhenShownAgain.resolve();
				this._dfdWhenShownAgain = null;
			}
		},

		_select: function(path, total) {

			var id = path.split(this.pathSeparator).pop();

			if (this._layerIdsById[id]) {
				return;
			}

			this._itemsSelected[id] = path;

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.getOwnChannel(),
				id: id
			});
		},

		_deselect: function(path, total) {

			var id = path.split(this.pathSeparator).pop(),
				layerId = this._layerIdsById[id];

			if (!layerId) {
				return;
			}

			delete this._itemsSelected[id];

			if (this._dfdWhenShownAgain) {
				if (!this._clearSelectionPending) {
					this._dfdWhenShownAgain.then(lang.hitch(this, this._reportDeselection, id));
				}
			} else {
				this._reportDeselection(id);
			}
		},

		_reportDeselection: function(id) {

			this._publish(this.themesBrowser.getChildChannel('browser', 'REMOVE'), {
				ids: [id]
			});

			this._removeLayerInstance(id);

			this._lastOrder--;
		},

		_removeLayerInstance: function(id) {

			var layerId = this._layerIdsById[id];

			this._emitEvt('REMOVE_LAYER', {
				layer: layerId
			});

			this._removeSubsAndPubsForLayer(this._layerInstances[layerId]);

			delete this._layerInstances[layerId];
			delete this._layerIdsById[id];
		},

		_clearSelection: function() {

			if (this._dfdWhenShownAgain) {
				this._dfdWhenShownAgain.cancel();
				this._clearSelectionPending = true;
				this._dfdWhenShownAgain = new Deferred();
				this._dfdWhenShownAgain.then(lang.hitch(this, this._reportClearSelection));
			} else {
				this._reportClearSelection();
			}
		},

		_reportClearSelection: function() {

			this._clearSelectionPending = false;

			this._publish(this.themesBrowser.getChildChannel('browser', 'CLEAR'));

			for (var key in this._layerIdsById) {
				this._removeLayerInstance(key);
			}

			this._lastOrder = 0;
		},

		_errorAvailable: function(error) {

			var patt = new RegExp('_selection');

			if (!error || !error.url || !patt.test(error.url)) {
				return;
			}

			alertify.dismissAll();

			var url = error.url,
				urlSplit = url.split('/'),
				id = urlSplit.pop();

			if (this._itemsSelected[id]) {
				this._emitEvt('DESELECT', [this._itemsSelected[id]]);
			}
		},

		_itemAvailable: function(response) {

			var item = response.data;

			if (item.leaves) {
				return;
			}

			var itemId = this._getAtlasLayerId(item);

			if (this._layerIdsById[itemId]) {
				return;
			}

			var layerDefinition = this._getAtlasLayerDefinition(),
				layerConfiguration = this._getAtlasLayerConfiguration(item),
				layerLabel = layerConfiguration.layerLabel;

			layerConfiguration.mapChannel = this.getMapChannel();

			var data = {
				id: itemId,
				label: layerLabel,
				originalItem: item,
				layer: {
					definition: layerDefinition,
					props: layerConfiguration
				}
			};

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.layer,
					action: TRACK.action.click,
					label: 'Layer loaded: ' + item.name
				}
			});

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.localTarget
			});

			this._lastOrder++;
			this._activateLayer(data, this._lastOrder);
		},

		_subLayerRemoved: function(res) {

			var layerId = res.layerId;

			this._removeLegendOfRemovedLayer(layerId);
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

		_subCatalogViewButtonEvent: function(res) {

			this._publish(this.templateDisplayerDetails.getChannel('HIDE'));

			var node = res.iconNode,
				item = res.item;

			item.href = lang.replace(redmicConfig.viewPaths.serviceOGCCatalogDetails, item);

			this._emitEvt('INJECT_ITEM', {
				data: item,
				target: 'tooltipDetails'
			});

			this._publish(this.templateDisplayerDetails.getChannel('SHOW'), {
				node: node
			});
		},

		_activateLayer: function(/*Object*/ item, order) {

			if (!item || !item.layer) {
				return;
			}

			var definition = item.layer.definition,
				props = item.layer.props,
				id = item.id,
				layerId = this._createLayerId(item.originalItem),
				layer = this._getLayerInstance(id, layerId, definition, props);

			this._emitEvt('ADD_LAYER', {
				layer: layer,
				layerId: layerId,
				layerLabel: item.label,
				atlasItem: item.originalItem,
				order: order
			});
		},

		_getLayerInstance: function(id, layerId, definition, props) {

			var layer = this._layerInstances[layerId];

			if (!layer) {
				layer = new definition(props);
				this._layerInstances[layerId] = layer;
				this._layerIdsById[id] = layerId;
				this._createSubsAndPubsForLayer(layer);
			}

			return layer;
		},

		_createSubsAndPubsForLayer: function(layerInstance) {

			this._createLegendSubsAndPubsForLayer(layerInstance);
		},

		_deactivateLayer: function(/*Object*/ item, order) {

			if (!item.layer) {
				return;
			}

			var layerId = this._createLayerId(item.originalItem),
				layer = this._layerInstances[layerId];

			if (layer) {
				this._emitEvt('REMOVE_LAYER', {
					layer: layer,
					order: order,
					keepInstance: true
				});
			}
		},

		_removeSubsAndPubsForLayer: function(layerInstance) {

			this._removeLegendSubsAndPubsForLayer(layerInstance);

			this._publish(layerInstance.getChannel('DISCONNECT'));
		},

		_subThemesBrowserButtonEvent: function(objReceived) {

			var btnId = objReceived.btnId,
				item = objReceived.item;

			if (btnId === 'addLayer') {
				this._onAddLayerBrowserButtonClick(objReceived);
			} else if (btnId === 'remove') {
				var parentItem = item.originalItem[this.parentProperty],
					path = 'r' + this.pathSeparator + parentItem.id + this.pathSeparator + item.id;

				this._emitEvt('DESELECT', [path]);
			} else if (btnId === 'legend') {
				this._showLayerLegend(objReceived);
			} else if (btnId === 'fitBounds') {
				this._fitBounds(item);
			}
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

		_onAddLayerBrowserButtonClick: function(obj) {

			var item = obj.item,
				state = obj.state,
				order = obj.total - obj.indexList;

			if (!state) {
				this._deactivateLayer(item, order);
			} else {
				this._activateLayer(item, order);
			}
		}
	});
});
