define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "./_AxesDrawingItfc"
], function(
	declare
	, lang
	, aspect
	, Deferred
	, _AxesDrawingItfc
) {
	return declare(_AxesDrawingItfc, {
		//	summary:
		//		Base de extensiones para dibujar ejes en la gráfica.
		//	description:
		//		No se puede usar directamente.

		constructor: function(args) {

			this.config = {
				_axesDrawingDfds: {},
				_subscriptionsToAxes: {},
				_hiddenGridAxes: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setAxesDrawingOwnCallbacksForEvents));

			aspect.after(this, "_createElements", lang.hitch(this, this._createAxesElements));
			aspect.before(this, "_onDataAddedToLayer", lang.hitch(this, this._onDataAddedToLayerAxesDrawing));
			aspect.before(this, "_clear", lang.hitch(this, this._clearAxesDrawing));
			aspect.before(this, "_onLayerCleared", lang.hitch(this, this._beforeLayerClearedAxesDrawing));
			aspect.after(this, "_setNewAxesLimits", lang.hitch(this, this._updateLayers));
			aspect.before(this, "_drawAxis", lang.hitch(this, this._beforeDrawAxis));
			aspect.after(this, "_reserveVerticalSpace", lang.hitch(this, this._reserveAxesDrawingVerticalSpace));
		},

		_setAxesDrawingOwnCallbacksForEvents: function() {

			this._onEvt("LAYER_HIDDEN", lang.hitch(this, this._afterLayerHiddenAxesDrawing));
			this._onEvt("LAYER_SHOWN", lang.hitch(this, this._afterLayerShownOrUpdatedAxesDrawing));
			this._onEvt("LAYER_UPDATED", lang.hitch(this, this._afterLayerShownOrUpdatedAxesDrawing));
			this._onEvt("LAYER_CLEARED", lang.hitch(this, this._afterLayerClearedAxesDrawing));
			this._onEvt("AXIS_DRAWN", lang.hitch(this, this._resolveAxisDrawingDfd));
		},

		_createAxesElements: function() {

			this.gridAxesArea = this.svg.insert("g", "#drawBox")
				.attr("id", "gridAxesArea");

			this.axesArea = this.svg.insert("g", "#drawBox")
				.attr("id", "axesArea");

			this.overlayGridAxesArea = this.svg.insert("g", "#toolsArea")
				.attr("id", "overlayGridAxesArea");

			this.overlayAxesArea = this.svg.insert("g", "#toolsArea")
				.attr("id", "overlayAxesArea");

			this._applyAxesDrawingTranslateValues();
		},

		_onDataAddedToLayerAxesDrawing: function(layerId, res) {

			this._layersLimits[layerId] && this._updateHorizontalLimitsOnLayerHiddenOrUpdated(res);
			this._drawAxes(res);
		},

		_clearAxesDrawing: function() {

			this._clearAxes();
		},

		_beforeLayerClearedAxesDrawing: function(res) {

			this._updateHorizontalLimitsOnLayerHiddenOrUpdated(res);
			this._removeAxisIfNotUsed(res);
		},

		_afterLayerHiddenAxesDrawing: function(res) {

			this._updateHorizontalLimitsOnLayerHiddenOrUpdated(res);
			this._hideAxisIfNotUsed(res);
		},

		_afterLayerShownOrUpdatedAxesDrawing: function(res) {

			var layerId = res.chart;

			if (!this._hiddenLayers[layerId]) {
				this._showAxisIfNotShown(res);
			}

			var param = res.parameterName,
				limits = this._layersLimits[layerId];

			this._findAndSetNewAxesLimits(null, param);
			limits && this._updateHorizontalLimitsOnLayerShown(limits.xMin, limits.xMax);
		},

		_afterLayerClearedAxesDrawing: function(res) {

			var layerId = res.chart,
				param = res.parameterName;

			this._adjustAxesAfterLayerCleared(layerId, param);
		},

		_adjustAxesAfterLayerCleared: function(layerId, param) {

			this._findAndSetNewAxesLimits(layerId, param);
		},

		_updateAxisSize: function(axisInstance) {

			this._publish(axisInstance.getChannel("SET_SIZE"), {
				width: this._innerWidth,
				height: this._innerHeight
			});
		},

		_setAxisScale: function(axisInstance, scale) {

			axisInstance && this._publish(axisInstance.getChannel("SET_SCALE"), {
				scale: scale
			});
		},

		_beforeDrawAxis: function(axisInstance, container) {

			if (!axisInstance) {
				return;
			}

			this._addAxisDrawingToWaitingQueue(axisInstance);
		},

		_addAxisDrawingToWaitingQueue: function(axisInstance) {

			var axisOwnChannel = axisInstance.getOwnChannel(),
				dfd = new Deferred();

			// TODO pensar que hacer cuando lleguen dfds para los mismos ejes (ocurre mucho)
			this._axesDrawingDfds[axisOwnChannel] = dfd;
			if (this._prepareUpdateLayersDfdList) {
				this._prepareUpdateLayersDfdList[axisOwnChannel] = dfd;
			}
		},

		_drawAxis: function(axisInstance, container) {

			axisInstance && this._publish(axisInstance.getChannel("DRAW"), {
				container: container
			});
		},

		_clearAxis: function(axisInstance) {

			this._publish(axisInstance.getChannel("CLEAR"));
		},

		_resize: function() {

			this.inherited(arguments);

			this._updateRightLimit();
			this._resizeAxes();
		},

		_showAxis: function(axisInstance) {

			axisInstance && this._publish(axisInstance.getChannel("SHOW"));
		},

		_hideAxis: function(axisInstance) {

			axisInstance && this._publish(axisInstance.getChannel("HIDE"));
		},

		_findAndSetNewAxesLimits: function(excludedLayerId, param) {

			var newLimits = this._findNewAxesLimits(excludedLayerId, param);
			this._setNewAxesLimits(newLimits, param);
		},

		_findNewAxesLimits: function(excludedLayerId, param) {

			var xMin, xMax, yMin, yMax;

			for (var key in this._layersLimits) {
				var limits = this._layersLimits[key];
				if (key !== excludedLayerId && !this._hiddenLayers[key]) {
					if (limits.param === param) {
						if (isNaN(yMin) || limits.yMin < yMin) {
							yMin = limits.yMin;
						}
						if (isNaN(yMax) || limits.yMax > yMax) {
							yMax = limits.yMax;
						}
					}
					if (!xMin || limits.xMin < xMin) {
						xMin = limits.xMin;
					}
					if (!xMax || limits.xMax > xMax) {
						xMax = limits.xMax;
					}
				}
			}

			return {
				xMin: xMin,
				xMax: xMax,
				yMin: yMin,
				yMax: yMax
			};
		},

		_subscribeToAxis: function(axisInstance) {

			if (!axisInstance) {
				return;
			}

			var axisId = axisInstance.getOwnChannel(),
				drawn = this._subscribe(axisInstance.getChannel("DRAWN"), lang.hitch(this, this._onAxisDrawn)),
				cleared = this._subscribe(axisInstance.getChannel("CLEARED"), lang.hitch(this, this._onAxisCleared)),
				shown = this._subscribe(axisInstance.getChannel("SHOWN"), lang.hitch(this, this._onAxisShown)),
				hidden = this._subscribe(axisInstance.getChannel("HIDDEN"), lang.hitch(this, this._onAxisHidden));

			this._subscriptionsToAxes[axisId] = {
				drawn: drawn,
				cleared: cleared,
				shown: shown,
				hidden: hidden
			};
		},

		_unsubscribeFromAxis: function(axisInstance) {

			if (!axisInstance) {
				return;
			}

			var axisId = axisInstance.getOwnChannel(),
				subscriptionsToAxis = this._subscriptionsToAxes[axisId];

			if (!subscriptionsToAxis) {
				return;
			}

			for (var key in subscriptionsToAxis) {
				var subscriptionHandler = subscriptionsToAxis[key],
					channel = subscriptionHandler.channel;

				channel && this._unsubscribe(channel.namespace, subscriptionHandler.id);
			}
		},

		_resolveAxisDrawingDfd: function(res) {

			var axisOwnChannel = res.axis;

			this._axesDrawingDfds[axisOwnChannel].resolve();
		},

		_onAxisDrawn: function(res) {

			this._emitEvt('AXIS_DRAWN', res);
		},

		_onAxisCleared: function(res) {

			this._emitEvt('AXIS_CLEARED', res);
		},

		_onAxisShown: function(res) {

			this._emitEvt('AXIS_SHOWN', res);
		},

		_onAxisHidden: function(res) {

			this._emitEvt('AXIS_HIDDEN', res);
		},

		_reserveAxesDrawingVerticalSpace: function() {

			this._applyAxesDrawingTranslateValues();
		},

		_applyAxesDrawingTranslateValues: function() {

			var transform = "translate(" + this._horizontalTranslate + "," + this._verticalTranslate + ")",
				areaNames = ['axesArea', 'gridAxesArea', 'overlayAxesArea', 'overlayGridAxesArea'];

			for (var i = 0; i < areaNames.length; i++) {
				var areaName = areaNames[i],
					area = this[areaName];

				area && area.transition().attr("transform", transform);
			}
		},

		_getAnyRemainingShownChart: function() {

			var layerCount = Object.keys(this._layers).length,
				hiddenLayerCount = Object.keys(this._hiddenLayers).length;

			return layerCount !== hiddenLayerCount;
		}
	});
});
