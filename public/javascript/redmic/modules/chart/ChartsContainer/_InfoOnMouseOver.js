define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "RWidgets/Utilities"
	, "./_InfoTooltipManagement"
], function(
	d3
	, declare
	, lang
	, aspect
	, Deferred
	, all
	, Utilities
	, _InfoTooltipManagement
){
	return declare(_InfoTooltipManagement, {
		//	summary:
		//		Extensión para mostrar información sobre las gráficas al pasar el cursor sobre
		//		el contenedor.

		constructor: function(args) {

			this.config = {
				infoOnMouseOverCircleClass: "infoOnMouseOverCircle",
				infoOnMouseOverOutsideCircleClass: "outsideCircle",
				infoOnMouseOverInsideCircleClass: "insideCircle",
				verticalLineClass: "axis",
				hiddenClass: "hidden",
				infoOutsideCircleRadius: 6,
				infoInsideCircleRadius: 4,

				_infoOnMouseOverQueryableLayers: {},
				_infoCircles: {},
				_mouseMoveTimeout: 3
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setInfoOnMouseOverOwnCallbacksForEvents));
			aspect.after(this, "_createElements", lang.hitch(this, this._createInfoOnMouseOverElements));
			aspect.after(this, "_doSubscriptionsForLayer", lang.hitch(this,
				this._doInfoOnMouseOverSubscriptionsForLayer));
			aspect.before(this, "_removeLayer", lang.hitch(this, this._infoOnMouseOverRemoveLayer));
			aspect.after(this, "_reserveVerticalSpace", lang.hitch(this, this._reserveInfoOnMouseOverVerticalSpace));
		},

		_setInfoOnMouseOverOwnCallbacksForEvents: function() {

			this._onEvt('LAYER_HIDDEN', lang.hitch(this, this._infoOnMouseOverOnLayerHidden));
		},

		_createInfoOnMouseOverElements: function() {

			this.infoOnMouseOverArea = this.toolsArea.append("svg:g")
				.attr("id", "infoOnMouseOver")
				.attr("class", this.hiddenClass);

			this._applyInfoOnMouseOverTranslateValues();
			this._createLineElements();
			this._createTooltipElements();

			this.svg
				.on("mouseleave.infoOnMouseOver", lang.hitch(this, this._onMouseLeave))
				.on("mousemove.infoOnMouseOver", lang.hitch(this, this._onMouseMove));
		},

		_createLineElements: function() {

			this.infoOnMouseOverLine = d3.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; });

			this.infoOnMouseOverLinePath = this.infoOnMouseOverArea.append("svg:path")
				.attr("class", this.verticalLineClass);
		},

		_doInfoOnMouseOverSubscriptionsForLayer: function(ret, args) {

			var layerId = args[0],
				layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			if (layerInstance.checkAction("GOT_Y_VALUE")) {
				this._infoOnMouseOverQueryableLayers[layerId] = layerInstance;
				this._createInfoCircle(layerId);

				this._subscriptionsForLayers[layerId].push(this._setSubscription({
					channel: layerInstance.getChannel("GOT_Y_VALUE"),
					callback: "_subGotLayerYValue"
				}));
			} else if (layerInstance.checkAction("GOT_CATEGORY_VALUE")) {
				this._subscriptionsForLayers[layerId].push(this._setSubscription({
					channel: layerInstance.getChannel("GOT_CATEGORY_VALUE"),
					callback: "_subGotLayerCategoryValue"
				}));
			}
		},

		_createInfoCircle: function(layerId) {

			this._infoCircles[layerId] = this.infoOnMouseOverArea.append("svg:g")
				.attr("class", this.infoOnMouseOverCircleClass);

			this._infoCircles[layerId].append("svg:circle")
				.attr("r", this.infoOutsideCircleRadius)
				.attr("class", this.infoOnMouseOverOutsideCircleClass);
			this._infoCircles[layerId].append("svg:circle")
				.attr("r", this.infoInsideCircleRadius)
				.attr("class", this.infoOnMouseOverInsideCircleClass);
		},

		_infoOnMouseOverRemoveLayer: function(layerId) {

			this._clearLayerInfoCircles(layerId);
			this._removeOldInfoReceivedFromLayer(layerId);

			delete this._infoOnMouseOverQueryableLayers[layerId];
		},

		_clearLayerInfoCircles: function(layerId) {

			if (this._infoCircles[layerId]) {
				this._infoCircles[layerId].remove();
				delete this._infoCircles[layerId];
			}
		},

		_infoOnMouseOverOnLayerHidden: function(obj) {

			var layerId = obj.chart;
			this._removePointPositionAndInfo(layerId);
		},

		_showInfoOnMouseOverCircles: function() {

			this.infoOnMouseOverArea.classed(this.hiddenClass, false);
		},

		_onMouseLeave: function() {

			clearTimeout(this._mouseMoveTimeoutHandler);
			this._hideInfoOnMouseOverTools();
		},

		_hideInfoOnMouseOverTools: function() {

			this._hideInfoOnMouseOverCircles();
			this._hideInfoOnMouseOverLinePath();
			this._hideInfoOnMouseOverTooltip();
		},

		_hideInfoOnMouseOverCircles: function() {

			this.infoOnMouseOverArea.classed(this.hiddenClass, true);
		},

		_onMouseMove: function() {

			var mousePos = d3.mouse(this.svg.node());

			clearTimeout(this._mouseMoveTimeoutHandler);
			this._mouseMoveTimeoutHandler = setTimeout(lang.hitch(this, this._lookForInfoOnPosition, mousePos),
				this._mouseMoveTimeout);
		},

		_lookForInfoOnPosition: function(mousePos) {

			var x = mousePos[0] - this._horizontalTranslate,
				y = mousePos[1] - this._verticalTranslate,
				min = this._leftLimit || 0,
				max = this._rightLimit || this._innerWidth;

			if (x >= min && x <= max) {
				this._showInfoOnMouseOverCircles();
				this._askLayersForValues(x);
				this._updateTooltipPosition(x, y);
				this._updateTooltipDirection(x);
			} else {
				this._hideInfoOnMouseOverTools();
			}
		},

		_askLayersForValues: function(x) {

			this._lastX = x;
			if (this._askLayersDfdList && !this._askLayersDfdList.isFulfilled()) {
				this._askLayersDfdList.cancel();
			}

			this._getLayerValueDfds = {};
			for (var layerId in this._infoOnMouseOverQueryableLayers) {
				if (!this._hiddenLayers[layerId]) {
					var layer = this._infoOnMouseOverQueryableLayers[layerId];
						dfd = new Deferred();

					this._getLayerValueDfds[layerId] = dfd;
					this._publish(layer.getChannel("GET_Y_VALUE"), { x: x });
				}
			}

			this._askLayersDfdList = all(this._getLayerValueDfds);
			this._askLayersDfdList.then(lang.hitch(this, this._chooseClosestPoints));
		},

		_subGotLayerYValue: function(res) {

			var layerId = res.layerInfo.chart;
			if (this._getLayerValueDfds && this._getLayerValueDfds[layerId]) {
				this._getLayerValueDfds[layerId].resolve(res);
			}
		},

		_subGotLayerCategoryValue: function(res) {

			var obj = lang.clone(res),
				layerInfo = obj.layerInfo,
				categoryIndex = obj.categoryIndex,
				categoryName = obj.categoryName,
				categoryDepth = obj.categoryDepth,
				layerId = layerInfo.chart,
				layerColor = layerInfo.color;

			if (layerColor instanceof Array) {
				var color;
				if (Utilities.isValidNumber(categoryDepth)) {
					color = layerInfo.color[categoryDepth][categoryIndex];
				} else {
					color = layerInfo.color[categoryIndex];
				}
				layerInfo.color = color;
			}

			this._updateTooltipContent(layerId, categoryName, obj);
		},

		_updateCirclePosition: function(layerId, x, y) {

			if (Utilities.isValidNumber(x) && Utilities.isValidNumber(y)) {
				this._moveInfoOnMouseOverCircle(layerId, x, y);
			} else {
				this._hideInfoOnMouseOverCircle(layerId);
			}
		},

		_moveInfoOnMouseOverCircle: function(layerId, x, y) {

			var circle = this._infoCircles[layerId];

			if (circle) {
				circle.attr("transform", "translate(" + x + "," + y + ")");
				circle.classed(this.hiddenClass, false);
			}
		},

		_hideInfoOnMouseOverCircle: function(layerId) {

			var circle = this._infoCircles[layerId];

			circle && circle.classed(this.hiddenClass, true);
		},

		_updateTooltipContent: function(layerId, title, res) {

			if (!title || !Utilities.isValidNumber(res.value)) {
				this._removeOldInfoReceivedFromLayer(layerId);
			} else {
				this._addNewInfoReceivedFromLayer(layerId, title, res);
			}
		},

		_removeOldInfoReceivedFromLayer: function(layerId) {

			if (!this._infoOnMouseOverTooltipContent || !this._infoOnMouseOverTooltipContent.layers) {
				return;
			}

			delete this._infoOnMouseOverTooltipContent.layers[layerId];

			var layerCount = Object.keys(this._infoOnMouseOverTooltipContent.layers).length;
			if (!layerCount) {
				delete this._infoOnMouseOverTooltipContent;
				this._hideInfoOnMouseOverTooltip();
			}

			this._sendDataToTooltipContent(this._infoOnMouseOverTooltipContent);
		},

		_addNewInfoReceivedFromLayer: function(layerId, title, res) {

			if (typeof title === "string") {
				this._addCategoryInfo(layerId, title, res);
			} else {
				this._addTemporalInfo(layerId, title, res);
			}

			this._sendDataToTooltipContent(this._infoOnMouseOverTooltipContent);
		},

		_addCategoryInfo: function(layerId, title, res) {

			var value = res.value,
				percentage = res.percentage,
				layerInfo = res.layerInfo;

			if (!this._infoOnMouseOverTooltipContent) {
				this._infoOnMouseOverTooltipContent = {
					titleValue: title,
					layers: {}
				};
			} else {
				this._infoOnMouseOverTooltipContent.titleValue = title;
			}

			this._infoOnMouseOverTooltipContent.layers[layerId] = {
				value: value,
				percentage: percentage,
				param: layerInfo.parameterName,
				color: layerInfo.color
			};
		},

		_addTemporalInfo: function(layerId, title, res) {

			var value = res.value,
				count = res.count,
				layerInfo = res.layerInfo;

			if (!this._infoOnMouseOverTooltipContent) {
				this._infoOnMouseOverTooltipContent = {
					horizontalValue: title,
					layers: {}
				};
			} else {
				this._infoOnMouseOverTooltipContent.horizontalValue = title;
			}

			if (count) {
				count = "(" + count + " " + this.i18n.items + ")";
			}

			this._infoOnMouseOverTooltipContent.layers[layerId] = {
				value: value,
				count: count,
				param: layerInfo.parameterName,
				color: layerInfo.color
			};
		},

		_chooseClosestPoints: function(results) {

			var minDistance = this._getMinDistance(results);

			for (var layerId in results) {
				var result = results[layerId],
					distance = result.distanceToReqX,
					domain = this._temporalAxisScale.domain(),
					xDate = this._temporalAxisScale.invert(result.x),
					isXInDomain = xDate >= domain[0] && xDate <= domain[1];

				if (distance === minDistance && isXInDomain) {
					this._updateForClosestPoints(layerId, result);
				} else {
					this._removePointPositionAndInfo(layerId);
					if (!this._infoOnMouseOverTooltipContent) {
						this._hideInfoOnMouseOverLinePath();
					}
				}
			}
		},

		_getMinDistance: function(results) {

			var minDistance = Number.POSITIVE_INFINITY;
			for (var layerId in results) {
				var result = results[layerId],
					distance = result.distanceToReqX;

				if (distance < minDistance) {
					minDistance = distance;
				}
			}

			return minDistance;
		},

		_updateForClosestPoints: function(layerId, res) {

			var x = res.x,
				y = res.y,
				xValue = this._temporalAxisScale.invert(x);

			this._updateCirclePosition(layerId, x, y);
			this._updateTooltipContent(layerId, xValue, res);
			this._updateLinePathPosition(x);
		},

		_updateLinePathPosition: function(x) {

			if (!Utilities.isValidNumber(x)) {
				this._hideInfoOnMouseOverLinePath();
				return;
			}

			var data = [{
				x: x,
				y: 0
			},{
				x: x,
				y: this._innerHeight
			}];

			this._showInfoOnMouseOverLinePath();
			this.infoOnMouseOverLinePath.attr("d", this.infoOnMouseOverLine(data));
		},

		_hideInfoOnMouseOverLinePath: function() {

			this.infoOnMouseOverLinePath.classed(this.hiddenClass, true);
		},

		_showInfoOnMouseOverLinePath: function() {

			this.infoOnMouseOverLinePath.classed(this.hiddenClass, false);
		},

		_removePointPositionAndInfo: function(layerId) {

			this._hideInfoOnMouseOverCircle(layerId);
			this._removeOldInfoReceivedFromLayer(layerId);
		},

		_pauseInfoOnMouseOver: function() {

			this._cbkToRestore = this.svg.on("mousemove.infoOnMouseOver");
			this.svg.on("mousemove.infoOnMouseOver", null);

			this._hideInfoOnMouseOverTools();
		},

		_continueInfoOnMouseOver: function() {

			this.svg.on("mousemove.infoOnMouseOver", this._cbkToRestore);
		},

		_reserveInfoOnMouseOverVerticalSpace: function() {

			this._applyInfoOnMouseOverTranslateValues();
		},

		_applyInfoOnMouseOverTranslateValues: function() {

			this.infoOnMouseOverArea && this.infoOnMouseOverArea.transition()
				.attr("transform", "translate(" + this._horizontalTranslate + "," + this._verticalTranslate + ")");
		}
	});
});
