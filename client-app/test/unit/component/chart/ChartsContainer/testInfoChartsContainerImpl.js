define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'put-selector'
	, 'src/util/Mediator'
	, 'src/component/chart/ChartsContainer/InfoChartsContainerImpl'
	, 'src/component/chart/layer/ChartLayer/LinearChartImpl'
], function(
	declare
	, lang
	, Deferred
	, all
	, put
	, Mediator
	, InfoChartsContainerImpl
	, LinearChartImpl
){
	var timeout = 5000,
		parameterName = 'parameter',
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
		},
		node, chartsContainer, layer1, layer2;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('InfoChartsContainerImpl initialize tests', {
		before: function() {

			chartsContainer = new InfoChartsContainerImpl({
				parentChannel: 'parent'
			});

			node = put('div[style="width:300px;height:300px"]');
			globalThis.document.children[0].appendChild(node);
		},

		after: function() {

			Mediator.publish(chartsContainer.getChannel('DISCONNECT'));
			put(node, '!');
		},

		tests: {
			Should_PublishChartsContainerReady_When_ShowChartsContainerInNode: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('CHARTS_CONTAINER_READY'), dfd.callback(function() {}));

				Mediator.publish(chartsContainer.getChannel('SHOW'), {
					node: node
				});
			}
		}
	});

	registerSuite('InfoChartsContainerImpl subscription to layers tests', {
		before: function() {

			chartsContainer = new InfoChartsContainerImpl({
				parentChannel: 'parent'
			});

			layer1 = new LinearChartImpl({
				parentChannel: 'parent',
				parameterName: parameterName
			});

			layer2 = new LinearChartImpl({
				parentChannel: 'parent',
				parameterName: parameterName
			});

			node = put('div[style="width:300px;height:300px"]');
			globalThis.document.children[0].appendChild(node);

			Mediator.publish(chartsContainer.getChannel('SHOW'), {
				node: node
			});
		},

		afterEach: function() {

			var dfd = new Deferred(),
				cbk = function() {

					Mediator.publish(layer1.getChannel('CONNECT'));
					dfd.resolve();
				};

			if (layer1._getPaused()) {
				cbk();
			} else {
				Mediator.once(layer1.getChannel('DISCONNECTED'), cbk);
				Mediator.publish(chartsContainer.getChannel('CLEAR'));
			}

			return dfd;
		},

		after: function() {

			Mediator.publish(chartsContainer.getChannel('DISCONNECT'));
			put(node, '!');
		},

		tests: {
			Should_PublishLayerAdded_When_AddEmptyLayerAndThenAddDataToLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_ADDED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);
			},

			Should_PublishLayerAdded_When_AddDataToLayerAndThenAddFilledLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_ADDED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});
			},

			Should_PublishLayerUpdated_When_AddDataToAddedEmptyLayer: function() {

				var dfd = this.async(timeout);

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.once(chartsContainer.getChannel('LAYER_UPDATED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);
			},

			Should_PublishLayerUpdated_When_AddDataToAddedFilledLayer: function() {

				var dfd = this.async(timeout);

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.once(chartsContainer.getChannel('LAYER_UPDATED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);
			},

			Should_PublishLayerCleared_When_PublishRemoveLayerWithFilledLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_CLEARED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(chartsContainer.getChannel('REMOVE_LAYER'), {
					layerId: layer1.getOwnChannel()
				});
			},

			Should_PublishLayerCleared_When_PublishRemoveLayerWithEmptyLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_CLEARED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(chartsContainer.getChannel('REMOVE_LAYER'), {
					layerId: layer1.getOwnChannel()
				});
			},

			Should_PublishLayerHidden_When_PublishHideLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_HIDDEN'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(chartsContainer.getChannel('HIDE_LAYER'), {
					layerId: layer1.getOwnChannel()
				});
			},

			Should_PublishLayerShown_When_PublishShowLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_SHOWN'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.once(chartsContainer.getChannel('LAYER_HIDDEN'), function(res) {

					Mediator.publish(chartsContainer.getChannel('SHOW_LAYER'), {
						layerId: layer1.getOwnChannel()
					});
				});

				Mediator.publish(chartsContainer.getChannel('HIDE_LAYER'), {
					layerId: layer1.getOwnChannel()
				});
			},

			Should_PublishLayerDrawn_When_PublishAddLayerWithFilledLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_DRAWN'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(layer1.getChannel('ADD_DATA'), data);

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});
			},

			Should_PublishLayerDrawn_When_PublishAddLayerWithEmptyLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_DRAWN'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});
			},

			Should_PublishGotLayerInfo_When_PublishGetLayerInfoWithAddedLayerSpecified: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('GOT_LAYER_INFO'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(chartsContainer.getChannel('GET_LAYER_INFO'), {
					layerId: layer1.getOwnChannel()
				});
			},

			Should_PublishGotLayerInfoForEachLayer_When_PublishGetLayerInfoWithNoLayerSpecified: function() {

				var dfd = this.async(timeout),
					dfd1 = new Deferred(),
					dfd2 = new Deferred(),
					dfdAll = all([dfd1, dfd2]).then(dfd.callback(function() {}));

				Mediator.subscribe(chartsContainer.getChannel('GOT_LAYER_INFO'), function(res) {

					var chart = res.chart;
					if (chart === layer1.getOwnChannel()) {
						dfd1.resolve();
					} else if (chart === layer2.getOwnChannel()) {
						Mediator.once(layer2.getChannel('DISCONNECTED'), function() {

							Mediator.publish(layer2.getChannel('CONNECT'));
							dfd2.resolve();
						});

						Mediator.publish(chartsContainer.getChannel('REMOVE_LAYER'), {
							layerId: layer2.getOwnChannel()
						});
					}
				}, {
					calls: 2
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer2
				});

				Mediator.publish(chartsContainer.getChannel('GET_LAYER_INFO'), {});
			},

			Should_PublishLayerColorSet_When_PublishSetColorToAddedLayer: function() {

				var dfd = this.async(timeout),
					color = 'green';

				Mediator.once(chartsContainer.getChannel('LAYER_COLOR_SET'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					assert.strictEqual(res.color, color, 'No se ha recibido el color que fue seteado');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(layer1.getChannel('SET_COLOR'), {
					color: color
				});
			},

			Should_PublishLayerInfoUpdated_When_PublishUpdateInfoToAddedLayer: function() {

				var dfd = this.async(timeout);

				Mediator.once(chartsContainer.getChannel('LAYER_INFO_UPDATED'), function(res) {

					assert.strictEqual(res.chart, layer1.getOwnChannel(),
						'No se ha recibido la confirmación de la capa esperada');

					dfd.resolve();
				});

				Mediator.publish(chartsContainer.getChannel('ADD_LAYER'), {
					layerInstance: layer1
				});

				Mediator.publish(layer1.getChannel('SET_PROPS'), {
					props: {}
				});
			}
		}
	});
});
