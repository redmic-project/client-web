define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "templates/ChartEmpty"
	, "./_InfoOnLayerEvent"
], function(
	declare
	, lang
	, aspect
	, ChartEmptyTemplate
	, _InfoOnLayerEvent
){
	return declare(_InfoOnLayerEvent, {
		//	summary:
		//		Extensión para mostrar aviso de que no hay nada para mostrar cuando una capa contiene datos pero no son
		//		representables. Por ejemplo, cuando en una tarta todos tienen valor 0.

		constructor: function(args) {

			this.config = {
				infoOnZeroValueDataText: this.i18n.allDataWithZeroValue,
				infoOnZeroValueDataIconClass: "fa fa-circle-o",

				_layerWithZeroValueDataAdded: false,
				_layerWithZeroValueShown: true
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setInfoOnZeroValueDataOwnCallbacksForEvents));
			aspect.after(this, "_createElements", lang.hitch(this, this._createInfoOnZeroValueDataElements));
			aspect.after(this, "_doSubscriptionsForLayer", lang.hitch(this,
				this._doInfoOnZeroValueDataSubscriptionsForLayer));
			aspect.after(this, "_addLayer", lang.hitch(this, this._infoOnZeroValueDataAddLayer));
			aspect.after(this, "_removeLayer", lang.hitch(this, this._infoOnZeroValueDataRemoveLayer));
			aspect.after(this, "_resize", lang.hitch(this, this._infoOnZeroValueAfterResize));
		},

		_setInfoOnZeroValueDataOwnCallbacksForEvents: function() {

			this._onEvt('LAYER_SHOWN', lang.hitch(this, this._infoOnZeroValueDataOnLayerShown));
			this._onEvt('LAYER_HIDDEN', lang.hitch(this, this._infoOnZeroValueDataOnLayerHidden));
		},

		_createInfoOnZeroValueDataElements: function() {

			this.infoOnZeroValueDataArea = this.toolsArea.append("svg:g")
				.attr("id", "infoOnZeroValueData")
				.attr("opacity", 0);

			this.infoOnZeroValueDataContainer = this.infoOnZeroValueDataArea.append("svg:foreignObject");

			var message = this._getZeroValueDataInfoMessage();
			this.infoOnZeroValueDataContainer.html(message);

			this._updateInfoOnLayerEventContainerSize(this.infoOnZeroValueDataContainer);
		},

		_getZeroValueDataInfoMessage: function() {

			return ChartEmptyTemplate({
				message: this.infoOnZeroValueDataText,
				iconClass: this.infoOnZeroValueDataIconClass
			});
		},

		_doInfoOnZeroValueDataSubscriptionsForLayer: function(ret, args) {

			var layerId = args[0],
				layerInstance = this._layers[layerId];

			if (!layerInstance || !layerInstance.checkAction("ZERO_VALUE_DATA_ADDED")) {
				return;
			}

			this._subscriptionsForLayers[layerId].push(this._setSubscription({
				channel: layerInstance.getChannel("ZERO_VALUE_DATA_ADDED"),
				callback: "_subZeroValueDataAddedToLayer"
			}));
		},

		_subZeroValueDataAddedToLayer: function(res) {

			var layerId = res.chart;

			this._layerWithZeroValueDataAdded = true;
			this._showOrHideZeroValueDataInfo();
		},

		_infoOnZeroValueDataOnLayerShown: function(evt) {

			this._layerWithZeroValueShown = true;
			this._showOrHideZeroValueDataInfo();
		},

		_infoOnZeroValueDataOnLayerHidden: function(evt) {

			this._layerWithZeroValueShown = false;
			this._showOrHideZeroValueDataInfo();
		},

		_infoOnZeroValueDataAddLayer: function(originalReturnValue, originalArgs) {

			this._layerWithZeroValueShown = true;
			this._showOrHideZeroValueDataInfo();
		},

		_infoOnZeroValueDataRemoveLayer: function(originalReturnValue, originalArgs) {

			var layerId = originalArgs[0];
			this._layerWithZeroValueDataAdded = false;

			this._showOrHideZeroValueDataInfo();
		},

		_showOrHideZeroValueDataInfo: function() {

			if (this._layerWithZeroValueDataAdded && this._layerWithZeroValueShown) {
				this._showInfoOnLayerEventMessage(this.infoOnZeroValueDataArea, this.infoOnZeroValueDataContainer);
			} else {
				this._hideInfoOnLayerEventMessage(this.infoOnZeroValueDataArea, this.infoOnZeroValueDataContainer);
			}
		},

		_infoOnZeroValueAfterResize: function() {

			if (!this.infoOnZeroValueDataContainer) {
				return;
			}

			this._updateInfoOnLayerEventContainerSize(this.infoOnZeroValueDataContainer);
			this._showOrHideZeroValueDataInfo();
		}
	});
});
