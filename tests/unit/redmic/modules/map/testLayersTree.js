define([
	"dojo/_base/declare"
	, "redmic/base/Mediator"
	, "redmic/modules/map/LayersTree"
], function(
	declare
	, Mediator
	, LayersTree
){
	var timeout, layersTree, target;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Layers tree map tests", {
		before: function() {
			timeout = 10;

			target = "";

			layersTree = new LayersTree({
				mapChannel: "map",
				treeChannel: "tree"
			});

			parent = {path:"root.0", label:"REDMIC", parent: null};
			child1 = {path: "root.0.1", label: "Batimetrías", parent: "root.0", layer: 1};
			child2 = {path: "root.0.2", label: "ZEC", parent: "root.0", layer: 2};

		},

		afterEach: function() {
		},

		after: function() {
			Mediator.publish(layersTree.getChannel("DISCONNECT"));
		},

		tests: {
			"layersTree creation": function() {

				assert.ok(layersTree.mapChannel, "El árbol de layers no se ha creado correctamente.");
				assert.ok(layersTree.treeChannel, "El árbol de layers no se ha creado correctamente.");
			},

			"add layer from tree": function() {

				var dfd = this.async(timeout);

				Mediator.once(layersTree._buildChannel(layersTree.mapChannel, layersTree.actions.ADDLAYER),
					dfd.callback(function(obj) {
						assert.equal(obj.layer, child1.layer,
							"El layer recibido para ser añadido no es el correcto");
				}));

				Mediator.publish(layersTree._buildChannel(layersTree.treeChannel, layersTree.actions.SELECT), {
					success: true,
					body: {
						target: target,
						ids: [child1]
					}
				});

			},

			"remove layer from tree": function() {

				var dfd = this.async(timeout);

				Mediator.once(layersTree._buildChannel(layersTree.mapChannel, layersTree.actions.REMOVELAYER),
					dfd.callback(function(obj) {
						assert.equal(obj.layer, child1.layer,
							"El layer recibido para ser borrado no es el correcto");
				}));

				Mediator.publish(layersTree._buildChannel(layersTree.treeChannel,layersTree.actions.DESELECT), {
					success: true,
					body: {
						target: target,
						ids: [child1]
					}
				});
			}
		}
	});

});
