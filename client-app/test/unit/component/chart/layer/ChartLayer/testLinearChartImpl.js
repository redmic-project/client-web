define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/util/Mediator'
	, 'src/component/chart/ChartsContainer/InfoChartsContainerImpl'
	, 'src/component/chart/layer/ChartLayer/LinearChartImpl'
], function(
	declare
	, lang
	, put
	, Mediator
	, InfoChartsContainerImpl
	, LinearChartImpl
){
	var timeout, chartsContainer, chartLayer, parameterName, data;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('LinearChartImpl tests', {
		before: function() {

			timeout = 1000;
			parameterName = 'parameter';

			data = {
				parameterName: parameterName,
				data: [{
					date: '2012-01-25T01:00:00.000Z',
					value: 1
				},{
					date: '2012-01-25T15:00:00.000Z',
					value: 2
				},{
					date: '2012-01-25T21:00:00.000Z',
					value: 3
				}],
				xMax: '2012-01-25T21:00:00.000Z',
				xMin: '2012-01-25T01:00:00.000Z',
				yMax: 3,
				yMin: 1
			};

			chartsContainer = new InfoChartsContainerImpl({
				parentChannel: 'parent'
			});

			node = put('div[style="width:300px;height:300px"]');
			globalThis.document.children[0].appendChild(node);

			Mediator.publish(chartsContainer.getChannel('SHOW'), {
				node: node
			});

			chartLayer = new LinearChartImpl({
				parentChannel: 'test',
				parameterName: parameterName
			});
		},

		afterEach: function() {

			Mediator.publish(chartLayer.getChannel('CLEAR'));
			Mediator.publish(chartsContainer.getChannel('CLEAR'));
		},

		after: function() {

			Mediator.publish(chartsContainer.getChannel('DISCONNECT'));
			Mediator.publish(chartLayer.getChannel('DISCONNECT'));
			put(node, '!');
		},

		tests: {
			Should_PublishDataAdded_When_AddData: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartLayer.getChannel('DATA_ADDED'), dfd.callback(function() {}));

				Mediator.publish(chartLayer.getChannel('ADD_DATA'), data);
			},

			Should_PublishDrawn_When_AddedToChartsContainerBeforeAddData: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartLayer.getChannel('DRAWN'), dfd.callback(function() {}));

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: chartLayer
				});

				Mediator.publish(chartLayer.getChannel('ADD_DATA'), data);
			},

			Should_PublishDrawn_When_AddedToChartsContainerAfterAddData: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartLayer.getChannel('DRAWN'), dfd.callback(function() {}));

				Mediator.publish(chartLayer.getChannel('ADD_DATA'), data);

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: chartLayer
				});
			}
		}
	});

});
