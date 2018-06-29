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
		//		Extensión para mostrar aviso de que no hay nada para mostrar cuando el contenedor esté vacío.

		constructor: function(args) {

			this.config = {
				infoOnEmptyDataText: this.i18n.noData,
				infoOnEmptyDataIconClass: "fa fa-eye-slash",

				_emptyLayers: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setInfoOnEmptyDataOwnCallbacksForEvents));
			aspect.after(this, "_createElements", lang.hitch(this, this._createInfoOnEmptyDataElements));
			aspect.after(this, "_doSubscriptionsForLayer", lang.hitch(this,
				this._doInfoOnEmptyDataSubscriptionsForLayer));
			aspect.after(this, "_addLayer", lang.hitch(this, this._infoOnEmptyDataAddLayer));
			aspect.after(this, "_removeLayer", lang.hitch(this, this._infoOnEmptyDataRemoveLayer));
			aspect.after(this, "_resize", lang.hitch(this, this._infoOnEmptyAfterResize));
		},

		_setInfoOnEmptyDataOwnCallbacksForEvents: function() {

			this._onEvt('LAYER_SHOWN', lang.hitch(this, this._infoOnEmptyDataOnLayerShown));
			this._onEvt('LAYER_HIDDEN', lang.hitch(this, this._infoOnEmptyDataOnLayerHidden));
		},

		_createInfoOnEmptyDataElements: function() {

			this.infoOnEmptyDataArea = this.toolsArea.append("svg:g")
				.attr("id", "infoOnEmptyData")
				.attr("opacity", 0);

			this.infoOnEmptyDataContainer = this.infoOnEmptyDataArea.append("svg:foreignObject");

			var message = this._getEmptyDataInfoMessage();
			this.infoOnEmptyDataContainer.html(message);

			this._updateInfoOnLayerEventContainerSize(this.infoOnEmptyDataContainer);
		},

		_getEmptyDataInfoMessage: function() {

			return ChartEmptyTemplate({
				message: this.infoOnEmptyDataText,
				iconClass: this.infoOnEmptyDataIconClass
			});
		},

		_doInfoOnEmptyDataSubscriptionsForLayer: function(ret, args) {

			var layerId = args[0],
				layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			this._subscriptionsForLayers[layerId].push(this._setSubscription({
				channel: layerInstance.getChannel("EMPTY_DATA_ADDED"),
				callback: "_subEmptyDataAddedToLayer"
			}));
		},

		_subEmptyDataAddedToLayer: function(res) {

			var layerId = res.chart;

			this._emptyLayers[layerId] = true;
			this._showOrHideEmptyDataInfo();
		},

		_infoOnEmptyDataOnLayerShown: function(evt) {

			this._showOrHideEmptyDataInfo();
		},

		_infoOnEmptyDataOnLayerHidden: function(evt) {

			this._showOrHideEmptyDataInfo();
		},

		_infoOnEmptyDataAddLayer: function(originalReturnValue, originalArgs) {

			this._showOrHideEmptyDataInfo();
		},

		_infoOnEmptyDataRemoveLayer: function(originalReturnValue, originalArgs) {

			var layerId = originalArgs[0];
			delete this._emptyLayers[layerId];

			this._showOrHideEmptyDataInfo();
		},

		_showOrHideEmptyDataInfo: function() {

			if (this._getChartsContainerEmptiness()) {
				this._showInfoOnLayerEventMessage(this.infoOnEmptyDataArea, this.infoOnEmptyDataContainer);
			} else {
				this._hideInfoOnLayerEventMessage(this.infoOnEmptyDataArea, this.infoOnEmptyDataContainer);
			}
		},

		_getChartsContainerEmptiness: function() {

			for (var layerId in this._layers) {
				if (!this._hiddenLayers[layerId] && !this._emptyLayers[layerId]) {
					return false;
				}
			}

			return true;
		},

		_infoOnEmptyAfterResize: function() {

			if (!this.infoOnEmptyDataContainer) {
				return;
			}

			this._updateInfoOnLayerEventContainerSize(this.infoOnEmptyDataContainer);
			this._showOrHideEmptyDataInfo();
		}
	});
});
