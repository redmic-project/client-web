define([
	'src/utils/Mediator'
	, 'redmic/modules/map/LeafletImpl'
], function(
	Mediator
	, LeafletImpl
) {

	var timeout, map, newLayer1, newLayer2, newBaseLayerName, newCenter, newZoom;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('LeafletImpl tests', {

		before: function() {

			map = new LeafletImpl({
				parentChannel: 'test'
			});

			timeout = 10;
			newLayer1 = map._getStaticLayerInstance('grid5000m');
			newLayer2 = map._getStaticLayerInstance('grid1000m');
			newBaseLayerName = 'topografico';
			newCenter = L.latLng(28, -16);
			newZoom = 15;
		},

		afterEach: function() {

			map.clear();
		},

		after: function() {

			Mediator.publish(map.getChannel('DESTROY'));
		},

		tests: {
			'Should_CreateInnerMapProperty_When_ModuleInitializes': function() {

				assert.ok(map.map, 'La instancia del mapa no se ha creado correctamente');
			},

			'Should_ObtainNewLayerInstance_When_MapIsAskedTo': function() {

				assert.ok(map._getStaticLayerInstance(newBaseLayerName),
					'El mapa no devuelve una nueva instancia de la capa solicitada');
			},

			'Should_ObtainAllBaseLayerKeysAndValidInstances_When_MapIsAskedTo': function() {

				var baseLayerKeys = map._getBaseLayers();

				assert.isAbove(baseLayerKeys.length, 2, 'No se han devuelto las suficientes capas base');

				for (var i = 0; i < baseLayerKeys.length; i++) {
					var baseLayerKey = baseLayerKeys[i],
						baseLayerInstance = map._getStaticLayerInstance(baseLayerKey);

					assert.ok(baseLayerInstance, 'La capa base "' + baseLayerKey + '" no se ha instanciado');
					assert.ok(baseLayerInstance._url,
						'La instancia de la capa base "' + baseLayerKey + '" no contiene el atributo "_url"');

					assert.ok(baseLayerInstance.options,
						'La instancia de la capa base "' + baseLayerKey + '" no contiene el atributo "options"');
				}
			},

			'Should_ObtainAllOptionalLayerKeysAndValidInstances_When_MapIsAskedTo': function() {

				var optionalLayerKeys = map._getOptionalLayers();

				assert.isAtLeast(optionalLayerKeys.length, 1, 'No se han devuelto las suficientes capas opcionales');

				for (var i = 0; i < optionalLayerKeys.length; i++) {
					var optionalLayerKey = optionalLayerKeys[i],
						optionalLayerInstance = map._getStaticLayerInstance(optionalLayerKey);

					assert.ok(optionalLayerInstance,
						'La capa opcional "' + optionalLayerKey + '" no se ha instanciado');

					assert.ok(optionalLayerInstance._url,
						'La instancia de la capa opcional "' + optionalLayerKey + '" no contiene el atributo "_url"');

					assert.ok(optionalLayerInstance.options,
						'La instancia de la capa opcional "' + optionalLayerKey + '" no contiene el atributo "options"');
				}
			},

			'Should_FindNewLayerLoaded_When_AddLayerIsPublished': function() {

				var prevLayersCount = Object.keys(map.map._layers).length;

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1
				});

				var currLayersCount = Object.keys(map.map._layers).length;

				assert.notStrictEqual(prevLayersCount, currLayersCount,
					'El mapa tiene el mismo número de capas a pesar de haber mandado a añadir una nueva');
			},

			'Should_FindNewOptionalLayerLoaded_When_AddLayerWithOptionalPropIsPublished': function() {

				var prevOptionalLayersCount = Object.keys(map._layersSelectorInstance._layers).length;

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1,
					optional: true
				});

				var currOptionalLayersCount = Object.keys(map._layersSelectorInstance._layers).length;

				assert.notStrictEqual(prevOptionalLayersCount, currOptionalLayersCount,
					'El número de capas opcionales registradas no ha cambiado tras añadir una nueva');
			},

			'Should_NotFindNewOptionalLayerLoaded_When_AddLayerWithoutOptionalPropIsPublished': function() {

				var prevOptionalLayersCount = Object.keys(map._layersSelectorInstance._layers).length;

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1
				});

				var currOptionalLayersCount = Object.keys(map._layersSelectorInstance._layers).length;

				assert.strictEqual(prevOptionalLayersCount, currOptionalLayersCount,
					'El número de capas opcionales registradas ha cambiado tras añadir una nueva que no lo era');
			},

			'Should_RemoveAllAddedLayers_When_MapIsCleared': function() {

				var prevLayersCount = Object.keys(map.map._layers).length;

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1,
					optional: true
				});

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer2
				});

				var currLayersCount = Object.keys(map.map._layers).length;

				assert.strictEqual(currLayersCount, prevLayersCount + 2,
					'El número de capas añadidas no es el esperado');

				map.clear();

				var finalLayersCount = Object.keys(map.map._layers).length;

				assert.strictEqual(finalLayersCount, prevLayersCount,
					'El número de capas no es el mismo que al principio tras llamar a "clear"');
			},

			'Should_PublishLayerAdded_When_LayerIsAdded': function() {

				var dfd = this.async(timeout);

				Mediator.once(map.getChannel('LAYER_ADDED'), dfd.callback(function(obj) {

					assert.deepEqual(obj.layer, newLayer1,
						'El mapa informa de que se añadió una capa, pero no se recibe la esperada');
				}), {}, this);

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1
				});
			},

			'Should_NotFindAddedLayer_When_LayerIsRemoved': function() {

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1
				});

				var prevLayersCount = Object.keys(map.map._layers).length;

				Mediator.publish(map.getChannel('REMOVE_LAYER'), {
					layer: newLayer1
				});

				var currLayersCount = Object.keys(map.map._layers).length;

				assert.notStrictEqual(currLayersCount, prevLayersCount,
					'El mapa tiene el mismo número de capas a pesar de haber mandado a eliminar una existente');
			},

			'Should_PublishLayerRemoved_When_LayerIsRemoved': function() {

				var dfd = this.async(timeout);

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1
				});

				Mediator.once(map.getChannel('LAYER_REMOVED'), dfd.callback(function(obj) {

					assert.ok(obj.success, 'El mapa informa de que no se eliminó la capa');
					assert.deepEqual(obj.layer, newLayer1,
						'El mapa informa de que se eliminó una capa, pero no se recibe la esperada');
				}), {}, this);

				Mediator.publish(map.getChannel('REMOVE_LAYER'), {
					layer: newLayer1
				});
			},

			'Should_PublishLayerRemovedWithError_When_TryToRemoveMissingLayer': function() {

				var dfd = this.async(timeout);

				Mediator.publish(map.getChannel('ADD_LAYER'), {
					layer: newLayer1
				});

				Mediator.once(map.getChannel('LAYER_REMOVED'), dfd.callback(function(obj) {

					assert.notOk(obj.success, 'El mapa informa de que se eliminó una capa no presente');
					assert.deepEqual(obj.layer, newLayer2, 'El mapa no devuelve la capa que falló al eliminar');
				}), {}, this);

				Mediator.publish(map.getChannel('REMOVE_LAYER'), {
					layer: newLayer2
				});
			},

			'Should_UpdateBaseLayer_When_ChangeBaseLayerIsPublished': function() {

				var defaultBaseLayerInstance = map._baseLayerInstances[map._baseLayerKeys[0]],
					newBaseLayerInstance = map._baseLayerInstances[newBaseLayerName];

				assert.ok(newBaseLayerInstance, 'El mapa no posee instancia para la nueva capa base');
				assert.notOk(map.map.hasLayer(newBaseLayerInstance), 'El mapa ya tenía cargada la nueva capa base');

				Mediator.publish(map.getChannel('CHANGE_BASE_LAYER'), {
					layer: newBaseLayerName
				});

				assert.ok(map.map.hasLayer(newBaseLayerInstance), 'El mapa no tiene cargada la nueva capa base');
				assert.notOk(map.map.hasLayer(defaultBaseLayerInstance), 'El mapa tiene cargada la anterior capa base');
			},

			'Should_PublishBaseLayerChanged_When_BaseLayerWasChanged': function() {

				var dfd = this.async(timeout);

				Mediator.once(map.getChannel('BASE_LAYER_CHANGED'), dfd.callback(function(obj) {

					assert.ok(obj.success, 'El mapa indica que no se pudo cambiar la capa base');

					var newBaseLayerInstance = map._baseLayerInstances[newBaseLayerName];
					assert.deepEqual(obj.baseLayer, newBaseLayerInstance,
						'El mapa informa de que se cambió la capa base, pero no se recibe la esperada');
				}), {}, this);

				Mediator.publish(map.getChannel('CHANGE_BASE_LAYER'), {
					layer: newBaseLayerName
				});
			},

			'Should_PublishBaseLayerChangedWithError_When_TriedToChangeToWrongBaseLayer': function() {

				var dfd = this.async(timeout),
					wrongLayerId = 'inventado';

				Mediator.once(map.getChannel('BASE_LAYER_CHANGED'), dfd.callback(function(obj) {

					assert.notOk(obj.success, 'El mapa informa de que se pudo cambiar a una capa base inexistente');
					assert.deepEqual(obj.layerId, wrongLayerId,
						'El mapa no devuelve el identificador de la capa que no pudo encontrar');
				}), {}, this);

				Mediator.publish(map.getChannel('CHANGE_BASE_LAYER'), {
					layer: wrongLayerId
				});
			},

			'Should_UpdateMapPosition_When_SetCenterPublished': function() {

				var prevCenter = map.map.getCenter();

				assert.notStrictEqual(prevCenter, newCenter, 'El mapa ya estaba en la nueva posición');

				Mediator.publish(map.getChannel('SET_CENTER'), {
					center: newCenter
				});

				var currCenter = map.map.getCenter();

				assert.notDeepEqual(prevCenter, currCenter, 'El mapa no ha cambiado respecto a la posición inicial');
			},

			'Should_PublishCenterSet_When_CenterWasChanged': function() {

				var dfd = this.async(timeout);

				Mediator.once(map.getChannel('CENTER_SET'), dfd.callback(function(obj) {

					assert.deepEqual(obj.latLng, newCenter,
						'El mapa informa de que se centró el mapa, pero no se recibe el centro esperado');
				}), {}, this);

				Mediator.publish(map.getChannel('SET_CENTER'), {
					center: newCenter
				});
			},

			'Should_UpdateMapZoom_When_SetZoomPublished': function() {

				var prevZoom = map.map.getZoom();

				assert.notStrictEqual(prevZoom, newZoom, 'El mapa ya estaba en el valor de zoom deseado');

				Mediator.publish(map.getChannel('SET_ZOOM'), {
					zoom: newZoom
				});

				var currZoom = map.map.getZoom();

				assert.strictEqual(currZoom, newZoom, 'El zoom del mapa no se ha actualizado correctamente');
			},

			'Should_PublishZoomSet_When_ZoomWasChanged': function() {

				var dfd = this.async(timeout);

				Mediator.once(map.getChannel('ZOOM_SET'), dfd.callback(function(obj) {

					assert.deepEqual(obj.zoom, newZoom,
						'El mapa informa de que se cambió el zoom, pero no se recibe el valor esperado');
				}), {}, this);

				Mediator.publish(map.getChannel('SET_ZOOM'), {
					zoom: newZoom
				});
			},

			'Should_UpdateMapPositionAndZoom_When_SetCenterAndZoomPublished': function() {

				var prevCenter = map.map.getCenter(),
					prevZoom = map.map.getZoom();

				assert.notStrictEqual(prevCenter, newCenter, 'El mapa ya estaba en la nueva posición');
				assert.notStrictEqual(prevZoom, newZoom, 'El mapa ya estaba en el valor de zoom deseado');

				Mediator.publish(map.getChannel('SET_CENTER_AND_ZOOM'), {
					center: newCenter,
					zoom: newZoom
				});

				var currCenter = map.map.getCenter(),
					currZoom = map.map.getZoom();

				assert.notDeepEqual(prevCenter, currCenter, 'El mapa no ha cambiado respecto a la posición inicial');
				assert.strictEqual(currZoom, newZoom, 'El zoom del mapa no se ha actualizado correctamente');
			},

			'Should_PublishCenterSet_When_SetCenterAndZoomPublished': function() {

				var dfd = this.async(timeout);

				Mediator.once(map.getChannel('CENTER_SET'), dfd.callback(function(obj) {

					assert.deepEqual(obj.latLng, newCenter,
						'El mapa informa de que se centró el mapa, pero no se recibe el centro esperado');
				}), {}, this);

				Mediator.publish(map.getChannel('SET_CENTER_AND_ZOOM'), {
					center: newCenter,
					zoom: newZoom
				});
			},

			'Should_PublishZoomSet_When_SetCenterAndZoomPublished': function() {

				var dfd = this.async(timeout);

				Mediator.once(map.getChannel('ZOOM_SET'), dfd.callback(function(obj) {

					assert.deepEqual(obj.zoom, newZoom,
						'El mapa informa de que se cambió el zoom, pero no se recibe el valor esperado');
				}), {}, this);

				Mediator.publish(map.getChannel('SET_CENTER_AND_ZOOM'), {
					center: newCenter,
					zoom: newZoom
				});
			}
		}
	});
});
