define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "src/utils/Mediator"
	, "redmic/modules/browser/row/_Buttons"
	, "redmic/modules/browser/row/_Hierarchical"
	, "redmic/modules/browser/row/_HierarchicalSelect"
	, "redmic/modules/browser/row/_Select"
	, "redmic/modules/browser/row/Row"
	, "templates/DomainList"
], function(
	declare
	, lang
	, put
	, Mediator
	, _Buttons
	, _Hierarchical
	, _HierarchicalSelect
	, _Select
	, Row
	, template
){
	var timeout = 100,
		parentChannel = "containerRow",
		row, config,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		checkBasicStructures = function() {

			assert.ok(row.domNode, "El row no se ha creado correctamente");
			assert.ok(row.rowTopNode, "El row no se ha creado correctamente");
			assert.ok(row.rowBottomNode, "El row no se ha creado correctamente");
			assert.ok(row.templateNode, "El row no se ha creado correctamente");
			assert.ok(row.template, "El template no se ha creado correctamente");
		};

	registerSuite("Row tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				template: template
			};

			row = new declare([Row])(config);
		},

		after: function() {

			Mediator.publish(row.getChannel("DISCONNECT"));
		},

		tests: {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": checkBasicStructures,

			"Should_SetTemplate_When_ReceiveUpdateTemplatePublication": function() {

				var template = 'Hola';

				Mediator.publish(row.getChannel("UPDATE_TEMPLATE"), {
					template: template
				});

				assert.strictEqual(row.template, template, "No se ha actualizado correctamente");
			},

			"Should_SetTemplate_When_ReceiveUpdateTemplateParentPublication": function() {

				var template = 'Hola';

				Mediator.publish(row._buildChannel(parentChannel, row.actions.UPDATE_TEMPLATE_ROW), {
					template: template
				});

				assert.strictEqual(row.template, template, "No se ha actualizado correctamente");
			}
		}
	});

	registerSuite("Row with selection tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				template: template
			};

			row = new declare([Row, _Select])(config);
		},

		after: function() {

			Mediator.publish(row.getChannel("DISCONNECT"));
		},

		tests: {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				checkBasicStructures();

				assert.ok(row.selectContainerNode, "No se ha creado correctamente");
				assert.ok(row.selectNode, "No se ha creado correctamente");
			},

			"Should_SetSelected_When_ReceiveSelectPublication": function() {

				Mediator.publish(row.getChannel("SELECT"));
				assert.isTrue(row._selected, "No se ha seleccionado correctamente");
			},

			"Should_SetSelected_When_ReceiveDeselectPublication": function() {

				Mediator.publish(row.getChannel("SELECT"));

				Mediator.publish(row.getChannel("DESELECT"));

				assert.isFalse(row._selected, "No se ha deseleccionado correctamente");
			},

			"Should_SetSelected_When_ReceiveSelectAllPublication": function() {

				Mediator.publish(row._buildChannel(parentChannel, row.actions.SELECT_ALL_ROWS));

				assert.isTrue(row._selected, "No se ha seleccionado correctamente");
			},

			"Should_SetSelected_When_ReceiveClearSelectionPublication": function() {

				Mediator.publish(row.getChannel("SELECT"));

				Mediator.publish(row._buildChannel(parentChannel, row.actions.CLEAR_SELECTION_ROWS));

				assert.isFalse(row._selected, "No se ha deseleccionado correctamente");
			}
		}
	});

	registerSuite("Row with buttons tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				template: template,
				buttonsConfig: {
					listButton: [{
						groupId: "edition",
						icons: [{
							icon: "fa-edit",
							btnId: "edit",
							title: "edit",
							option: "default",
							href: "activityEdit"
						}]
					},{
						icon: "fa-info-circle",
						btnId: "details",
						title: "info",
						href: "activityDetails"
					}]
				}
			};

			row = new declare([Row, _Buttons])(config);
		},

		after: function() {

			Mediator.publish(row.getChannel("DISCONNECT"));
		},

		tests: {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				checkBasicStructures();

				assert.ok(row.buttons, "Los botones de la row no se han creado correctamente");
			}
		}
	});

	registerSuite("Row with hierarchical tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				template: template
			};

			row = new declare([Row, _Hierarchical])(config);
		},

		after: function() {

			Mediator.publish(row.getChannel("DISCONNECT"));
		},

		tests: {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": checkBasicStructures,

			"Should_SetTemplate_When_ReceiveUpdateTemplatePublication": function() {

				var template = 'Hola';

				Mediator.publish(row.getChannel("UPDATE_TEMPLATE"), {
					template: template
				});

				assert.strictEqual(row.template, template, "No se ha actualizado correctamente");
			},

			"Should_SetTemplate_When_ReceiveUpdateTemplateParentPublication": function() {

				var template = 'Hola';

				Mediator.publish(row._buildChannel(parentChannel, row.actions.UPDATE_TEMPLATE_ROW), {
					template: template
				});

				assert.strictEqual(row.template, template, "No se ha actualizado correctamente");
			}
		}
	});

	registerSuite("Row with hierarchical selection tests", {
		before: function() {

			config = {
				parentChannel: parentChannel,
				template: template
			};

			row = new declare([Row, _Hierarchical, _HierarchicalSelect])(config);
		},

		after: function() {

			Mediator.publish(row.getChannel("DISCONNECT"));
		},

		tests: {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				checkBasicStructures();

				assert.ok(row.selectContainerNode, "No se ha creado correctamente");
				assert.ok(row.selectNode, "No se ha creado correctamente");
			},

			"Should_SetSelected_When_ReceiveSelectPublication": function() {

				Mediator.publish(row.getChannel("SELECT"));
				assert.isTrue(row._selected, "No se ha seleccionado correctamente");
			},

			"Should_SetSelected_When_ReceiveDeselectPublication": function() {

				Mediator.publish(row.getChannel("SELECT"));

				Mediator.publish(row.getChannel("DESELECT"));

				assert.isFalse(row._selected, "No se ha deseleccionado correctamente");
			},

			"Should_SetSelected_When_ReceiveSelectAllPublication": function() {

				Mediator.publish(row._buildChannel(parentChannel, row.actions.SELECT_ALL_ROWS));

				assert.isTrue(row._selected, "No se ha seleccionado correctamente");
			},

			"Should_SetSelected_When_ReceiveClearSelectionPublication": function() {

				Mediator.publish(row.getChannel("SELECT"));

				Mediator.publish(row._buildChannel(parentChannel, row.actions.CLEAR_SELECTION_ROWS));

				assert.isFalse(row._selected, "No se ha deseleccionado correctamente");
			}
		}
	});
});
