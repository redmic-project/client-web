define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector'
	, "src/util/Mediator"
	, "src/component/browser/buttons/_GroupButtons"
	, "src/component/browser/buttons/Buttons"
], function(
	declare
	, lang
	, put
	, Mediator
	, _GroupButtons
	, Buttons
){
	var timeout, buttons, config, node, item;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Buttons tests", {
		before: function() {
			timeout = 100;

			config = {
				parentChannel: "containerRow",
				listButton: [{
					groupId: "edition",
					icons: [{
						icon: "fa-edit",
						btnId: "edit",
						title: "edit",
						option: "default",
						href: "href-edit"
					},{
						icon: "fa-copy",
						btnId: "copy",
						title: "copy",
						href: "href-copy"
					}]
				},{
					icon: "fa-info-circle",
					btnId: "details",
					title: "info",
					href: "href",
					condition: function(item) {

						return !!item.type;
					}
				},{
					icon: "fa-keyboard-o",
					btnId: "goToChildren",
					href: [
						"href-1",
						"href-2"
					],
					condition: function(item) {

						return true;
					},
					chooseHref: function(item) {

						var type = item.type;

						if (type === 1) {
							return 0;
						}
						if (type === 2) {
							return 1;
						}

						return 0;
					},
					title: "data-loader"
				}]
			};

			buttons = new declare([Buttons, _GroupButtons])(config);

			node = put('div[style="width:300px;height:300px"]');
			globalThis.document.children[0].appendChild(node);

			item = {
				id: 1,
				name: "name",
				name_en: "name_en",
				type: 1
			};
		},

		after: function() {

			Mediator.publish(buttons.getChannel("DISCONNECT"));
		},

		tests: {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				assert.ok(buttons.listButton, "No se ha creado correctamente");
				assert.ok(buttons.domNode, "No se ha creado correctamente");
				assert.isAbove(buttons.domNode.children.length, 2, "No se ha creado correctamente");
			},

			"Should_Shown_When_ModuleIsShow": function() {

				Mediator.once(buttons.getChannel('SHOWN'), function() {

					var buttonNode = buttons.domNode.children[1];

					assert.strictEqual(buttonNode.getAttribute('href'), 'href', "No se ha creado correctamente");

					buttonNode = buttons.domNode.children[2];

					assert.strictEqual(buttonNode.getAttribute('href'), 'href-1', "No se ha creado correctamente");
				});

				Mediator.publish(buttons.getChannel('SHOW'), {
					node: node,
					data: item
				});
			},

			"Should_OccultButton_When_IncorrectCondition": function() {

				Mediator.once(buttons.getChannel('SHOWN'), function() {

					var buttonNode = buttons.domNode.children[1];

					assert.isTrue(buttonNode.getAttribute('class').includes('hidden'), "No se ha creado correctamente");
				});

				delete item.type;

				Mediator.publish(buttons.getChannel('SHOW'), {
					node: node,
					data: item
				});
			},

			"Should_ChangeConditionButton_When_ChangeItem": function() {

				Mediator.once(buttons.getChannel('SHOWN'), function() {

					var buttonNode = buttons.domNode.children[2];

					assert.strictEqual(buttonNode.getAttribute('href'), 'href-2', "No se ha creado correctamente");
				});

				item.type = 2;

				Mediator.publish(buttons.getChannel('SHOW'), {
					node: node,
					data: item
				});
			}
		}
	});
});
