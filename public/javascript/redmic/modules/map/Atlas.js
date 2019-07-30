define([
	'alertify/alertify.min'
	,"app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/designs/textSearchList/main/ServiceOGC"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "put-selector/put"
	, "redmic/map/OpenLayers"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/_DragAndDrop"
	, "redmic/modules/browser/_HierarchicalSelect"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/dataDisplayer/DataDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "redmic/modules/map/layer/_PublishInfo"
	, "redmic/modules/map/layer/WmsLayerImpl"
	, "templates/AtlasList"
	, "templates/LoadingCustom"
	, "templates/ServiceOGCAtlasList"
	, "templates/ServiceOGCAtlasDetails"
], function(
	alertify
	, Controller
	, Layout
	, ServiceOGC
	, redmicConfig
	, declare
	, lang
	, Deferred
	, put
	, OpenLayers
	, _Module
	, _Selection
	, _Show
	, _ShowInPopup
	, _ShowInTooltip
	, _Store
	, _DragAndDrop
	, _HierarchicalSelect
	, SelectionBox
	, Total
	, DataDisplayer
	, TemplateDisplayer
	, _PublishInfo
	, WmsLayerImpl
	, ListTemplate
	, LoadingCustom
	, serviceOGCList
	, templateDetails
){
	return declare([_Module, _Show, _Store, _Selection], {
		//	summary:
		//		Módulo de Atlas.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				ownChannel: "atlas",

				events: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					DISABLE_THEMES_BUTTON: "disableThemesButton",
					ENABLE_THEMES_BUTTON: "enableThemesButton",
					DISABLE_CATALOG_BUTTON: "disableCatalogButton",
					ENABLE_CATALOG_BUTTON: "enableCatalogButton"
				},

				_itemsSelected: {},
				localTarget: "local",
				// TODO este target no hace falta, pero si uno de selección común a categorias y capas
				//target: [redmicConfig.services.atlasLayer, redmicConfig.services.atlasCategory],
				pathSeparator: ".",
				pathProperty: "path",
				layerIdSeparator: "_",
				themeSeparator: "-",
				showBrowserAnimationClass: "animated fadeIn",
				hideBrowserAnimationClass: "animated fadeOut",

				_layersDataContainers: {}, // contenedores de info y legend de las capas
				_layerInstances: {}, // capas de las que hemos creado instancia (no se borran, se reciclan)
				_layerIdsById: {}, // correspondencia entre ids de las capas con sus layerIds
				_lastOrder: 0, // order de la última capa añadida (para saber donde añadir la siguiente)
				_legendInstances: {} // instancias de módulo visualizador de leyendas
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.themesBrowserConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.selectedThemes,
				target: this.localTarget,
				buttonsInTopZone: true,
				buttons: {
					"goToCatalog": {
						className: "fa-plus",
						title: this.i18n.goToCatalog
					}
				},
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
								icon: "fa-list-alt",
								btnId: "legend",
								title: "legend",
								returnItem: true,
								condition: "styleLayer"
							},{
								icon: "fa-map-marker",
								title: "map centering",
								btnId: "fitBounds",
								returnItem: true
							},{
								icon: "fa-toggle-on",
								altIcon: "fa-toggle-off",
								btnId: "addLayer",
								title: "layer",
								state: true,
								returnItem: true
							},{
								icon: "fa-trash-o",
								btnId: "remove",
								title: "remove",
								returnItem: true
							}]
						}
					},
					noDataMessage: {
						definition: LoadingCustom,
						props: {
							message: this.i18n.addLayersToLoadInMap,
							iconClass: "fr fr-layer",
							clickable: true
						}
					}
				}
			}, this.themesBrowserConfig || {}]);

			this.catalogConfig = this._merge([{
				parentChannel: this.getChannel(),
				browserExts: [_HierarchicalSelect],
				//target: this.target,
				perms: this.perms,
				buttonsInTopZone: true,
				buttons: {
					"backToSelectedLayers": {
						className: "fa-reply",
						title: this.i18n.goToSelectedLayers
					}
				},
				classByList: '.borderList',
				browserConfig: {
					template: serviceOGCList,
					//noSelectParent: true,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								style: '[style="position:relative;"]',
								event: "onmouseover",
								condition: "urlSource",
								node: true,
								returnItem: true
							}]
						}
					},
					bars: [{
						instance: SelectionBox,
						config: {
							omitShowSelectedOnly: true,
							itemsShow: {
								clearSelection: true
							}
						}
					}]
				},
				filterConfig: {
					initQuery: {
						size: null,
						from: null
					}
				}
			}, this.catalogConfig || {}]);

			this.detailsConfig = this._merge([{
				parentChannel: this.getChannel(),
				template: templateDetails,
				target: "tooltipDetails",
				'class': 'descriptionTooltip',
				timeClose: 200
			}, this.atlasConfig || {}]);
		},

		_initialize: function() {

			this.themesBrowser = new declare([Layout, Controller])(this.themesBrowserConfig);

			this.catalogView = new ServiceOGC(this.catalogConfig);

			this.templateDisplayerDetails = new declare(TemplateDisplayer).extend(_ShowInTooltip)(this.detailsConfig);
		},

		_defineSubscriptions: function() {

			if (!this.getMapChannel) {
				console.error("Map channel not defined for atlas '%s'", this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel : this.getMapChannel("LAYER_REMOVED"),
				callback: "_subLayerRemoved"
			},{
				channel: this.themesBrowser.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subThemesBrowserButtonEvent"
			},{
				channel: this.themesBrowser.getChildChannel("browser", "DRAG_AND_DROP"),
				callback: "_subThemesBrowserDragAndDrop"
			},{
				channel: this.themesBrowser.getChildChannel("browser", "NO_DATA_MSG_CLICKED"),
				callback: "_subThemesBrowserNoDataMsgClicked"
			},{
				channel: this.themesBrowser.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subThemesBrowserKeypadInput"
			},{
				channel: this.catalogView.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subCatalogViewKeypadInput"
			},{
				channel : this.catalogView.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subCatalogViewButtonEvent"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.getMapChannel("ADD_LAYER")
			},{
				event: 'REMOVE_LAYER',
				channel: this.getMapChannel("REMOVE_LAYER")
			},{
				event: 'DISABLE_THEMES_BUTTON',
				channel: this.themesBrowser.getChildChannel("iconKeypad", "DISABLE_BUTTON")
			},{
				event: 'ENABLE_THEMES_BUTTON',
				channel: this.themesBrowser.getChildChannel("iconKeypad", "ENABLE_BUTTON")
			},{
				event: 'DISABLE_CATALOG_BUTTON',
				channel: this.catalogView.getChildChannel("iconKeypad", "DISABLE_BUTTON")
			},{
				event: 'ENABLE_CATALOG_BUTTON',
				channel: this.catalogView.getChildChannel("iconKeypad", "ENABLE_BUTTON")
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

			this._atlasContainer = put('div.atlasContainer');

			this._showBrowser(this.catalogView, this._atlasContainer, null, this.hideBrowserAnimationClass);

			/*this.atlasNode = new ContentPane({
				region: "center",
				'class': 'noScrolledContainer'
			});

			this.container = new BorderContainer({
				width: "100%"
			}).placeAt(this.atlasNode);

			this.themesBrowserNode = new ContentPane({
				region: "center",
				'class': 'noScrolledContainer marginedSizeContainer'
			});*/

			/*this.container.addChild(this.themesBrowserNode);

			this._showBrowser(this.themesBrowser, this.themesBrowserNode.domNode,
				null, this.hideBrowserAnimationClass);*/

			/*this.catalogViewNode = new ContentPane({
				region: "center",
				'class': 'noScrolledContainer marginedSizeContainer'
			});

			this._showBrowser(this.catalogView, this.catalogViewNode.domNode, null, this.hideBrowserAnimationClass);
			this.container.addChild(this.catalogViewNode);*/
		},

		_getNodeToShow: function() {

			return this._atlasContainer;
		},

		_showBrowser: function(instance, node, showAnimationClass, hideAnimationClass) {

			this._publish(instance.getChannel("SHOW"), {
				node: node,
				animation: {
					showAnimation: showAnimationClass,
					hideAnimation: hideAnimationClass
				}
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

			this._publish(this.themesBrowser.getChildChannel("browser", "REMOVE"), {
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

			this._publish(this.themesBrowser.getChildChannel("browser", "CLEAR"));

			for (var key in this._layerIdsById) {
				this._removeLayerInstance(key);
			}

			this._lastOrder = 0;
		},

		_isTiled: function(item) {

			var protocols = item.protocols;

			if (item.protocols && item.protocols.length !== 0) {
				for (var i = 0; i < protocols.length; i++) {
					if (protocols[i].type === 'WMTS') {
						return true;
					}
				}
			}

			return false;
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

			var isTiled = this._isTiled(item),
				props = {
					layers: [item.name],
					transparent: true
				};

			if (isTiled) {
				props.tiled = true;
				props.pane = 'overlayPane';
			}

			if (item.formats) {
				if (item.formats.indexOf('image/png') !== -1) {
					props.format = 'image/png';
				}
			}

			var itemId = item.id;

			if (this._layerIdsById[itemId]) {
				return;
			}

			var layerId = this._createLayerId(item),
				layerLabel = item.alias || item.title,

				layer = OpenLayers.build({
					type: isTiled ? "wmts" : "wms",
					url: item.urlSource,
					props: props
				}),

				data = {
					id: itemId,
					label: layerLabel,
					originalItem: item,
					layer: {
						definition: declare([WmsLayerImpl, _PublishInfo]),
						props: {
							parentChannel: this.getChannel(),
							mapChannel: this.getMapChannel(),
							layer: layer,
							styleLayer: item.styleLayer,
							queryable: item.queryable,
							layerId: layerId,
							layerLabel: layerLabel,
							refresh: item.refresh
						}
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

		_subLayerRemoved: function(response) {

			var layerId = response.layerId,
				infoContainer = this._layersDataContainers[layerId],
				legendContent = infoContainer ? infoContainer.legend : null;

			legendContent && put("!", legendContent);
			delete this._layersDataContainers[layerId];
		},

		_subLayerLegend: function(response) {

			var layerId = response.layerId,
				layerLabel = response.layerLabel,
				layerLegend = response.legend,
				container = this._layersDataContainers[layerId];

			if (!container) {
				container = this._layersDataContainers[layerId] = {};
			}

			if (container.legend) {
				put("!", container.legend);
			}

			container.legend = put("div.atlasLayerInfoMessage");

			var legendContent = put(container.legend, "div.layerLegend");
			put(legendContent, "div.layerLegendTitle", layerLabel);

			var legendContentImg = put(legendContent, "div.imageContainer");
			legendContentImg.innerHTML = "<img src='" + layerLegend + "' />";
		},

		_subThemesBrowserDragAndDrop: function(response) {

			var item = response.item,
				total = response.total,
				indexOld = response.indexOld,
				indexList = response.indexList;

			if (!item && !total && !indexOld && !indexList) {
				return;
			}

			this._publish(this.getMapChannel("REORDER_LAYERS"), {
				layerId: this._createLayerId(response.item.originalItem),
				newPosition: response.total - response.indexList,
				oldPosition: response.total - response.indexOld
			});
		},

		_subThemesBrowserNoDataMsgClicked: function(res) {

			this._goToCatalog();
		},

		_subThemesBrowserKeypadInput: function(res) {

			if (res.inputKey === "goToCatalog") {
				this._goToCatalog();
			}
		},

		_goToCatalog: function() {

			this._disableButtons();

			this._once(this.themesBrowser.getChannel("HIDDEN"),
				lang.hitch(this, function() {

				this._showBrowser(this.catalogView, this._atlasContainer,
					this.showBrowserAnimationClass, this.hideBrowserAnimationClass);
				}));

			this._publish(this.themesBrowser.getChannel("HIDE"));

			this._once(this.catalogView.getChannel("SHOWN"), lang.hitch(this, this._enableButtons));
		},

		_disableButtons: function() {

			this._emitEvt('DISABLE_THEMES_BUTTON', { key: "goToCatalog" });
			this._emitEvt('DISABLE_CATALOG_BUTTON', { key: "backToSelectedLayers" });
		},

		_enableButtons: function() {

			this._emitEvt('ENABLE_THEMES_BUTTON', { key: "goToCatalog" });
			this._emitEvt('ENABLE_CATALOG_BUTTON', { key: "backToSelectedLayers" });
		},

		_subCatalogViewKeypadInput: function(res) {

			if (res.inputKey === "backToSelectedLayers") {
				this._backToSelectedLayers();
			}
		},

		_subCatalogViewButtonEvent: function(res) {

			this._publish(this.templateDisplayerDetails.getChannel("HIDE"));

			var node = res.iconNode,
				item = res.item;

			if (node.firstChild) {
				node = node.firstChild;
			} else {
				node = put(node, 'div');
			}

			item.href = lang.replace(redmicConfig.viewPaths.serviceOGCCatalogDetails, item);

			this._emitEvt('INJECT_ITEM', {
				data: item,
				target: "tooltipDetails"
			});

			this._publish(this.templateDisplayerDetails.getChannel("SHOW"), {
				node: node,
				additionalNode: res.iconNode
			});
		},

		_backToSelectedLayers: function() {

			this._disableButtons();

			this._once(this.catalogView.getChannel("HIDDEN"),
				lang.hitch(this, function() {

				this._showBrowser(this.themesBrowser, this._atlasContainer,
					this.showBrowserAnimationClass, this.hideBrowserAnimationClass);
				}));

			this._publish(this.catalogView.getChannel("HIDE"));

			this._once(this.themesBrowser.getChannel("SHOWN"),
				lang.hitch(this, this._enableButtons));
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
				order: order
			});
		},

		_createLayerId: function(item) {

			var themeInspire = item.themeInspire ? item.themeInspire.code : 'default';

			return themeInspire + this.themeSeparator + item.name + this.layerIdSeparator + item.id;
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

			this._setSubscription({
				channel : layerInstance.getChannel("LAYER_LEGEND"),
				callback: "_subLayerLegend"
			});
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

			this._removeSubscription(layerInstance.getChannel("LAYER_LEGEND"));
			this._publish(layerInstance.getChannel('DISCONNECT'));
		},

		_subThemesBrowserButtonEvent: function(objReceived) {

			var btnId = objReceived.btnId,
				item = objReceived.item;

			if (btnId === "addLayer") {
				this._onAddLayerBrowserButtonClick(objReceived);
			} else if (btnId === "remove") {
				var path = objReceived.item.originalItem[this.pathProperty];
				this._emitEvt('DESELECT', [path]);
			} else if (btnId === "legend") {
				this._showLayerLegend(this._createLayerId(item.originalItem));
			} else if (btnId === "fitBounds") {
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
		},

		_showLayerLegend: function(layerId) {

			var container = this._layersDataContainers[layerId],
				legend = container ? container.legend : null;

			if (legend) {
				if (!this._legendInstances[layerId]) {
					this._legendInstances[layerId] = new declare(DataDisplayer).extend(_ShowInPopup)({
						parentChannel: this.getChannel(),
						ownChannel: "legend" + layerId,
						title: this.i18n.legend,
						width: 5,
						height: "sm"
					});
				}

				this._publish(this._legendInstances[layerId].getChannel("TOGGLE_SHOW"), {
					data: legend.innerHTML
				});
			} else {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.noLegendAvailable
				});
			}
		},

		_getItemToDeselect: function(ids) {

			return {
				items: ids
			};
		}
	});
});
