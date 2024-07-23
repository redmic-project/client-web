define([
	'alertify/alertify.min'
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "put-selector/put"
	, "src/utils/Credentials"
	, "src/component/atlas/Atlas"
	, "src/component/base/_Filter"
	, "src/component/base/_Selection"
	, "src/component/base/_Store"
	, "src/component/browser/ListImpl"
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_Framework"
	, "src/component/browser/_Select"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/browser/bars/Pagination"
	, "src/component/browser/bars/Total"
	, 'src/component/form/FormContainerImpl'
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, "src/component/map/layer/_AddFilter"
	, "src/component/map/layer/_ListenBounds"
	, "src/component/map/layer/_ListenZoom"
	, "src/component/map/layer/_RadiusOnClick"
	, "src/component/map/layer/_PublishInfo"
	, "src/component/map/layer/GridLayerImpl"
	, "src/component/map/layer/PruneClusterLayerImpl"
	, "src/component/map/layer/WmsLayerImpl"
	, "src/component/mapQuery/QueryOnMap"
	, "src/component/search/TextImpl"
	, "src/component/tree/_LazyLoad"
	, "src/component/tree/_LeafSelection"
//	, "src/component/tree/_SelectionBox"
	, "src/component/tree/CbtreeImpl"
	, "templates/SpeciesDistributionPopup"
	, "templates/SpeciesList"
], function(
	alertify
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, aspect
	, Deferred
	, put
	, Credentials
	, Atlas
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
	, FormContainerImpl
	, TabsDisplayer
	, GenericWithTopbarDisplayerImpl
	, _AddFilter
	, _ListenBounds
	, _ListenZoom
	, _RadiusOnClick
	, _PublishInfo
	, GridLayerImpl
	, PruneClusterLayerImpl
	, WmsLayerImpl
	, QueryOnMap
	, TextImpl
	, _LazyLoad
	, _LeafSelection
//	, _SelectionBoxTree
	, CbtreeImpl
	, TemplatePopup
	, TemplateList
) {

	return declare([Layout, Controller, _Selection, _Store, _Filter], {
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
				browserPageSize: 25,

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
				initQuery: {
					size: this.browserPageSize
				},
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
					instance: Pagination,
					config: {
						rowPerPage: this.browserPageSize
					}
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

			this.atlasConfig = this._merge([{
				parentChannel: this.getChannel(),
				perms: this.perms
			}, this.atlasConfig || {}]);

			this.queryOnMapConfig = this._merge([{
				parentChannel: this.getChannel(),
				typeGroupProperty: this.typeGroupProperty
			}, this.queryOnMapConfig || {}]);
		},

		_initialize: function() {

			this._createSpeciesCatalog();
			this._createSpeciesTree();
			this._createSettingsForm();
			this._createMapLayers();

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.atlasConfig.addTabChannel = this._tabsDisplayer.getChannel('ADD_TAB');
			this.atlasConfig.getMapChannel = getMapChannel;

			this.queryOnMapConfig.getMapChannel = getMapChannel;
			this.queryOnMapConfig.tabsDisplayerChannel = this._tabsDisplayer.getChannel();
		},

		_createSpeciesCatalog: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			var BrowserDefinition = declare([ListImpl, _Framework, _ButtonsInRow, _Select]);
			this.browser = new BrowserDefinition(this.browserConfig);

			this._speciesBrowserWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browser,
				title: this.i18n.speciesCatalogView
			});

			this._publish(this._speciesBrowserWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this.textSearch
			});
		},

		_createSpeciesTree: function() {

			var TreeDefinition = declare([CbtreeImpl, _LazyLoad, _LeafSelection/*, _SelectionBoxTree*/]);
			this.tree = new TreeDefinition(this.treeConfig);

			this._speciesTreeWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.tree,
				title: this.i18n.taxonTree
			});
		},

		_createSettingsForm: function() {

			this._settingsForm = new FormContainerImpl({
				parentChannel: this.getChannel(),
				template: this.formTemplate,
				formContainerConfig: {
					loadInputs: lang.hitch(this, this._inputsFilterSidebarContent)
				}
			});

			this._settingsFormWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this._settingsForm,
				title: this.i18n.settings
			});
		},

		_createMapLayers: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel),
				mapChannel = getMapChannel();

			this.d3LayerConfig.mapChannel = mapChannel;

			var d3LayerDefinition = declare(declare([GridLayerImpl, _AddFilter, _PublishInfo])
				.extend(_ListenBounds)).extend(_ListenZoom);
			this.gridLayer = new d3LayerDefinition(this.d3LayerConfig);

			this.pruneClusterLayerConfig.mapChannel = mapChannel;

			var pruneClusterLayerDef = declare(declare([PruneClusterLayerImpl, _AddFilter, _RadiusOnClick])
				.extend(_ListenBounds)).extend(_ListenZoom);
			this.pruneClusterLayer = new pruneClusterLayerDef(this.pruneClusterLayerConfig);

			this.grid5000Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: mapChannel,
				layerDefinition: 'grid5000m'
			});

			this.grid1000Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: mapChannel,
				layerDefinition: 'grid1000m'
			});

			this.grid500Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: mapChannel,
				layerDefinition: 'grid500m'
			});

			this.grid100Layer = new WmsLayerImpl({
				parentChannel: this.getChannel(),
				mapChannel: mapChannel,
				layerDefinition: 'grid100m'
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

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.gridLayer.getChannel('SET_PROPS'), {
				minZoom: this.grid5000MinZoom,
				currentGridLayer: this.currentGridLayer
			});

			this._emitEvt('ADD_LAYER', {layer: this.gridLayer});
			this._emitEvt('ADD_LAYER', {layer: this.pruneClusterLayer});

			this._clearAndDisconnectLayer(this.pruneClusterLayer);

			this._addTabsToSideContent();
			this._emitEvt('REFRESH');
		},

		_addTabsToSideContent: function() {

			var addTabChannel = this._tabsDisplayer.getChannel('ADD_TAB');

			this._publish(addTabChannel, {
				title: this.i18n.speciesCatalogView,
				iconClass: 'fr fr-crab',
				channel: this._speciesBrowserWithTopbar.getChannel()
			});

			this._publish(addTabChannel, {
				title: this.i18n.taxonTree,
				iconClass: 'fa fa-sitemap',
				channel: this._speciesTreeWithTopbar.getChannel()
			});

			this._publish(addTabChannel, {
				title: this.i18n.settings,
				iconClass: 'fa fa-cog',
				channel: this._settingsFormWithTopbar.getChannel()
			});

			this._createAtlas();

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});
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

		_createAtlas: function() {

			this.atlas = new Atlas(this.atlasConfig);
			this._queryOnMap = new QueryOnMap(this.queryOnMapConfig);
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
