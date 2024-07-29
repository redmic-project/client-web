define([
	"src/component/model/model/attr/RelationAttr"
	, "../_ModelTestCommons"
], function(
	RelationAttr
	, _ModelTestCommons
){
	var relationAttr, schema, value, newValue,
		timeout = 100;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("RelationAttr generic tests", {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 16,
				name: "prueba"
			};

			newValue = {
				id: 2,
				name: "prueba2"
			};

			schema = {
				type: "integer",
				url: "activity"
			};

			relationAttr = new RelationAttr();
			relationAttr.build(schema).then(dfd.callback(function() {

				relationAttr.deserialize(value, true);
			}));
		},

		beforeEach: function() {

			relationAttr.reset();
		},

		tests: {
			"check getter with existing property": function() {

				assert.isOk(relationAttr.get("name"), "La propiedad pedida no existe, pero debería");
			},

			"check getter with non-existing property": function() {

				assert.isUndefined(relationAttr.get("missingProperty"), "La propiedad perdida existe, pero no debería");
			},

			"check setter": function() {

				assert.isFalse(relationAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				relationAttr.set("value", newValue);
				assert.strictEqual(relationAttr.get("value"), newValue.id,
					"El getter de value no devuelve el valor seteado");

				assert.strictEqual(relationAttr.get("id"), newValue.id,
					"El getter de value no devuelve la propiedad seteada correspondiente al value");

				assert.strictEqual(relationAttr.get("name"), newValue.name,
					"El getter de value no devuelve la propiedad seteada");

				assert.isTrue(relationAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				relationAttr.clear();

				relationAttr.set("value", 0);
				assert.strictEqual(relationAttr.get("value"), 0, "El getter de value no devuelve el valor 0 seteado");

				assert.strictEqual(relationAttr.get("id"), 0,
					"El getter de value no devuelve la propiedad seteada correspondiente al valor 0");

				assert.isNull(relationAttr.get("name"),
					"El getter de value devuelve una propiedad no seteada");
			},

			"check deserialize": function() {

				relationAttr.deserialize(newValue);
				assert.strictEqual(relationAttr.get("value"), newValue.id, "Deserialize no ha propagado el valor");
				assert.strictEqual(relationAttr.get("id"), newValue.id,
					"Deserialize no ha propagado el valor de la propiedad correspondiente al value");

				assert.strictEqual(relationAttr.get("name"), newValue.name,
					"Deserialize no ha propagado el valor de la propiedad");

				relationAttr.reset();
				assert.strictEqual(relationAttr.get("value"), value.id,
					"El valor no ha vuelto a su estado inicial antes de cambiarlo con deserialize hacia valor inicial");

				relationAttr.deserialize(newValue, true);
				assert.strictEqual(relationAttr.get("value"), newValue.id, "Deserialize no ha propagado el valor");
				assert.strictEqual(relationAttr.get("_initValue"), newValue.id,
					"Deserialize no ha propagado el valor inicial");

				assert.strictEqual(relationAttr._initAdditionalProperties.id, newValue.id,
					"Deserialize no ha propagado el valor inicial de la propiedad");

				assert.strictEqual(relationAttr._initAdditionalProperties.name, newValue.name,
					"Deserialize no ha propagado el valor inicial de la propiedad");

				relationAttr.deserialize(value, true);
			},

			"check serialize": function() {

				var serialized = relationAttr.serialize();

				assert.strictEqual(serialized, relationAttr.get("value"),
					"Serialize no devuelve el mismo valor que el getter de value");

				assert.strictEqual(serialized, value.id, "Serialize no ha devuelto el valor almacenado");
			},

			"check reset": function() {

				assert.isFalse(relationAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				relationAttr.deserialize(newValue);
				assert.isTrue(relationAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				relationAttr.reset();
				assert.strictEqual(relationAttr.get("value"), value.id,
					"Reset no ha restaurado la instancia al valor original");

				assert.strictEqual(relationAttr.get("name"), value.name,
					"Reset no ha restaurado la instancia al valor de propiedad original");

				assert.strictEqual(relationAttr.get("id"), value.id,
					"Reset no ha restaurado la instancia al valor de propiedad correspondiente al value original");

				assert.isFalse(relationAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras resetear");
			},

			"check clear": function() {

				assert.isFalse(relationAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				relationAttr.set("value", newValue);
				assert.isTrue(relationAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				relationAttr.clear();
				assert.strictEqual(relationAttr.get("value"), null, "Clear no ha limpiado el valor");
				assert.strictEqual(relationAttr.get("name"), null,
					"Clear no ha limpiado el valor de la propiedad");

				assert.strictEqual(relationAttr.get("id"), null,
					"Clear no ha limpiado el valor de la propiedad correspondiente al value");

				assert.isTrue(relationAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras limpiar");
			},

			"check validate": function() {

				assert.strictEqual(relationAttr.get("schema"), schema, "El schema original se ha modificado");

				// Valores permitidos

				assert.isTrue(relationAttr.get("isValid"), "El modelo cree que el valor no es válido");

				relationAttr.set("value", newValue);
				assert.isTrue(relationAttr.get("isValid"), "La validación falla con un valor válido");

				relationAttr.reset();

				relationAttr.set("value", newValue.id);
				assert.isTrue(relationAttr.get("isValid"), "La validación falla con un valor simple pero válido");

				relationAttr.set("value", 0);
				assert.isTrue(relationAttr.get("isValid"), "La validación falla con valor 0");

				relationAttr.reset();

				// Valores no permitidos

				relationAttr.set("value", newValue.id.toString());
				assert.isFalse(relationAttr.get("isValid"), "La validación no falla con un valor de tipo string");

				relationAttr.set("value", null);
				assert.isFalse(relationAttr.get("isValid"), "La validación no falla con un valor nulo");

				relationAttr.set("value", undefined);
				assert.isFalse(relationAttr.get("isValid"), "La validación no falla con un valor indefinido");

				relationAttr.set("value", {});
				assert.isFalse(relationAttr.get("isValid"), "La validación no falla con un valor objeto vacío");

				relationAttr.set("value", "");
				assert.isFalse(relationAttr.get("isValid"), "La validación no falla con valor cadena vacía");

				relationAttr.set("value", []);
				assert.isFalse(relationAttr.get("isValid"), "La validación no falla con valor array vacía");
			},

			"check invalid set": function() {

				_ModelTestCommons.setAndCheckInvalidValues(relationAttr, [
					newValue.id.toString(), null, undefined, {}, "", []
				]);
			}
		}
	});
});
