define([
	'app/designs/chart/main/MultiWindRoseChartWithToolbar'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
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
	, _Store
	, _AngularAxisWithGridDrawing
	, _InfoOnEmptyData
	, _InfoOnMouseOver
	, _LegendBar
	, _RadialAxisWithGridDrawing
	, _SummaryBox
	, redmicConfig
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Widget para representar un par de parámetros de velocidad y dirección mediante gráfica windrose.

		constructor: function(args) {

			this.config = {
				ownChannel: 'activityFixedTimeseriesWindrose',
				stationDataTarget: 'stationData',
				allowedSpeedParameters: [
					61, // velocidad viento media
					66 // velocidad viento máxima
				],
				allowedDirectionParameters: [
					62, // dirección viento media
					67 // dirección viento máxima
				]
			};

			lang.mixin(this, this.config, args);

			this.target = [this.stationDataTarget];
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onMeOrAncestorHidden));
		},

		_initialize: function() {

			// TODO buscar manera de poder mostrar más de una, quizá con tabs?

			this._windrose = new MultiWindRoseChartWithToolbar({
				parentChannel: this.getChannel(),
				// TODO se puede sin replace aquí?
				target: lang.replace(redmicConfig.services.timeSeriesWindRose, { id: this.pathVariableId }),
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

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			const sourceData = res.data,
				measurements = this._getFilteredMeasurementData(sourceData.measurements);

			if (measurements.length > 2) {
				console.warn('Unexpected number of measurements for windrose charts.');
			}

			const siteName = sourceData.site?.name,
				speedParamTitle = measurements[0]?.parameter.name,
				directionParamTitle = measurements[1]?.parameter.name;

			// TODO revisar si se aplica en caliente o necesita algo más (antes venía desde fuera al inicio)
			this.title = `${speedParamTitle} + ${directionParamTitle} | ${siteName}`;

			this._manageMeasurementData(measurements);
		},

		_getFilteredMeasurementData: function(measurements) {

			return measurements.filter((measurement) => {

				const paramId = measurement.parameter?.id;
				return this.allowedSpeedParameters.includes(paramId) ||
					this.allowedDirectionParameters.includes(paramId);
			});
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

		getNodeToShow: function() {

			return this._windrose.getNodeToShow();
		},

		_onMeOrAncestorHidden: function() {

			this._publish(this._windrose.getChannel('CLEAR'));
		}
	});
});
