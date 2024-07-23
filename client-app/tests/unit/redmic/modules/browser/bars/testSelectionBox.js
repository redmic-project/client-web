define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "src/utils/Mediator"
	, "src/component/browser/bars/SelectionBox"
], function(
	declare
	, lang
	, put
	, Mediator
	, SelectionBox
){
	var timeout = 100,
		parentChannel = "container",
		row, config,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Selection box bar tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				queryChannel: parentChannel,
				browserChannel: parentChannel
			};

			instance = new declare([SelectionBox])(config);
		},

		after: function() {

			Mediator.publish(instance.getChannel("DISCONNECT"));
		},

		tests: {

			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				assert.ok(instance, "No se ha creado correctamente");
				assert.ok(instance.selectionBox, "No se ha creado correctamente");
			},

			"Should_ChangeStatusAll_When_ProcessStatusSeeSelection": function() {

				instance._processStatusSeeSelection('all');

				assert.isFalse(instance._activeSeeSelection, "No se ha cambiado correctamente");
			},

			"Should_ChangeStatusSelected_When_ProcessStatusSeeSelection": function() {

				instance._processStatusSeeSelection('selected');

				assert.isTrue(instance._activeSeeSelection, "No se ha cambiado correctamente");
			},

			"Should_PublicateQuery_When_ChangeSeeSelection": function() {

				var dfd = this.async(timeout);

				Mediator.once(instance._buildChannel(parentChannel, instance.actions.ADD_TO_QUERY), function(req) {

					assert.isNull(req.query.terms.selection, "No se ha enviado correctamente");

					dfd.resolve();
				});

				instance.selectNode.selectedIndex = 0;

				instance._evtOnChangeSelect();
			},

			"Should_PublicateClearBrowser_When_ChangeSeeSelection": function() {

				var dfd = this.async(timeout);

				Mediator.once(instance._buildChannel(parentChannel, instance.actions.CLEAR), function(req) {

					assert.isTrue(instance._activeSeeSelection, "No se ha cambiado correctamente");

					dfd.resolve();
				});

				instance.selectNode.selectedIndex = 1;

				instance._evtOnChangeSelect();
			}
		}
	});
});
