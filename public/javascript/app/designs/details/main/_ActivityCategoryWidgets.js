define([
	'app/designs/details/main/ActivityTrackingMap'
	, 'app/details/views/ActivityAreaMapBase'
	, 'app/details/views/ActivityCitationMapBase'
	, 'app/details/views/ActivityFixedTimeseriesChart'
	, 'app/details/views/ActivityFixedTimeseriesMap'
	, 'app/details/views/ActivityInfrastructureMapBase'
	, 'app/details/views/ActivityLayerMapBase'
	, 'dojo/_base/declare'
], function(
	ActivityTrackingMap
	, ActivityAreaMapBase
	, ActivityCitationMapBase
	, ActivityFixedTimeseriesChart
	, ActivityFixedTimeseriesMap
	, ActivityInfrastructureMapBase
	, ActivityLayerMapBase
	, declare
) {

	return declare(null, {
		//	summary:
		//		Adiciones a vista detalle de Activity, para mostrar datos según su categoría.

		_prepareActivityCategoryCustomWidgets: function() {

			if (!this._activityCategoryCustomWidgets) {
				this._activityCategoryCustomWidgets = [];
			}

			var activityCategory = this._activityData.activityCategory,
				widgetKey;

			if (activityCategory === 'ci') {
				widgetKey = this._prepareCitationActivityWidgets();
			} else if (activityCategory === 'ml') {
				widgetKey = this._prepareMapLayerActivityWidgets();
			} else if (['tr', 'at', 'pt'].indexOf(activityCategory) !== -1) {
				widgetKey = this._prepareTrackingActivityWidgets();
			} else if (activityCategory === 'if') {
				widgetKey = this._prepareInfrastructureActivityWidgets();
			} else if (activityCategory === 'ar') {
				widgetKey = this._prepareAreaActivityWidgets();
			} else if (activityCategory === 'ft') {
				widgetKey = this._prepareFixedTimeseriesActivityWidgets();
			}

			if (widgetKey) {
				if (widgetKey instanceof Array) {
					this._activityCategoryCustomWidgets = this._activityCategoryCustomWidgets.concat(widgetKey);
				} else {
					this._activityCategoryCustomWidgets.push(widgetKey);
				}
			}
		},

		_prepareCitationActivityWidgets: function() {

			var key = 'activityCitation';

			var config = {
				width: 6,
				height: 6,
				type: ActivityCitationMapBase,
				props: {
					title: this.i18n.citations,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareMapLayerActivityWidgets: function() {

			var key = 'activityMapLayer';

			var config = {
				width: 6,
				height: 6,
				type: ActivityLayerMapBase,
				props: {
					title: this.i18n.layers,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareTrackingActivityWidgets: function() {

			var key = 'activityTracking';

			var config = {
				width: 6,
				height: 6,
				type: ActivityTrackingMap,
				props: {
					title: this.i18n.tracking,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareInfrastructureActivityWidgets: function() {

			var key = 'activityInfrastructure';

			var config = {
				width: 6,
				height: 6,
				type: ActivityInfrastructureMapBase,
				props: {
					title: this.i18n.infrastructures,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareAreaActivityWidgets: function() {

			var key = 'activityArea';

			var config = {
				width: 6,
				height: 6,
				type: ActivityAreaMapBase,
				props: {
					title: this.i18n.area,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareFixedTimeseriesActivityWidgets: function() {

			var mapKey = 'activityFixedTimeseriesMap';

			var mapConfig = {
				width: 6,
				height: 6,
				type: ActivityFixedTimeseriesMap,
				props: {
					title: this.i18n.associatedSurveyStation,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(mapKey, mapConfig);

			var chartKey = 'activityFixedTimeseriesChart';

			var chartConfig = {
				width: 6,
				height: 6,
				type: ActivityFixedTimeseriesChart,
				props: {
					title: this.i18n.charts,
					pathVariableId: this._activityData.id,
					timeseriesDataChannel: this._getWidgetInstance(mapKey).getChannel('TIMESERIES_DATA')
				}
			};

			this._addWidget(chartKey, chartConfig);

			return [mapKey, chartKey];
		},

		_removeActivityCategoryCustomWidgets: function() {

			while (this._activityCategoryCustomWidgets.length) {
				var key = this._activityCategoryCustomWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
