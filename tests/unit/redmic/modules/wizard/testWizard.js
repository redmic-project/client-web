define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/base/Mediator"
	, "redmic/modules/wizard/Wizard"
	, "redmic/modules/wizard/FacetsWizardImpl"
], function(
	declare
	, lang
	, put
	, Mediator
	, Wizard
	, FacetsWizardImpl
){
	var timeout, wizard, item;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Wizard module tests", {
		before: function() {
			timeout = 100;

			wizard = new declare([FacetsWizardImpl, Wizard])({
				parentChannel: "view"
			});
		},

		afterEach: function() {

		},

		after: function() {
			Mediator.publish(wizard.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {
				assert.equal(wizard.storeChannel, "app:data", "wizard no se ha creado correctamente.");
			},

			"show in node": function() {

				var dfd = this.async(timeout);
				content = put("div");

				Mediator.once(wizard.getChannel("SHOWN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se mostró correctamente.");
				}));

				Mediator.publish(wizard.getChannel("SHOW"), {
					node: content
				});

				assert.isNotNull(wizard.node,
					"wizard tiene el campo node a null, por tanto no se ha mostrado correctamente."
				);
			},

			"hide node": function() {

				var dfd = this.async(timeout);

				Mediator.once(wizard.getChannel("HIDDEN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se ocultó correctamente.");
				}));

				Mediator.publish(wizard.getChannel("HIDE"));

				assert.isNull(wizard.node,
					"wizard no tiene el campo node a null, por tanto "+
					"sigue estando mostrado a pesar de llamar a hide."
				);
			}
		}
	});

	registerSuite("Wizard with FacetsWizardImpl module tests", {
		before: function() {
			timeout = 100;

			wizard = new declare([FacetsWizardImpl, Wizard])({
				parentChannel: "view",
				storeChannel: "wizardData"
			});
		},

		afterEach: function() {

		},

		after: function() {
			Mediator.publish(wizard.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {
				assert.equal(wizard.storeChannel, "wizardData", "wizard no se ha creado correctamente.");
			}
		}
	});

});
