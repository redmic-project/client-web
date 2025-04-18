define([
	"app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContentAndTopbar"
	, 'src/redmicConfig'
	, 'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
	, 'put-selector'
	, "RWidgets/Utilities"
	, "src/component/base/_Store"
	, "src/component/components/ProgressSlider/ProgressSlider"
	, "src/component/atlas/Atlas"
	, 'src/component/form/FormContainerImpl'
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'src/component/layout/TabsDisplayer'
	, "src/component/map/layer/_AddFilter"
	, "src/component/map/layer/_PublishInfo"
	, "src/component/map/layer/TrackingLayerImpl"
	, "src/component/mapQuery/QueryOnMap"
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, d3
	, declare
	, lang
	, moment
	, put
	, Utilities
	, _Store
	, ProgressSlider
	, Atlas
	, FormContainerImpl
	, GenericWithTopbarDisplayerImpl
	, TabsDisplayer
	, _AddFilter
	, _PublishInfo
	, TrackingLayerImpl
	, QueryOnMap
) {

	return declare([Layout, Controller, _Main, _Store], {
		//	summary:
		//		Vista de Tracking.
		//	description:
		//		Permite visualizar seguimientos.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function(args) {

			this.config = {
				title: this.i18n.tracking,
				"class": "",

				layersTarget: redmicConfig.services.pointTrackingCluster,
				infoTarget: redmicConfig.services.trackingActivity,

				mainEvents: {
					MOVE_TRACK_TO: "moveTrackTo",
					SET_PROGRESS_MAX: "setProgressMax",
					SET_PROGRESS_MIN: "setProgressMin",
					SET_PROGRESS_TIMEOUT: "setProgressTimeout",
					SET_PROGRESS_DELTA: "setProgressDelta",
					SHOW_DIRECTION_MARKERS: "showDirectionMarkers",
					HIDE_DIRECTION_MARKERS: "hideDirectionMarkers",
					PRESS_PROGRESS_BUTTON: "pressProgressButton",
					SET_TRACKING_PROPS: "setTrackingProps"
				},
				mainActions: {
					CLEAR: "clear",
					CLEAR_LAYERS: "clearLayers",
					ADD_LAYER: "addLayer",
					VALUE_CHANGED: "valueChanged"
				},

				typeGroupProperty: "category",
				ownChannel: "tracking",
				// TODO puede que esto sea innecesario ya
				_currentZoomLevel: 7,
				_layerInstances: {},
				_activityIdByUuid: {},
				_trackingPointLimits: {},
				_colors: d3.schemePaired,
				_colorUsage: {},
				_transitionOffset: 100,
				_trackingTransitionRate: 900,
				_layerIdPrefix: "tracking",
				layerIdSeparator: "_",
				_deltaProgress: 3600000,
				formTemplate: 'viewers/views/templates/forms/Tracking',
				timeMode: false
			};

			lang.mixin(this, this.config, args);

			if (this.usePrivateTarget) {
				this.layersTarget = redmicConfig.services.privatePointTrackingCluster;
			}
		},

		_setMainConfigurations: function() {

			this.formConfig = this._merge([{
				parentChannel: this.getChannel(),
				template: this.formTemplate,
				formContainerConfig: {
					loadInputs: lang.hitch(this, this._loadInputsFormAndShow),
					defaultTrackingMode: this.timeMode ? 1 : 0
				}
			}, this.formConfig || {}]);

			this.mapConfig = this._merge([{
				maxZoom: 21
			}, this.mapConfig || {}]);
		},

		_setMainOwnCallbacksForEvents: function() {

			this.on([this.events.HIDE, this.events.ANCESTOR_HIDE], lang.hitch(this, this._onHide));
		},

		_initializeMain: function() {

			this.TrackingClusterLayer = declare([TrackingLayerImpl, _AddFilter, _PublishInfo]);

			this.progressSlider = new ProgressSlider({
				parentChannel: this.getChannel(),
				props: {
					showValue: true,
					valueInTooltip: false
				}
			});

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});
		},

		_defineMainSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("CLEAR_LAYERS"),
				callback: "_subClearLayers"
			},{
				channel : this.getChannel("ADD_LAYER"),
				callback: "_subAddLayers"
			},{
				channel: this.map.getChannel("ZOOM_SET"),
				callback: "_subZoomSet"
			},{
				channel: this.progressSlider.getChannel("CHANGE_VALUE"),
				callback: "_subProgressSliderChange"
			});
		},

		_defineMainPublications: function () {

			this.publicationsConfig.push({
				event: 'SET_PROGRESS_MAX',
				channel: this.progressSlider.getChannel("SET_MAX")
			},{
				event: 'SET_PROGRESS_MIN',
				channel: this.progressSlider.getChannel("SET_MIN")
			},{
				event: 'SET_PROGRESS_TIMEOUT',
				channel: this.progressSlider.getChannel("SET_TIMEOUT")
			},{
				event: 'SET_PROGRESS_DELTA',
				channel: this.progressSlider.getChannel("SET_DELTA")
			},{
				event: 'PRESS_PROGRESS_BUTTON',
				channel: this.progressSlider.getChannel("BUTTON_ACTION")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._fillTopContent();
			this._fillSideContent();
		},

		_fillTopContent: function() {

			this._publish(this.progressSlider.getChannel("SHOW"), {
				node: this.topbarNode
			});

			put(this.topbarNode, ".barSliderContainer");
		},

		_fillSideContent: function() {

			this._createBrowserWork();

			this._createSettingsForm();

			this._createAtlas();

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});
		},

		_createAtlas: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				getMapChannel: getMapChannel,
				addTabChannel: this._tabsDisplayer.getChannel('ADD_TAB')
			});

			this._queryOnMap = new QueryOnMap({
				parentChannel: this.getChannel(),
				getMapChannel: getMapChannel,
				tabsDisplayerChannel: this._tabsDisplayer.getChannel(),
				typeGroupProperty: this.typeGroupProperty
			});
		},

		_createSettingsForm: function() {

			this._settingsForm = new FormContainerImpl(this.formConfig);

			this._settingsFormWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this._settingsForm,
				title: this.i18n.settings
			});

			this._publish(this._tabsDisplayer.getChannel('ADD_TAB'), {
				title: this.i18n.settings,
				iconClass: 'fa fa-cog',
				channel: this._settingsFormWithTopbar.getChannel()
			});
		},

		_loadInputsFormAndShow: function(inputs) {

			this.inputsForm = inputs;

			for (var key in this.inputsForm) {
				this._publish(this._buildChannel(this.inputsForm[key].channel, 'SHOW'), {
					node: this.inputsForm[key].node
				});

				this._subscribe(this._buildChannel(this.inputsForm[key].channel, 'VALUE_CHANGED'),
					lang.hitch(this, this._subChanged));
			}

			if (this.timeMode) {
				this._changeMode('1');
			} else {
				this._publish(this._buildChannel(this.inputsForm.interval.channel, 'HIDE'));
			}
		},

		_subChanged: function(res) {

			if (res.name === "markers") {
				this._changeMarkers(res.value);
			} else if (res.name === "mode") {
				this._changeMode(res.value);
			} else if (res.name === "rate") {
				this._changeRate(res.value);
			} else if (res.name === "interval") {
				this._changeInterval(res.value);
			}
		},

		_addDataLayer: function(idProperty, item) {

			if (!this._layerInstances[idProperty]) {
				this._createLayerInstance(idProperty, item);
				this._createSubsAndPubsForLayer(this._layerInstances[idProperty]);
			}

			this._emitEvt('ADD_LAYER', {layer: this._layerInstances[idProperty]});

			this._markersAreShown && this._emitEvt('SHOW_DIRECTION_MARKERS');
		},

		_createLayerInstance: function(idProperty, item) {

			this._activityIdByUuid[idProperty] = item.activityId;

			var target = lang.replace(this.layersTarget, {
					elementuuid: idProperty,
					activityid: this._activityIdByUuid[idProperty]
				}),
				infoTarget = lang.replace(this.infoTarget, {
					id: this._activityIdByUuid[idProperty]
				}),
				layerId = this._generateLayerId(idProperty),
				color = this._getFreeColor(idProperty, item),
				definition = this.TrackingClusterLayer;

			this._layerInstances[idProperty] = new definition(this._configByLayerInstance({
				target: target,
				infoTarget: infoTarget,
				fillColor: color,
				layerId: layerId,
				layerLabel: layerId
			}));
		},

		_configByLayerInstance: function(obj) {

			var ret = {
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				// TODO puede que esto sea innecesario ya
				filterConfig: {
					initQuery: {
						terms: {
							zoomLevel: this._currentZoomLevel
						}
					}
				},
				transitionDuration: this._trackingTransitionRate
			};

			lang.mixin(ret, obj);

			return ret;

		},

		_generateLayerId: function(idProperty) {

			return this._layerIdPrefix + this.layerIdSeparator + idProperty;
		},

		_createSubsAndPubsForLayer: function(layerInstance) {

			this._setSubscriptions([{
				channel: layerInstance.getChannel('DATA_BOUNDS_UPDATED'),
				callback: '_subLayerDataBoundsUpdated'
			}]);

			this._setPublications([{
				event: 'MOVE_TRACK_TO',
				channel: layerInstance.getChannel("GO_TO_POSITION")
			},{
				event: 'SHOW_DIRECTION_MARKERS',
				channel: layerInstance.getChannel("SHOW_DIRECTION_MARKERS")
			},{
				event: 'HIDE_DIRECTION_MARKERS',
				channel: layerInstance.getChannel("HIDE_DIRECTION_MARKERS")
			},{
				event: 'SET_TRACKING_PROPS',
				channel: layerInstance.getChannel("SET_PROPS")
			}]);
		},

		_subLayerDataBoundsUpdated: function(res) {

			var layerId = res.layerId,
				lineId = res.lineId,
				count = res.count,
				startDate = res.start,
				endDate = res.end,
				layerLimits = this._trackingPointLimits[layerId];

			if (!layerLimits) {
				this._trackingPointLimits[layerId] = {};
				layerLimits = this._trackingPointLimits[layerId];
			}

			layerLimits[lineId] = {
				count: count,
				start: moment(startDate),
				end: moment(endDate)
			};

			this._updateProgressSlider();
		},

		_getFreeColor: function(idProperty, item) {

			for (var i = 0; i < this._colors.length; i++) {
				var notUsed = true;
				for (var key in this._colorUsage) {
					if (this._colorUsage[key] === i) {
						notUsed = false;
						break;
					}
				}
				if (notUsed) {
					this._colorUsage[idProperty] = i;
					return this._colors[i];
				}
			}
		},

		_removeDataLayer: function(idProperty) {

			this._removeSubsAndPubsForLayer(idProperty);
			this._removeLayerAssociatedData(idProperty);
			this._removeLayerInstance(idProperty);
		},

		_removeSubsAndPubsForLayer: function(idProperty) {

			var layerInstance = this._layerInstances[idProperty];

			this._removeSubscriptions([
				layerInstance.getChannel('DATA_BOUNDS_UPDATED')
			]);

			this._removePublications([
				layerInstance.getChannel("GO_TO_POSITION"),
				layerInstance.getChannel("SHOW_DIRECTION_MARKERS"),
				layerInstance.getChannel("HIDE_DIRECTION_MARKERS"),
				layerInstance.getChannel("SET_PROPS")
			]);
		},

		_removeLayerInstance: function(idProperty) {

			var layerInstance = this._layerInstances[idProperty];

			this._publish(layerInstance.getChannel("CLEAR"));
			this._emitEvt('REMOVE_LAYER', {
				layer: layerInstance
			});
			this._publish(layerInstance.getChannel("DISCONNECT"));

			layerInstance.destroy();
			delete this._layerInstances[idProperty];

			delete this._activityIdByUuid[idProperty];

			//var layerId = this._layerIdPrefix + this.layerIdSeparator + idProperty;
			delete this._colorUsage[idProperty];
		},

		_removeLayerAssociatedData: function(idProperty) {

			var layerInstance = this._layerInstances[idProperty],
				layerId = layerInstance.getOwnChannel();

			delete this._trackingPointLimits[layerId];
			this._updateProgressSlider();
		},

		_subClearLayers: function() {

			for (var idProperty in this._layerInstances) {
				this._removeDataLayer(idProperty);
			}
		},

		_subAddLayers: function(item) {

			item && this._addDataLayer(item.uuid, item);
		},

		_subProgressSliderChange: function(res) {

			var value = res.value,
				animate = false;

			if (this.timeMode) {
				if (!value._isAMomentObject) {
					value = moment(value);
				}
				// TODO controlar si es un salto de 1 en fechas (en base a intervalo) para animar!!
			} else {
				if (this._lastPosition) {
					animate = this._lastPosition === value - 1;
				} else {
					animate = value === 1;
				}
			}

			this._lastPosition = value;

			this._emitEvt('MOVE_TRACK_TO', {
				position: value,
				animate: animate
			});
		},

		_getTransitionRate: function(rate) {

			var transitionRate = rate - this._transitionOffset;

			this._trackingTransitionRate = transitionRate > 0 ? transitionRate : 0;

			return this._trackingTransitionRate;
		},

		_getActivityIdFromTarget: function(target) {

			var targetSplitted = target.split("/");
			return targetSplitted[3];
		},

		_getMinAndMaxForSlider: function() {

			var max, min;

			for (var layerId in this._trackingPointLimits) {
				var layerItem = this._trackingPointLimits[layerId];
				for (var lineId in layerItem) {
					var lineItem = layerItem[lineId];

					if (!this.timeMode) {
						var count = lineItem.count;

						if (!Utilities.isValidNumber(max) || count > max) {
							max = count;
						}
					} else {
						var start = lineItem.start,
							end = lineItem.end;

						if (!min || start.isBefore(min)) {
							min = start;
						}
						if (!max || end.isAfter(max)) {
							max = end;
						}
					}
				}
			}

			return {
				max: max || 0,
				min: !this.timeMode ? 0 : min || 0
			};
		},

		_updateProgressSlider: function(/*Boolean?*/ reset) {

			var limits = this._getMinAndMaxForSlider();

			this._emitEvt('SET_PROGRESS_MIN', {
				value: limits.min,
				reset: !!reset
			});
			this._emitEvt('SET_PROGRESS_MAX', {
				value: limits.max
			});
		},

		_subZoomSet: function(res) {
			// TODO puede que esto sea innecesario ya
			this._currentZoomLevel = res.zoom;
		},

		_changeRate: function(value) {

			var valueInMilliseconds = value * 1000,
				changeRateValue = this._getTransitionRate(value);

			this._emitEvt('SET_PROGRESS_TIMEOUT', {
				value: valueInMilliseconds
			});

			this._emitEvt('SET_TRACKING_PROPS', {
				transitionDuration: changeRateValue
			});
		},

		_changeInterval: function(value) {

			this._deltaProgress = value;

			if (this.timeMode) {
				this._emitEvt('SET_PROGRESS_DELTA', {
					value: this._deltaProgress
				});
			}
		},

		_changeMode: function(value) {

			var newMode = value,
				delta;

			this._emitEvt('PRESS_PROGRESS_BUTTON', {
				key: "STOP"
			});

			if (newMode === '0') {
				this.timeMode = false;
				delta = 1;
				this._publish(this._buildChannel(this.inputsForm.interval.channel, 'HIDE'));
			} else {
				this.timeMode = true;
				this._publish(this._buildChannel(this.inputsForm.interval.channel, 'SHOW'));
				delta = this._deltaProgress;
			}

			for (var idProperty in this._layerInstances) {
				var item = {activityId: this._activityIdByUuid[idProperty]};

				this._removeDataLayer(idProperty);

				this._addDataLayer(idProperty, item);
			}

			this._updateProgressSlider(true);
			this._emitEvt('SET_PROGRESS_DELTA', {
				value: delta
			});
		},

		_changeMarkers: function(value) {

			if (value === '0') {
				this._emitEvt('HIDE_DIRECTION_MARKERS');
				this._markersAreShown = false;
			} else {
				this._emitEvt('SHOW_DIRECTION_MARKERS');
				this._markersAreShown = true;
			}
		},

		_onHide: function() {

			this._emitEvt('PRESS_PROGRESS_BUTTON', {
				key: "PAUSE"
			});
		}
	});
});
