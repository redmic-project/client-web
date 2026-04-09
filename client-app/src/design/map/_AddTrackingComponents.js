define([
	'd3'
	, 'dojo/_base/declare'
	, 'moment'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddProgressSliderComponent'
	, 'src/design/map/_AddTrackingMapLayerComponents'
	, 'src/design/map/_AddTrackingSettingsComponent'
	, 'src/redmicConfig'
	, 'templates/ActivityList'
	, 'templates/AnimalList'
	, 'templates/TrackingPlatformList'
], function(
	d3
	, declare
	, moment
	, _AddBrowserComponent
	, _AddProgressSliderComponent
	, _AddTrackingMapLayerComponents
	, _AddTrackingSettingsComponent
	, redmicConfig
	, TemplateActivityList
	, TemplateAnimalList
	, TemplatePlatformList
) {

	return declare([_AddBrowserComponent, _AddTrackingSettingsComponent, _AddProgressSliderComponent,
		_AddTrackingMapLayerComponents], {
		// summary:
		//   Lógica de diseño para añadir los componentes necesarios para visualizar datos de seguimiento sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				typeGroupProperty: 'category',
				idProperty: 'uuid',
				enabledBrowserExtensions: {
					selectionManager: true,
					multiTemplate: true
				},
				browserTabIconClass: 'fr fr-track',
				_availableColors: d3.schemePaired,
				_colorsUsage: {},
				_trackingDataLimits: {}
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('browserConfig', {
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-tint',
							btnId: 'colorPicker',
							title: 'color',
							condition: item => item.color,
							startup: (nodeIcon, item) => {
								if (!item.color) {
									return;
								}
								const iconStyle = `color:${item.color} !important; text-shadow: 0px 0px 3px white;`;
								nodeIcon.setAttribute('style', iconStyle);
							}
						},{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: [
								redmicConfig.viewPaths.activityDetails,
								redmicConfig.viewPaths.platformDetails,
								redmicConfig.viewPaths.animalDetails
							],
							chooseHref: item => {
								if (item.activityType) {
									return 0;
								}
								if (item.platformType) {
									return 1;
								}
								if (item.lifeStage) {
									return 2;
								}
							},
							condition: item => item.activityType || item.platformType || item.lifeStage
						}]
					},
					selectionIdProperty: this.idProperty
				},
				idProperty: this.idProperty,
				existsPropertyWithTemplate: true,
				template: TemplateActivityList,
				templatesByTypeGroup: {
					activityType: TemplateActivityList,
					taxon: TemplateAnimalList,
					platformType: TemplatePlatformList
				}
			});

			this.mergeComponentAttribute('queryOnMapConfig', {
				typeGroupProperty: this.typeGroupProperty
			});
		},

		_onItemSelected: function(res) {

			this.inherited(arguments);

			const itemId = res.itemId,
				activityId = this.pathVariableId ?? itemId,
				color = this._getFreeColor(itemId);

			this._addTrackingLayer?.({
				[this.idProperty]: itemId,
				activityId,
				color
			});
			this._updateBrowserItem(itemId, {color});
		},

		_onItemDeselected: function(res) {

			this.inherited(arguments);

			const itemId = res.itemId;

			this._releaseColor(itemId);
			this._updateBrowserItem(itemId, {
				color: null
			});

			this._removeTrackingLayer?.(itemId);
			this._applyTrackingDataLimits();
		},

		_onSelectionCleared: function(_res) {

			this.inherited(arguments);

			this._removeAllColorUsage();
			this._removeAllTrackingLayers?.();
		},

		_getFreeColor: function(itemId) {

			const color = this._availableColors.find(
				(_color, index) => !Object.values(this._colorsUsage).includes(index));

			if (color) {
				this._colorsUsage[itemId] = this._availableColors.indexOf(color);
			}
			return color;
		},

		_getUsedColor: function(itemId) {

			return this._availableColors[this._colorsUsage[itemId]];
		},

		_releaseColor: function(itemId) {

			delete this._colorsUsage[itemId];
		},

		_updateBrowserItem: function(itemId, data) {

			data[this.idProperty] = itemId;

			const target = this._getTarget?.();

			this._emitEvt('INJECT_ITEM', {data, target});
		},

		_setTrackingItemLineLimits: function(lineLimits) {

			const itemId = lineLimits.layerId,
				itemLineId = lineLimits.lineId,
				count = lineLimits.count,
				start = moment(lineLimits.start),
				end = moment(lineLimits.end),
				itemLimits = this._getTrackingItemLimits(itemId);

			itemLimits[itemLineId] = {count, start, end};
		},

		_getTrackingItemLimits: function(itemId) {

			const trackingItemLimits = this._trackingDataLimits[itemId] ?? {};
			this._trackingDataLimits[itemId] = trackingItemLimits;

			return trackingItemLimits;
		},

		_applyTrackingDataLimits: function(/*Boolean?*/ reset) {

			const limits = this._getTrackingDataRange();

			this._updateProgressSliderLimits?.(limits, reset);
		},

		_getTrackingDataRange: function() {

			const limits = {
				max: 0,
				min: 0
			};

			Object.values(this._trackingDataLimits).forEach(itemLimits =>
				Object.values(itemLimits).forEach(itemLineLimits =>
					this._evaluateItemLineLimits(itemLineLimits, limits)));

			return limits;
		},

		_evaluateItemLineLimits: function(itemLineLimits, limits) {

			if (!this.timeMode) {
				const count = itemLineLimits.count;

				if (count > limits.max) {
					limits.max = count;
				}

				return;
			}

			const start = itemLineLimits.start,
				end = itemLineLimits.end;

			if (!limits.min || start.isBefore(limits.min)) {
				limits.min = start;
			}
			if (!limits.max || end.isAfter(limits.max)) {
				limits.max = end;
			}
		},

		_deleteTrackingItemLimits: function(itemId) {

			delete this._trackingDataLimits[itemId];
		},

		_removeAllColorUsage: function() {

			Object.keys(this._colorsUsage).forEach(itemId => {
				this._releaseColor(itemId);
				this._updateBrowserItem(itemId, {
					color: null
				});
			});
		}
	});
});
