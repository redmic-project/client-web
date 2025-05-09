define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector'
	, "src/util/Mediator"
	, "src/component/browser/bars/Total"
	, "src/component/browser/ListImpl"
	, "templates/DomainList"
], function(
	declare
	, lang
	, put
	, Mediator
	, Total
	, ListImpl
	, template
){
	var timeout = 100,
		parentChannel = "container",
		target = "/api/domain",
		row, config, data, item,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		publishData = function() {

			Mediator.publish(browser._buildChannel(browser.storeChannel, browser.actions.AVAILABLE), {
				res: {
					data: data,
					status: 200
				},
				target: target
			});
		},

		publishItem = function() {

			Mediator.publish(browser._buildChannel(browser.storeChannel, browser.actions.ITEM_AVAILABLE), {
				res: {
					data: item,
					status: 200
				},
				target: target
			});
		},

		initData = function() {

			data = [];

			for (var i = 10; i >= 1; i--) {
				item = {
					id: i,
					name: 'name_' + i,
					name_en: 'name_en_' + i
				};

				data.push(item);
			}
		};

	registerSuite("Total bar tests", {
		before: function() {

			var configBrowser = {
				parentChannel: parentChannel,
				target: target,
				template: template
			};

			browser = new declare([ListImpl])(configBrowser);

			initData();

			config = {
				parentChannel: parentChannel,
				target: target,
				browserChannel: browser.getChannel()
			};

			instance = new declare([Total])(config);
		},

		afterEach: function() {

			Mediator.publish(browser.getChannel("CLEAR"));
		},

		after: function() {

			Mediator.publish(instance.getChannel("DISCONNECT"));
		},

		tests: {

			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				assert.ok(instance, "No se ha creado correctamente");
				assert.ok(instance.totalNode, "No se ha creado correctamente");
			},

			"Should_SetTotal_When_ReceiveSetTotalPublication": function() {

				Mediator.publish(instance.getChannel("SET_TOTAL"), {
					value: 20
				});

				assert.strictEqual(instance.total, 20, "No se ha enviado correctamente");
			},

			"Should_SetTotal_When_ReceiveItemAvailablePublication": function() {

				publishItem();

				assert.strictEqual(instance.total, 1, "No se ha enviado correctamente");
			},

			"Should_SetTotal_When_ReceiveDataAvailablePublication": function() {

				publishData();

				assert.strictEqual(instance.total, 10, "No se ha enviado correctamente");
			},

			"Should_SetTotal_When_ReceiveDataRemovedPublication": function() {

				publishData();

				Mediator.publish(browser.getChannel("REMOVE_ITEM"), {
					id: 1
				});

				assert.strictEqual(instance.total, 9, "No se ha enviado correctamente");
			},

			"Should_SetTotal_When_ReceiveClearPublication": function() {

				publishData();

				Mediator.publish(browser.getChannel("CLEAR"), {
					id: 1
				});

				assert.strictEqual(instance.total, 0, "No se ha enviado correctamente");
			}
		}
	});
});
