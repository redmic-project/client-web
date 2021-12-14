define([
	"app/base/models/attr/Attr"
	, "../_ModelTestCommons"
], function(
	Attr
	, _ModelTestCommons
){
	var attr, schema, value, newValue, name, path,
		timeout = 100;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Attr generic, string and number tests", {
		before: function() {

			var dfd = this.async(timeout);

			value = "hola mundo";

			newValue = 5.1;

			schema = {
				type: ["string", "number"],
				maximum: 10,
				minimum: 1,
				maxLength: 10,
				minLength: 1
			};

			name = "hijo";
			path = "padre/";

			attr = new Attr({
				modelInstanceName: name,
				modelInstancePath: path
			});
			attr.build(schema).then(dfd.callback(function() {

				attr.deserialize(value, true);
			}));
		},

		beforeEach: function() {

			attr.reset();
		},

		tests: {
			"check constructor": function() {

				assert.isOk(attr.get("schema"), "Schema no definido");
				assert.strictEqual(attr.modelInstanceName, name,
					"El atributo 'modelInstanceName' no corresponde con la propiedad");

				assert.strictEqual(attr.modelInstancePath, path + name,
					"El atributo 'modelInstancePath' no corresponde con la propiedad");
			},

			"check getter": function() {

				assert.strictEqual(attr.get("value"), value, "El getter de value no devuelve el valor esperado");
			},

			"check setter": function() {

				assert.isFalse(attr.get("hasChanged"), "No se ha inicializado correctamente el estado de modificación");

				attr.set("value", newValue);
				assert.strictEqual(attr.get("value"), newValue, "El getter de value no devuelve el valor seteado");

				assert.isTrue(attr.get("hasChanged"), "No se ha actualizado el estado de modificación");
			},

			"check deserialize": function() {

				attr.deserialize(newValue);
				assert.strictEqual(attr.get("value"), newValue, "Deserialize no ha propagado el valor");

				attr.reset();
				assert.strictEqual(attr.get("value"), value,
					"El valor no ha vuelto a su estado inicial antes de cambiarlo con deserialize hacia valor inicial");

				attr.deserialize(newValue, true);
				assert.strictEqual(attr.get("value"), newValue, "Deserialize no ha propagado el valor");
				assert.strictEqual(attr.get("_initValue"), newValue, "Deserialize no ha propagado el valor inicial");

				attr.deserialize(value, true);
			},

			"check serialize": function() {

				var serialized = attr.serialize();

				assert.strictEqual(serialized, attr.get("value"),
					"Serialize no devuelve el mismo valor que el getter de value");

				assert.strictEqual(serialized, value, "Serialize no ha devuelto el valor almacenado");
			},

			"check reset": function() {

				assert.isFalse(attr.get("hasChanged"), "No se ha inicializado correctamente el estado de modificación");

				attr.set("value", newValue);
				assert.isTrue(attr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				attr.reset();
				assert.strictEqual(attr.get("value"), value, "Reset no ha restaurado la instancia al valor original");

				assert.isFalse(attr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras resetear");
			},

			"check clear": function() {

				assert.isFalse(attr.get("hasChanged"), "No se ha inicializado correctamente el estado de modificación");

				attr.set("value", newValue);
				assert.isTrue(attr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				attr.clear();
				assert.strictEqual(attr.get("value"), null, "Clear no ha limpiado el valor de la propiedad");

				assert.isTrue(attr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras limpiar");
			},

			"check validate": function() {

				assert.strictEqual(attr.get("schema"), schema, "El schema original se ha modificado");

				// Valores permitidos

				assert.isTrue(attr.get("isValid"), "El modelo cree que el valor no es válido");

				attr.set("value", newValue);
				assert.isTrue(attr.get("isValid"), "La validación falla con un tipo de dato válido");

				attr.reset();

				// Valores no permitidos

				// Tipos de dato
				attr.set("value", ["string dentro de array"]);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un tipo de dato array");

				attr.set("value", true);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un tipo de dato boolean");

				attr.set("value", null);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un tipo de dato null");

				attr.set("value", undefined);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un tipo de dato undefined");

				attr.set("value", {});
				assert.isFalse(attr.get("isValid"), "La validación no falla con un tipo de dato object");

				// Restricciones
				attr.set("value", 11);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un dato demasiado grande");

				attr.set("value", 0);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un dato demasiado pequeño");

				attr.set("value", "adios mundo cruel");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un dato demasiado largo");

				attr.set("value", "");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un dato demasiado corto");
			},

			"check invalid set": function() {

				_ModelTestCommons.setAndCheckInvalidValues(attr, [
					["string dentro de array"], true, null, undefined, {}, 11, 0, "adios mundo cruel", ""
				]);
			},

			"check hasChanged after reinitialization to null": function() {

				assert.isFalse(attr.get("hasChanged"), "No se ha inicializado correctamente el estado de modificación");

				attr.clear();
				assert.isTrue(attr.get("hasChanged"), "No se ha actualizado correctamente el estado de modificación");

				attr.deserialize(null, true);
				assert.isFalse(attr.get("hasChanged"), "No se ha reinicializado correctamente el estado de modificación");

				attr.deserialize(value, true);
				assert.isFalse(attr.get("hasChanged"), "No se ha reinicializado correctamente el estado de modificación");
			}
		}
	});

	registerSuite("Attr integer tests", {
		before: function() {

			var dfd = this.async(timeout);

			value = 123;

			schema = {
				type: "integer"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				attr.deserialize(value, true);
			}));
		},

		beforeEach: function() {

			attr.reset();
		},

		tests: {
			"check validate": function() {

				// Valores permitidos

				assert.isTrue(attr.get("isValid"), "La validación falla con un entero válido");

				// Valores no permitidos

				attr.set("value", 123.1);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un number con decimales");
			},

			"check invalid set": function() {

				_ModelTestCommons.setAndCheckInvalidValues(attr, [123.1]);
			}
		}
	});


	var dateString1 = "2014-01-01",
		dateString2 = "2013-12-31",
		dateTimeString = "2014-01-01T00:00:00.000+00:00",
		dateTimeStringZonePlus1 = "2014-01-01T00:00:00.000+01:00";

	registerSuite("Attr date tests", {
		before: function() {

			var dfd = this.async(timeout);

			schema = {
				type: "string",
				format: "date"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				attr.deserialize(dateString1, true);
			}));
		},

		beforeEach: function() {

			attr.reset();
		},

		tests: {
			"check setter": function() {

				var dateObj = new Date(dateTimeString),
					dateObjZonePlus1 = new Date(dateTimeStringZonePlus1),
					dateTimeInteger = dateObj.getTime(),
					dateTimeIntegerZonePlus1 = dateObjZonePlus1.getTime();

				attr.set("value", dateTimeString);
				assert.strictEqual(attr.get("value"), dateString1,
					"El setter no ha convertido el valor string en formato fecha-hora al formato de fecha");

				attr.set("value", dateTimeStringZonePlus1);
				assert.strictEqual(attr.get("value"), dateString2,
					"El setter no ha convertido la zona horaria del valor string en formato fecha-hora correctamente");

				attr.set("value", dateObj);
				assert.strictEqual(attr.get("value"), dateString1,
					"El setter no ha convertido el valor objeto Date al formato de fecha");

				attr.set("value", dateObjZonePlus1);
				assert.strictEqual(attr.get("value"), dateString2,
					"El setter no ha convertido la zona horaria del valor objeto Date correctamente");

				attr.set("value", dateTimeInteger);
				assert.strictEqual(attr.get("value"), dateString1,
					"El setter no ha convertido el valor entero en milisegundos al formato de fecha");

				attr.set("value", dateTimeIntegerZonePlus1);
				assert.strictEqual(attr.get("value"), dateString2,
					"El setter no ha convertido la zona horaria del valor entero en milisegundos correctamente");
			},

			"check validate": function() {

				// Valores permitidos

				assert.isTrue(attr.get("isValid"), "La validación falla con un string con formato de fecha válido");

				attr.set("value", Date.now());
				assert.isTrue(attr.get("isValid"), "La validación falla con un número de milisegundos válido");

				attr.set("value", -Date.now());
				assert.isTrue(attr.get("isValid"), "La validación falla con un número negativo de milisegundos válido");

				attr.set("value", new Date());
				assert.isTrue(attr.get("isValid"), "La validación falla con un objeto Date válido");

				// Valores no permitidos

				attr.set("value", "no soy un date");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un string con formato de fecha inválido");

				attr.set("value", "2014-01-00T00:00:00.000+01:00");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un string con fecha-hora imposible");

				attr.set("value", "2014-01-00");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un string con fecha imposible");

				attr.set("value", -Date.now() * 100);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un número negativo de milisegundos inválido");
			},

			"check invalid set": function() {

				_ModelTestCommons.setAndCheckInvalidValues(attr, [
					"no soy un date", "2014-01-00T00:00:00.000+01:00", "2014-01-00", -Date.now() * 100
				]);
			}
		}
	});

	registerSuite("Attr date-time tests", {
		before: function() {

			var dfd = this.async(timeout);

			schema = {
				type: "string",
				format: "date-time"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				attr.deserialize(dateTimeStringZonePlus1, true);
			}));
		},

		beforeEach: function() {

			attr.reset();
		},

		tests: {
			"check setter": function() {

				var dateObj = new Date(dateTimeString),
					dateObjZonePlus1 = new Date(dateTimeStringZonePlus1),
					dateTimeInteger = dateObj.getTime(),
					dateTimeIntegerZonePlus1 = dateObjZonePlus1.getTime(),
					expectedDateTimeZonePlus1Value = "2013-12-31T23:00:00.000+00:00";

				attr.set("value", dateTimeString);
				assert.strictEqual(attr.get("value"), dateTimeString,
					"El setter ha convertido el valor string en formato fecha-hora sin necesidad");

				attr.set("value", dateString1);
				assert.strictEqual(attr.get("value"), dateTimeString,
					"El setter no ha convertido el valor string en formato fecha al formato de fecha-hora");

				attr.set("value", dateTimeStringZonePlus1);
				assert.strictEqual(attr.get("value"), expectedDateTimeZonePlus1Value,
					"El setter no ha convertido la zona horaria del valor string en formato fecha-hora correctamente");

				attr.set("value", dateObj);
				assert.strictEqual(attr.get("value"), dateTimeString,
					"El setter no ha convertido el valor objeto Date al formato de fecha-hora");

				attr.set("value", dateObjZonePlus1);
				assert.strictEqual(attr.get("value"), expectedDateTimeZonePlus1Value,
					"El setter no ha convertido la zona horaria del valor objeto Date correctamente");

				attr.set("value", dateTimeInteger);
				assert.strictEqual(attr.get("value"), dateTimeString,
					"El setter no ha convertido el valor entero en milisegundos al formato de fecha-hora");

				attr.set("value", dateTimeIntegerZonePlus1);
				assert.strictEqual(attr.get("value"), expectedDateTimeZonePlus1Value,
					"El setter no ha convertido la zona horaria del valor entero en milisegundos correctamente");
			},

			"check validate": function() {

				// Valores permitidos

				assert.isTrue(attr.get("isValid"), "La validación falla con un string con formato de fecha-hora válido");

				attr.set("value", dateString1);
				assert.isTrue(attr.get("isValid"), "La validación falla con un string con formato de fecha válido");

				attr.set("value", Date.now());
				assert.isTrue(attr.get("isValid"), "La validación falla con un número de milisegundos válido");

				attr.set("value", -Date.now());
				assert.isTrue(attr.get("isValid"), "La validación falla con un número negativo de milisegundos válido");

				attr.set("value", new Date());
				assert.isTrue(attr.get("isValid"), "La validación falla con un objeto Date válido");

				// Valores no permitidos

				attr.set("value", "no soy un date-time");
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string con formato de fecha-hora inválido");

				attr.set("value", "2014-01-00T00:00:00.000+01:00");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un string con fecha-hora imposible");

				attr.set("value", "2014-01-00");
				assert.isFalse(attr.get("isValid"), "La validación no falla con un string con fecha imposible");

				attr.set("value", -Date.now() * 100);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un número negativo de milisegundos inválido");
			},

			"check invalid set": function() {

				_ModelTestCommons.setAndCheckInvalidValues(attr, [
					"no soy un date-time", "2014-01-00T00:00:00.000+01:00", "2014-01-00", -Date.now() * 100
				]);
			}
		}
	});

	registerSuite("Attr duration tests", {
		before: function() {

			var dfd = this.async(timeout);

			value = 'P1Y2M3DT4H5M6S';

			schema = {
				type: "string",
				format: "duration"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				attr.deserialize(value, true);
			}));
		},

		beforeEach: function() {

			attr.reset();
		},

		tests: {
			"check setter": function() {

				var durationInMillis = 60000,
					rareDecimalDurationString = 'PT1.5M',
					expectedDurationString = 'PT1M',
					expectedDecimalDurationString = 'PT1M30S';

				attr.set("value", durationInMillis);
				assert.strictEqual(attr.get("value"), expectedDurationString,
					"El setter no ha convertido el valor entero de milisegundos en string en formato duración");

				attr.set("value", rareDecimalDurationString);
				assert.strictEqual(attr.get("value"), expectedDecimalDurationString,
					"El setter no ha convertido el string raro en string de duración con los decimales esperados");
			},

			"check validate": function() {

				// Valores permitidos

				assert.isTrue(attr.get("isValid"), "La validación falla con un string con formato de duración válido");

				attr.set("value", "P1YT");
				assert.isTrue(attr.get("isValid"),
					"La validación falla con un string con formato de duración (sin parte de tiempo) válido");

				attr.set("value", "PT1H");
				assert.isTrue(attr.get("isValid"),
					"La validación falla con un string con formato de duración (sin parte de periodo) válido");

				attr.set("value", "P1Y");
				assert.isTrue(attr.get("isValid"),
					"La validación falla con un string con formato de duración (sin designante de tiempo) válido");

				attr.set("value", 60000);
				assert.isTrue(attr.get("isValid"), "La validación falla con un entero que indica milisegundos válido");

				// Valores no permitidos

				attr.set("value", "p1yt1h");
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string con formato de duración (designantes en minúscula) inválido");

				attr.set("value", "T1H");
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string con formato de duración (sin designante de periodo) inválido");

				attr.set("value", "P1D1W");
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string con formato de duración (con designantes desordenados) inválido");

				attr.set("value", "P1HT1Y");
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string con formato de duración (con designantes desubicados) inválido");

				attr.set("value", "T1HP1Y");
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string con formato de duración (con designantes invertidos) inválido");

				attr.set("value", -60000);
				assert.isFalse(attr.get("isValid"), "La validación no falla con un entero que indica milisegundos negativo");

				attr.set("value", dateString1);
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string en formato fecha, inválido para duraciones");

				attr.set("value", dateTimeString);
				assert.isFalse(attr.get("isValid"),
					"La validación no falla con un string en formato fecha-hora, inválido para duraciones");

				attr.set("value", new Date());
				assert.isFalse(attr.get("isValid"), "La validación no falla con un objeto Date, inválido para duraciones");
			},

			"check invalid set": function() {

				_ModelTestCommons.setAndCheckInvalidValues(attr, [
					"p1yt1h", "T1H", "P1D1W", "P1HT1Y", "T1HP1Y", -60000, dateString1, dateTimeString, new Date()
				]);
			}
		}
	});

	registerSuite("Attr default key tests", {
		"type string with default": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "string",
				"default": "Hola"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.isTrue(attr.get("isValid"), "La validación falla con una cadena de texto en un tipo string");
			}));
		},

		"type integer with default": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "integer",
				"default": "1"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.isTrue(attr.get("isValid"), "La validación falla con un valor entero en un tipo integer");
				assert.strictEqual(attr.get("value"), 1,
					"El default no se ha añadido al value siendo correcto para este tipo");
			}));
		},

		"error type integer with default": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "integer",
				"default": "uno"
			};

			attr = new Attr();

			attr.build(schema).then(dfd.callback(function() {

				assert.strictEqual(attr.get("value"), null,
					"El default se ha añadido al value siendo incorrecto para este tipo");
			}));
		},

		"type number with default": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "number",
				"default": "1.25"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.isTrue(attr.get("isValid"), "La validación falla con un valor numerico en un tipo number");
				assert.strictEqual(attr.get("value"), 1.25,
					"El default no se ha añadido al value siendo correcto para este tipo");
			}));
		},

		"error type number with default": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "number",
				"default": "uno"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.strictEqual(attr.get("value"), null,
					"El default se ha añadido al value siendo incorrecto para este tipo");
			}));
		},

		"type boolean with default true": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "boolean",
				"default": "true"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.isTrue(attr.get("isValid"), "La validación falla con 'true' en un tipo boolean");
				assert.strictEqual(attr.get("value"), true,
					"El default no se ha añadido al value siendo correcto para este tipo");
			}));
		},

		"type boolean with default false": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "boolean",
				"default": "false"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.isTrue(attr.get("isValid"), "La validación falla con 'false' en un tipo boolean");
				assert.strictEqual(attr.get("value"), false,
					"El default no se ha añadido al value siendo correcto para este tipo");
			}));
		},

		"error type boolean with default": function() {

			var dfd = this.async(timeout);

			schema = {
				type: "number",
				"default": "uno"
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.strictEqual(attr.get("value"), null,
					"El default se ha añadido al value siendo incorrecto para este tipo");
			}));
		},

		'Should_OmitDefaultValue_When_PropertyIsNullable': function() {

			var dfd = this.async(timeout);

			schema = {
				type: ['number', 'null'],
				'default': 1
			};

			attr = new Attr();
			attr.build(schema).then(dfd.callback(function() {

				assert.strictEqual(attr.get('value'), null,
					'El valor por defecto se ha asignado aunque la propiedad era anulable');
			}));
		}
	});
});
