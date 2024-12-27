define([
	'app/designs/chart/main/MultiWindRoseChartWithToolbar'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/chart/ChartsContainer/_AngularAxisWithGridDrawing'
	, 'src/component/chart/ChartsContainer/_InfoOnEmptyData'
	, 'src/component/chart/ChartsContainer/_InfoOnMouseOver'
	, 'src/component/chart/ChartsContainer/_LegendBar'
	, 'src/component/chart/ChartsContainer/_RadialAxisWithGridDrawing'
	, 'src/component/chart/ChartsContainer/_SummaryBox'
	, 'src/redmicConfig'
], function(
	MultiWindRoseChartWithToolbar
	, declare
	, lang
	, _Module
	, _Show
	, _AngularAxisWithGridDrawing
	, _InfoOnEmptyData
	, _InfoOnMouseOver
	, _LegendBar
	, _RadialAxisWithGridDrawing
	, _SummaryBox
	, redmicConfig
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget para representar un par de parámetros de velocidad y dirección mediante gráfica windrose.

		constructor: function(args) {

			this.config = {
				ownChannel: 'activityFixedTimeseriesWindrose',
				target: redmicConfig.services.timeSeriesWindRose
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onMeOrAncestorHidden));
		},

		_initialize: function() {

			this._windrose = new MultiWindRoseChartWithToolbar({
				parentChannel: this.getChannel(),
				target: lang.replace(this.target, { id: this.pathVariableId }),
				chartsContainerExts: [
					_AngularAxisWithGridDrawing,
					_RadialAxisWithGridDrawing,
					_InfoOnMouseOver,
					_LegendBar,
					_SummaryBox,
					_InfoOnEmptyData
				]
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._subscribe(this.timeseriesDataChannel, lang.hitch(this, function(data) {

				this._manageMeasurementData(data.measurements);
			}));
		},

		getNodeToShow: function() {

			return this._windrose.getNodeToShow();
		},

		_manageMeasurementData: function(data) {

			var directionDataDefinitionIds = [],
				speedDataDefinitionIds = [];

			var maxTimeInterval, unitAcronym;

			for (var i = 0; i < data.length; i++) {
				var measurement = data[i],
					dataDefinition = measurement.dataDefinition,
					parameterId = measurement.parameter.id,
					timeInterval = dataDefinition.timeInterval,
					unit = measurement.unit;

				var dataDefinitionId = dataDefinition.id,
					isDirectionDataDefinition = this.allowedDirectionParameters.includes(parameterId),
					isSpeedDataDefinition = this.allowedSpeedParameters.includes(parameterId);

				if (isDirectionDataDefinition || isSpeedDataDefinition) {
					if (!maxTimeInterval || timeInterval > maxTimeInterval) {
						maxTimeInterval = timeInterval;
					}
				}

				if (isSpeedDataDefinition) {
					speedDataDefinitionIds.push(dataDefinitionId);
					unitAcronym = unit.acronym;
				}

				if (isDirectionDataDefinition) {
					directionDataDefinitionIds.push(dataDefinitionId);
				}
			}

			this._publish(this._windrose.getChannel('SET_PROPS'), {
				directionDataDefinitionIds: directionDataDefinitionIds,
				speedDataDefinitionIds: speedDataDefinitionIds,
				timeInterval: maxTimeInterval,
				sourceUnit: unitAcronym
			});
		},

		_onMeOrAncestorHidden: function() {

			this._publish(this._windrose.getChannel('CLEAR'));
		}
	});
});
