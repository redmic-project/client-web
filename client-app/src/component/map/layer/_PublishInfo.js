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
		// summary:
		//   Extensión de MapLayer para consumir y publicar información de la capa.

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
				queryable: true
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const infoIsMinePredicate = res => this._chkLayerInfoIsMine(res);

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.mapChannel, 'MAP_CLICKED'),
				callback: "_subPublishInfoMapClicked",
				options: {
					predicate: () => this._chkCanDoQuery()
				}
			},{
				channel: this._buildChannel(this.storeChannel, 'AVAILABLE'),
				callback: "_subInfoAvailable",
				options: {
					predicate: infoIsMinePredicate
				}
			},{
				channel: this._buildChannel(this.storeChannel, 'ITEM_AVAILABLE'),
				callback: "_subInfoAvailable",
				options: {
					predicate: infoIsMinePredicate
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
				channel: this._buildChannel(this.mapChannel, 'LAYER_INFO_FORWARDED')
			},{
				event: 'LAYER_QUERYING',
				channel: this.getChannel("LAYER_QUERYING")
			},{
				event: 'LAYER_QUERYING',
				channel: this._buildChannel(this.mapChannel, 'LAYER_QUERYING_FORWARDED')
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

			const lat = response.latLng.lat,
				lng = response.latLng.lng;

			if (!lat || !lng) {
				return;
			}

			const layerId = this.layerId;
			this._emitEvt('LAYER_QUERYING', { layerId });

			this._requestLayerInfo(response);

			this._emitEvt('TRACK', {
				event: 'request_layer_featureinfo',
				layer_name: this.layerLabel ?? layerId
			});
		},

		_subInfoAvailable: function(response) {

			this._processLayerInfo(response.res.data);
		},

		_getLayerInfoToPublish: function(res) {

			const inherited = this.inherited(arguments);

			return this._merge([inherited, {
				queryable: this.queryable
			}]);
		}
	});
});
