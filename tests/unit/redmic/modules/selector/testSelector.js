define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/base/Mediator'
	, 'redmic/modules/selector/Selector'

], function(
	declare
	, lang
	, Mediator
	, Selector
){
	var timeout = 100,
		target = '{apiUrl}/data',
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

				assert(selector.selections, 'La estructura de seleccionados no se ha creado correctamente');
			},

			Should_EmitSaveForSelection_When_SelectItem: function() {

				var dfd = this.async(timeout);

				selector._onceEvt('SAVE', function(evt) {

					assert.include(evt.data.ids, 1, 'El item seleccionado debe tener id 1');
					assert.strictEqual(evt.data.action, 'select', 'La acción para guardar debe ser la de seleccionar');

					dfd.resolve();
				});

				Mediator.publish(selector.getChannel('SELECT'), {
					target: target,
					items: 1
				});
			},

			Should_OmitSaveForSelectionEmission_When_SelectAlreadySelectedItem : function() {

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

			Should_EmitSaveForSelection_When_SelectSeveralItems: function() {

				var dfd = this.async(timeout);

				selector._onceEvt('SAVE', function(evt) {

					assert.lengthOf(evt.data.ids, 3, 'El array de items debe tener longitud 3');
					assert.strictEqual(evt.data.action, 'select', 'La acción para guardar debe ser la de seleccionar');

					dfd.resolve();
				});

				Mediator.publish(selector.getChannel('SELECT'), {
					target: target,
					items: [1, 2, 3]
				});
			},

			Should_EmitSaveForDeselection_When_DeselectItem: function() {

				var dfd = this.async(timeout);

				Mediator.publish(selector.getChannel('SELECT'), {
					target: target,
					items: 1
				});

				selector._onceEvt('SAVE', function(evt) {

					assert.include(evt.data.ids, 1, 'El item deseleccionado debe tener id 1');
					assert.strictEqual(evt.data.action, 'deselect', 'La acción para guardar debe ser la de deseleccionar');

					dfd.resolve();
				});

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: target,
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

			Should_EmitSaveForDeselection_When_DeselectSeveralItems: function() {

				var dfd = this.async(timeout);

				selector._select([1, 2, 3], target);

				assert.strictEqual(selector._getTotal(target), 3, 'El total antes del deselect debe ser igual a 3');

				selector._onceEvt('SAVE', function(evt) {

					assert.lengthOf(evt.data.ids, 3, 'El array de items debe tener longitud 3');
					assert.strictEqual(evt.data.action, 'deselect', 'La acción para guardar debe ser la de seleccionar');

					dfd.resolve();
				});

				Mediator.publish(selector.getChannel('DESELECT'), {
					target: target,
					items: [1, 2, 3]
				});
			},

			Should_PublishSelectedGroup_When_ReceiveGroupSelectedRequest: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, target);

				Mediator.once(selector.getChannel('SELECTED_GROUP'), function(res) {

					var selection = res.selection;

					assert.strictEqual(res.target, target, 'El target del servicio no corresponde con el enviado');

					assert.lengthOf(Object.keys(selection), 2, 'El total de seleccionados recibido no es el esperado');
					assert(selection[1], 'El item con id 1 no está seleccionado');
					assert(selection[2], 'El item con id 2 no está seleccionado');

					dfd.resolve();
				});

				Mediator.publish(selector.getChannel('GROUP_SELECTED'), {
					target: target
				});
			},

			Should_EmitSaveForClearSelection_When_ClearSelectionByTarget: function() {

				var dfd = this.async(timeout),
					selectionArray = [1, 2];

				selector._select(selectionArray, target);

				selector._onceEvt('SAVE', function(evt) {

					assert.strictEqual(evt.data.action, 'clearSelection',
						'La acción para guardar debe ser la de limpiar selección');

					dfd.resolve();
				});

				Mediator.publish(selector.getChannel('CLEAR_SELECTION'), {
					selectionTarget: target
				});
			}
		}
	});
});
