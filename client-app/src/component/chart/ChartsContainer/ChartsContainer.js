define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, 'put-selector'
	, "RWidgets/Utilities"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "./_ChartsContainerItfc"
], function(
	d3
	, declare
	, lang
	, Deferred
	, put
	, Utilities
	, _Module
	, _Show
	, _ChartsContainerItfc
) {

	return declare([_Module, _Show, _ChartsContainerItfc], {
		//	summary:
		//		Módulo para visualizar gráficas por capas.
		//	description:
		//		Proporciona un contenedor para ver gráficas, independientemente de su tipo.
		//		Además actua como punto de encuentro entre otros módulos con las capas, para
		//		escucharlas y publicarles cosas.

		constructor: function(args) {

			this.config = {
				events: {
					CHARTS_CONTAINER_READY: "chartsContainerReady",
					LAYER_ADDED: "layerAdded",
					LAYER_SHOWN: "layerShown",
					LAYER_HIDDEN: "layerHidden",
					LAYER_DRAWN: "layerDrawn",
					LAYER_CLEARED: "layerCleared",
					LAYER_UPDATED: "layerUpdated",
					GOT_LAYER_INFO: "gotLayerInfo",
					LAYER_COLOR_SET: "layerColorSet",
					LAYER_INFO_UPDATED: "layerInfoUpdated",
					DOMAIN_CHANGED: "domainChanged",
					FOCUS_CHANGED: "focusChanged",
					AXIS_SHOWN: "axisShown",
					AXIS_HIDDEN: "axisHidden",
					AXIS_DRAWN: "axisDrawn",
					AXIS_CLEARED: "axisCleared",
					BUTTONS_CONTAINER_SET: "buttonsContainerSet",
					INTERVAL_CHANGED: "intervalChanged"
				},
				actions: {
					CHARTS_CONTAINER_READY: "chartsContainerReady",
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					SHOW_LAYER: "showLayer",
					HIDE_LAYER: "hideLayer",
					LAYER_ADDED: "layerAdded",
					LAYER_SHOWN: "layerShown",
					LAYER_HIDDEN: "layerHidden",
					LAYER_DRAWN: "layerDrawn",
					CLEAR: "clear",
					LAYER_CLEARED: "layerCleared",
					LAYER_UPDATED: "layerUpdated",
					GET_LAYER_INFO: "getLayerInfo",
					GOT_LAYER_INFO: "gotLayerInfo",
					LAYER_COLOR_SET: "layerColorSet",
					LAYER_INFO_UPDATED: "layerInfoUpdated",
					DOMAIN_CHANGED: "domainChanged",
					CHANGE_DOMAIN: "changeDomain",
					FOCUS_CHANGED: "focusChanged",
					SHOW_HORIZONTAL_GRID_AXIS: "showHorizontalGridAxis",
					SHOW_VERTICAL_GRID_AXIS: "showVerticalGridAxis",
					HIDE_HORIZONTAL_GRID_AXIS: "hideHorizontalGridAxis",
					HIDE_VERTICAL_GRID_AXIS: "hideVerticalGridAxis",
					AXIS_SHOWN: "axisShown",
					AXIS_HIDDEN: "axisHidden",
					AXIS_DRAWN: "axisDrawn",
					AXIS_CLEARED: "axisCleared",
					INTERVAL_CHANGED: "intervalChanged"
				},

				marginContainer: 5,
				paddingContainer: 0,
				className: "chartsContainer",
				pathSeparator: ".",

				_width: 0,
				_height: 0,
				_innerWidth: 0,
				_innerHeight: 0,
				_sidePaddingContainer: 30,
				_topPaddingContainer: 5,
				_bottomPaddingContainer: 30,
				_horizontalTranslate: 0,
				_verticalTranslate: 0,
				_layers: {},
				_pendingLayersDfds: {},
				_paramsByLayerId: {},
				_layerContainers: {},
				_subscriptionsForLayers: {},
				_publicationsForLayers: {},
				_hiddenLayers: {},
				_layersLimits: {},
				_nodeEvaluationIntervalTimeout: 100
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getParentChannel("SHOWN"),
				callback: "_subAncestorShown"
			},{
				channel: this.getChannel("ADD_LAYER"),
				callback: "_subAddLayer"
			},{
				channel: this.getChannel("REMOVE_LAYER"),
				callback: "_subRemoveLayer"
			},{
				channel: this.getChannel("SHOW_LAYER"),
				callback: "_subShowLayer"
			},{
				channel: this.getChannel("HIDE_LAYER"),
				callback: "_subHideLayer"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel: this.getChannel("GET_LAYER_INFO"),
				callback: "_subGetLayerInfo"
			},{
				channel: this.getChannel("CHANGE_DOMAIN"),
				callback: "_subChangeDomain"
			},{
				channel: this.getChannel("SHOW_HORIZONTAL_GRID_AXIS"),
				callback: "_subShowHorizontalGridAxis"
			},{
				channel: this.getChannel("SHOW_VERTICAL_GRID_AXIS"),
				callback: "_subShowVerticalGridAxis"
			},{
				channel: this.getChannel("HIDE_HORIZONTAL_GRID_AXIS"),
				callback: "_subHideHorizontalGridAxis"
			},{
				channel: this.getChannel("HIDE_VERTICAL_GRID_AXIS"),
				callback: "_subHideVerticalGridAxis"
			},{
				channel: this.getChannel("INTERVAL_CHANGED"),
				callback: "_subIntervalChanged"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'CHARTS_CONTAINER_READY',
				channel: this.getChannel("CHARTS_CONTAINER_READY")
			},{
				event: 'LAYER_ADDED',
				channel: this.getChannel("LAYER_ADDED")
			},{
				event: 'LAYER_UPDATED',
				channel: this.getChannel("LAYER_UPDATED")
			},{
				event: 'LAYER_SHOWN',
				channel: this.getChannel("LAYER_SHOWN")
			},{
				event: 'LAYER_HIDDEN',
				channel: this.getChannel("LAYER_HIDDEN")
			},{
				event: 'LAYER_DRAWN',
				channel: this.getChannel("LAYER_DRAWN")
			},{
				event: 'LAYER_CLEARED',
				channel: this.getChannel("LAYER_CLEARED")
			},{
				event: 'GOT_LAYER_INFO',
				channel: this.getChannel("GOT_LAYER_INFO")
			},{
				event: 'LAYER_COLOR_SET',
				channel: this.getChannel("LAYER_COLOR_SET")
			},{
				event: 'LAYER_INFO_UPDATED',
				channel: this.getChannel("LAYER_INFO_UPDATED")
			},{
				event: 'DOMAIN_CHANGED',
				channel: this.getChannel('DOMAIN_CHANGED')
			},{
				event: 'FOCUS_CHANGED',
				channel: this.getChannel('FOCUS_CHANGED')
			},{
				event: 'AXIS_SHOWN',
				channel: this.getChannel("AXIS_SHOWN")
			},{
				event: 'AXIS_HIDDEN',
				channel: this.getChannel("AXIS_HIDDEN")
			},{
				event: 'AXIS_DRAWN',
				channel: this.getChannel("AXIS_DRAWN")
			},{
				event: 'AXIS_CLEARED',
				channel: this.getChannel("AXIS_CLEARED")
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CHARTS_CONTAINER_READY', lang.hitch(this, this._addPendingLayers));
			this._onEvt('LAYER_CLEARED', lang.hitch(this, this._onLayerClearedConfirmation));
			this._onEvt('SHOW', lang.hitch(this, this._onChartsContainerShown));
		},

		postCreate: function() {

			this.inherited(arguments);

			this.chartsContainerNode = put('div.' + this.className);
		},

		_afterShow: function(req) {

			var node = req.node.domNode || req.node,
				dfd = new Deferred();

			this._dfdAfterShow = dfd;

			this._evaluateNodeDimensions(node);

			return dfd;
		},

		_evaluateNodeDimensions: function(node) {

			if (node.clientHeight && node.clientWidth) {
				clearInterval(this._nodeEvaluationIntervalHandler);
				this._dfdAfterShow.resolve();
			} else if (!this._nodeEvaluationIntervalHandler) {
				var cbk = lang.hitch(this, this._evaluateNodeDimensions, node);
				this._nodeEvaluationIntervalHandler = setInterval(cbk, this._nodeEvaluationIntervalTimeout);
			}
		},

		_startup: function() {

			this._prepareChartsContainerElementsCreation();
		},

		_prepareChartsContainerElementsCreation: function() {

			this._updateTranslateValues();
		},

		_updateTranslateValues: function() {

			this._horizontalTranslate = this._sidePaddingContainer + this.paddingContainer;
			this._verticalTranslate = this._topPaddingContainer + this.paddingContainer;
		},

		_onChartsContainerShown: function() {

			this._createChartsContainerElements();
		},

		_createChartsContainerElements: function() {

			this._updateSize();
			this._createElements();
			this._emitEvt('CHARTS_CONTAINER_READY');
		},

		_createElements: function() {

			this.svg = d3.select(this.chartsContainerNode).append("svg:svg")
				.attr("width", this._width)
				.attr("height", this._height);

			this.drawBox = this.svg.append("svg:g")
				.attr("id", "drawBox");

			this._applyTranslateValues();

			this.drawSvg = this.drawBox.append("svg:svg");

			this.drawArea = this.drawSvg.append("svg:g")
				.attr("id", "drawArea");

			this.toolsArea = this.svg.append("svg:g")
				.attr("id", "toolsArea");
		},

		_resizeVisibleDrawing: function() {

			var min = this._leftLimit || 0,
				max = this._rightLimit || this._innerWidth,
				visibleMin = min + this._horizontalTranslate,
				visibleMax = max - min;

			this.drawSvg.attr("width", visibleMax > 0 ? visibleMax : 0);

			var drawBoxTransform = "translate(" + visibleMin + "," + this._verticalTranslate + ")";
			this.drawBox.transition()
				.attr("transform", drawBoxTransform);

			var drawAreaTransform = "translate(" + -min + ")";
			this.drawArea.attr("transform", drawAreaTransform);
		},

		_updateSize: function() {

			var clientWidth = this.chartsContainerNode.clientWidth,
				clientHeight = this.chartsContainerNode.clientHeight;

			if (!clientWidth || !clientHeight) {
				return;
			}

			var width = clientWidth - this.marginContainer * 2,
				height = clientHeight - this.marginContainer * 2,
				innerWidth = width - 2 * this._horizontalTranslate,
				innerHeight = height - this._topPaddingContainer - this._bottomPaddingContainer - 2 *
					this.paddingContainer;

			this._width = width;
			this._height = height;
			this._innerWidth = innerWidth;
			this._innerHeight = innerHeight;
		},

		_addPendingLayers: function() {

			for (var layerId in this._pendingLayersDfds) {
				this._pendingLayersDfds[layerId].resolve();
			}

			delete this._pendingLayersDfds;
		},

		_onLayerClearedConfirmation: function(res) {

			var layerId = res.chart;

			delete this._layers[layerId];
			delete this._layerContainers[layerId];
			delete this._paramsByLayerId[layerId];
			delete this._hiddenLayers[layerId];
			delete this._layersLimits[layerId];
		},

		getNodeToShow: function() {

			return this.chartsContainerNode;
		},

		_getModuleRootNode: function() {

			return this.domNode;
		},

		_getModuleMainNode: function() {

			return this.chartsContainerNode;
		},

		_subAncestorShown: function(res) {

			if (this._dfdAfterShow && !this._dfdAfterShow.isFulfilled() && this.chartsContainerNode.clientHeight &&
				this.chartsContainerNode.clientWidth) {

				this._updateTranslateValues();
				this._dfdAfterShow.resolve();
			}
		},

		_subAddLayer: function(req) {

			var layerInstance = req.layerInstance,
				layerId = layerInstance.getOwnChannel();

			if (this._layers[layerId]) {
				return;
			}

			this._layers[layerId] = layerInstance;

			if (this.svg) {
				this._addLayer(layerId);
			} else {
				var dfd = new Deferred();
				this._pendingLayersDfds[layerId] = dfd;
				dfd.then(lang.hitch(this, this._addLayer, layerId));
			}
		},

		_addLayer: function(layerId) {

			this._doSubscriptionsForLayer(layerId);
			this._preparePublicationsForLayer(layerId);
			this._doPublicationsForLayer(layerId);
			this._tryToDrawLayer(this._layers[layerId]);

			// todo
			//this._emitEvt('LAYER_ADDED', layerId);
		},

		_doSubscriptionsForLayer: function(layerId) {

			var layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			this._subscriptionsForLayers[layerId] = this._setSubscriptions([{
				channel: layerInstance.getChannel("DATA_ADDED"),
				callback: "_subLayerDataAdded"
			},{
				channel: layerInstance.getChannel("DATA_ADDED"),
				callback: "_subLayerDataAddedOnce",
				options: {
					calls: 1
				}
			},{
				channel: layerInstance.getChannel("READY_TO_DRAW"),
				callback: "_subLayerReadyToDraw"
			},{
				channel: layerInstance.getChannel("DRAWN"),
				callback: "_subLayerDrawn"
			},{
				channel: layerInstance.getChannel("CLEARED"),
				callback: "_subLayerCleared"
			},{
				channel: layerInstance.getChannel("SHOWN"),
				callback: "_subLayerShown"
			},{
				channel: layerInstance.getChannel("HIDDEN"),
				callback: "_subLayerHidden"
			},{
				channel: layerInstance.getChannel("COLOR_SET"),
				callback: "_subLayerColorSet"
			}]);
		},

		_preparePublicationsForLayer: function(layerId) {

			var layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			this._publicationsForLayers[layerId] = this._setPublications([{
				event: 'INTERVAL_CHANGED',
				channel: layerInstance.getChannel("INTERVAL_CHANGED")
			}]);
		},

		_doPublicationsForLayer: function(layerId) {

			var layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			this._publishToLayer(layerInstance, "ADDED_TO_CONTAINER");
		},

		_tryToDrawLayer: function(layerInstance) {

			this._publishToLayer(layerInstance, "TRY_TO_DRAW");
		},

		_subLayerDataAddedOnce: function(res) {

			this._emitEvt('LAYER_ADDED', res);
		},

		_subLayerDataAdded: function(res) {

			var layerId = res.chart;
			this._onDataAddedToLayer(layerId, res);
		},

		_onDataAddedToLayer: function(layerId, res) {

			this._layersLimits[layerId] = {
				param: res.parameterName,
				xMin: res.xMin,
				xMax: res.xMax,
				yMin: res.yMin,
				yMax: res.yMax
			};

			this._updateOriginalDomain();
			this._emitEvt('LAYER_UPDATED', res);
			this._prepareDraw(layerId, res);
		},

		_subLayerReadyToDraw: function(res) {

			var layerId = res.chart;

			this._prepareDraw(layerId, res);
		},

		_subLayerShown: function(res) {

			var chart = res.chart;

			delete this._hiddenLayers[chart];
			this._updateOriginalDomain();

			this._emitEvt('LAYER_SHOWN', res);
		},

		_subLayerHidden: function(res) {

			var chart = res.chart;

			this._hiddenLayers[chart] = true;
			this._updateOriginalDomain();

			this._emitEvt('LAYER_HIDDEN', res);
		},

		_subLayerColorSet: function(res) {

			this._emitEvt('LAYER_COLOR_SET', res);
		},

		_prepareDraw: function(layerId, res) {

			var layerInstance = this._layers[layerId],
				param = res.parameterName;

			this._paramsByLayerId[layerId] = param;

			layerInstance && this._updateLayerSize(layerInstance);
			this._createLayerContainer(layerId);
			this._redrawLayer(layerId);
		},

		_updateLayerSize: function(layerInstance) {

			this._publishToLayer(layerInstance, "SET_SIZE", {
				width: this._innerWidth,
				height: this._innerHeight
			});
		},

		_createLayerContainer: function(layerId) {

			var layerInstance = this._layers[layerId];

			if (layerInstance && !this._layerContainers[layerId]) {
				var container = this.drawArea.append("svg:g")
					.attr("id", layerInstance.getOwnChannel())
					.attr("opacity", 1);

				this._layerContainers[layerId] = container;
			}
		},

		_redrawLayer: function(layerId) {

			var layerInstance = this._layers[layerId],
				param = this._paramsByLayerId[layerId];

			if (layerInstance && param) {
				this._setLayerScale(layerInstance, param);
				this._drawLayer(layerInstance, this._layerContainers[layerId]);
			}
		},

		_setLayerScale: function(layerInstance, param) {

			if (!layerInstance.checkAction("SET_SCALE")) {
				return;
			}

			var pub = {},
				hScale = this._getHorizontalScale(),
				vScale = this._getVerticalScale(param);

			if (hScale) {
				pub.horizontalScale = hScale;
			}
			if (vScale) {
				pub.verticalScale = vScale;
			}

			this._publishToLayer(layerInstance, "SET_SCALE", pub);
		},

		_drawLayer: function(layerInstance, container) {

			this._publishToLayer(layerInstance, "DRAW", {
				container: container
			});
		},

		_subLayerDrawn: function(res) {

			this._emitEvt('LAYER_DRAWN', res);
		},

		_subLayerCleared: function(res) {

			this._onLayerCleared(res);
		},

		_onLayerCleared: function(res) {

			this._unbindLayer(res.chart);
			this._updateOriginalDomain();

			this._emitEvt('LAYER_CLEARED', res);
		},

		_subRemoveLayer: function(req) {

			this._removeLayer(req.layerId);
		},

		_removeLayer: function(layerId) {

			var layerInstance = this._layers[layerId];

			if (layerInstance) {
				this._clearLayer(layerInstance);
			} else {
				console.error("Nonexistent chart layer '%s' cannot be removed", layerId);
			}
		},

		_clearLayer: function(layerInstance) {

			this._publishToLayer(layerInstance, "CLEAR");
			this._publishToLayer(layerInstance, "DISCONNECT");
		},

		_unbindLayer: function(layerId) {

			var subscriptionsForLayer = this._subscriptionsForLayers[layerId],
				publicationsForLayer = this._publicationsForLayers[layerId];

			if (subscriptionsForLayer) {
				this._removeSubscriptions(subscriptionsForLayer);
				delete this._subscriptionsForLayers[layerId];
			}

			if (publicationsForLayer) {
				this._removePublications(publicationsForLayer);
				delete this._publicationsForLayers[layerId];
			}
		},

		_subShowLayer: function(req) {

			this._showLayer(req.layerId, req.index);
		},

		_showLayer: function(layerId, index) {

			var layerInstance = this._layers[layerId];

			if (layerInstance) {
				var pubObj = Utilities.isValidNumber(index) ? { index: index } : null;
				this._publishToLayer(layerInstance, "SHOW", pubObj);
			}
		},

		_publishToLayer: function(instance, action, obj) {

			var channel = instance.getChannel(action);

			this._publish(channel, obj);
		},

		_subHideLayer: function(req) {

			this._hideLayer(req.layerId, req.index);
		},

		_hideLayer: function(layerId, index) {

			var layerInstance = this._layers[layerId];

			if (layerInstance) {
				var pubObj = Utilities.isValidNumber(index) ? { index: index } : null;
				this._publishToLayer(layerInstance, "HIDE", pubObj);
			}
		},

		_resize: function() {

			if (!this.svg) {
				return;
			}

			this._prepareUpdateLayersPromises();
			this._resizeChartsContainer();
			this._prepareUpdateLayers();
		},

		_resizeChartsContainer: function() {

			this._updateSize();

			this.svg
				.attr("width", this._width > 0 ? this._width : 0)
				.attr("height", this._height > 0 ? this._height : 0);
		},

		_prepareUpdateLayers: function() {

			this._updateLayers();
		},

		_updateLayers: function() {

			for (var layerId in this._layers) {
				var layerInstance = this._layers[layerId];
				this._updateLayerSize(layerInstance);
				this._redrawLayer(layerId);
			}

			this._finishUpdateLayersPromises();
		},

		_subClear: function() {

			this._clear();
		},

		_clear: function() {

			for (var layerId in this._layers) {
				this._removeLayer(layerId);
			}
		},

		_subGetLayerInfo: function(req) {

			this._getLayerInfo(req);
		},

		_subChangeDomain: function(req) {

			var min = req.min,
				max = req.max;

			this._changeDomain(min, max);
		},

		_subShowHorizontalGridAxis: function(req) {

			this._showHorizontalGridAxis(req);
		},

		_subShowVerticalGridAxis: function(req) {

			this._showVerticalGridAxis(req);
		},

		_subHideHorizontalGridAxis: function(req) {

			this._hideHorizontalGridAxis(req);
		},

		_subHideVerticalGridAxis: function(req) {

			this._hideVerticalGridAxis(req);
		},

		_subIntervalChanged: function(req) {

			this._emitEvt('INTERVAL_CHANGED', req);
		},

		_changeDomain: function(min, max, omitRecording) {

			if (this._temporalAxisDomain.min !== min || this._temporalAxisDomain.max !== max) {
				!omitRecording && this._recordDomain(min, max);
				this._changeDomainLimits(min, max);
			}
		},

		_changeDomainLimits: function(min, max) {

			// TODO experimental, para que las animaciones de los ejes no nos hagan fallar
			// aun no funciona
			this._prepareUpdateLayersPromises();
			this._setHorizontalAxisLimits(min, max);
			this._prepareUpdateLayers();
		},

		_reserveVerticalSpace: function(reservation) {

			var reserveAbove = reservation.above,
				reserveUnder = reservation.under;

			reserveAbove && this._reserveVerticalSpaceAbove(reserveAbove);
			reserveUnder && this._reserveVerticalSpaceUnder(reserveUnder);

			if (reserveAbove || reserveUnder) {
				this._applyVerticalSpaceReservation();
			}
		},

		_releaseVerticalSpace: function(release) {

			var releaseAbove = release.above,
				releaseUnder = release.under;

			releaseAbove && this._releaseVerticalSpaceAbove(releaseAbove);
			releaseUnder && this._releaseVerticalSpaceUnder(releaseUnder);

			if (releaseAbove || releaseUnder) {
				this._applyVerticalSpaceReservation();
			}
		},

		_reserveVerticalSpaceAbove: function(height) {

			this._topPaddingContainer += height;
		},

		_reserveVerticalSpaceUnder: function(height) {

			this._bottomPaddingContainer += height;
		},

		_releaseVerticalSpaceAbove: function(height) {

			this._topPaddingContainer -= height;
		},

		_releaseVerticalSpaceUnder: function(height) {

			this._bottomPaddingContainer -= height;
		},

		_applyVerticalSpaceReservation: function() {

			this._updateTranslateValues();

			var translation = this._applyTranslateValues();
			translation && translation.on("end", lang.hitch(this, this._resize));
		},

		_applyTranslateValues: function() {

			if (this.drawBox) {
				var transform = "translate(" + this._horizontalTranslate + "," + this._verticalTranslate + ")";
				return this.drawBox.transition()
					.attr("transform", transform);
			}
		}
	});
});
