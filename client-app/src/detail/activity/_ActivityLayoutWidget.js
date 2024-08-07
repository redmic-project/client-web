define([
	'dojo/_base/declare'
	, 'src/detail/_WidgetDefinition'
], function(
	declare
	, _WidgetDefinition
) {

	return declare(_WidgetDefinition, {
		//	summary:
		//		Aplicación de componentes adicionales para la vista detalle de Activity, en función del tipo de layout
		//		establecido según su identificador. Si no está establecido, se decide según su categoría.

		_onDetailLayoutsPropSet: function(evt) {

			var currentElementId = this.pathVariableId,
				detailLayout = evt.value[currentElementId];

			if (detailLayout) {
				this._prepareDetailLayoutWidgets(detailLayout);
			}
		},

		_prepareCustomWidgets: function() {
			// TODO medida temporal por retrocompatibilidad con activityCategory

			var currentElementId = this.pathVariableId,
				detailLayout = this.detailLayouts && this.detailLayouts[currentElementId];

			if (!detailLayout) {
				this._prepareActivityCategoryCustomWidgets();
			}
		},

		_prepareDetailLayoutWidgets: function(detailLayout) {

			if (!this._detailLayoutWidgets) {
				this._detailLayoutWidgets = [];
			}

			var widgetKey;

			if (detailLayout === 'citationMap') {
				widgetKey = this._prepareCitationActivityWidgets();
			} else if (detailLayout === 'ogcLayerMap') {
				widgetKey = this._prepareMapLayerActivityWidgets();
			} else if (detailLayout === 'trackingMap') {
				widgetKey = this._prepareTrackingActivityWidgets();
			} else if (detailLayout === 'infrastructureMap') {
				widgetKey = this._prepareInfrastructureActivityWidgets();
			} else if (detailLayout === 'areaMap') {
				widgetKey = this._prepareAreaActivityWidgets();
			} else if (detailLayout === 'featureTimeseriesMapChart') {
				widgetKey = this._prepareFixedTimeseriesActivityWidgets();
			} else if (detailLayout === 'embeddedContent') {
				widgetKey = this._prepareEmbeddedContentsActivityWidgets();
			}

			if (widgetKey) {
				if (widgetKey instanceof Array) {
					this._detailLayoutWidgets = this._detailLayoutWidgets.concat(widgetKey);
				} else {
					this._detailLayoutWidgets.push(widgetKey);
				}
			}
		},

		_prepareActivityCategoryCustomWidgets: function() {
			// TODO borrar cuando se deje de usar activityCategory

			if (!this._detailLayoutWidgets) {
				this._detailLayoutWidgets = [];
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
					this._detailLayoutWidgets = this._detailLayoutWidgets.concat(widgetKey);
				} else {
					this._detailLayoutWidgets.push(widgetKey);
				}
			}
		},

		_prepareCitationActivityWidgets: function() {

			var key = 'activityCitation',
				config = this._getActivityCitationConfig();

			this._addWidget(key, config);

			return key;
		},

		_prepareMapLayerActivityWidgets: function() {

			var key = 'activityMapLayer',
				config = this._getActivityMapLayerConfig();

			this._addWidget(key, config);

			return key;
		},

		_prepareTrackingActivityWidgets: function() {

			var key = 'activityTracking',
				config = this._getActivityTrackingConfig();

			this._addWidget(key, config);

			return key;
		},

		_prepareInfrastructureActivityWidgets: function() {

			var key = 'activityInfrastructure',
				config = this._getActivityInfrastructureConfig();

			this._addWidget(key, config);

			return key;
		},

		_prepareAreaActivityWidgets: function() {

			var key = 'activityArea',
				config = this._getActivityAreaConfig();

			this._addWidget(key, config);

			return key;
		},

		_prepareFixedTimeseriesActivityWidgets: function() {

			var mapKey = 'activityFixedTimeseriesMap',
				mapConfig = this._getActivityFixedTimeseriesMapConfig();

			this._addWidget(mapKey, mapConfig);

			var chartKey = 'activityFixedTimeseriesChart',
				chartConfig = this._getActivityFixedTimeseriesChartConfig(mapKey);

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

				var key = 'embeddedContent' + i,
					config = this._getActivityEmbeddedContentsConfig(embeddedContentParentNode.firstChild, i);

				keys.push(key);

				this._addWidget(key, config);
			}

			return keys;
		},

		_removeCustomWidgets: function() {

			if (!this._detailLayoutWidgets) {
				return;
			}

			while (this._detailLayoutWidgets.length) {
				var key = this._detailLayoutWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
