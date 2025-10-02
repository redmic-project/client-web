define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
], function(
	declare
	, lang
	, Deferred
) {

	return declare(null, {
		//	summary:
		//		Aplicación de componentes adicionales para la vista detalle de Activity, en función del tipo de layout
		//		establecido según su identificador. Si no está establecido, se decide según su categoría.

		constructor: function(args) {

			this.config = {
				mainActions: {
					GET_USER_GRANTS_FOR_ACTIVITY: 'getUserGrantsForActivity',
					GOT_USER_GRANTS_FOR_ACTIVITY: 'gotUserGrantsForActivity',
					TIMESERIES_LINE_CHARTS_DATA: 'timeseriesLineChartsData',
					TIMESERIES_WINDROSE_DATA: 'timeseriesWindroseData'
				},
				_layoutWidgets: []
			};

			lang.mixin(this, this.config, args);
		},

		_onDetailLayoutsPropSet: function(evt) {

			const currentElementId = this.pathVariableId,
				activityDetailLayouts = evt.value?.[currentElementId];

			if (!activityDetailLayouts?.length) {
				// TODO medida temporal por retrocompatibilidad con activityCategory
				this._prepareActivityCategoryLayoutWidgets();
				return;
			}

			activityDetailLayouts.forEach((layout) => this._processActivityDetailLayout(currentElementId, layout));
		},

		_processActivityDetailLayout: function(activityId, layout) {

			const layoutType = layout?.type;

			if (!layoutType) {
				return;
			}

			const layoutConfig = layout?.config ?? {},
				layoutCheckGrants = layout?.checkGrants ?? false;

			if (!layoutCheckGrants) {
				this._prepareLayoutWidgets(layoutType, layoutConfig);
				return;
			}

			const dfd = new Deferred();

			dfd.then(
				(resolvedGrants) => this._onLayoutGranted(layout, resolvedGrants),
				(rejectedGrants) => this._onLayoutNotGranted(layout, rejectedGrants));

			this._checkUserGrantsForActivityData(activityId, dfd);
		},

		_checkUserGrantsForActivityData: function(activityId, dfd) {

			this._once(this._buildChannel(this.credentialsChannel, 'GOT_USER_GRANTS_FOR_ACTIVITY'), (res) => {
				res?.accessGranted ? dfd.resolve() : dfd.reject();
			});

			this._publish(this._buildChannel(this.credentialsChannel, 'GET_USER_GRANTS_FOR_ACTIVITY'), {
				activityId: activityId
			});
		},

		_onLayoutGranted: function(layout, resolvedGrants) {

			const layoutType = layout.type,
				layoutConfig = layout.config ?? {};

			layoutConfig.accessGranted = true;

			this._prepareLayoutWidgets(layoutType, layoutConfig);
		},

		_onLayoutNotGranted: function(layout, rejectedGrants) {

			// TODO mostrar al usuario un aviso de que existen datos en la actividad, pero no tiene permiso.
			// Ofrecerle identificarse.
		},

		_prepareLayoutWidgets: function(layoutType, layoutConfig) {

			const capitalizedLayoutType = layoutType.charAt(0).toUpperCase() + layoutType.slice(1),
				prepareWidgetsMethod = `_prepare${capitalizedLayoutType}LayoutWidgets`;

			this[prepareWidgetsMethod]?.(layoutConfig);
		},

		_prepareActivityCategoryLayoutWidgets: function() {
			// TODO borrar cuando se deje de usar activityCategory

			const activityCategory = this._activityData.activityCategory;

			if (activityCategory === 'ci') {
				this._prepareCitationMapLayoutWidgets();
			} else if (activityCategory === 'ml') {
				this._prepareOgcLayerMapLayoutWidgets();
			} else if (['tr', 'at', 'pt'].indexOf(activityCategory) !== -1) {
				this._prepareTrackingMapLayoutWidgets();
			} else if (activityCategory === 'if') {
				this._prepareInfrastructureMapLayoutWidgets();
			} else if (activityCategory === 'ar') {
				this._prepareAreaMapLayoutWidgets();
			} else if (activityCategory === 'ft') {
				this._prepareFeatureTimeseriesMapChartLayoutWidgets();
			} else if (activityCategory === 'ec') {
				this._prepareEmbeddedContentLayoutWidgets();
			}
		},

		_prepareCitationMapLayoutWidgets: function(layoutConfig) {

			const key = 'activityCitation',
				config = this._getActivityCitationConfig(layoutConfig);

			this._addLayoutWidget(key, config);
		},

		_prepareOgcLayerMapLayoutWidgets: function(layoutConfig) {

			const key = 'activityMapLayer',
				config = this._getActivityMapLayerConfig(layoutConfig);

			this._addLayoutWidget(key, config);
		},

		_prepareTrackingMapLayoutWidgets: function(layoutConfig) {

			const key = 'activityTracking',
				config = this._getActivityTrackingConfig(layoutConfig);

			this._addLayoutWidget(key, config);
		},

		_prepareInfrastructureMapLayoutWidgets: function(layoutConfig) {

			const key = 'activityInfrastructure',
				config = this._getActivityInfrastructureConfig(layoutConfig);

			this._addLayoutWidget(key, config);
		},

		_prepareAreaMapLayoutWidgets: function(layoutConfig) {

			const key = 'activityArea',
				config = this._getActivityAreaConfig(layoutConfig);

			this._addLayoutWidget(key, config);
		},

		_prepareFeatureMapLayoutWidgets: function(layoutConfig) {

			const mapKey = 'activityFixedObservationSeriesMap',
				mapConfig = this._getActivityFixedObservationSeriesMapConfig(layoutConfig);

			this._addLayoutWidget(mapKey, mapConfig);

			const listKey = 'activityFixedObservationSeriesList',
				listConfig = this._getActivityFixedObservationSeriesListConfig(mapKey, layoutConfig);

			this._addLayoutWidget(listKey, listConfig);
		},

		_prepareFeatureTimeseriesMapChartLayoutWidgets: function(layoutConfig) {

			const mapKey = 'activityFixedTimeseriesMap',
				mapConfig = this._getActivityFixedTimeseriesMapConfig(layoutConfig);

			this._addLayoutWidget(mapKey, mapConfig);

			const timeseriesDataChannel = this._getWidgetInstance(mapKey).getChannel('TIMESERIES_DATA');

			this._subscribe(timeseriesDataChannel, lang.hitch(this, this._onTimeseriesDataPublished, layoutConfig));
		},

		_onTimeseriesDataPublished: function(layoutConfig, data) {

			this._onTimeseriesLineChartsDataPublished(layoutConfig, data);
			this._onTimeseriesWindroseDataPublished(layoutConfig, data);
		},

		_onTimeseriesLineChartsDataPublished: function(layoutConfig, data) {

			const lineChartsKey = 'activityFixedTimeseriesLineCharts',
				lineChartsConfig = this._getActivityFixedTimeseriesLineChartsConfig(layoutConfig),
				lineChartsDataChannel = this.getChannel('TIMESERIES_LINE_CHARTS_DATA'),
				siteName = data.site.name;

			lineChartsConfig.props = this._merge([lineChartsConfig.props, {
				title: this.i18n.charts + ' | ' + siteName,
				timeseriesDataChannel: lineChartsDataChannel
			}]);

			if (this._lineChartsWidgetKey) {
				this._destroyWidget(this._lineChartsWidgetKey);
			}
			this._lineChartsWidgetKey = lineChartsKey;

			this._addLayoutWidget(lineChartsKey, lineChartsConfig);

			this._publish(lineChartsDataChannel, data);
		},

		_onTimeseriesWindroseDataPublished: function(layoutConfig, data) {

			const allowedSpeedParameters = [
				61, // velocidad viento media
				66 // velocidad viento máxima
			];
			const allowedDirectionParameters = [
				62, // dirección viento media
				67 // dirección viento máxima
			];

			const filteredMeasurements = data.measurements.filter((measurement) => {

				const paramId = measurement.parameter.id;
				return allowedSpeedParameters.includes(paramId) || allowedDirectionParameters.includes(paramId);
			});

			if (this._windroseWidgetKeys) {
				this._windroseWidgetKeys.forEach(lang.hitch(this, this._destroyWidget));
			}
			this._windroseWidgetKeys = [];

			for (let i = 0; i < filteredMeasurements.length - 1; i += 2) {
				this._onEachWindroseDataPair({
					index: i ? i - 1 : 0,
					layoutConfig: layoutConfig,
					measurements: [filteredMeasurements[i], filteredMeasurements[i + 1]],
					site: data.site,
					allowedSpeedParameters,
					allowedDirectionParameters
				});
			}
		},

		_onEachWindroseDataPair: function(args) {

			const windroseKey = 'activityFixedTimeseriesWindrose' + args.index,
				windroseConfig = this._getActivityFixedTimeseriesWindroseConfig(args.layoutConfig),
				windroseDataChannel = this.getChannel('TIMESERIES_WINDROSE_DATA') + args.index,
				siteName = args.site.name,
				speedParamTitle = args.measurements[0].parameter.name,
				directionParamTitle = args.measurements[1].parameter.name;

			windroseConfig.props = this._merge([windroseConfig.props, {
				ownChannel: 'windrose' + args.index,
				title: speedParamTitle + ' + ' + directionParamTitle + ' | ' + siteName,
				allowedSpeedParameters: args.allowedSpeedParameters,
				allowedDirectionParameters: args.allowedDirectionParameters,
				timeseriesDataChannel: windroseDataChannel
			}]);

			this._windroseWidgetKeys.push(windroseKey);

			this._addLayoutWidget(windroseKey, windroseConfig);

			this._publish(windroseDataChannel, {
				measurements: args.measurements
			});
		},

		_prepareEmbeddedContentLayoutWidgets: function(layoutConfig) {

			const embeddedContents = this._activityData.embeddedContents,
				layoutEmbeddedContent = layoutConfig?.content;

			if (layoutEmbeddedContent) {
				embeddedContents.push({embeddedContent: layoutEmbeddedContent});
			}

			for (let i = 0; i < embeddedContents.length; i++) {
				const embeddedContentObj = embeddedContents[i],
					embeddedContentValue = embeddedContentObj.embeddedContent,
					embeddedContentParentNode = globalThis.document.createElement('object');

				embeddedContentParentNode.innerHTML = embeddedContentValue;

				const key = 'embeddedContent' + i,
					node = embeddedContentParentNode.firstChild,
					config = this._getActivityEmbeddedContentsConfig(node, i, layoutConfig);

				this._addLayoutWidget(key, config);
			}
		},

		_prepareSupersetDashboardLayoutWidgets: function(layoutConfig) {

			const dashboardId = layoutConfig.id,
				key = 'superset-' + dashboardId,
				config = this._getSupersetDashboardConfig(layoutConfig);

			this._addLayoutWidget(key, config);
		},

		_addLayoutWidget: function(key, config) {

			this._addWidget(key, config);
			this._layoutWidgets.push(key);
		},

		_removeLayoutWidgets: function() {

			if (!this._layoutWidgets) {
				return;
			}

			while (this._layoutWidgets.length) {
				const key = this._layoutWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
