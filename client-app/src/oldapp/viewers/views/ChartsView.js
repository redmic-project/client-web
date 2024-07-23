define([
	'alertify/alertify.min'
	, "app/designs/embeddedContentWithTopbar/main/EmbeddedContentSelectionInTopbar"
	, "app/designs/chart/main/_ProcessDataDefinitionAndGetTimeSeries"
	, "app/designs/chart/main/ChartsWithLegendAndToolbarsAndSlider"
	, "app/designs/dynamicDualContent/main/FacetsWithDynamicRightContent"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, 'app/viewers/views/_TimeSeriesDataManagement'
	, "app/viewers/views/_TimeSeriesSelectionManagement"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_ShowInPopup"
	, "src/component/chart/ChartsContainer/_InfoOnMouseOver"
	, "src/component/chart/ChartsContainer/_TemporalAxisWithGridDrawing"
	, "src/component/chart/ChartsContainer/_VerticalAxesWithGridDrawing"
	, "src/component/chart/ChartsContainer/_ZoomByDragging"
	, "src/component/browser/HierarchicalImpl"
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_HierarchicalSelect"
	, "src/component/browser/_Framework"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/map/LeafletImpl"
	, "src/component/map/layer/PruneClusterLayerImpl"
	, "src/component/map/layer/_Highlightable"
	, "src/component/map/layer/_Selectable"
	, "templates/SurveyStationDataList"
], function (
	alertify
	, EmbeddedContentSelectionInTopbar
	, _ProcessDataDefinitionAndGetTimeSeries
	, ChartsWithLegendAndToolbarsAndSlider
	, FacetsWithDynamicRightContent
	, ListController
	, ListLayout
	, _TimeSeriesDataManagement
	, _TimeSeriesSelectionManagement
	, redmicConfig
	, declare
	, lang
	, _ShowInPopup
	, _InfoOnMouseOver
	, _TemporalAxisWithGridDrawing
	, _VerticalAxesWithGridDrawing
	, _ZoomByDragging
	, HierarchicalImpl
	, _ButtonsInRow
	, _HierarchicalSelect
	, _Framework
	, SelectionBox
	, LeafletImpl
	, PruneClusterLayerImpl
	, _Highlightable
	, _Selectable
	, ListTemplate
){
	return declare([
		EmbeddedContentSelectionInTopbar, _TimeSeriesDataManagement, _TimeSeriesSelectionManagement
	], {
		//	summary:
		//		Vista de ChartsView.

		constructor: function(args) {

			this.config = {
				perms: 1,
				target: redmicConfig.services.timeSeriesStations,
				browserTarget: "browser",
				browserPopupTarget: "browserPopup",
				mapTarget: "map",
				title: this.i18n.dataViewerByStations,
				idProperty: "uuid",

				embeddedButtons: {
					"showMap": {
						className: "fa-globe",
						title: this.i18n.map,
						group: "selection"
					},
					"showList": {
						className: "fa-list",
						title: this.i18n.list,
						group: "selection"
					},
					"showChart": {
						className: "fa-line-chart",
						title: this.i18n.charts,
						group: "display"
					}
				},

				_mapLayerSelectionTarget: 'mapLayerSelectionTarget',
				_guideMessagesStartupTimeout: 3000
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.chartsConfig = this._merge([{
				title: this.i18n.charts,
				parentChannel: this.getChannel(),
				chartsContainerExts: [
					_TemporalAxisWithGridDrawing,
					_VerticalAxesWithGridDrawing,
					_ZoomByDragging,
					_InfoOnMouseOver
				],
				aggregationToolSelection: {
					interval: [],
					metrics: ["avg"]
				},
				aggregationToolConfig: {
					defaultIntervalOptions: []
				}
			}, this.chartsConfig || {}]);

			this.filterConfig = this._merge([{
				parentChannel: this.getChannel(),
				initQuery: {
					size: null
				}
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				title: this.i18n.parametersByStations,
				browserBase: [HierarchicalImpl, _Framework, _ButtonsInRow],
				browserExts: [_HierarchicalSelect],
				browserConfig: {
					idProperty: "path",
					target: this.browserTarget,
					selectionTarget: this.target,
					noSelectParent: false,
					template: ListTemplate,
					bars: [{
						instance: SelectionBox,
						config: {
							omitShowSelectedOnly: true
						}
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								title: "info",
								condition: function(item) {

									return item.activityId;
								},
								href: lang.replace(redmicConfig.viewPaths.activityCatalogDetails, {
									id: '{activityId}'
								})
							}]
						}
					}
				}
			}, this.browserConfig || {}]);

			var browserPopupConfig = this._merge([this.browserConfig, {
				title: this.i18n.parametersByStation,
				browserConfig: {
					target: this.browserPopupTarget
				},
				width: 4,
				height: "md",
				reposition: "w"
			}]);

			this.browserPopupConfig = this._merge([browserPopupConfig, this.browserPopupConfig || {}]);

			this.mapLayerDefinitionConfig = this._merge([{
				idProperty: this.idProperty,
				selectorChannel: this.getChannel(),
				selectionTarget: this._mapLayerSelectionTarget,
				target: this.mapTarget,
				onEachFeature: lang.hitch(this, this.onEachFeature),
				bindPopupToMarkers: false
			}, this.mapLayerDefinitionConfig || {}]);
		},

		_initialize: function() {

			this.filterContainer = new FacetsWithDynamicRightContent(this.filterConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CHANGE_EMBEDDED_CONTENT', lang.hitch(this, this._onChangeEmbeddedContent));
			this._onEvt('HIDE', lang.hitch(this, this._onViewHidden));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.filterContainer.getChannel("SET_PROPS"), {
				secondaryContent: this.facets
			});

			this._showMap("showMap");
			this._getMapData();

			this._showGuideMessagesHandler = setTimeout(lang.hitch(this, this._showGuideMessagesAtStartup),
				this._guideMessagesStartupTimeout);
		},

		_showGuideMessagesAtStartup: function() {

			var onDismissEmptySelectionMessage = lang.hitch(this, this._onDismissEmptySelectionMessage);

			if (this._getEmptySelection()) {
				this._emptySelectionAlertify = alertify.message(this.i18n.cannotShowDataWithEmptySelection, 0);
				this._emptySelectionAlertify.callback = onDismissEmptySelectionMessage;
			} else {
				onDismissEmptySelectionMessage();
			}
		},

		_onDismissEmptySelectionMessage: function(dismissedByUser) {

			if (dismissedByUser && this._getEmptySelection()) {
				this._showSelectionAvailableMessageOnSelect = true;
			} else {
				this._showSelectionAvailableMessage();
			}

			delete this._emptySelectionAlertify;
		},

		_showSelectionAvailableMessage: function() {

			this._selectionAvailableAlertify = alertify.message(this.i18n.canShowDataWithSelectionAvailable, 0);
			this._selectionAvailableAlertify.callback = lang.hitch(this, this._onDismissSelectionAvailableMessage);
		},

		_onDismissSelectionAvailableMessage: function(dismissedByUser) {

			delete this._selectionAvailableAlertify;
		},

		_select: function(itemId) {

			var markerId = itemId.split('.')[1];
			this._selectMarker(markerId);

			this._updateGuideMessagesAfterSelect();
		},

		_deselect: function(itemId) {

			var markerId = itemId.split('.')[1];
			this._deselectMarker(markerId);

			this._updateGuideMessagesAfterDeselect();
		},

		_clearSelection: function() {

			this._clearMapLayerSelection();
		},

		_selectMarker: function(markerId) {

			//this._publishSelectionToMapLayer('SELECTED', markerId);
		},

		_deselectMarker: function(markerId) {

			//this._publishSelectionToMapLayer('DESELECTED', markerId);
		},

		_clearMapLayerSelection: function() {

			//this._publishSelectionToMapLayer('SELECTION_CLEARED');
		},

		_publishSelectionToMapLayer: function(action, markerId) {

			// TODO rompe la capa pruneCluster dejando rastros, arreglar
			var pubBody = {
				target: this._mapLayerSelectionTarget
			};

			if (markerId !== undefined) {
				pubBody.ids = markerId;
			}

			this._publish(this.getChannel(action), pubBody);
		},

		_updateGuideMessagesAfterSelect: function() {

			if (this._emptySelectionAlertify) {
				this._emptySelectionAlertify.dismiss();
			}

			if (this._showSelectionAvailableMessageOnSelect) {
				this._showSelectionAvailableMessage();
				delete this._showSelectionAvailableMessageOnSelect;
			}
		},

		_updateGuideMessagesAfterDeselect: function() {

			if (this._selectionAvailableAlertify && this._getEmptySelection()) {
				this._selectionAvailableAlertify.dismiss();
			}
		},

		_onChangeEmbeddedContent: function(evt) {

			var inputKey = evt.inputKey,
				buttonKeys = Object.keys(this.embeddedButtons),
				embeddedContentIndex = buttonKeys.indexOf(inputKey);

			if (embeddedContentIndex === 0) {
				this._showMap(inputKey);
				this._getMapData();
			} else if (embeddedContentIndex === 1) {
				this._showList(inputKey);
				this._getListData();
			} else if (embeddedContentIndex === 2) {
				this._prepareShowChart(inputKey);
			}
		},

		_showMap: function(inputKey) {

			this._initializeMap();

			this._publish(this.filterContainer.getChannel("SET_PROPS"), {
				primaryContent: this.map
			});
			this._embedModule(this.filterContainer, inputKey);

			this._resetMarkerActive();
		},

		_initializeMap: function() {

			if (!this.map) {
				this.map = new LeafletImpl({
					parentChannel: this.filterContainer.getChannel()
				});
			}

			if (!this.mapLayerImpl) {
				this.mapLayerDefinitionConfig.parentChannel = this.filterContainer.getChannel();
				this.mapLayerDefinitionConfig.mapChannel = this.map.getChannel();

				var mapLayerDefinition = declare([PruneClusterLayerImpl, _Highlightable, _Selectable]);

				this.mapLayerImpl = new mapLayerDefinition(this.mapLayerDefinitionConfig);

				this._publish(this.map.getChannel("ADD_LAYER"), {
					layer: this.mapLayerImpl
				});
			}

			if (!this.browserPopup) {
				this.browserPopupConfig.parentChannel = this.filterContainer.getChannel();

				var browserPopupDefinition = declare([ListLayout, ListController]).extend(_ShowInPopup);
				this.browserPopup = new browserPopupDefinition(this.browserPopupConfig);

				this._setSubscription({
					channel : this.browserPopup.getChannel("HIDDEN"),
					callback: "_subBrowserPopupHidden"
				});
			}
		},

		_showList: function(inputKey) {

			this._initializeList();

			this._publish(this.filterContainer.getChannel("SET_PROPS"), {
				primaryContent: this.browser
			});
			this._embedModule(this.filterContainer, inputKey);
		},

		_initializeList: function() {

			if (!this.browser) {
				this.browserConfig.parentChannel = this.filterContainer.getChannel();
				this.browser = new declare([ListLayout, ListController])(this.browserConfig);
			}
		},

		_prepareShowChart: function(inputKey) {

			if (this._getEmptySelection()) {
				this._emitEvt('COMMUNICATION', {
					level: "warning",
					description: this.i18n.noItem
				});
				return;
			}

			clearTimeout(this._showGuideMessagesHandler);

			if (this._selectionAvailableAlertify) {
				this._selectionAvailableAlertify.dismiss();
			}

			this._getListDataDfd ? this._getListDataDfd.then(lang.hitch(this, this._showChart, inputKey)) :
				this._showChart(inputKey);
		},

		_showChart: function(inputKey) {

			if (!this._showChartIsValid()) {
				this._emitEvt('COMMUNICATION', {description: this.i18n.noItem});
				return;
			}

			this._initializeChart();

			this._embedModule(this.chartContainer, inputKey);

			if (this._updateDataChart) {
				this._publish(this.chartContainer.getChannel("SET_PROPS"), {
					chartsData: this.seriesData
				});
			}

			this._updateDataChart = false;
		},

		_initializeChart: function() {

			if (!this.chartContainer) {
				this.chartContainer = new declare([
					ChartsWithLegendAndToolbarsAndSlider,
					_ProcessDataDefinitionAndGetTimeSeries
				])(this.chartsConfig);
			}
		},

		onEachFeature: function(data, marker) {

			marker.unbindPopup();

			marker.on("click", lang.hitch(this, this._clickInMarker, {
				layer: marker,
				data: data
			}));
		},

		_clickInMarker: function(obj) {

			var currClickedStationId = obj.data[this.idProperty];

			if (this._lastClickedStationId) {
				if (currClickedStationId === this._lastClickedStationId) {
					this._lastClickedStationId = null;
				}
				this._publish(this.browserPopup.getChannel('HIDE'));
			}

			if (currClickedStationId !== this._lastClickedStationId) {
				this._lastClickedStationId = currClickedStationId;

				this._emitEvt('GET', {
					target: this.target,
					requesterId: this.getOwnChannel(),
					id: currClickedStationId
				});
			}
		},

		_subBrowserPopupHidden: function() {

			this._resetMarkerActive();
		},

		_resetMarkerActive: function() {

			if (this._lastClickedStationId) {
				this._publish(this.mapLayerImpl.getChannel("DELETE_HIGHLIGHT_MARKER"), {
					id: this._lastClickedStationId
				});
			}

			this._lastClickedStationId = false;
		},

		_onViewHidden: function() {

			clearTimeout(this._showGuideMessagesHandler);
			this._emptySelectionAlertify && this._emptySelectionAlertify.dismiss();
			this._selectionAvailableAlertify && this._selectionAvailableAlertify.dismiss();
		}
	});
});
