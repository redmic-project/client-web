define([
	'dojo/_base/declare'
	, 'src/util/Mediator'
	, 'src/component/tree/_LazyLoad'
	, 'src/component/tree/_LeafSelection'
	, 'src/component/tree/CbtreeImpl'
], function(
	declare
	, Mediator
	, _LazyLoad
	, _LeafSelection
	, CbtreeImpl
){

	var timeout = 100,
		target = 'api/prueba',

		filterSchema = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"title": "Metadata Query DTO",
			"type": "object",
			"properties": {
				"regexp": {
					"type": ["array", "null"],
					"uniqueItems": true,
					"items": {
						"$ref": "#/definitions/RegexpDTO"
					}
				}
			},
			"definitions": {
				"RegexpDTO": {
					"type": ["object", "null"],
					"properties": {
						"field": {
							"type": "string"
						},
						"exp": {
							"type": "string"
						}
					},
					"required": ["field", "exp"]
				}
			}
		},

		createQuery = function(item) {

			var query = {
				'regexp': [{
					field: 'path.name',
					exp: 'root.[0-9]+'
				}]
			};

			if (!item) {
				return query;
			}

			query.regexp[0].exp = item.path + '.[0-9]+';

			return query;
		},

		shortData = [{
			name: 'abuelo de pepito',
			children: [2, 3],
			path: 'root.0'
		},{
			name: 'tio-abuelo de pepito',
			children: null,
			path: 'root.1'
		},{
			name: 'padre de pepito',
			children: [4],
			path: 'root.0.2'
		},{
			name: 'tio de pepito',
			children: [5],
			path: 'root.0.3'
		},{
			name: 'pepito',
			children: null,
			path: 'root.0.2.4'
		},{
			name: 'primo de pepito',
			children: null,
			path: 'root.0.3.5'
		}],

		tree, newData;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('Tree tests', {
		before: function() {

			newData = shortData;

			tree = new CbtreeImpl({
				parentChannel: 'parentChannel',
				selectionTarget: target,
				data: newData
			});
		},

		afterEach: function() {

			tree.clear();
		},

		after: function() {

			Mediator.publish(tree.getChannel('DISCONNECT'));
		},

		tests: {
			Should_HaveStructuresAvailable_When_ModuleIsInitialized: function() {

				assert(tree.store, 'El store local no se ha creado correctamente');
				assert.lengthOf(tree.store._data, 6, 'El store local no ha inicializado los datos correctamente');
				assert(tree.model, 'El modelo no se ha creado correctamente');
				assert(tree.tree, 'El árbol no se ha creado correctamente');
			},

			Should_PublishSelectRequest_When_ClickOnDeselectedItem: function() {

				var dfd = this.async(timeout);

				// Emulamos la suscripción de Selector
				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECT), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');

					assert.strictEqual(req.items, newData[0][tree.idProperty],
						'El id recibido como seleccionado no coincide con el id del item seleccionado');

					dfd.resolve();
				});

				var item = tree.getItem(newData[0][tree.idProperty]);
				// Emulamos el evento del árbol
				tree.emit(tree.events.CHECKBOXCLICK, [
					item,
					'nodo',
					{
						target: {
							checked: true
						}
					}
				]);
			},

			Should_ListenSelectedResponse_When_SelectorPublishSingleItemSelected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert(tree.getChecked(tree.getItem(res.ids)), 'El item seleccionado no lo está para el árbol');

					assert.deepEqual({'root.0': true}, tree._selection,
						'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				var itemId = newData[0][tree.idProperty];
				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					ids: [itemId],
					total: 1,
					target: target
				});
			},

			Should_ListenSelectedResponse_When_SelectorPublishSeveralItemsSelected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert(tree.getChecked(tree.getItem(res.ids[0])),
						'El primer item seleccionado no lo está para el árbol');

					assert(tree.getChecked(tree.getItem(res.ids[1])),
						'El segundo item seleccionado no lo está para el árbol');

					assert.deepEqual({'root.0': true, 'root.1': true}, tree._selection,
						'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				var itemId1 = newData[0][tree.idProperty],
					itemId2 = newData[1][tree.idProperty];

				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [itemId1, itemId2]
				});
			},

			Should_PublishDeselectRequest_When_ClickOnSelectedItem: function() {

				var dfd = this.async(timeout);

				// Emulamos la suscripción de Selector
				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECT), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');

					assert.strictEqual(req.items, newData[0][tree.idProperty],
						'El id recibido como deseleccionado no coincide con el id del item deseleccionado');

					dfd.resolve();
				});

				var item = tree.getItem(newData[0][tree.idProperty]);
				// Emulamos el evento del árbol
				tree.emit(tree.events.CHECKBOXCLICK, [
					item,
					'nodo',
					{
						target: {
							checked: false
						}
					}
				]);
			},

			Should_ListenDeselectedResponse_When_SelectorPublishSingleItemDeselected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert.notOk(tree.getChecked(tree.getItem(res.ids)),
						'El item deseleccionado no lo está para el árbol');

					assert.deepEqual({}, tree._selection, 'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				var itemId = newData[0][tree.idProperty];
				tree.setChecked(tree.getItem(itemId), true);	// Forzamos la selección para poder deseleccionar
				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), {
					target: target,
					ids: [itemId],
					total: 0
				});
			},

			Should_ListenDeselectedResponse_When_SelectorPublishSeveralItemsDeselected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert.notOk(tree.getChecked(tree.getItem(res.ids[0])),
						'El primer item deseleccionado no lo está para el árbol');

					assert.notOk(tree.getChecked(tree.getItem(res.ids[1])),
						'El segundo item deseleccionado no lo está para el árbol');

					assert.deepEqual({}, tree._selection, 'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				var itemId1 = newData[0][tree.idProperty],
					itemId2 = newData[1][tree.idProperty];

				tree.setChecked(tree.getItem(itemId1), true);	// Forzamos la selección para poder deseleccionar
				tree.setChecked(tree.getItem(itemId2), true);	// Forzamos la selección para poder deseleccionar

				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), {
					target: target,
					ids: [itemId1, itemId2]
				});
			},

			Should_PublishGroupSelectedRequest_When_GroupSelectedEventIsEmitted: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.GROUP_SELECTED), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');

					dfd.resolve();
				}, {}, this);

				tree.emit(tree.events.GROUP_SELECTED);
			},

			Should_ListenSelectedGroupResponse_When_SelectorPublishSelectedGroup: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED_GROUP), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert.strictEqual(res.requesterId, tree.getOwnChannel(),
						'El requesterId del solicitante no es el esperado');

					assert.isTrue(res.selection.items[1], 'El item seleccionado no tiene el id esperado');
					assert.strictEqual(res.selection.total, 1, 'El total de seleccionados no es 1');
					assert.deepEqual({1: true}, tree._selection, 'La estructura de seleccionados no es correcta');

					dfd.resolve();
				});

				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED_GROUP), {
					selection: {
						items: {1: true},
						total: 1
					},
					target: target,
					requesterId: tree.getOwnChannel()
				});
			},

			Should_PublishClearSelectionRequest_When_ClearSelectionEventIsEmitted: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.CLEAR_SELECTION), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');

					dfd.resolve();
				}, {}, this);

				tree.emit(tree.events.CLEAR_SELECTION);
			},

			Should_ListenSelectionClearedResponse_When_SelectorPublishSelectionCleared: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTION_CLEARED), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');
					assert.lengthOf(Object.keys(tree._selection), 0,'El árbol aun tiene items seleccionados');

					dfd.resolve();
				}, {}, this);

				var itemId1 = newData[0][tree.idProperty],
					itemId2 = newData[1][tree.idProperty];

				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [itemId1, itemId2]
				});

				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTION_CLEARED), {
					target: target
				});
			},

			Should_GenerateItemLabel_When_NoLabelGenerationIsDefined: function() {

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][tree.idProperty],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			},

			Should_GenerateItemLabel_When_LabelGenerationIsDefinedByFieldName: function() {

				var field = 'name';

				tree.itemLabel = field;
				tree.clear();

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][field],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			},

			Should_GenerateItemLabel_When_LabelGenerationIsDefinedByExpression: function() {

				var field1 = 'id',
					field2 = 'name';

				tree.itemLabel = '{' + field1 + '}{' + field2 + '}';
				tree.clear();

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][field1] + newData[0][field2],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			},

			Should_GenerateItemLabel_When_LabelGenerationIsDefinedByCallback: function() {

				tree.itemLabel = function(item) {
					return item[tree.idProperty];
				};
				tree.clear();

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][tree.idProperty],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			}
		}
	});

	registerSuite('Tree tests with lazy load', {
		before: function() {

			tree = new declare([CbtreeImpl, _LazyLoad])({
				target: target,
				parentChannel: 'parentChannel',
				createQuery: createQuery,
				filterConfig: {
					modelConfig: {
						schema: filterSchema
					}
				}
			});

			newData = shortData;
		},

		afterEach: function() {

			tree.clear();
		},

		after: function() {

			Mediator.publish(tree.getChannel('DISCONNECT'));
		},

		tests: {
			Should_ListenDataAvailableResponse_When_StorePublishNewData: function() {

				var firstItem = newData[0];

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [firstItem],
						status: 200
					}
				});

				assert.deepEqual(tree.getItem(firstItem[tree.idProperty]), firstItem,
					'El store local no se ha actualizado con la información recibida'
				);
			},

			Should_PublishRefreshedResponse_When_ListenDataAvailableResponse: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree.getChannel('REFRESHED'), function(res) {

					assert(res.success, 'El canal informa de que hubo un error al recibir los datos');
					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');
					dfd.resolve();
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: newData[0],
						status: 200
					}
				});
			},

			Should_PublishItemsRequest_When_ExpandItem: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.storeChannel, tree.actions.REQUEST), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');
					assert(req.query, 'No se recibe una query');
					dfd.resolve();
				}, {}, this);

				tree._loadData(newData[0], 'nodo');
			},

			Should_PublishRefreshedResponse_When_ExpandItemAndListenDataAvailableResponse: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree.getChannel('REFRESHED'), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');
					dfd.resolve();
				}, {}, this);

				Mediator.once(tree._buildChannel(tree.storeChannel, tree.actions.REQUEST), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');

					// Simulamos la respuesta del store
					Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
						target: target,
						res: {
							data: newData,
							status: 200
						}
					});
				}, {}, this);

				tree._loadData(newData[0], 'nodo');
			},

			Should_RequestNotLoadedDescendantItemsAndListenResponse_When_ExpandItem: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.storeChannel, tree.actions.REQUEST), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');
					assert.deepEqual(req.query, createQuery(newData[3]), 'El filtro de la query no es el esperado');

					Mediator.once(tree.getChannel('REFRESHED'), function(res) {

						assert(res.success, 'El canal informa de que hubo un error al recibir los datos');
						assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

						tree.getModelChildren(tree.getItem(newData[3][tree.idProperty]), function(items) {

							assert.lengthOf(items, 1, 'Se recibe un número de items distinto al esperado');
							assert.deepEqual(items[0], newData[5], 'Se recibe un item distinto al esperado');
							dfd.resolve();
						});
					}, {}, this);

					// Simulamos la respuesta del store
					Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
						target: target,
						res: {
							data: [newData[5]],
							status: 200
						}
					});
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0], newData[1], newData[2], newData[3], newData[4]],
						status: 200
					}
				});

				tree._loadData(newData[3], 'nodo');
			},

			Should_PublishSelectRequest_When_ClickOnDeselectedItem: function() {

				var dfd = this.async(timeout);

				// Emulamos la suscripción de Selector
				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECT), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');

					assert.strictEqual(req.items, newData[0][tree.idProperty],
						'El id recibido como seleccionado no coincide con el id del item seleccionado');

					dfd.resolve();
				});

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				var item = tree.getItem(newData[0][tree.idProperty]);
				// Emulamos el evento del árbol
				tree.emit(tree.events.CHECKBOXCLICK, [
					item,
					'nodo',
					{
						target: {
							checked: true
						}
					}
				]);
			},

			Should_ListenSelectedResponse_When_SelectorPublishSingleItemSelected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), function(res) {

					assert.strictEqual(res.target, target,
						'El canal informa de datos que no nos corresponden');

					assert(tree.getChecked(tree.getItem(res.ids)),
						'El item seleccionado no lo está para el árbol');

					assert.deepEqual({'root.0': true}, tree._selection, 'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				var itemId = newData[0][tree.idProperty];
				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [itemId],
					total: 1
				});
			},

			Should_ListenSelectedResponse_When_SelectorPublishSeveralItemsSelected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert(tree.getChecked(tree.getItem(res.ids[0])),
						'El primer item seleccionado no lo está para el árbol');

					assert(tree.getChecked(tree.getItem(res.ids[1])),
						'El segundo item seleccionado no lo está para el árbol');

					assert.deepEqual({'root.0': true, 'root.1': true}, tree._selection,
						'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0], newData[1]],
						status: 200
					}
				});

				var itemId1 = newData[0][tree.idProperty],
					itemId2 = newData[1][tree.idProperty];

				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [itemId1, itemId2]
				});
			},

			Should_PublishDeselectRequest_When_ClickOnSelectedItem: function() {

				var dfd = this.async(timeout);

				// Emulamos la suscripción de Selector
				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECT), function(req) {

					assert.strictEqual(req.target, target, 'El canal informa de datos que no nos corresponden');
					assert.strictEqual(req.items, newData[0][tree.idProperty],
						'El id recibido como deseleccionado no coincide con el id del item deseleccionado');

					dfd.resolve();
				});

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				var item = tree.getItem(newData[0][tree.idProperty]);
				// Emulamos el evento del árbol
				tree.emit(tree.events.CHECKBOXCLICK, [
					item,
					'nodo',
					{
						target: {
							checked: false
						}
					}
				]);
			},

			Should_ListenDeselectedResponse_When_SelectorPublishSingleItemDeselected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert.notOk(tree.getChecked(tree.getItem(res.ids)),
						'El item deseleccionado no lo está para el árbol');

					assert.deepEqual({}, tree._selection, 'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				var itemId = newData[0][tree.idProperty];
				tree.setChecked(tree.getItem(itemId), true);	// Forzamos la selección para poder deseleccionar
				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), {
					target: target,
					ids: [itemId],
					total: 0
				});
			},

			Should_ListenDeselectedResponse_When_SelectorPublishSeveralItemsDeselected: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), function(res) {

					assert.strictEqual(res.target, target, 'El canal informa de datos que no nos corresponden');

					assert.notOk(tree.getChecked(tree.getItem(res.ids[0])),
						'El primer item deseleccionado no lo está para el árbol');

					assert.notOk(tree.getChecked(tree.getItem(res.ids[1])),
						'El segundo item deseleccionado no lo está para el árbol');

					assert.deepEqual({}, tree._selection, 'La estructura de seleccionados no es correcta');

					dfd.resolve();
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0], newData[1]],
						status: 200
					}
				});

				var itemId1 = newData[0][tree.idProperty],
					itemId2 = newData[1][tree.idProperty];

				tree.setChecked(tree.getItem(itemId1), true);	// Forzamos la selección para poder deseleccionar
				tree.setChecked(tree.getItem(itemId2), true);	// Forzamos la selección para poder deseleccionar
				// Emulamos la orden de Selector
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.DESELECTED), {
					target: target,
					ids: [itemId1, itemId2]
				});
			},

			Should_SelectNewAvailableItem_When_ItemWasSelectedBeforeBeingAvailable: function() {

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});
				tree.setChecked(tree.getItem(tree.getIdentity(newData[0])), true);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[1], newData[2]],
						status: 200
					}
				});

				assert.notOk(tree.getChecked(tree.getItem(tree.getIdentity(newData[1]))),
					'Se ha marcado como seleccionado un item que no debería estarlo');

				assert(tree.getChecked(tree.getItem(tree.getIdentity(newData[2]))),
					'No se ha marcado como seleccionado un hijo de un item seleccionado');
			},

			Should_GenerateItemLabel_When_NoLabelGenerationIsDefined: function() {

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][tree.idProperty],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			},

			Should_GenerateItemLabel_When_LabelGenerationIsDefinedByFieldName: function() {

				var field = 'name';

				tree.itemLabel = field;

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][field],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			},

			Should_GenerateItemLabel_When_LabelGenerationIsDefinedByExpression: function() {

				var field1 = 'id',
					field2 = 'name';

				tree.itemLabel = '{' + field1 + '}{' + field2 + '}';

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][field1] + newData[0][field2],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			},

			Should_GenerateItemLabel_When_LabelGenerationIsDefinedByCallback: function() {

				tree.itemLabel = function(item) {

					return item[tree.idProperty];
				};

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				assert.strictEqual(tree.getItem(newData[0][tree.idProperty])[tree.labelAttr],
					newData[0][tree.idProperty],
					'El item añadido no tiene la etiqueta esperada'
				);

				tree.itemLabel = null;
			}
		}
	});

	registerSuite('Tree tests with lazy load and selection based on leaves', {
		before: function() {

			tree = new declare([CbtreeImpl, _LazyLoad, _LeafSelection])({
				target: target,
				parentChannel: 'parentChannel',
				createQuery: createQuery
			});

			newData = [{
				name: '0',
				children: [3, 4],
				leaves: 3,
				path: 'root.0'
			},{
				name: '1',
				children: [5],
				leaves: 3,
				path: 'root.1'
			},{
				name: '2',
				children: [6, 7, 8],
				leaves: 6,
				path: 'root.2'
			},{
				name: '3',
				children: [9, 10],
				leaves: 2,
				path: 'root.0.3'
			},{
				name: '4',
				children: [11],
				leaves: 1,
				path: 'root.0.4'
			},{
				name: '5',
				children: [12, 13, 14],
				leaves: 3,
				path: 'root.1.5'
			},{
				name: '6',
				children: [15],
				leaves: 1,
				path: 'root.2.6'
			},{
				name: '7',
				children: [16, 17],
				leaves: 2,
				path: 'root.2.7'
			},{
				name: '8',
				children: [18, 19, 20],
				leaves: 3,
				path: 'root.2.8'
			},{
				name: '9',
				children: null,
				leaves: 0,
				path: 'root.0.3.9'
			},{
				name: '10',
				children: null,
				leaves: 0,
				path: 'root.0.3.10'
			},{
				name: '11',
				children: null,
				leaves: 0,
				path: 'root.0.4.11'
			},{
				name: '12',
				children: null,
				leaves: 0,
				path: 'root.1.5.12'
			},{
				name: '13',
				children: null,
				leaves: 0,
				path: 'root.1.5.13'
			},{
				name: '14',
				children: null,
				leaves: 0,
				path: 'root.1.5.14'
			},{
				name: '15',
				children: null,
				leaves: 0,
				path: 'root.2.6.15'
			},{
				name: '16',
				children: null,
				leaves: 0,
				path: 'root.2.7.16'
			},{
				name: '17',
				children: null,
				leaves: 0,
				path: 'root.2.7.17'
			},{
				name: '18',
				children: null,
				leaves: 0,
				path: 'root.2.8.18'
			},{
				name: '19',
				children: null,
				leaves: 0,
				path: 'root.2.8.19'
			},{
				name: '20',
				children: null,
				leaves: 0,
				path: 'root.2.8.20'
			}];
		},

		afterEach: function() {

			tree.clear();
		},

		after: function() {

			Mediator.publish(tree.getChannel('DISCONNECT'));
		},

		tests: {
			Should_HaveSelectionStructureAvailable_When_ModuleIsInitialized: function() {

				assert(tree._selectionStructure, 'La estructura de seleccionados no se ha creado correctamente');
			},

			Should_GenerateStructureWithSelectedLeavesProperty_When_SelectLeafItem: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), function(res) {

					assert.lengthOf(Object.keys(tree._selectionStructure), 3,
						'La estructura no tiene el número de elementos esperado');

					var item9 = newData[9][tree.idProperty],
						item3 = newData[3][tree.idProperty],
						item0 = newData[0][tree.idProperty];

					assert.property(tree._selectionStructure, item9, 'La estructura no contiene la hoja seleccionada');
					assert.propertyVal(tree._selectionStructure[item9], 'selectedLeaves', 1,
						'La estructura contiene datos incorrectos sobre la hoja seleccionada');

					assert.property(tree._selectionStructure, item3,
						'La estructura no contiene al padre de la hoja seleccionada');
					assert.propertyVal(tree._selectionStructure[item3], 'selectedLeaves', 1,
						'La estructura contiene datos incorrectos sobre el padre de la hoja seleccionada');

					assert.property(tree._selectionStructure, item0,
						'La estructura no contiene al abuelo de la hoja seleccionada');
					assert.propertyVal(tree._selectionStructure[item0], 'selectedLeaves', 1,
						'La estructura contiene datos incorrectos sobre el abuelo de la hoja seleccionada');

					dfd.resolve();
				}, {}, this);

				var itemId = newData[9][tree.idProperty];
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [itemId],
					total: 1
				});
			},

			Should_GenerateStructureWithLeavesProperty_When_RequestChildrenOfRootItem: function() {

				var dfd = this.async(timeout);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0]],
						status: 200
					}
				});

				Mediator.once(tree.getChannel('REFRESHED'), function(res) {

					assert.lengthOf(Object.keys(tree._selectionStructure), 3,
						'La estructura no tiene el número de elementos esperado');

					var item0 = newData[0][tree.idProperty],
						item3 = newData[3][tree.idProperty],
						item4 = newData[4][tree.idProperty];

					assert.property(tree._selectionStructure, item0,
						'La estructura no contiene la raíz de los elementos pedidos');

					assert.propertyVal(tree._selectionStructure[item0], 'leaves', 3,
						'La estructura contiene datos incorrectos sobre la raíz de los elementos pedidos');

					assert.property(tree._selectionStructure, item3,
						'La estructura no contiene el primero de los elementos pedidos');

					assert.propertyVal(tree._selectionStructure[item3], 'leaves', 2,
						'La estructura contiene datos incorrectos sobre el primero de los elementos pedidos');

					assert.property(tree._selectionStructure, item4,
						'La estructura no contiene el segundo de los elementos pedidos');

					assert.propertyVal(tree._selectionStructure[item4], 'leaves', 1,
						'La estructura contiene datos incorrectos sobre el segundo de los elementos pedidos');

					dfd.resolve();
				}, {}, this);

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[3], newData[4]],
						status: 200
					}
				});
			},

			Should_GenerateStructureWithLeavesAndSelectedLeavesProps_When_SelectLeafAndRequestItsAncestors: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree.getChannel('REFRESHED'), function(res) {

					assert.lengthOf(Object.keys(tree._selectionStructure), 21,
						'La estructura no tiene el número de elementos esperado');

					for (var key in tree._selectionStructure) {
						var item = tree._selectionStructure[key];

						assert.isNumber(item.leaves, 'El contador de hojas tiene datos incorrectos');
						assert.isNumber(item.selectedLeaves,
							'El contador de hojas seleccionadas tiene datos incorrectos');

						assert.isTrue(item.selectedLeaves >= item.leaves,
							'No están seleccionadas todas las hojas del árbol');
					}

					dfd.resolve();
				}, {}, this);

				var item9Id = newData[9][tree.idProperty],
					item10Id = newData[10][tree.idProperty],
					item11Id = newData[11][tree.idProperty],
					item12Id = newData[12][tree.idProperty],
					item13Id = newData[13][tree.idProperty],
					item14Id = newData[14][tree.idProperty],
					item15Id = newData[15][tree.idProperty],
					item16Id = newData[16][tree.idProperty],
					item17Id = newData[17][tree.idProperty],
					item18Id = newData[18][tree.idProperty],
					item19Id = newData[19][tree.idProperty],
					item20Id = newData[20][tree.idProperty];

				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [item9Id, item10Id, item11Id, item12Id, item13Id, item14Id,
						item15Id, item16Id, item17Id, item18Id, item19Id, item20Id],
					total: 12
				});

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0], newData[1], newData[2], newData[3], newData[4], newData[5], newData[6],
							newData[7], newData[8]],
						status: 200
					}
				});
			},

			Should_SetAncestorItemsAsMixed_When_SelectLeafItemWithAnotherDeselectedSiblingAndReceiveAncestors: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree.getChannel('REFRESHED'), function(res) {

					var parentId = newData[0][tree.idProperty],
						grandParentId = newData[3][tree.idProperty];

					assert.strictEqual(tree.getChecked(tree.getItem(parentId)), 'mixed');
					assert.strictEqual(tree.getChecked(tree.getItem(grandParentId)), 'mixed');

					dfd.resolve();
				}, {}, this);

				var itemId = newData[9][tree.idProperty];
				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [itemId],
					total: 1
				});

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0], newData[3]],
						status: 200
					}
				});
			},

			Should_SetParentAsSelectedAndGrandParentAsMixed_When_SelectLeavesFromSameParentAndReceiveAncestors: function() {

				var dfd = this.async(timeout);

				Mediator.once(tree.getChannel('REFRESHED'), function(res) {

					var parentId = newData[3][tree.idProperty],
						grandParentId = newData[0][tree.idProperty];

					assert.strictEqual(tree.getChecked(tree.getItem(parentId)), true);
					assert.strictEqual(tree.getChecked(tree.getItem(grandParentId)), 'mixed');

					dfd.resolve();
				}, {}, this);

				var item9Id = newData[9][tree.idProperty],
					item10Id = newData[10][tree.idProperty];

				Mediator.publish(tree._buildChannel(tree.selectorChannel, tree.actions.SELECTED), {
					target: target,
					ids: [item9Id, item10Id],
					total: 2
				});

				Mediator.publish(tree._buildChannel(tree.storeChannel, tree.actions.AVAILABLE), {
					target: target,
					res: {
						data: [newData[0], newData[3]],
						status: 200
					}
				});
			}
		}
	});
});
