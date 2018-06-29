define([
	"redmic/map/OpenLayers"
], function(
	OpenLayers
){
	var baseLayer, wrongBaseLayer;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("OpenLayers tests", {
		before: function() {

			baseLayer = "redmic";
			wrongBaseLayer = "juanito";
		},

		tests: {
			"Get layer": function() {

				assert.ok(OpenLayers.get(baseLayer), "El generador no devuelve una nueva capa base.");
			},

			"Get wrong layer": function() {

				assert.notOk(OpenLayers.get(wrongBaseLayer), "El generador devuelve una nueva capa base inexistente.");
			},

			"GetAllBaseLayers": function() {

				var baseLayers = OpenLayers.getAllBaseLayers();

				assert.isAbove(Object.keys(baseLayers).length, 2, 'No se han generado las suficientes capas base');
				for (var key in baseLayers) {
					assert.ok(baseLayers[key], "El generador no devuelve la capa base '" + key + "'.");
				}
			},

			"Layer props": function() {

				var baseLayers = OpenLayers.getAllBaseLayers();

				for (var key in baseLayers) {
					var newBaseLayer = baseLayers[key],
						layerLabel = newBaseLayer.label,
						layerInstance = newBaseLayer.instance,
						layerOptions = layerInstance.options;

					assert.ok(layerInstance, "La capa '" + key + "' generada no contiene instancia.");
					assert.ok(layerOptions, "La capa '" + key + "' generada no contiene el atributo 'options'.");
					assert.ok(layerLabel, "La capa '" + key + "' generada no contiene el atributo 'label'.");
				}
			}
		}
	});

});
