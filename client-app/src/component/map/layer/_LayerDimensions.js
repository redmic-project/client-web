define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'moment'
], function(
	declare
	, lang
	, aspect
	, moment
) {

	return declare(null, {
		//	summary:
		//		Extensión de MapLayer para asignar valores a diferentes dimensiones de la capa, como la temporal o la de
		//		elevación.

		constructor: function(args) {

			this.config = {
				layerDimensionsActions: {
					SET_LAYER_DIMENSION: 'SET_LAYER_DIMENSION'
				},

				_currentDimensionValues: {}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixLayerDimensionsEventsAndActions));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineLayerDimensionsSubscriptions));
			aspect.after(this, '_afterLayerAdded', lang.hitch(this, this._afterLayerAddedLayerDimensions));
		},

		_mixLayerDimensionsEventsAndActions: function() {

			lang.mixin(this.actions, this.layerDimensionsActions);
			delete this.layerDimensionsActions;
		},

		_defineLayerDimensionsSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('SET_LAYER_DIMENSION'),
				callback: '_subSetLayerDimension'
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_afterLayerAddedLayerDimensions: function() {

			var elevationDimension = this.dimensions && this.dimensions.elevation;

			if (elevationDimension) {
				this._setElevationDimension({
					value: elevationDimension.defaultValue
				});
			}
		},

		_obtainDimensionParams: function(data) {

			var dimensionParams = {};

			this._obtainTimeDimensionParams(dimensionParams, data);
			this._obtainElevationDimensionParams(dimensionParams);

			return dimensionParams;
		},

		_obtainTimeDimensionParams: function(dimensionParams, data) {

			if (dimensionParams && data && data.time) {
				dimensionParams.time = moment(data.time).toISOString();
				this._currentDimensionValues.time = dimensionParams.time;
			}

			return dimensionParams;
		},

		_obtainElevationDimensionParams: function(dimensionParams) {

			if (dimensionParams && this._currentDimensionValues.elevation) {
				dimensionParams.elevation = this._currentDimensionValues.elevation;
			}

			return dimensionParams;
		},

		_subSetLayerDimension: function(req) {

			if (!req || !req.elevation) {
				return;
			}

			this._setElevationDimension(req.elevation);
		},

		_setElevationDimension: function(elevation) {

			var newElevation = elevation.value;
			this._currentDimensionValues.elevation = newElevation;

			this._applyElevationDimension();
		},

		_applyElevationDimension: function() {

			if (!this.layer) {
				return;
			}

			this.layer.setParams({
				elevation: this._currentDimensionValues.elevation
			});
		}
	});
});
