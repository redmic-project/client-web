define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Filter"
], function(
	_CompositeInTooltipFromIconKeypad
	, declare
	, lang
	, aspect
	, _Filter
){
	return declare([_Filter, _CompositeInTooltipFromIconKeypad], {
		//	summary:
		//
		//	description:
		//

		constructor: function (args) {

			this.config = {
				_lastDataFilter: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setTrackingByFilterConfigurations));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineTrackingByFilterSubscriptions));
		},

		_setTrackingByFilterConfigurations: function() {

			this.filterConfig = this._merge([{
				initQuery: {
					qFlags: ["1"]
				}
			}, this.filterConfig || {}]);
		},

		_defineTrackingByFilterSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.filter.getChannel("REQUEST_FILTER"),
				callback: "_subRequestFilter"
			});
		},

		postCreate: function() {

			this._once(this.filter.getChannel("REQUESTED"), lang.hitch(this, this._subRequestedFilter));

			this.inherited(arguments);
		},

		_subRequestedFilter: function(obj) {

			this._serializeFilter();
		},

		_subRequestFilter: function(obj) {

			this._serializeFilter();
		},

		_serializeFilter: function() {

			this._once(this.filter.getChannel("SERIALIZED"), lang.hitch(this, this._subSerializedFilter));

			this._publish(this.filter.getChannel("SERIALIZE"), {
				noSerializeNullValue: false
			});
		},

		_subSerializedFilter: function(req) {

			this._serializedFilter(req);
		},

		_serializedFilter: function(req) {

			var data = req.data;

			delete data.size;
			delete data.from;

			this._lastDataFilter = data;

			for (var key in this._layerInstances) {
				this._publish(this._layerInstances[key].getChildChannel('filter', "ADD_TO_QUERY"), {
					query: data
				});
			}
		},

		_configByLayerInstance: function(obj) {

			var ret = this.inherited(arguments);

			delete ret.filterConfig;

			lang.mixin(this._lastDataFilter, {
				terms: {
					zoomLevel: this._currentZoomLevel
				}
			});

			lang.mixin(ret, {
				filterConfig: {
					initQuery: this._lastDataFilter
				}
			});

			return ret;
		},

		_getIconKeypadNode: function() {

			return this.topbarNode;
		}
	});
});
