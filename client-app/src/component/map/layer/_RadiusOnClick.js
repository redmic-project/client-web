define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/map/layer/_RadiusCommons"
], function(
	declare
	, lang
	, aspect
	, _RadiusCommons
){
	return declare(_RadiusCommons, {
		//	summary:
		//		Extensión de MapLayer para dibujar el radio de un marcador al pulsar sobre él.

		constructor: function(args) {

			this.config = {
				_lastRadiusOnClickItemId: null
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setRadiusOnClickOwnCallbacksForEvents));

			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineRadiusOnClickSubscriptions));
		},

		_setRadiusOnClickOwnCallbacksForEvents: function() {

			this._onEvt('CLICK', lang.hitch(this, this._onRadiusOnClickMarkerClicked));
		},

		_defineRadiusOnClickSubscriptions: function() {

			if (!this.mapChannel) {
				console.error("Map channel not defined for layer '%s'", this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.mapChannel, this.actions.MAP_CLICKED),
				callback: '_subMapClickedRadiusOnClick'
			},{
				channel : this._buildChannel(this.mapChannel, this.actions.POPUP_CLOSED),
				callback: '_subPopupClosed'
			});
		},

		_subMapClickedRadiusOnClick: function(res) {

			this._eraseRadiusIfNotSelected(this._lastRadiusOnClickItemId);
		},

		_subPopupClosed: function(res) {

			this._eraseRadiusIfNotSelected(this._lastRadiusOnClickItemId);
		},

		_eraseRadiusIfNotSelected: function(itemId) {

			if (itemId === null || (this._selection && this._selection[itemId])) {
				return;
			}

			this._eraseRadius(itemId);

			this._lastRadiusOnClickItemId = null;
		},

		_onRadiusOnClickMarkerClicked: function(evt) {

			var layer = evt.layer,
				data = evt.data,
				feature = layer.feature || data.feature,
				itemId = feature[this.idProperty];

			this._handleRadiusOnClickDrawing(itemId, layer);
		},

		_handleRadiusOnClickDrawing: function(itemId, layer) {

			var clickedDifferentMarker = this._lastRadiusOnClickItemId === itemId;

			if (this._lastRadiusOnClickItemId !== null && !clickedDifferentMarker) {
				this._eraseRadiusIfNotSelected(this._lastRadiusOnClickItemId);
			}

			if (this._circlesById[itemId]) {
				this._eraseRadiusIfNotSelected(itemId);
			} else {
				layer.on('remove', lang.hitch(this, this._eraseRadiusIfNotSelected, itemId));
				this._lastRadiusOnClickItemId = itemId;

				this._drawRadius(itemId, this._getFeatureLatLng(itemId), this._getFeatureRadius(itemId));
			}
		}
	});
});
