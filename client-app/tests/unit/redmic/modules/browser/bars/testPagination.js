define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/base/Mediator"
	, "redmic/modules/browser/bars/Pagination"
	, "templates/DomainList"
], function(
	declare
	, lang
	, put
	, Mediator
	, Pagination
	, template
){
	var timeout = 100,
		parentChannel = "container",
		target = "/api/domain",
		row, config, data, item, instance,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		publishData = function() {

			Mediator.publish(instance._buildChannel(instance.storeChannel, instance.actions.AVAILABLE), {
				res: {
					data: data,
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
		},

		checkBasicStructure = function(pages) {

			assert.strictEqual(instance.containerUlNode.children.length, pages, "No se ha enviado correctamente");

			assert.ok(instance.containerUlNode, "No se ha creado correctamente");
			assert.ok(instance.angleDoubleLeft, "No se ha creado correctamente");
			assert.ok(instance.angleLeft, "No se ha creado correctamente");
			assert.ok(instance.angleRight, "No se ha creado correctamente");
			assert.ok(instance.angleDoubleRight, "No se ha creado correctamente");
		};

	registerSuite("Pagination bar tests", {
		before: function() {

			initData();

			config = {
				parentChannel: parentChannel,
				queryChannel: parentChannel,
				target: target
			};

			instance = new declare([Pagination])(config);
		},

		after: function() {

			Mediator.publish(instance.getChannel("DISCONNECT"));
		},

		tests: {

			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				assert.ok(instance, "No se ha creado correctamente");
				assert.ok(instance.pageSizeOptions, "No se ha creado correctamente");
				assert.ok(instance.rowPerPage, "No se ha creado correctamente");
				assert.ok(instance.paginateSelectNode, "No se ha creado correctamente");
			},

			"Should_SetTotal_When_ReceiveSetTotalPublication": function() {

				Mediator.publish(instance.getChannel("SET_TOTAL"), {
					value: 200
				});

				assert.strictEqual(instance.total, 200, "No se ha enviado correctamente");
				assert.strictEqual(instance.totalPages, 2, "No se ha enviado correctamente");

				checkBasicStructure(5);
			},

			"Should_NoPages_When_ReceiveSetTotalPublication": function() {

				Mediator.publish(instance.getChannel("SET_TOTAL"), {
					value: 0
				});

				assert.strictEqual(instance.total, 0, "No se ha enviado correctamente");
				assert.strictEqual(instance.totalPages, 0, "No se ha enviado correctamente");

				checkBasicStructure(4);
			},

			"Should_PublicateQuery_When_ReceiveGoToPagePublication": function() {

				Mediator.publish(instance.getChannel("SET_TOTAL"), {
					value: 200
				});

				assert.strictEqual(instance.totalPages, 2, "No se ha enviado correctamente");

				checkBasicStructure(5);

				var dfd = this.async(timeout);

				Mediator.once(instance._buildChannel(parentChannel, instance.actions.ADD_TO_QUERY), function(req) {

					assert.strictEqual(req.query.size, 100, "No se ha enviado correctamente");
					assert.strictEqual(req.query.from, 100, "No se ha enviado correctamente");

					dfd.resolve();
				});

				Mediator.publish(instance.getChannel("GO_TO_PAGE"), {
					index: 2
				});
			},

			"Should_SetTotal_When_ReceiveDataAvailablePublication": function() {

				publishData();

				assert.strictEqual(instance.total, 10, "No se ha enviado correctamente");
				assert.strictEqual(instance.totalPages, 1, "No se ha enviado correctamente");

				checkBasicStructure(5);
			}
		}
	});
});
