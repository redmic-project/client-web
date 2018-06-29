define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/base/Mediator'
	, 'redmic/modules/chart/Toolbar/SliderSelectorImpl'
], function(
	declare
	, lang
	, put
	, Mediator
	, SliderSelectorImpl
){
	var timeout, sliderSelector, min, max, value;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('Toolbar SliderSelectorImpl tests', {
		before: function() {

			timeout = 100;
			min = 1;
			max = 3;
			value = 2;

			sliderSelector = new SliderSelectorImpl({
				parentChannel: 'test',
				title: 'sliderSelector',
				iconClass: 'fa-arrows-alt',
				sliderConfig: {
					inputProps: {
						minimum: min,
						maximum: max,
						labels: ['1', '2', '3'],
						value: value
					}
				}
			});

			node = put('div[style="width:300px;height:300px"]');
		},

		afterEach: function() {

		},

		after: function() {

			Mediator.publish(sliderSelector.getChannel('DISCONNECT'));
			put(node, '!');
		},

		tests: {
			Should_PublishModuleShown_When_ShowModuleInNode: function() {

				var dfd = this.async(timeout);

				Mediator.once(sliderSelector.getChannel('SHOWN'), dfd.callback(function() {}));

				Mediator.publish(sliderSelector.getChannel('SHOW'), {
					node: node
				});
			},

			Should_PublishToolActuated_When_SliderValueWasChanged: function() {

				var dfd = this.async(timeout);

				Mediator.once(sliderSelector.getChannel('TOOL_ACTUATED'), dfd.callback(function() {}));

				Mediator.publish(sliderSelector.getChildChannel('slider', 'SET_VALUE'), {
					value: min
				});
			},

			Should_GetValueSet_When_SliderValueWasChanged: function() {

				var dfd = this.async(timeout);

				Mediator.once(sliderSelector.getChannel('TOOL_ACTUATED'), function(res) {

					assert.strictEqual(res.value, min, 'No se ha devuelto el valor seteado en el input interno');
					dfd.resolve();
				});

				Mediator.publish(sliderSelector.getChildChannel('slider', 'SET_VALUE'), {
					value: min
				});
			}
		}
	});

});
