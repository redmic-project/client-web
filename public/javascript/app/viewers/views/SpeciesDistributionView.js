define([
	'alertify/alertify.min'
	, "app/base/views/extensions/_ShowInPopupResultsFromQueryOnMap"
	, "app/base/views/extensions/_QueryOnMap"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "app/redmicConfig"
	, "dijit/layout/LayoutContainer"
	, "dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "put-selector/put"
	, "redmic/base/Credentials"
	, "redmic/form/FormContainer"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/map/Atlas"
	, "redmic/modules/map/layer/_AddFilter"
	, "redmic/modules/map/layer/_ListenBounds"
	, "redmic/modules/map/layer/_ListenZoom"
	, "redmic/modules/map/layer/_RadiusOnClick"
	, "redmic/modules/map/layer/_PublishInfo"
	, "redmic/modules/map/layer/GridLayerImpl"
	, "redmic/modules/map/layer/PruneClusterLayerImpl"
	, "redmic/modules/map/layer/WmsLayerImpl"
	, "redmic/modules/search/TextImpl"
	, "redmic/modules/tree/_LazyLoad"
	, "redmic/modules/tree/_LeafSelection"
//	, "redmic/modules/tree/_SelectionBox"
	, "redmic/modules/tree/CbtreeImpl"
	, "templates/SpeciesDistributionPopup"
	, "templates/SpeciesList"
], function(
	alertify
	, _ShowInPopupResultsFromQueryOnMap
	, _QueryOnMap
	, Controller
	, Layout
	, redmicConfig
	, LayoutContainer
	, ContentPane
	, TabContainer
	, declare
	, lang
	, aspect
	, Deferred
	, put
	, Credentials
	, FormContainer
	, _Filter
	, _Selection
	, _Store
	, ListImpl
	, _ButtonsInRow
	, _Framework
	, _Select
	, SelectionBox
	, Pagination
	, Total
	, Atlas
	, _AddFilter
	, _ListenBounds
	, _ListenZoom
	, _RadiusOnClick
	, _PublishInfo
	, GridLayerImpl
	, PruneClusterLayerImpl
	, WmsLayerImpl
	, TextImpl
	, _LazyLoad
	, _LeafSelection
//	, _SelectionBoxTree
	, CbtreeImpl
	, TemplatePopup
	, TemplateList
){
	return declare([Layout, Controller, _Selection, _Store, _Filter, _QueryOnMap, _ShowInPopupResultsFromQueryOnMap], {
		//	summary:
		//		Vista de SpeciesDistribution.
		//	description:
		//		Permite visualizar las distribución de las especies.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function(args) {

			this.config = {
				title: this.i18n["species-distribution"],
				"class": "",

				defaultLayer: "gridLayer",

				layersGridInfo: [
					{ layer: "grid5000", label:"5000x5000", value:0, selected: true },
					{ layer: "grid1000", label:"1000x1000", value:1 },
					{ layer: "grid500", label:"500x500", value:2 },
					{ layer:"grid100", label:"100x100", value:3 }
				],

				_currentZoomLevel: 7,
				grid5000MinZoom: 7,
				grid1000MinZoom: 10,
				grid500MinZoom: 11,
				grid100MinZoom: 14,

				mode: [{
					selectorType: "checkbox",
					selectionMode: "multiple",
					label: this.i18n.exist,
					value: 0,
					selected: true
				},{
					selectorType: "checkbox",
					selectionMode: "multiple",
					label: this.i18n.registersCount,
					value: 1
				},{
					selectorType: "checkbox",
					selectionMode: "multiple",
					label: this.i18n.speciesCount,
					value: 2
				},{
					selectorType:"checkbox",
					selectionMode: "multiple",
					label:this.i18n.speciesPresence,
					value: 3
				}],

				secondaryListButtons: [{
					icon: "fa-database",
					btnId: "activityInfo",
					title: 'parentActivityInfo',
					href: redmicConfig.viewPaths.activityCatalogDetailsRegister,
					condition: function(item) {
						return !!item.properties.activityId;
					}
				}],

				gridLayerTarget: redmicConfig.services.distribution,
				elasticTarget: redmicConfig.services.species,
				taxonsTarget: redmicConfig.services.taxons,
				speciesListTarget: "speciesDistributionListSpecies",

				formTemplate: "viewers/views/templates/forms/SpeciesDistribution",

				currentGridLayer: null,
				currentMode: null,
				typeGroupProperty: "category",

				//precision: [0, 5000],
				confidences: [1, 2, 3, 4],

				events: {
					SET_LAYER_PROPS: "setLayerProps"
				},

				actions: {
					VALUE_CHANGED: "valueChanged"
				},

				ownChannel: "speciesDistribution"
			};

			lang.mixin(this, this.config, args);

			this.currentGridLayer = this.layersGridInfo[0].layer;
			this.currentMode = 3;
			this.target = this.taxonsTarget;
			this.selectionTarget = redmicConfig.services.distribution;

			aspect.after(this, "_subSelected", lang.hitch(this, this._onChangeSelection));
			aspect.after(this, "_subDeselected", lang.hitch(this, this._onChangeSelection));
		},

		_setConfigurations: function() {

			this.filterConfig = this._merge([{
				target: this.elasticTarget,
				parentChannel: this.getChannel()
			}, this.filterConfig || {}]);

			this.searchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.elasticTarget,
				highlightField: ['scientificName', 'commonName', 'peculiarity.popularNames',
					"scientificName.suggest", "commonName.suggest", "peculiarity.popularNames.suggest"],
				searchFields: ["scientificName", "aphia", "scientificName.suggest", "commonName",
					"commonName.suggest", "peculiarity.popularNames.suggest"],
				itemLabel: null
			}, this.searchConfig || {}]);

			this.browserConfig = this._merge([{
				idProperty: "path",
				parentChannel: this.getChannel(),
				perms: this.perms,
				target: this.elasticTarget,
				selectionTarget: this.selectionTarget,
				template: TemplateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: redmicConfig.viewPaths.speciesCatalogDetails
						}]
					}
				},
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Pagination
				}]
			}, this.browserConfig || {}]);

			this.treeConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.taxonsTarget,
				selectionTarget: this.selectionTarget,
				idProperty: "path",
				perms: this.perms,
				itemLabel: "{rank.name} - {scientificName} ({leaves})",
				createQuery: function(item) {
					var query = {
						"returnFields" : ["id", "scientificName", "path", "rank", "leaves"],
						"regexp": [{"field": "path", "exp": "root.[0-9]+"}]
					};

					if (!item)
						return query;

					query.regexp[0].exp = item.path + ".[0-9]+";

					return query;
				}
			}, this.treeConfig || {}]);

			this.d3LayerConfig = this._merge([{
				parentChannel: this.getChannel(),
				layerId: "taxonDistribution",
				target: this.gridLayerTarget + "/" + this.currentGridLayer,
				externalShouldAbortRequest: lang.hitch(this, this._shouldAbortRequestForDataLayer),
				confidences: this.confidences
			}, this.d3LayerConfig || {}]);

			this.pruneClusterLayerConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: redmicConfig.services.citationAll,
				filterConfig: {
					initQuery: {
						returnFields: ["geometry", "id", "uuid", "properties.collect.radius"]/*,
						terms: {
							precision: this.precision
						},
						z: {
							min: -5000,
							max: 5000
						}*/
					}
				},
				categoryStyle: "bubbles",
				idProperty: "uuid",
				externalShouldAbortRequest: lang.hitch(this, this._shouldAbortRequestForDataLayer),
				getPopupContent: this._getPopupContent,
				getMarkerCategory: function(feature) {
					if (feature._meta.category && feature._meta.category == 'ci')
						return 0;
					else
						return 1;
				}
			}, this.pruneClusterLayerConfig || {}]);
		},

		_initialize: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			var BrowserDefinition = declare([ListImpl, _Framework, _ButtonsInRow, _Select]);
			this.browser = new BrowserDefinition(this.browserConfig);

			var tree = declare([CbtreeImpl, _LazyLoad, _LeafSelection/*, _SelectionBoxTree*/]);
			this.tree = new tree(this.treeConfig);

			this.d3LayerConfig.mapChannel = this.map.getChannel();

			var d3LayerDefinition = declare(declare([GridLayerImpl, _AddFilter, _PublishInfo])
				.extend(_ListenBounds)).extend(_ListenZoom);
			this.gridLayer = new d3LayerDefinition(this.d3LayerConfig);

			this.pruneClusterLayerConfig.mapChannel = this.map.getChannel();

			var pruneClusterLayerDef = declare(declare([PruneClusterLayerImpl, _AddFilter, _RadiusOnClick])
				.extend(_ListenBounds)).extend(_ListenZoom);
			this.pruneClusterLayer = new pruneClusterLayerDef(this.pruneClusterLayerConfig);

			this.grid5000Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				layerDefinition: 'grid5000m'
			});

			this.grid1000Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				layerDefinition: 'grid1000m'
			});

			this.grid500Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				layerDefinition: 'grid500m'
			});

			this.grid100Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				layerDefinition: 'grid100m'
			});

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				perms: this.perms,
				getMapChannel: lang.hitch(this.map, this.map.getChannel)
			});
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.map.getChannel("SHOWN"),
				callback: "_subMapShown"
			},{
				channel : this.map.getChannel("ZOOM_SET"),
				callback: "_subMapZoomSet",
				options: {
					predicate: lang.hitch(this, this._chkModeIsValidForGrid)
				}
			});
		},

		_definePublications: function () {

			this.publicationsConfig.push({
				event: 'SET_LAYER_PROPS',
				channel : this.gridLayer.getChannel("SET_PROPS")
			},{
				event: 'SET_LAYER_PROPS',
				channel : this.pruneClusterLayer.getChannel("SET_PROPS")
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._onShown));
		},

		postCreate: function() {

			this.inherited(arguments);

			var browserAndSearchContainer = new LayoutContainer({
				title: this.i18n.list,
				'class': "marginedContainer noScrolledContainer"
			});

			this.gridNode = new ContentPane({
				region: "center",
				'class': 'stretchZone'
			});

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.gridNode.domNode
			});

			this.textSearchNode = new ContentPane({
				'class': "topZone",
				region: "top"
			});

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode.domNode
			});

			browserAndSearchContainer.addChild(this.textSearchNode);
			browserAndSearchContainer.addChild(this.gridNode);

			this.treeNode = new ContentPane({
				title: this.i18n.tree,
				'class': "scrollWrapper"
			});

			this._publish(this.tree.getChannel("SHOW"), {
				node: this.treeNode.domNode
			});

			this._publish(this.gridLayer.getChannel('SET_PROPS'), {
				minZoom: this.grid5000MinZoom,
				currentGridLayer: this.currentGridLayer
			});

			this._emitEvt('ADD_LAYER', {layer: this.gridLayer});
			this._emitEvt('ADD_LAYER', {layer: this.pruneClusterLayer});

			this._clearAndDisconnectLayer(this.pruneClusterLayer);

			this.tabs = new TabContainer({
				tabPosition: "top",
				region: "center",
				'class': "mediumSolidContainer sideTabContainer borderRadiusTabContainer"
			});

			this.tabs.addChild(browserAndSearchContainer);
			this.tabs.addChild(this.treeNode);
			this.tabs.addChild(this._createFilterSidebarContent());
			this.tabs.addChild(this._createAtlas());
			this.tabs.placeAt(this.contentNode);
			this.tabs.startup();

			this._emitEvt('REFRESH');
		},

		_onShown: function() {

			this.tabs.resize();
		},

		_onChangeSelection: function(response) {

			clearTimeout(this._updateDataLayerTimeoutHandler);
			this._updateDataLayerTimeoutHandler = setTimeout(lang.hitch(this, this._updateDataLayer), 1);
		},

		_updateDataLayer: function(/*response*/) {

			var instance = this[this.currentMode < 3 ? "gridLayer" : "pruneClusterLayer"],
				selectIds = Credentials.get("selectIds");

			if (selectIds && selectIds[this.selectionTarget]) {

				this.selectIds = selectIds[this.selectionTarget];

				var obj = {
					"terms": {
						"selection": this.selectIds
					}
				};

				// TODO cuando los terms en el schema esten con propiedades borrar el if
				if (this.currentMode === 3) {
					if (this.precision) {
						obj.precision = this.precision;
					}
				} else {
					obj.terms.confidences = this.confidences;
				}

				this._publish(instance.getChannel("REFRESH"), obj);
			}
		},

		_clearSelection: function(response) {

			this._publish(this.gridLayer.getChannel("CLEAR"));

			this._publish(this.pruneClusterLayer.getChannel("CLEAR"));
		},

		_subMapShown: function(response) {

			this.mapInstance = response.instance;
		},

		_subMapZoomSet: function(response) {

			this._currentZoomLevel = response.zoom;

			this._checkZoomLevel();

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "speciesDistributionZoom-" + response.zoom
				}
			});
		},

		_checkZoomLevel: function() {

			var limit = this[this.currentGridLayer + "MinZoom"],
				zoom = this._currentZoomLevel;

			this._emitEvt('SET_LAYER_PROPS', {
				minZoom: limit
			});

			if (zoom < limit) {
				// TODO ojo, esto borra todo, debería borrar solo las repetidas (del tipo que se emite en esta vista)
				alertify.dismissAll();
				this._emitEvt('COMMUNICATION', {description: this.i18n.zoomLevelTooLowForCurrentMode});
			} else {
				// TODO ojo, esto borra todo, debería borrar solo las repetidas (del tipo que se emite en esta vista)
				alertify.dismissAll();
			}
		},

		_chkModeIsValidForGrid: function() {

			return this.currentMode < 3;
		},

		_getPopupContent: function(data) {

			var dfd = new Deferred(),
				obj = {
					i18n: this.i18n
				},
				parseData = function(resWrapper) {
					obj.feature = resWrapper.res.data;

					if (obj.feature.properties.activityId) {
						this._once(this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
							lang.hitch(this, parseDataActivity));

						this._emitEvt('GET', {
							target: redmicConfig.services.activity,
							requesterId: this.getOwnChannel(),
							id: obj.feature.properties.activityId
						});
					} else {
						dfd.resolve(TemplatePopup(obj));
					}
				},
				parseDataActivity = function(resWrapper) {

					obj.feature.properties.activity = resWrapper.res.data;

					dfd.resolve(TemplatePopup(obj));
				};

			this._once(this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE), lang.hitch(this, parseData));

			this._emitEvt("GET", {
				target: redmicConfig.services.citationAll,
				requesterId: this.getOwnChannel(),
				id: data.feature.uuid
			});

			return dfd;
		},

		_changeGrid: function(value) {

			var newLayer = this.layersGridInfo[value].layer;

			this._changeGridLayer(newLayer, this[newLayer + "Layer"]);

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "changeGridSize" + newLayer
				}
			});
		},

		_changeGridLayer: function(newLayer, layerInstance) {

			this._emitEvt('REMOVE_LAYER', {
				layer: this[this.currentGridLayer + "Layer"]
			});

			this.currentGridLayer = newLayer;

			this._emitEvt('SET_LAYER_PROPS', {
				minZoom: this[this.currentGridLayer + "MinZoom"],
				currentGridLayer: this.currentGridLayer
			});

			this._emitEvt('ADD_LAYER', {layer: layerInstance});

			this._publish(this.gridLayer.getChannel("CHANGE_TARGET"), {
				target: this.gridLayerTarget + "/" + this.currentGridLayer
			});

			this._checkZoomLevel();
		},

		_changeMode: function(value) {

			var newMode = this.mode[value].value,
				oldLayer = this.currentMode < 3 ? "gridLayer" : "pruneClusterLayer",
				newLayer = newMode < 3 ? "gridLayer" : "pruneClusterLayer";

			this._clearAndDisconnectLayer(this[oldLayer]);

			this._publish(this[newLayer].getChannel("CONNECT"), {
				actions: ["REQUEST", "LAYER_LOADING", "LAYER_LOADED"]
			});

			this.currentMode = newMode;

			this._emitEvt('SET_LAYER_PROPS', {
				currentMode: this.currentMode
			});

			this._updateDataLayer();

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "changeDistributionMode:" + this.mode[value].label
				}
			});

			if (this.currentMode > 2) {
				this._emitEvt('REMOVE_LAYER', {
					layer: this[this.currentGridLayer + "Layer"]
				});

				this._hideInputForm('grid', true);
				this._hideInputForm('confidences', true);
				this._hideInputForm('precisionSlider', false);
				this._hideInputForm('zSlider', false);
			} else {
				this._emitEvt('ADD_LAYER', {
					layer: this[this.currentGridLayer + "Layer"]
				});
				this._hideInputForm('grid', false);
				this._hideInputForm('confidences', false);
				this._hideInputForm('precisionSlider', true);
				this._hideInputForm('zSlider', true);
			}
		},

		_clearAndDisconnectLayer: function(layer) {

			this._publish(layer.getChannel("CLEAR"));

			this._publish(layer.getChannel("DISCONNECT"), {
				actions: ["REQUEST", "LAYER_LOADING", "LAYER_LOADED"]
			});
		},

		_changeConfidences: function(values) {

			var confidences = [];
			for (var i = 0; i < values.length; i++) {
				confidences.push(parseInt(values[i], 10));
			}

			this.confidences = confidences;

			// TODO cuando los terms en el schema esten con propiedades, cambiar lo de selection
			this._publish(this.gridLayer.getChannel("REFRESH"), {
				"terms": {
					"selection": this.selectIds,
					"confidences": this.confidences
				}
			});

			this._emitEvt('SET_LAYER_PROPS', {
				confidences: confidences
			});

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "changeDistributionConfidences" + confidences
				}
			});
		},

		_changePrecisionSlider: function(value) {

			var obj = {
				terms: {
					selection: this.selectIds
				},
				precision: value
			};

			this._publish(this.pruneClusterLayer.getChannel("REFRESH"), obj);

			if (value) {
				this._emitEvt('TRACK', {
					type: TRACK.type.event,
					info: {
						category: TRACK.category.button,
						action: TRACK.action.click,
						label: "changeDistributionPrecision:" + value.min + "-" + value.max
					}
				});
			}
		},

		_changeZSlider: function(value) {

			var obj = {
				z: value
			};

			this._publish(this.pruneClusterLayer.getChannel("REFRESH"), obj);

			if (value) {
				this._emitEvt('TRACK', {
					type: TRACK.type.event,
					info: {
						category: TRACK.category.button,
						action: TRACK.action.click,
						label: "changeDistributionDepth:" + value.min + "-" + value.max
					}
				});
			}
		},

		_hideInputForm: function(inputKey, hide) {

			var input = this._inputsFilterSidebar[inputKey];

			if (!input) {
				return;
			}

			var obj = {
					label: true
				},
				parentNode = input.node.parentNode;

			if (hide) {
				parentNode && put(parentNode, ".hidden");
				this._publish(this._buildChannel(input.channel, this.actions.HIDE), obj);
			} else {
				parentNode && put(parentNode, "!hidden");
				this._publish(this._buildChannel(input.channel, this.actions.SHOW), obj);
			}
		},

		_createFilterSidebarContent: function() {

			// TODO cambiar por modulo form

			this.formWidget = new FormContainer({
				title: this.i18n.mode,
				region: "center",
				template: this.formTemplate,
				parentChannel: this.getChannel(),
				width: 8,
				i18n: this.i18n,
				loadInputs: lang.hitch(this, this._inputsFilterSidebarContent),
				isDisableInputs: true
			});

			this.formWidget.startup();

			return this.formWidget;
		},

		_createAtlas: function() {

			var cp = new ContentPane({
				title: this.i18n.themes,
				region:"center"
			});

			this._publish(this.atlas.getChannel("SHOW"), {
				node: cp.domNode
			});

			return cp;
		},

		_inputsFilterSidebarContent: function(inputs) {

			this._inputsFilterSidebar = inputs;

			for (var key in this._inputsFilterSidebar) {

				if ('precisionSlider' === key || 'zSlider' === key) {
					this._once(this._buildChannel(this._inputsFilterSidebar[key].channel, this.actions.SHOWN),
						lang.hitch(this, this._hideInputForm, key, true));
				}

				this._publish(this._buildChannel(this._inputsFilterSidebar[key].channel, this.actions.SHOW), {
					node: this._inputsFilterSidebar[key].node
				});

				this._subscribe(this._buildChannel(this._inputsFilterSidebar[key].channel, this.actions.VALUE_CHANGED),
					lang.hitch(this, this._subChanged));
			}

			// TODO solución provisional, ya que se duplica la capa del grid
			setTimeout(lang.hitch(this, this._changeMode, 0));
		},

		_subChanged: function(res) {

			if (res.name === 'confidences') {
				this._changeConfidences(res.value);
			} else if (res.name === 'mode') {
				this._changeMode(res.value);
			} else if (res.name === 'grid') {
				this._changeGrid(res.value);
			} else if (res.name === 'precisionSlider') {
				this._changePrecisionSlider(res.value);
			} else if (res.name === 'zSlider') {
				this._changeZSlider(res.value);
			}
		},

		_shouldAbortRequestForDataLayer: function() {

			return this._getEmptySelection();
		}
	});
});
