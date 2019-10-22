define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/base/Mediator'
	, 'redmic/modules/selection/Selector'
], function(
	declare
	, lang
	, Mediator
	, Selector
) {

	var timeout = 100,
		target = '{apiUrl}/data',
		settingsTarget = '{apiUrl}/{endpoint}/data',
		localTarget = 'local/data',
		selector;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('Selector tests', {
		before: function() {

			selector = new Selector({
				parentChannel: 'app'
			});
		},

		afterEach: function() {

			selector.selections = {};
		},

		after: function() {

			Mediator.publish(selector.getChannel('DISCONNECT'));
		},

		tests: {
			Should_HaveSelectionStructureAvailable_When_ModuleIsInitialized: function() {

				assert.ok(selector.selections, 'La estructura de seleccionados no se ha creado correctamente');
			},

			Should_EmitSaveForSelection_When_SelectItem: function() {

				var dfd = this.async(timeout);

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.include(evt.data.ids, 1, 'El item seleccionado debe tener id 1');
					assert.strictEqual(evt.data.action, 'select', 'La acción para guardar debe ser la de seleccionar');
				}));

				Mediator.publish(selector.getChannel('SELECT'), {
					target: target,
					items: 1
				});
			},

			Should_EmitSaveForSettingsSelection_When_SelectItem: function() {

				var dfd = this.async(timeout);

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.include(evt.data.selection, 1, 'El item seleccionado debe tener id 1');
				}));

				Mediator.publish(selector.getChannel('SELECT'), {
					target: settingsTarget,
					items: 1
				});
			},

			Should_HaveItemInSelection_When_PublishSelectedForLocalSelection: function() {

				var dfd = this.async(timeout);

				Mediator.once(selector.getChannel('SELECTED'), dfd.callback(function(res) {

					assert.include(res.ids, '1', 'El item seleccionado debe tener como id la cadena "1"');
					assert.ok(selector.selections[localTarget].items[1], 'El item con id 1 debe estar seleccionado');
				}));

				Mediator.publish(selector.getChannel('SELECT'), {
					target: localTarget,
					items: 1
				});
			},

			Should_OmitSaveForSelectionEmission_When_SelectAlreadySelectedItem: function() {

				var dfd = this.async(timeout),
					callback = function(res) {

						dfd.reject(new Error('Se ha publicado "selected" para un elemento ya seleccionado'));
					};

				setTimeout(dfd.callback(function() {

					Mediator.remove(selector.getChannel('SELECTED'), callback);
				}), timeout - 1);

				selector._select([1], target);

				Mediator.once(selector.getChannel('SELECTED'), callback);

				selector._select([1], target);
			},

			Should_OmitSaveForSettingsSelectionEmission_When_SelectAlreadySelectedItem: function() {

				var dfd = this.async(timeout),
					callback = function(res) {

						dfd.reject(new Error('Se ha publicado "selected" para un elemento ya seleccionado'));
					};

				setTimeout(dfd.callback(function() {

					Mediator.remove(selector.getChannel('SELECTED'), callback);
				}), timeout - 1);

				selector._select([1], settingsTarget);

				Mediator.once(selector.getChannel('SELECTED'), callback);

				selector._select([1], settingsTarget);
			},

			Should_EmitSaveForSelection_When_SelectSeveralItems: function() {

				var dfd = this.async(timeout);

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.lengthOf(evt.data.ids, 3, 'El array de items debe tener longitud 3');
					assert.strictEqual(evt.data.action, 'select', 'La acción para guardar debe ser la de seleccionar');
				}));

				Mediator.publish(selector.getChannel('SELECT'), {
					target: target,
					items: [1, 2, 3]
				});
			},

			Should_EmitSaveForSettingsSelection_When_SelectSeveralItems: function() {

				var dfd = this.async(timeout);

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.lengthOf(evt.data.selection, 3, 'El array de items debe tener longitud 3');
				}));

				Mediator.publish(selector.getChannel('SELECT'), {
					target: settingsTarget,
					items: [1, 2, 3]
				});
			},

			Should_HaveItemsInSelection_When_PublishSelectedForMultipleLocalSelection: function() {

				var dfd = this.async(timeout);

				Mediator.once(selector.getChannel('SELECTED'), dfd.callback(function(res) {

					assert.includeMembers(res.ids, ['1', '2', '3'],
						'Los items seleccionados deben tener como ids las cadenas correspondientes a sus id');

					assert.ok(selector.selections[localTarget].items[1], 'El item con id 1 debe estar seleccionado');
					assert.ok(selector.selections[localTarget].items[2], 'El item con id 2 debe estar seleccionado');
					assert.ok(selector.selections[localTarget].items[3], 'El item con id 3 debe estar seleccionado');
				}));

				Mediator.publish(selector.getChannel('SELECT'), {
					target: localTarget,
					items: [1, 2, 3]
				});
			},

			Should_EmitSaveForDeselection_When_DeselectItem: function() {

				var dfd = this.async(timeout);

				Mediator.publish(selector.getChannel('SELECT'), {
					target: target,
					items: 1
				});

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.include(evt.data.ids, 1, 'El item deseleccionado debe tener id 1');
					assert.strictEqual(evt.data.action, 'deselect',
						'La acción para guardar debe ser la de deseleccionar');
				}));

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: target,
					items: 1
				});
			},

			Should_EmitSaveForSettingsDeselection_When_DeselectItem: function() {

				var dfd = this.async(timeout);

				Mediator.publish(selector.getChannel('SELECT'), {
					target: settingsTarget,
					items: 1
				});

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.include(evt.data.selection, 1, 'El item deseleccionado debe tener id 1');
				}));

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: settingsTarget,
					items: 1
				});
			},

			Should_NotHaveItemInSelection_When_PublishDeselectedForLocalSelection: function() {

				var dfd = this.async(timeout);

				Mediator.publish(selector.getChannel('SELECT'), {
					target: localTarget,
					items: 1
				});

				Mediator.once(selector.getChannel('DESELECTED'), dfd.callback(function(res) {

					assert.include(res.ids, '1', 'El item deseleccionado debe tener como id la cadena "1"');
					assert.notOk(selector.selections[localTarget].items[1], 'El item con id 1 debe estar seleccionado');
				}));

				assert.ok(selector.selections[localTarget].items[1],
					'El item con id 1 debe estar previamente seleccionado');

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: localTarget,
					items: 1
				});
			},

			Should_OmitSaveForDeselectionEmission_When_DeselectAlreadyDeselectedItem: function() {

				var dfd = this.async(timeout),
					callback = function(res) {

						dfd.reject(new Error('Se ha publicado "deselected" para un elemento ya deseleccionado'));
					};

				setTimeout(dfd.callback(function() {

					Mediator.remove(selector.getChannel('DESELECTED'), callback);
				}), timeout - 1);

				Mediator.once(selector.getChannel('DESELECTED'), callback);

				selector._deselect([1], target);
			},

			Should_OmitSaveForSettingsDeselectionEmission_When_DeselectAlreadyDeselectedItem: function() {

				var dfd = this.async(timeout),
					callback = function(res) {

						dfd.reject(new Error('Se ha publicado "deselected" para un elemento ya deseleccionado'));
					};

				setTimeout(dfd.callback(function() {

					Mediator.remove(selector.getChannel('DESELECTED'), callback);
				}), timeout - 1);

				Mediator.once(selector.getChannel('DESELECTED'), callback);

				selector._deselect([1], settingsTarget);
			},

			Should_EmitSaveForDeselection_When_DeselectSeveralItems: function() {

				var dfd = this.async(timeout);

				selector._select([1, 2, 3], target);

				assert.strictEqual(selector._getTotal(target), 3, 'El total antes del deselect debe ser igual a 3');

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.lengthOf(evt.data.ids, 3, 'El array de items debe tener longitud 3');
					assert.strictEqual(evt.data.action, 'deselect',
						'La acción para guardar debe ser la de seleccionar');
				}));

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: target,
					items: [1, 2, 3]
				});
			},

			Should_EmitSaveForSettingsDeselection_When_DeselectSeveralItems: function() {

				var dfd = this.async(timeout);

				selector._select([1, 2, 3], settingsTarget);

				assert.strictEqual(selector._getTotal(settingsTarget), 3,
					'El total antes del deselect debe ser igual a 3');

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.lengthOf(evt.data.selection, 3, 'El array de items debe tener longitud 3');
				}));

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: settingsTarget,
					items: [1, 2, 3]
				});
			},

			Should_NotHaveItemsInSelection_When_PublishDeselectedForMultipleLocalSelection: function() {

				var dfd = this.async(timeout);

				Mediator.publish(selector.getChannel('SELECT'), {
					target: localTarget,
					items: [1, 2, 3]
				});

				Mediator.once(selector.getChannel('DESELECTED'), dfd.callback(function(res) {

					assert.includeMembers(res.ids, ['1', '2', '3'],
						'Los items seleccionados deben tener como ids las cadenas correspondientes a sus id');

					assert.notOk(selector.selections[localTarget].items[1],
						'El item con id 1 debe estar seleccionado');

					assert.notOk(selector.selections[localTarget].items[2],
						'El item con id 2 debe estar deseleccionado');

					assert.notOk(selector.selections[localTarget].items[3],
						'El item con id 3 debe estar deseleccionado');
				}));

				assert.ok(selector.selections[localTarget].items[1],
					'El item con id 1 debe estar previamente seleccionado');

				assert.ok(selector.selections[localTarget].items[2],
					'El item con id 2 debe estar seleccionado');

				assert.ok(selector.selections[localTarget].items[3],
					'El item con id 3 debe estar seleccionado');

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: localTarget,
					items: [1, 2, 3]
				});
			},

			Should_PublishSelectedGroup_When_ReceiveGroupSelectedRequest: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, target);

				Mediator.once(selector.getChannel('SELECTED_GROUP'), dfd.callback(function(res) {

					var selection = res.selection;

					assert.strictEqual(res.target, target, 'El target del servicio no corresponde con el enviado');

					assert.lengthOf(Object.keys(selection), 2, 'El total de seleccionados recibido no es el esperado');
					assert.ok(selection[1], 'El item con id 1 no está seleccionado');
					assert.ok(selection[2], 'El item con id 2 no está seleccionado');
				}));

				Mediator.publish(selector.getChannel('GROUP_SELECTED'), {
					target: target
				});
			},

			Should_PublishSelectedGroup_When_ReceiveSettingsGroupSelectedRequest: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, settingsTarget);

				Mediator.once(selector.getChannel('SELECTED_GROUP'), dfd.callback(function(res) {

					var selection = res.selection;

					assert.strictEqual(res.target, settingsTarget,
						'El target del servicio no corresponde con el enviado');

					assert.lengthOf(Object.keys(selection), 2, 'El total de seleccionados recibido no es el esperado');
					assert.ok(selection[1], 'El item con id 1 no está seleccionado');
					assert.ok(selection[2], 'El item con id 2 no está seleccionado');
				}));

				Mediator.publish(selector.getChannel('GROUP_SELECTED'), {
					target: settingsTarget
				});
			},

			Should_PublishSelectedGroup_When_ReceiveLocalGroupSelectedRequest: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, localTarget);

				Mediator.once(selector.getChannel('SELECTED_GROUP'), dfd.callback(function(res) {

					var selection = res.selection;

					assert.strictEqual(res.target, localTarget,
						'El target del servicio no corresponde con el enviado');

					assert.lengthOf(Object.keys(selection), 2, 'El total de seleccionados recibido no es el esperado');
					assert.ok(selection[1], 'El item con id 1 no está seleccionado');
					assert.ok(selection[2], 'El item con id 2 no está seleccionado');
				}));

				Mediator.publish(selector.getChannel('GROUP_SELECTED'), {
					target: localTarget
				});
			},

			Should_EmitSaveForClearSelection_When_ClearSelectionByTarget: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, target);

				selector._onceEvt('SAVE', dfd.callback(function(evt) {

					assert.strictEqual(evt.data.action, 'clearSelection',
						'La acción para guardar debe ser la de limpiar selección');
				}));

				Mediator.publish(selector.getChannel('CLEAR_SELECTION'), {
					target: target
				});
			},

			Should_EmitSaveForClearSelection_When_ClearSelectionBySettingsTarget: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, settingsTarget);

				selector._onceEvt('SAVE', dfd.callback(function(evt) {}));

				Mediator.publish(selector.getChannel('CLEAR_SELECTION'), {
					target: settingsTarget
				});
			},

			Should_PublishSelectionCleared_When_ClearSelectionByLocalTarget: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, localTarget);

				Mediator.once(selector.getChannel('SELECTION_CLEARED'), dfd.callback(function(res) {

					assert.isEmpty(selector.selections[localTarget].items,
						'Los elementos seleccionados no se han limpiado correctamente');
				}));

				Mediator.publish(selector.getChannel('CLEAR_SELECTION'), {
					target: localTarget
				});
			}
		}
	});
});
