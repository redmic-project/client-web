define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "src/utils/Mediator"
	, "redmic/modules/browser/bars/Order"
], function(
	declare
	, lang
	, put
	, Mediator
	, Order
){
	var timeout = 100,
		parentChannel = "container",
		target = 'orderTarget',
		row, config,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Order bar tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				queryChannel: parentChannel,
				target: target,
				options: [
					{value: "name"},
					{value: "code"},
					{value: "updated"},
					{value: "gjhg"}
				]
			};

			instance = new declare([Order])(config);
		},

		after: function() {

			Mediator.publish(instance.getChannel("DISCONNECT"));
		},

		tests: {

			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				assert.ok(instance, "No se ha creado correctamente");
				assert.ok(instance.orderNode, "No se ha creado correctamente");
				assert.ok(instance.selectOrderNode, "No se ha creado correctamente");
				assert.ok(instance.directionOrderNode, "No se ha creado correctamente");
				assert.ok(instance.optionSelect, "No se ha creado correctamente");
				assert.ok(instance.options, "No se ha creado correctamente");
			},

			"Should_CreateOptions_When_ModuleIsInitialized": function() {

				assert.strictEqual(instance.selectOrderNode.children.length, 5, "No se ha añadido correctamente");
			},

			"Should_EmitPublication_When_ClickInOption": function() {

				var dfd = this.async(timeout);

				Mediator.once(instance._buildChannel(parentChannel, instance.actions.ADD_TO_QUERY), function(req) {

					assert.strictEqual(req.query.sorts[0].field, 'name', "No se ha enviado correctamente");
					assert.strictEqual(req.query.sorts[0].order, 'ASC', "No se ha enviado correctamente");
					assert.strictEqual(req.query.target, target, "No se ha enviado correctamente");
					dfd.resolve();
				});

				instance.selectOrderNode.selectedIndex = 1;

				instance._eventOrderOptionClick();
			},

			"Should_EmitPublication_When_ClickInDirectionOrder": function() {

				var dfd = this.async(timeout);

				instance.selectOrderNode.selectedIndex = 1;

				instance._eventOrderOptionClick();

				Mediator.once(instance._buildChannel(parentChannel, instance.actions.ADD_TO_QUERY), function(req) {

					assert.strictEqual(req.query.sorts[0].field, 'name', "No se ha enviado correctamente");
					assert.strictEqual(req.query.sorts[0].order, 'DESC', "No se ha enviado correctamente");
					assert.strictEqual(req.query.target, target, "No se ha enviado correctamente");
					dfd.resolve();
				});

				instance._eventDirectionClick([]);
			},

			"Should_UpdateOptions_When_ReceiveUpdateOptionsPublication": function() {

				Mediator.publish(instance.getChannel("UPDATE_OPTIONS"), {
					options: [
						{value: "n1"},
						{value: "n2"}
					]
				});

				assert.strictEqual(instance.selectOrderNode.children.length, 3, "No se ha añadido correctamente");
			}
		}
	});
});
