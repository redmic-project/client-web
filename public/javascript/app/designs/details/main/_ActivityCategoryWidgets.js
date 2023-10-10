define([
	'app/designs/details/main/ActivityTrackingMap'
	, 'app/details/views/ActivityAreaMapBase'
	, 'app/details/views/ActivityCitationMapBase'
	, 'app/details/views/ActivityFixedTimeseriesChart'
	, 'app/details/views/ActivityFixedTimeseriesMap'
	, 'app/details/views/ActivityInfrastructureMapBase'
	, 'app/details/views/ActivityLayerMapBase'
	, 'dojo/_base/declare'
	, 'redmic/modules/layout/genericDisplayer/GenericDisplayer'
], function(
	ActivityTrackingMap
	, ActivityAreaMapBase
	, ActivityCitationMapBase
	, ActivityFixedTimeseriesChart
	, ActivityFixedTimeseriesMap
	, ActivityInfrastructureMapBase
	, ActivityLayerMapBase
	, declare
	, GenericDisplayer
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
			} else if (activityCategory === 'ec') {
				widgetKey = this._prepareEmbeddedContentsActivityWidgets();
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
					windowTitle: 'citations',
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
					windowTitle: 'layers',
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
					windowTitle: 'tracking',
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
					windowTitle: 'infrastructures',
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
					windowTitle: 'area',
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
					windowTitle: 'associatedSurveyStation',
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
					windowTitle: 'charts',
					pathVariableId: this._activityData.id,
					timeseriesDataChannel: this._getWidgetInstance(mapKey).getChannel('TIMESERIES_DATA')
				}
			};

			this._addWidget(chartKey, chartConfig);

			return [mapKey, chartKey];
		},

		_prepareEmbeddedContentsActivityWidgets: function() {

			var embeddedContents = this._activityData.embeddedContents,
				keys = [];

			for (var i = 0; i < embeddedContents.length; i++) {
				var embeddedContentObj = embeddedContents[i],
					embeddedContentValue = embeddedContentObj.embeddedContent,
					embeddedContentParentNode = document.createElement('object');

				embeddedContentParentNode.innerHTML = embeddedContentValue;

				var config = {
					width: 6,
					height: 6,
					type: GenericDisplayer,
					props: {
						title: this.i18n.activityEmbeddedContent + ' #' + i,
						content: embeddedContentParentNode.firstChild
					}
				};

				var key = 'activityEmbeddedContent' + i;
				keys.push(key);

				this._addWidget(key, config);
			}

			return keys;
		},

		_removeActivityCategoryCustomWidgets: function() {

			while (this._activityCategoryCustomWidgets.length) {
				var key = this._activityCategoryCustomWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
