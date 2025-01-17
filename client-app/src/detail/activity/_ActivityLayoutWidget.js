define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/detail/_WidgetDefinition'
], function(
	declare
	, lang
	, Deferred
	, _WidgetDefinition
) {

	return declare(_WidgetDefinition, {
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
				}
			};

			lang.mixin(this, this.config, args);
		},

		_onDetailLayoutsPropSet: function(evt) {

			var currentElementId = this.pathVariableId,
				activityDetailLayouts = evt.value && evt.value[currentElementId];

			if (!activityDetailLayouts || !activityDetailLayouts.length) {
				return;
			}

			this._processActivityDetailLayouts(currentElementId, activityDetailLayouts);
		},

		_processActivityDetailLayouts: function(activityId, layouts) {

			layouts.forEach(lang.hitch(this, function(layout) {

				var layoutType = layout.type,
					layoutConfig = layout.config || {},
					layoutCheckGrants = layout.checkGrants || false;

				if (!layoutType) {
					return;
				}

				var grantedCallback = lang.hitch(this, this._prepareDetailLayoutWidgets, layoutType, layoutConfig);

				if (layoutCheckGrants) {
					var notGrantedCallback = lang.hitch(this, this._onLayoutNotGranted),
						dfd = new Deferred();

					dfd.then(grantedCallback, notGrantedCallback);

					this._checkUserGrantsForActivityData(activityId, dfd);
				} else {
					grantedCallback();
				}
			}));
		},

		_checkUserGrantsForActivityData: function(activityId, dfd) {

			var channelToSubscribe = this._buildChannel(this.credentialsChannel, 'GOT_USER_GRANTS_FOR_ACTIVITY');

			this._once(channelToSubscribe, lang.hitch(this, function(grantsDfd, res) {

				if (res.accessGranted) {
					grantsDfd.resolve(true);
				} else {
					grantsDfd.reject(false);
				}
			}, dfd));

			var channelToPublish = this._buildChannel(this.credentialsChannel, 'GET_USER_GRANTS_FOR_ACTIVITY');
			this._publish(channelToPublish, {
				activityId: activityId
			});
		},

		_onLayoutNotGranted: function(grantsDfd) {

			// TODO mostrar al usuario un aviso de que existen datos en la actividad, pero no tiene permiso.
			// Ofrecerle identificarse.
		},

		_prepareCustomWidgets: function() {
			// TODO medida temporal por retrocompatibilidad con activityCategory

			var currentElementId = this.pathVariableId,
				detailLayout = this.detailLayouts && this.detailLayouts[currentElementId],
				detailLayoutWidgetsCount = this._detailLayoutWidgets && this._detailLayoutWidgets.length;

			if (!detailLayout || !detailLayoutWidgetsCount) {
				this._prepareActivityCategoryCustomWidgets();
			}
		},

		_prepareDetailLayoutWidgets: function(detailLayout, layoutConfig, grantsDfd) {

			if (!this._detailLayoutWidgets) {
				this._detailLayoutWidgets = [];
			}

			if (grantsDfd !== undefined) {
				layoutConfig.accessGranted = grantsDfd;
			}

			var prepareWidgetsMethod;

			if (detailLayout === 'citationMap') {
				prepareWidgetsMethod = '_prepareCitationActivityWidgets';
			} else if (detailLayout === 'ogcLayerMap') {
				prepareWidgetsMethod = '_prepareMapLayerActivityWidgets';
			} else if (detailLayout === 'trackingMap') {
				prepareWidgetsMethod = '_prepareTrackingActivityWidgets';
			} else if (detailLayout === 'infrastructureMap') {
				prepareWidgetsMethod = '_prepareInfrastructureActivityWidgets';
			} else if (detailLayout === 'areaMap') {
				prepareWidgetsMethod = '_prepareAreaActivityWidgets';
			} else if (detailLayout === 'featureMap') {
				prepareWidgetsMethod = '_prepareFixedObservationSeriesActivityWidgets';
			} else if (detailLayout === 'featureTimeseriesMapChart') {
				prepareWidgetsMethod = '_prepareFixedTimeseriesActivityWidgets';
			} else if (detailLayout === 'embeddedContent') {
				prepareWidgetsMethod = '_prepareEmbeddedContentsActivityWidgets';
			}

			if (!prepareWidgetsMethod) {
				console.warn('Tried to get widgets for "%s" detail layout, but none found!', detailLayout);
				return;
			}

			var widgetKey = this[prepareWidgetsMethod](layoutConfig);

			if (widgetKey instanceof Array) {
				this._detailLayoutWidgets = this._detailLayoutWidgets.concat(widgetKey);
			} else {
				this._detailLayoutWidgets.push(widgetKey);
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

		_prepareCitationActivityWidgets: function(layoutConfig) {

			var key = 'activityCitation',
				config = this._getActivityCitationConfig(layoutConfig);

			this._addWidget(key, config);

			return key;
		},

		_prepareMapLayerActivityWidgets: function(layoutConfig) {

			var key = 'activityMapLayer',
				config = this._getActivityMapLayerConfig(layoutConfig);

			this._addWidget(key, config);

			return key;
		},

		_prepareTrackingActivityWidgets: function(layoutConfig) {

			var key = 'activityTracking',
				config = this._getActivityTrackingConfig(layoutConfig);

			this._addWidget(key, config);

			return key;
		},

		_prepareInfrastructureActivityWidgets: function(layoutConfig) {

			var key = 'activityInfrastructure',
				config = this._getActivityInfrastructureConfig(layoutConfig);

			this._addWidget(key, config);

			return key;
		},

		_prepareAreaActivityWidgets: function(layoutConfig) {

			var key = 'activityArea',
				config = this._getActivityAreaConfig(layoutConfig);

			this._addWidget(key, config);

			return key;
		},

		_prepareFixedObservationSeriesActivityWidgets: function(layoutConfig) {

			var mapKey = 'activityFixedObservationSeriesMap',
				mapConfig = this._getActivityFixedObservationSeriesMapConfig(layoutConfig);

			this._addWidget(mapKey, mapConfig);

			var listKey = 'activityFixedObservationSeriesList',
				listConfig = this._getActivityFixedObservationSeriesListConfig(mapKey, layoutConfig);

			this._addWidget(listKey, listConfig);

			return [mapKey, listKey];
		},

		_prepareFixedTimeseriesActivityWidgets: function(layoutConfig) {

			var mapKey = 'activityFixedTimeseriesMap',
				mapConfig = this._getActivityFixedTimeseriesMapConfig(layoutConfig);

			this._addWidget(mapKey, mapConfig);

			var timeseriesDataChannel = this._getWidgetInstance(mapKey).getChannel('TIMESERIES_DATA');

			this._subscribe(timeseriesDataChannel, lang.hitch(this, this._onTimeseriesDataPublished, layoutConfig));

			return mapKey;
		},

		_onTimeseriesDataPublished: function(layoutConfig, data) {

			this._onTimeseriesLineChartsDataPublished(layoutConfig, data);
			this._onTimeseriesWindroseDataPublished(layoutConfig, data);
		},

		_onTimeseriesLineChartsDataPublished: function(layoutConfig, data) {

			var lineChartsKey = 'activityFixedTimeseriesLineCharts',
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

			this._addWidget(lineChartsKey, lineChartsConfig);

			this._publish(lineChartsDataChannel, data);
		},

		_onTimeseriesWindroseDataPublished: function(layoutConfig, data) {

			var allowedSpeedParameters = [
					61, // velocidad viento media
					66 // velocidad viento máxima
				],
				allowedDirectionParameters = [
					62, // dirección viento media
					67 // dirección viento máxima
				],
				filteredMeasurements = data.measurements.filter(lang.hitch(this, this._filterWindroseMeasurements, {
					allowedSpeedParameters: allowedSpeedParameters,
					allowedDirectionParameters: allowedDirectionParameters
				}));

			if (this._windroseWidgetKeys) {
				this._windroseWidgetKeys.forEach(lang.hitch(this, this._destroyWidget));
			}
			this._windroseWidgetKeys = [];

			for (var i = 0; i < filteredMeasurements.length - 1; i += 2) {
				this._onEachWindroseDataPair({
					index: i ? i - 1 : 0,
					layoutConfig: layoutConfig,
					measurements: [filteredMeasurements[i], filteredMeasurements[i + 1]],
					site: data.site,
					allowedSpeedParameters: allowedSpeedParameters,
					allowedDirectionParameters: allowedDirectionParameters
				});
			}
		},

		_filterWindroseMeasurements: function(args, measurement) {

			var paramId = measurement.parameter.id;

			return args.allowedSpeedParameters.includes(paramId) || args.allowedDirectionParameters.includes(paramId);
		},

		_onEachWindroseDataPair: function(args) {

			var windroseKey = 'activityFixedTimeseriesWindrose' + args.index,
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

			this._addWidget(windroseKey, windroseConfig);

			this._publish(windroseDataChannel, {
				measurements: args.measurements
			});
		},

		_prepareEmbeddedContentsActivityWidgets: function(layoutConfig) {

			var embeddedContents = this._activityData.embeddedContents,
				keys = [];

			var embeddedContent = layoutConfig && layoutConfig.content;

			if (embeddedContent) {
				embeddedContents.push({embeddedContent: embeddedContent});
			}

			for (var i = 0; i < embeddedContents.length; i++) {
				var embeddedContentObj = embeddedContents[i],
					embeddedContentValue = embeddedContentObj.embeddedContent,
					embeddedContentParentNode = globalThis.document.createElement('object');

				embeddedContentParentNode.innerHTML = embeddedContentValue;

				var key = 'embeddedContent' + i,
					node = embeddedContentParentNode.firstChild,
					config = this._getActivityEmbeddedContentsConfig(node, i, layoutConfig);

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
