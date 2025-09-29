define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_PublishInfoItfc"
], function(
	declare
	, lang
	, _PublishInfoItfc
) {

	return declare(_PublishInfoItfc, {
		//	summary:
		//		Extensión de MapLayer para consumir y publicar información de la capa.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					LAYER_INFO: "layerInfo",
					LAYER_QUERYING: "layerQuerying"
				},

				actions: {
					MAP_CLICKED: "mapClicked",
					LAYER_INFO: "layerInfo",
					LAYER_INFO_FORWARDED: "layerInfoForwarded",
					LAYER_QUERYING: "layerQuerying",
					LAYER_QUERYING_FORWARDED: "layerQueryingForwarded"
				},

				queryable: true,
				layerId: "layerId"
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_mixPublishInfoEventsAndActions: function () {

			lang.mixin(this.events, this.publishInfoEvents);
			lang.mixin(this.actions, this.publishInfoActions);
			delete this.publishInfoEvents;
			delete this.publishInfoActions;
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.mapChannel, this.actions.MAP_CLICKED),
				callback: "_subPublishInfoMapClicked",
				options: {
					predicate: this._chkCanDoQuery
				}
			},{
				channel: this._buildChannel(this.storeChannel, this.actions.AVAILABLE),
				callback: "_subInfoAvailable",
				options: {
					predicate: lang.hitch(this, this._chkLayerInfoIsMine)
				}
			},{
				channel: this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
				callback: "_subInfoAvailable",
				options: {
					predicate: lang.hitch(this, this._chkLayerInfoIsMine)
				}
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_definePublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'LAYER_INFO',
				channel: this.getChannel("LAYER_INFO")
			},{
				event: 'LAYER_INFO',
				channel: this._buildChannel(this.mapChannel, this.actions.LAYER_INFO_FORWARDED)
			},{
				event: 'LAYER_QUERYING',
				channel: this.getChannel("LAYER_QUERYING")
			},{
				event: 'LAYER_QUERYING',
				channel: this._buildChannel(this.mapChannel, this.actions.LAYER_QUERYING_FORWARDED)
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_chkCanDoQuery: function() {

			return this.queryable && this._chkLayerAdded();
		},

		_chkLayerInfoIsMine: function(res) {

			return this.queryable && res.target === this.infoTarget && res.requesterId === this.getOwnChannel();
		},

		_subPublishInfoMapClicked: function(response) {

			if (!response.latLng) {
				return;
			}

			var lat = response.latLng.lat,
				lng = response.latLng.lng;

			if (!lat || !lng) {
				return;
			}

			this._emitEvt('LAYER_QUERYING', {
				layerId: this.layerId
			});

			this._requestLayerInfo(response);

			this._emitEvt('TRACK', {
				event: 'request_layer_featureinfo',
				layer_name: this.layerLabel || this.layerId
			});
		},

		_subInfoAvailable: function(response) {

			this._processLayerInfo(response.res.data);
		},

		_getLayerInfoToPublish: function(res) {

			var retObj = {
				queryable: this.queryable
			};

			lang.mixin(retObj, this.inherited(arguments));

			return retObj;
		}
	});
});
