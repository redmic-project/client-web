define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_PublishInfoItfc"
], function(
	declare
	, lang
	, aspect
	, _PublishInfoItfc
){
	return declare(_PublishInfoItfc, {
		//	summary:
		//		Extensión de MapLayer para consumir y publicar información de la capa.


		queryable: true,
		layerId: "layerId",

		publishInfoEvents: {
			LAYER_INFO: "layerInfo",
			LAYER_QUERYING: "layerQuerying"
		},

		publishInfoActions: {
			MAP_CLICKED: "mapClicked",
			LAYER_INFO: "layerInfo",
			LAYER_INFO_FORWARDED: "layerInfoForwarded",
			LAYER_QUERYING: "layerQuerying",
			LAYER_QUERYING_FORWARDED: "layerQueryingForwarded"
		},


		constructor: function(args) {

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixPublishInfoEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineSelectionSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineSelectionPublications));
		},

		_mixPublishInfoEventsAndActions: function () {

			lang.mixin(this.events, this.publishInfoEvents);
			lang.mixin(this.actions, this.publishInfoActions);
			delete this.publishInfoEvents;
			delete this.publishInfoActions;
		},

		_defineSelectionSubscriptions: function () {

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

		_defineSelectionPublications: function () {

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

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.layer,
					action: TRACK.action.click,
					label: this.layerId + " [lat:" + lat + ", lng:" + lng + "]"
				}
			});

			this._emitEvt('LAYER_QUERYING', {
				layerId: this.layerId
			});

			this._requestLayerInfo(response);
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
