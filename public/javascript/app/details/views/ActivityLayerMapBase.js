define([
	'app/designs/details/main/ActivityMap'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'redmic/modules/map/layer/WmsLayerImpl'
], function(
	ActivityMap
	, redmicConfig
	, declare
	, lang
	, aspect
	, WmsLayerImpl
) {

	return declare(ActivityMap, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: '',
				layerTarget: redmicConfig.services.atlasLayer,
				activityCategory: ['ml'],
				definitionLayer: [WmsLayerImpl]
			};

			lang.mixin(this, this.config, args);
		},

		_itemAvailable: function() {

			var storeChannel = this._buildChannel(this.storeChannel, this.actions.AVAILABLE);
			this._once(storeChannel, lang.hitch(this, this._onLayerActivitiesData), {
				predicate: lang.hitch(this, this._chkIsDataFromLayerActivities)
			});

			this._emitEvt('REQUEST', {
				target: this.layerTarget,
				action: '_search',
				method: 'POST',
				query: {
					terms: {
						activities: [this.pathVariableId]
					}
				}
			});
		},

		_chkIsDataFromLayerActivities: function(res) {

			return res.target === this.layerTarget;
		},

		_onLayerActivitiesData: function(res) {

			console.log('llega atlas', res);
		}
	});
});
