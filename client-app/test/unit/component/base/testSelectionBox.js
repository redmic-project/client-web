define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "src/component/base/SelectionBox"
	, "src/util/Mediator"
], function(
	declare
	, lang
	, put
	, SelectionBox
	, Mediator
){
	var timeout, selectionBox, target, getTotal;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("SelectionBox tests", {
		before: function() {

			timeout = 100;
			target = "/api/contacts";

			selectionBox = new SelectionBox({
				parentChannel: "",
				target: target
			});

			getTotal = function() {
				if (!selectionBox.selectionCount.innerHTML) {
					return 0;
				}

				return parseInt(selectionBox.selectionCount.innerHTML.split(" ")[0], 10);
			};
		},

		afterEach: function() {
			selectionBox._clearSelection();
		},

		after: function() {
			Mediator.publish(selectionBox.getChannel("DISCONNECT"));
		},

		tests: {
			"Creation": function() {
				assert.ok(selectionBox.container, "SelectionBox no se ha creado correctamente");
			},

			"Show in node": function() {

				var dfd = this.async(timeout);
				content = put("div");

				Mediator.once(selectionBox.getChannel("SHOWN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se mostró correctamente");
				}));

				Mediator.publish(selectionBox.getChannel("SHOW"), {
					node: content
				});

				assert.isNotNull(selectionBox.node,
					"El selectionBox tiene el campo node a null, por tanto no se ha mostrado correctamente"
				);
			},

			"Hide from node": function() {

				var dfd = this.async(timeout);

				Mediator.once(selectionBox.getChannel("HIDDEN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se ocultó correctamente");
				}));

				Mediator.publish(selectionBox.getChannel("HIDE"));

				assert.isNull(selectionBox.node,
					"El selectionBox no tiene el campo node a null, por tanto sigue estando mostrado a pesar de llamar a hide"
				);
			},

			"Refresh": function() {  // OJO el refresh es quien setea el target, hay que hacer un refresh antes de la selección

				var dfd = this.async(timeout);

				Mediator.once(selectionBox.getChannel("REFRESHED"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se refrescó correctamente");
					assert.strictEqual(obj.target, target, "No se recibió el nuevo target correctamente");
				}));

				Mediator.publish(selectionBox.getChannel("REFRESH"), {
					target: target
				});
			},

			"Get item selected from selector": function() {

				var dfdSelected = this.async(timeout);

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED),
					dfdSelected.callback(function(res) {
						assert.ok(res.success, "No se seleccionó correctamente el item enviado");
						assert.deepEqual(res.body.ids, [1], "Objeto recibido como seleccionado no coincide con el enviado");
						assert.deepEqual(getTotal(), 1,
							"El contador de selectionBox debería devolver 1");
				}));

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1],
						total: 1
					}
				});
			},

			"Get set of items selected from selector": function() {

				var dfdSelected = this.async(timeout);

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED),
					dfdSelected.callback(function(res) {
						assert.ok(res.success, "No se seleccionó correctamente el item enviado");
						assert.deepEqual(res.body.ids, [1, 2, 3], "Objeto recibido como seleccionado no coincide con el enviado");
						assert.deepEqual(getTotal(), 3,
							"El contador de selectionBox debería devolver 3");
				}));

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1, 2, 3],
						total: 3
					}
				});
			},

			"Get item deselected from selector": function() {

				var dfdDeselected = this.async(timeout);

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1],
						total: 1
					}
				});

				assert.deepEqual(1, getTotal(),
					"El contador de selectionBox debería devolver 1");

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.DESELECTED),
					dfdDeselected.callback(function(res) {
						assert.ok(res.success, "No se seleccionó correctamente el item enviado");
						assert.deepEqual(res.body.ids, [1], "Objeto recibido como seleccionado no coincide con el enviado");
						assert.deepEqual(0, getTotal(),
							"El contador de selectionBox debería devolver 0");
				}));

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.DESELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1],
						total: 0
					}
				});
			},

			"Get set of item deselected from selector": function() {

				var dfdDeselected = this.async(timeout);

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1, 2, 3],
						total: 3
					}
				});

				assert.deepEqual(3, getTotal(),
					"El contador de selectionBox debería devolver 3");

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.DESELECTED),
					dfdDeselected.callback(function(res) {
						assert.ok(res.success, "No se seleccionó correctamente el item enviado");
						assert.deepEqual(res.body.ids, [1, 2, 3], "Objeto recibido como seleccionado no coincide con el enviado");
						assert.deepEqual(0, getTotal(),
							"El contador de selectionBox debería devolver 0");
				}));

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.DESELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1, 2, 3],
						total: 0
					}
				});
			},

			"Get selectGroup from selector and select items": function() {

				var dfdSelectedGroup = this.async(timeout);

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED_GROUP),
					dfdSelectedGroup.callback(function(groupSelected) {
						assert.isTrue(groupSelected.success, "No se recibió correctamente el grupo de seleccionados");
						assert.equal(groupSelected.body.target, target,
							"El target del servicio no corresponde con el enviado");
						assert.equal(groupSelected.body.requesterId, selectionBox.getOwnChannel(),
							"El requesterId del solicitante no corresponde con el enviado");
						assert.deepEqual(groupSelected.body.selection.items, {1:true},
							"El item deseleccionado debe tener id 1");
						assert.equal(groupSelected.body.selection.total, 1, "El total de seleccionados debe ser 1");
						assert.deepEqual(1, getTotal(),
							"El contador de selectionBox debería devolver 1");
				}));

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED_GROUP), {
					success: true,
					body: {
						selection: {
							items: {1: true},
							total: 1
						},
						target: target,
						requesterId: selectionBox.getOwnChannel()
					}
				});
			},

			"Request selectGroup to selector": function() {

				var dfdDeselectedGroup = this.async(timeout);

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.GROUP_SELECTED),
					dfdDeselectedGroup.callback(function(groupSelected) {
						assert.equal(groupSelected.target, target, "El target del servicio no corresponde con el enviado");
				}));

				selectionBox.emit(selectionBox.events.GROUP_SELECTED);
			},

			"Get clearSelection from selector": function() {

				var dfd = this.async(timeout);

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1, 2, 3],
						total: 3
					}
				});

				assert.deepEqual(3, getTotal(),
					"El contador de selectionBox debería devolver 3");

				Mediator.once(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTION_CLEARED),
					dfd.callback(function(item) {
						assert.deepEqual(0, getTotal(),
							"El contador de selectionBox debería devolver 0");
						assert.deepEqual(item.target, target, "El target del servicio no corresponde con el enviado");
				}));

				Mediator.publish(selectionBox._buildChannel(selectionBox.selectorChannel, selectionBox.actions.SELECTION_CLEARED), {
					success: true,
					target: target
				});
			}
		}
	});

});
