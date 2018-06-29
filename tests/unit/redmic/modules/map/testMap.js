define([
	"dojo/_base/declare"
	, "redmic/base/Mediator"
	, "redmic/map/OpenLayers"
	, "redmic/modules/map/LeafletImpl"
	, "redmic/modules/map/Map"
], function(
	declare
	, Mediator
	, OpenLayers
	, Leaflet
	, Map
){
	var timeout, map, newLayer1, newLayer2,
		newBaseLayer, newCenter, newZoom;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Map tests", {
		before: function() {
			timeout = 10;
			map = new declare([Leaflet, Map])();
			newLayer1 = OpenLayers.get("grid5000");
			newLayer2 = OpenLayers.get("grid1000");
			newBaseLayer = OpenLayers.get("topografico");
			newCenter = L.latLng(20, -20);
			newZoom = 15;
		},

		afterEach: function() {
			map.clear();
		},

		after: function() {
			Mediator.publish(map.getChannel("DISCONNECT"));
		},

		tests: {
			"Map creation": function() {
				assert.ok(map.map, "El mapa no se ha creado correctamente.");
			},

			"AddLayer subscription": function() {
				var layerLength = Object.keys(map.map._layers).length;

				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});

				assert.notStrictEqual(Object.keys(map.map._layers).length, layerLength,
					"El mapa tiene el mismo número de capas a pesar de haber mandado a añadir una nueva."
				);
			},

			"AddLayer with optional layer": function() {
				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1,
					optional: true
				});

				var controlLayerLength = Object.keys(map.controlLayers._layers).length;

				assert.strictEqual(controlLayerLength, Object.keys(map.layers).length,
					"El número de capas opcionales registradas no coincide con las que tiene el controlador."
				);
			},

			"LayerAdded publication": function() {
				var dfd = this.async(timeout);

				Mediator.once(map.getChannel("LAYERADDED"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se añadió una capa.");
					assert.deepEqual(obj.layer, newLayer1,
						"El canal informa de que se añadió una capa, pero no se recibe la esperada.");
					assert.deepEqual(map.layers[newLayer1.options.id].layer, newLayer1,
						"La capa no se registró en nuestra estructura correctamente.");
				}), {}, this);

				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});
			},

			"LayerAdded publication with duplicated layer": function() {
				var dfd = this.async(timeout);

				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});

				Mediator.once(map.getChannel("LAYERADDED"),
					dfd.callback(function(obj) {
					assert.notOk(obj.success, "El canal informa de que se añadió una capa duplicada.");
					assert.deepEqual(obj.layer, newLayer1,
						"El canal no devuelve la capa correcta que falló al añadirse.");
				}), {}, this);

				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});
			},

			"RemoveLayer subscription": function() {
				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});

				var layerLength = Object.keys(map.map._layers).length;

				Mediator.publish(map.getChannel("REMOVELAYER"), {
					layer: newLayer1
				});

				assert.notStrictEqual(Object.keys(map.map._layers).length, layerLength,
					"El mapa tiene el mismo número de capas a pesar de haber mandado a eliminar una existente."
				);
			},

			"LayerRemoved publication": function() {
				var dfd = this.async(timeout);

				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});

				Mediator.once(map.getChannel("LAYERREMOVED"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se eliminó una capa.");
					assert.deepEqual(obj.layer, newLayer1,
						"El canal informa de que se eliminó una capa, pero no se recibe la esperada.");
					assert.isUndefined(map.layers[newLayer1.options.id],
						"La capa sigue registrada en nuestra estructura tras haberse eliminado.");
				}), {}, this);

				Mediator.publish(map.getChannel("REMOVELAYER"), {
					layer: newLayer1
				});
			},

			"LayerRemoved publication with a layer not loaded in map": function() {
				var dfd = this.async(timeout);

				Mediator.publish(map.getChannel("ADDLAYER"), {
					layer: newLayer1
				});

				Mediator.once(map.getChannel("LAYERREMOVED"),
					dfd.callback(function(obj) {
					assert.notOk(obj.success, "El canal informa de que se eliminó una capa no presente.");
					assert.deepEqual(obj.layer, newLayer2,
						"El canal no devuelve la capa correcta que falló al eliminarse.");
				}), {}, this);

				Mediator.publish(map.getChannel("REMOVELAYER"), {
					layer: newLayer2
				});
			},

			"ChangeBaseLayer subscription": function() {
				assert.notOk(map.map.hasLayer(newBaseLayer), "El mapa ya tenía la capa base deseada.");

				Mediator.publish(map.getChannel("CHANGEBASELAYER"), {
					layer: newBaseLayer
				});

				assert.ok(map.map.hasLayer(newBaseLayer),
					"El mapa no tiene la nueva capa base a pesar de haber mandado a cambiarla.");
			},

			"BaseLayerChanged publication": function() {
				var dfd = this.async(timeout);

				Mediator.once(map.getChannel("BASELAYERCHANGED"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se cambió la capa base.");
					assert.strictEqual(obj.baseLayer.options.id, newBaseLayer.options.id,
						"El canal informa de que se cambió la capa base, pero no se recibe la esperada.");
					assert.notOk(map.hasLayer(map.layers[map.defaultBaseLayer].layer),
						"El mapa sigue teniendo cargada otra capa base.");
				}), {}, this);

				Mediator.publish(map.getChannel("CHANGEBASELAYER"), {
					layer: newBaseLayer
				});
			},

			"BaseLayerChanged publication with invalid layer": function() {
				var dfd = this.async(timeout),
					wrongLayerId = "inventado";

				Mediator.once(map.getChannel("BASELAYERCHANGED"),
					dfd.callback(function(obj) {
					assert.notOk(obj.success, "El canal informa de que se cambió a una capa base inexistente.");
					assert.deepEqual(obj.baseLayer, wrongLayerId,
						"El canal no devuelve la capa correcta que falló al añadirse.");
				}), {}, this);

				Mediator.publish(map.getChannel("CHANGEBASELAYER"), {
					layer: wrongLayerId
				});
			},

			"BaseLayerChanged publication with duplicated layer": function() {

				Mediator.publish(map.getChannel("CHANGEBASELAYER"), {
					layer: newBaseLayer
				});

				var dfd = this.async(timeout),
					layerCount = Object.keys(map.layers).length;

				Mediator.once(map.getChannel("BASELAYERCHANGED"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se cambió la capa base.");
					assert.strictEqual(Object.keys(map.layers).length, layerCount,
						"El mapa fue capaz de cargar 2 veces la misma capa base, duplicándola.");
				}), {}, this);

				Mediator.publish(map.getChannel("CHANGEBASELAYER"), {
					layer: newBaseLayer
				});
			},

			"SetCenter subscription": function() {
				var center = map.map.getCenter();

				assert.notStrictEqual(center, newCenter, "El centro del mapa ya estaba donde queremos colocarlo.");

				Mediator.publish(map.getChannel("SETCENTER"), newCenter);

				assert.deepEqual(map.map.getCenter(), newCenter,
					"El centro del mapa no se ha actualizado correctamente.");
			},

			"CenterSet publication": function() {
				var dfd = this.async(timeout);

				Mediator.once(map.getChannel("CENTERSET"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se centró el mapa.");
					assert.deepEqual(obj.latLng, newCenter,
						"El canal informa de que se centró el mapa, pero no se recibe el punto esperado.");
				}), {}, this);

				Mediator.publish(map.getChannel("SETCENTER"), newCenter);
			},

			"SetZoom subscription": function() {
				var zoom = map.map.getZoom();

				assert.notStrictEqual(zoom, newZoom, "El zoom del mapa ya estaba en el valor deseado.");

				Mediator.publish(map.getChannel("SETZOOM"), newZoom);

				assert.deepEqual(map.map.getZoom(), newZoom,
					"El zoom del mapa no se ha actualizado correctamente.");
			},

			"ZoomSet publication": function() {
				var dfd = this.async(timeout);

				Mediator.once(map.getChannel("ZOOMSET"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se cambió el zoom del mapa.");
					assert.deepEqual(obj.zoom, newZoom,
						"El canal informa de que se cambió el zoom, pero no se recibe el valor esperado.");
				}), {}, this);

				Mediator.publish(map.getChannel("SETZOOM"), newZoom);
			},

			"SetCenterAndZoom subscription": function() {
				var center = map.map.getCenter(),
					zoom = map.map.getZoom();

				assert.notStrictEqual(center, newCenter, "El centro del mapa ya estaba donde queremos colocarlo.");
				assert.notStrictEqual(zoom, newZoom, "El zoom del mapa ya estaba en el valor deseado.");

				Mediator.publish(map.getChannel("SETCENTERANDZOOM"), {
					center: newCenter,
					zoom: newZoom
				});

				assert.deepEqual(map.map.getCenter(), newCenter,
					"El centro del mapa no se ha actualizado correctamente.");
				assert.deepEqual(map.map.getZoom(), newZoom,
					"El zoom del mapa no se ha actualizado correctamente.");
			},

			"CenterSet publication after setCenterAndZoom publication": function() {
				var dfd = this.async(timeout);

				Mediator.once(map.getChannel("CENTERSET"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se centró el mapa.");
					assert.deepEqual(obj.latLng, newCenter,
						"El canal informa de que se centró el mapa, pero no se recibe el punto esperado.");
				}), {}, this);

				Mediator.publish(map.getChannel("SETCENTERANDZOOM"), {
					center: newCenter,
					zoom: newZoom
				});
			},

			"ZoomSet publication after setCenterAndZoom publication": function() {
				var dfd = this.async(timeout);

				Mediator.once(map.getChannel("ZOOMSET"),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El canal informa de que no se cambió el zoom del mapa.");
					assert.deepEqual(obj.zoom, newZoom,
						"El canal informa de que se cambió el zoom, pero no se recibe el valor esperado.");
				}), {}, this);

				Mediator.publish(map.getChannel("SETCENTERANDZOOM"), {
					center: newCenter,
					zoom: newZoom
				});
			}
		}
	});

});
