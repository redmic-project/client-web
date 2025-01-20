define([
	"app/designs/mapWithSideContent/main/Tracking"
	, "app/designs/mapWithSideContent/main/_TrackingWithListByFilter"
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	Tracking
	, _TrackingWithListByFilter
	, _Module
	, _Show
	, _Store
	, redmicConfig
	, declare
	, lang
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				target: [redmicConfig.services.activity]
			};

			lang.mixin(this, this.config, args);

			if (this.usePrivateTarget) {
				this.baseTargetChildren = redmicConfig.services.privateElementsTrackingActivity;
			} else {
				this.baseTargetChildren = redmicConfig.services.elementsTrackingActivity;
			}
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onMeOrAncestorHidden));
		},

		_initialize: function() {

			this._trackingMap = new declare([Tracking, _TrackingWithListByFilter])({
				parentChannel: this.getChannel(),
				usePrivateTarget: this.usePrivateTarget,
				timeMode: true,
				defaultTrackingMode: 1
			});
		},

		getNodeToShow: function() {

			return this._trackingMap.getNodeToShow();
		},

		_onMeOrAncestorShown: function() {

			this._refreshCurrentData();
		},

		_onMeOrAncestorHidden: function() {

			this._publish(this._trackingMap.getChannel('CLEAR'));
		},

		_refreshCurrentData: function() {

			this._publish(this._trackingMap.getChannel("SET_PROPS"), {
				pathVariableId: this.pathVariableId
			});

			this._emitEvt('GET', {
				target: this.target[0],
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});
		},

		_itemAvailable: function(item) {

			var target = lang.replace(this.baseTargetChildren, item.data);

			this.target[1] = target;

			this._publish(this._trackingMap.getChannel("UPDATE_TARGET"), {
				target: target,
				refresh: true
			});
		}
	});
});
