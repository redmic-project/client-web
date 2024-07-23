define([
	"app/base/models/attr/ObjAttr"
	, "dojo/_base/lang"
	, "../_ModelTestCommons"
], function(
	ObjAttr
	, lang
	, _ModelTestCommons
){
	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	var objAttr, schema, name, path, value, serializedValue, newValue, serializedNewValue, serializedEmptyValue,
		specificProps, specificTests,

		timeout = 100,

		commonProps = {
			beforeEach: function() {

				objAttr.reset();
			}
		},

		commonTests = {
			"check getter": function() {

				assert.deepEqual(objAttr.get("value"), serializedValue,
					"El getter de value no devuelve el valor esperado");

				for (var prop in value) {
					var instance = objAttr.get(prop);
					assert.deepEqual(instance.get("value"), serializedValue[prop], "El getter de " + prop +
						" no devuelve el valor esperado");
				}

				assert.isUndefined(objAttr.get("hola"),
					"El getter de value devuelve algo en el lugar de una propiedad inexistente");
			},

			"check setter": function() {

				assert.isFalse(objAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				objAttr.set("value", newValue);
				assert.deepEqual(objAttr.get("value"), serializedNewValue,
					"El getter de value no devuelve el valor seteado");

				assert.lengthOf(Object.keys(objAttr._additionalProperties), 1,
					"No se ha encontrado el número de propiedades adicionales esperado");

				assert.isDefined(objAttr.get("hola"),
					"El getter de value no devuelve nada para una propiedad existente pero ajena al schema");

				assert.strictEqual(objAttr.get("hola"), serializedNewValue.hola,
					"El getter de value no devuelve el valor esperado para la propiedad ajena al schema");

				assert.isTrue(objAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");
			},

			"check deserialize": function() {

				var prop;
				objAttr.deserialize(newValue);

				assert.deepEqual(objAttr.get("value"), serializedNewValue, "Deserialize no ha propagado el valor");
				for (prop in value) {
					assert.deepEqual(objAttr.get(prop).get("value"), serializedNewValue[prop],
						"Deserialize no ha propagado el valor de " + prop);
				}
				assert.strictEqual(objAttr.get("hola"), serializedNewValue.hola,
					"Deserialize no ha propagado el valor de la propiedad ajena al schema");

				assert.lengthOf(Object.keys(objAttr._additionalProperties), 1,
					"No se ha encontrado el número de propiedades adicionales esperado");

				objAttr.reset();
				assert.deepEqual(objAttr.get("value"), serializedValue,
					"El valor no ha vuelto a su estado inicial antes de cambiarlo con deserialize hacia valor inicial");

				for (prop in value) {
					assert.deepEqual(objAttr.get(prop).get("value"), serializedValue[prop],
						"El valor de " + prop + " no ha vuelto a su estado inicial");
				}
				assert.isUndefined(objAttr.get("hola"),
					"El valor de la propiedad ajena al schema no ha vuelto a su estado inicial");

				assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
					"No se ha encontrado el número de propiedades adicionales esperado");

				objAttr.deserialize(newValue, true);
				assert.deepEqual(objAttr.get("value"), serializedNewValue, "Deserialize no ha propagado el valor");
				assert.deepEqual(objAttr.get("_initValue"), serializedNewValue,
					"Deserialize no ha propagado el valor inicial");

				var newValueCopy = lang.clone(newValue);
				newValueCopy.hola = "otro valor";
				objAttr.set("value", newValueCopy);
				assert.isTrue(objAttr.get("hasChanged"),
					"No se ha actualizado el estado de modificación tras cambiar el valor de una propiedad adicional");

				objAttr.deserialize(value, true);
			},

			"check serialize": function() {

				var serialized = objAttr.serialize();

				assert.deepEqual(serialized, objAttr.get("value"),
					"Serialize no devuelve el mismo valor que el getter de value");

				assert.deepEqual(serialized, serializedValue, "Serialize no ha devuelto el valor almacenado");

				objAttr.deserialize(newValue);
				assert.deepEqual(objAttr.serialize(), serializedNewValue,
					"Serialize no ha devuelto el valor almacenado completo");
			},

			"check reset": function() {

				assert.isFalse(objAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				objAttr.set("value", newValue);
				assert.isTrue(objAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				objAttr.reset();
				assert.deepEqual(objAttr.get("value"), serializedValue,
					"Reset no ha restaurado la instancia al valor original");

				assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
					"No se ha encontrado el número de propiedades adicionales esperado");

				assert.isUndefined(objAttr.get("hola"),
					"Reset no ha restaurado el valor de la propiedad ajena al schema");

				assert.isFalse(objAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras resetear");
			},

			"check clear": function() {

				assert.isFalse(objAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				objAttr.set("value", newValue);
				assert.isTrue(objAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				objAttr.clear();
				assert.deepEqual(objAttr.get("value"), serializedEmptyValue,
					"Clear no ha limpiado el valor de la propiedad");

				assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
					"No se ha encontrado el número de propiedades adicionales esperado");

				assert.isTrue(objAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras limpiar");
			},

			"check validate": function() {

				assert.strictEqual(objAttr.get("schema"), schema, "El schema original se ha modificado");

				// Valores permitidos

				assert.isTrue(objAttr.get("isValid"), "El modelo cree que el valor no es válido");

				objAttr.set("value", newValue);
				assert.isTrue(objAttr.get("isValid"), "La validación falla con un tipo de dato válido");
			},

			"check hasChanged after set property value": function() {

				assert.isFalse(objAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				var propertyName = Object.keys(value)[0],
					propertyInstance = objAttr.get(propertyName);

				assert.isDefined(propertyInstance, "No se ha encontrado la instancia de la propiedad");

				propertyInstance.deserialize(newValue[propertyName]);

				assert.isTrue(objAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras setear una propiedad");
			},

			"check isValid after set invalid value to property": function() {

				assert.isTrue(objAttr.get("isValid"), "El modelo cree que el valor no es válido");

				var propertyName = Object.keys(value)[0],
					propertyInstance = objAttr.get(propertyName);

				assert.isDefined(propertyInstance, "No se ha encontrado la instancia de la propiedad");

				propertyInstance.deserialize(null);

				assert.isFalse(objAttr.get("isValid"),
					"El modelo cree que el valor es válido tras setear un valor inválido en una propiedad");
			}
		};


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				name: "pepito"
			};

			serializedValue = lang.clone(value);

			newValue = {
				id: 2,
				name: "juanito",
				hola: "adios"
			};

			serializedNewValue = lang.clone(newValue);

			serializedEmptyValue = {
				id: null,
				name: null
			};

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "number"
					},
					"name": {
						type: "string"
					}
				}
			};

			name = "hijo";
			path = "padre/";

			objAttr = new ObjAttr({
				modelInstanceName: name,
				modelInstancePath: path,
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(objAttr.get("schema"), "Schema no definido");
			assert.isNotOk(objAttr.value, "Atributo 'value' definido, no permitido");
			assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
				"Propiedades adicionales detectadas al inicio");

			var pathLevel1 = path + name;
			assert.strictEqual(objAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(objAttr.modelInstancePath, pathLevel1,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");

			for (var prop in value) {
				assert.isOk(objAttr._properties[prop], "No existe la propiedad " + prop);

				var pathLevel2 = pathLevel1 + objAttr.pathSeparator + prop,
					instance = objAttr.get(prop);

				assert.strictEqual(instance.modelInstanceName, prop,
					"El atributo 'modelInstanceName' no corresponde con la propiedad " + prop);

				assert.strictEqual(instance.modelInstancePath, pathLevel2,
					"El atributo 'modelInstancePath' no corresponde con la propiedad " + prop);
			}
		}
	};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check reset specific properties": function() {

			objAttr.set("value", newValue);
			objAttr.reset(["name"]);

			assert.strictEqual(objAttr.get("name").get("value"), serializedValue.name,
				"Reset no ha restaurado el valor de una propiedad especificada");

			assert.strictEqual(objAttr.get("id").get("value"), serializedNewValue.id,
				"Reset ha restaurado el valor de una propiedad no especificada");
		},

		"check clear specific properties": function() {

			objAttr.clear(["name"]);

			assert.isNull(objAttr.get("name").get("value"),
				"Clear no ha limpiado el valor de una propiedad especificada");

			assert.strictEqual(objAttr.get("id").get("value"), serializedValue.id,
				"Clear ha limpiado el valor de una propiedad no especificada");
		}
	});

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with Attr elements (number, string) and generic tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				name: "pepito"
			};

			serializedValue = lang.clone(value);

			newValue = {
				id: 2,
				name: "juanito"
			};

			serializedNewValue = lang.clone(newValue);

			serializedEmptyValue = {
				id: null,
				name: null
			};

			schema = {
				type: "object",
				required: [ "id" ],
				minProperties: 2,
				maxProperties: 3,
				properties: {
					"id": {
						type: "number",
						maximum: 10,
						minimum: 1
					},
					"name": {
						type: "string",
						maxLength: 10,
						minLength: 1
					}
				}
			};

			objAttr = new ObjAttr({
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		},

		beforeEach: function() {

			objAttr.reset();
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(objAttr.get("schema"), "Schema no definido");
			assert.isNotOk(objAttr.value, "Atributo 'value' definido, no permitido");
			assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
				"Propiedades adicionales detectadas al inicio");

			assert.isTrue(objAttr.get("id").get("isRequired"),
				"La instancia de una propiedad requerida del objeto cree que no lo es");

			assert.isFalse(objAttr.get("name").get("isRequired"),
				"La instancia de una propiedad no requerida del objeto cree que si lo es");
		},

		"check validate": function() {

			assert.strictEqual(objAttr.get("schema"), schema, "El schema original se ha modificado");

			// Valores permitidos

			assert.isTrue(objAttr.get("isValid"), "El modelo cree que el valor no es válido");

			objAttr.set("value", newValue);
			assert.isTrue(objAttr.get("isValid"), "La validación falla con un tipo de dato válido");

			// Valores no permitidos

			objAttr.clear();
			assert.isFalse(objAttr.get("isValid"), "El modelo cree que el valor vacío es válido");

			objAttr.set("value", {});
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor object vacío");

			objAttr.deserialize([]);
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor array vacío");

			objAttr.deserialize({ id: "1", name: "pepito" });
			assert.isFalse(objAttr.get("isValid"),
				"La validación no falla con una propiedad con tipo de dato incorrecto");

			objAttr.deserialize(1);
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor de tipo integer");

			objAttr.deserialize("hola");
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor de tipo string");

			objAttr.deserialize(["hola"]);
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor de tipo array");

			objAttr.deserialize(true);
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor de tipo boolean");

			objAttr.deserialize(null);
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor de tipo null");

			objAttr.deserialize(undefined);
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con un valor de tipo undefined");

			// Más valores no permitidos, por restricciones

			objAttr.deserialize({
				name: "pepito",
				hola: "adios"
			});
			assert.isFalse(objAttr.get("isValid"),
				"La validación no falla con una propiedad obligatoria omitida");

			objAttr.deserialize({
				id: 1
			});
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con una sola propiedad asignada (mínimo 2)");

			objAttr.deserialize({
				id: 1,
				name: "pepito",
				hola: "hasta luego",
				treintaytres: 33
			});
			assert.isFalse(objAttr.get("isValid"), "La validación no falla con 4 propiedades asignadas (máximo 3)");

			objAttr.deserialize({
				id: 11,
				name: "pepito"
			});
			assert.isFalse(objAttr.get("isValid"),
				"La validación no falla con una propiedad con valor demasiado grande");

			objAttr.deserialize({
				id: 0,
				name: "pepito"
			});
			assert.isFalse(objAttr.get("isValid"),
				"La validación no falla con una propiedad con valor demasiado pequeño");

			objAttr.deserialize({
				id: 1,
				name: "pepito el grande"
			});
			assert.isFalse(objAttr.get("isValid"),
				"La validación no falla con una propiedad con valor demasiado largo");

			objAttr.deserialize({
				id: 1,
				name: ""
			});
			assert.isFalse(objAttr.get("isValid"),
				"La validación no falla con una propiedad con valor demasiado corto");
		},

		"check invalid set": function() {

			_ModelTestCommons.setAndCheckInvalidValues(objAttr, [
				{}, [], { id: "1", name: "pepito" }, 1, "hola", ["hola"], true, null, undefined,
				{
					name: "pepito",
					hola: "adios"
				},{
					id: 1,
					name: "pepito",
					hola: "hasta luego",
					treintaytres: 33
				},{
					id: 11,
					name: "pepito"
				},{
					id: 0,
					name: "pepito"
				},{
					id: 1,
					name: "pepito el grande"
				},{
					id: 1,
					name: ""
			}]);
		}
	};

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with restrictions tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				contact: {
					id: 1,
					name: "pepito"
				}
			};

			serializedValue = {
				contact: 1
			};

			newValue = {
				contact: {
					id: 2,
					name: "juanito"
				},
				hola: "adios"
			};

			serializedNewValue = {
				contact: 2,
				hola: "adios"
			};

			serializedEmptyValue = {
				contact: null
			};

			schema = {
				type: "object",
				properties: {
					"contact": {
						type: "integer",
						url: "contact"
					}
				}
			};

			objAttr = new ObjAttr({
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ObjAttr with RelationAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				numbers: [1, 2]
			};

			serializedValue = lang.clone(value);

			newValue = {
				numbers: [3, 4],
				hola: "adios"
			};

			serializedNewValue = lang.clone(newValue);

			serializedEmptyValue = {
				numbers: []
			};

			schema = {
				type: "object",
				properties: {
					"numbers": {
						type: "array",
						items: {
							type: "integer"
						}
					}
				}
			};

			name = "hijo";
			path = "padre/";

			objAttr = new ObjAttr({
				modelInstanceName: name,
				modelInstancePath: path,
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(objAttr.get("schema"), "Schema no definido");
			assert.isNotOk(objAttr.value, "Atributo 'value' definido, no permitido");
			assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
				"Propiedades adicionales detectadas al inicio");

			var pathLevel1 = path + name;
			assert.strictEqual(objAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(objAttr.modelInstancePath, pathLevel1,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");

			var propertyName = "numbers",
				propertyInstance = objAttr.get(propertyName),
				pathSeparator = objAttr.pathSeparator,
				pathLevel2 = pathLevel1 + pathSeparator + propertyName;

			assert.strictEqual(propertyInstance.modelInstanceName, propertyName,
				"El atributo 'modelInstanceName' no corresponde a la propiedad hija");

			assert.strictEqual(propertyInstance.modelInstancePath, pathLevel2,
				"El atributo 'modelInstancePath' no corresponde a la propiedad hija");

			var itemIndex = 0,
				itemName = propertyInstance._itemIdsByPosition[itemIndex],
				firstChildElement = propertyInstance.get(itemIndex),
				pathLevel3 = pathLevel2 + pathSeparator + itemName;

			assert.strictEqual(firstChildElement.modelInstanceName, itemName,
				"El atributo 'modelInstanceName' no corresponde al item nieto");

			assert.strictEqual(firstChildElement.modelInstancePath, pathLevel3,
				"El atributo 'modelInstancePath' no corresponde al item nieto");
		}
	};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check reset specific properties": function() {

			objAttr.set("value", newValue);
			objAttr.reset(["numbers" + objAttr.pathSeparator + "0"]);

			var instance = objAttr.get("numbers");

			assert.strictEqual(instance.get(0).get("value"), serializedValue.numbers[0],
				"Reset no ha restaurado el valor de una propiedad especificada");

			assert.strictEqual(instance.get(1).get("value"), serializedNewValue.numbers[1],
				"Reset ha restaurado el valor de una propiedad no especificada");
		},

		"check clear specific properties": function() {

			objAttr.clear(["numbers" + objAttr.pathSeparator + "0"]);

			var instance = objAttr.get("numbers");

			assert.isNull(instance.get(0).get("value"), "Clear no ha limpiado el valor de una propiedad especificada");

			assert.strictEqual(instance.get(1).get("value"), serializedValue.numbers[1],
				"Clear ha limpiado el valor de una propiedad no especificada");
		}
	});

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with ArrayAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				number: {
					integerPart: 1,
					fractionalPart: 5
				}
			};

			serializedValue = lang.clone(value);

			newValue = {
				number: {
					integerPart: 3,
					fractionalPart: 14
				},
				hola: "adios"
			};

			serializedNewValue = lang.clone(newValue);

			serializedEmptyValue = {
				number: {
					integerPart: null,
					fractionalPart: null
				}
			};

			schema = {
				type: "object",
				properties: {
					"number": {
						type: "object",
						properties: {
							"integerPart": {
								type: "integer"
							},
							"fractionalPart": {
								type: "integer"
							}
						}
					}
				}
			};

			name = "hijo";
			path = "padre/";

			objAttr = new ObjAttr({
				modelInstanceName: name,
				modelInstancePath: path,
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(objAttr.get("schema"), "Schema no definido");
			assert.isNotOk(objAttr.value, "Atributo 'value' definido, no permitido");
			assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
				"Propiedades adicionales detectadas al inicio");

			var pathLevel1 = path + name;
			assert.strictEqual(objAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(objAttr.modelInstancePath, pathLevel1,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");

			var propertyName = "number",
				propertyInstance = objAttr.get(propertyName),
				pathSeparator = objAttr.pathSeparator,
				pathLevel2 = pathLevel1 + pathSeparator + propertyName;

			assert.strictEqual(propertyInstance.modelInstanceName, propertyName,
				"El atributo 'modelInstanceName' no corresponde a la propiedad hija");

			assert.strictEqual(propertyInstance.modelInstancePath, pathLevel2,
				"El atributo 'modelInstancePath' no corresponde a la propiedad hija");

			var childPropertyName = "integerPart",
				firstChildElement = propertyInstance.get(childPropertyName),
				pathLevel3 = pathLevel2 + pathSeparator + childPropertyName;

			assert.strictEqual(firstChildElement.modelInstanceName, childPropertyName,
				"El atributo 'modelInstanceName' no corresponde a la propiedad nieta");

			assert.strictEqual(firstChildElement.modelInstancePath, pathLevel3,
				"El atributo 'modelInstancePath' no corresponde a la propiedad nieta");
		}
	};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check reset specific properties": function() {

			objAttr.set("value", newValue);
			objAttr.reset(["number" + objAttr.pathSeparator + "integerPart"]);

			var instance = objAttr.get("number");

			assert.strictEqual(instance.get("integerPart").get("value"), serializedValue.number.integerPart,
				"Reset no ha restaurado el valor de una propiedad especificada");

			assert.strictEqual(instance.get("fractionalPart").get("value"), serializedNewValue.number.fractionalPart,
				"Reset ha restaurado el valor de una propiedad no especificada");
		},

		"check clear specific properties": function() {

			objAttr.clear(["number" + objAttr.pathSeparator + "integerPart"]);

			var instance = objAttr.get("number");

			assert.isNull(instance.get("integerPart").get("value"),
				"Clear no ha limpiado el valor de una propiedad especificada");

			assert.strictEqual(instance.get("fractionalPart").get("value"), serializedValue.number.fractionalPart,
				"Clear ha limpiado el valor de una propiedad no especificada");
		}
	});

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with ObjAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				geom: {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [1, 2, 3]
					},
					properties: {}
				}
			};

			serializedValue = lang.clone(value);

			newValue = {
				geom: {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [4, 5, 6]
					},
					properties: {}
				},
				hola: "adios"
			};

			serializedNewValue = lang.clone(newValue);

			serializedEmptyValue = {
				geom: {
					type: null,
					geometry: {
						type: null,
						coordinates: []
					},
					properties: {}
				}
			};

			schema = {
				type: "object",
				properties: {
					"geom": {
						type: "object",
						required: [ "type", "geometry", "properties" ],
						additionalProperties: false,
						properties: {
							"type": {
								type: "string",
								"enum": [ "Feature" ]
							},
							"geometry": {
								type: "object",
								required: [ "type", "coordinates" ],
								additionalProperties: false,
								properties: {
									"type": {
										type: "string",
										"enum": [ "Point" ]
									},
									"coordinates": {
										type: "array",
										minItems: 2,
										maxItems: 3,
										items: {
											"type": "number",
											maximum: 9000000000000000,
											minimum: -9000000000000000
										}
									}
								}
							},
							"properties": {
								type: "object"
							}
						}
					}
				}
			};

			objAttr = new ObjAttr({
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ObjAttr with GeoJSON (ObjAttr) elements tests", specificProps);

	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				numbers: [{
					id: 1,
					value: 22
				},{
					id: 2,
					value: 27
				}]
			};

			serializedValue = {
				numbers: [1, 2]
			};

			newValue = {
				numbers: [{
					id: 3,
					value: 33
				}],
				hola: "adios"
			};

			serializedNewValue = {
				numbers: [3],
				hola: "adios"
			};

			serializedEmptyValue = {
				numbers: []
			};

			schema = {
				type: "object",
				properties: {
					"numbers": {
						type: "array",
						items: {
							type: "integer",
							url: "numbers"
						}
					}
				}
			};

			name = "hijo";
			path = "padre/";

			objAttr = new ObjAttr({
				modelInstanceName: name,
				modelInstancePath: path,
				serializeAdditionalProperties: true
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			var propertyName = "numbers",
				arrayInstance = objAttr.get(propertyName),
				relationIndex = 0,
				relationName = arrayInstance._itemIdsByPosition[relationIndex],
				pathSeparator = objAttr.pathSeparator,
				relationPath = path + name + pathSeparator + propertyName + pathSeparator + relationName,
				relationInstance = arrayInstance.get(relationIndex);

			assert.strictEqual(relationInstance.modelInstanceName, relationName,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(relationInstance.modelInstancePath, relationPath,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");
		}
	};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check array value after set array item value": function() {

			var arrayInstance = objAttr.get("numbers"),
				itemInstance = arrayInstance.get(0);

			assert.strictEqual(arrayInstance.get("value")[0], itemInstance.get("value"),
				"Inicialmente, el valor del array en la posición del item no se corresponde con el valor del item");

			itemInstance.set("value", newValue.numbers[0]);

			assert.strictEqual(arrayInstance.get("value")[0], itemInstance.get("value"),
				"Tras setear, el valor del array en la posición del item no se corresponde con el valor del item");
		}
	});

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with ArrayAttr elements (containing RelationAttr elements) tests", specificProps);

	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				name: {
					id: 1,
					name: "pepito"
				}
			};

			serializedValue = lang.clone(value);

			newValue = {
				id: 2,
				name: {
					id: 1,
					name: "juanito",
					hola: "adios"
				},
				hola: "adios"
			};

			serializedNewValue = {
				id: 2,
				name: {
					id: 1,
					name: "juanito"
				}
			};

			serializedEmptyValue = {
				id: null,
				name: {
					id: null,
					name: null
				}
			};

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "number"
					},
					"name": {
						type: ["object", null],
						properties: {
							"id": {
								type: "number"
							},
							"name": {
								type: "string"
							}
						}
					}
				}
			};

			name = "hijo";
			path = "padre/";

			objAttr = new ObjAttr({
				modelInstanceName: name,
				modelInstancePath: path
			});
			objAttr.build(schema).then(dfd.callback(function() {

				objAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(objAttr.get("schema"), "Schema no definido");
			assert.isNotOk(objAttr.value, "Atributo 'value' definido, no permitido");
			assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
				"Propiedades adicionales detectadas al inicio");

			var pathLevel1 = path + name;
			assert.strictEqual(objAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(objAttr.modelInstancePath, pathLevel1,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");

			for (var prop in value) {
				assert.isOk(objAttr._properties[prop], "No existe la propiedad " + prop);

				var pathLevel2 = pathLevel1 + objAttr.pathSeparator + prop,
					instance = objAttr.get(prop);

				assert.strictEqual(instance.modelInstanceName, prop,
					"El atributo 'modelInstanceName' no corresponde con la propiedad " + prop);

				assert.strictEqual(instance.modelInstancePath, pathLevel2,
					"El atributo 'modelInstancePath' no corresponde con la propiedad " + prop);
			}
		}
	};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check setter": function() {

			assert.isFalse(objAttr.get("hasChanged"),
				"No se ha inicializado correctamente el estado de modificación");

			objAttr.set("value", newValue);
			assert.deepEqual(objAttr.get("value"), serializedNewValue,
				"El getter de value no devuelve el valor seteado");

			assert.lengthOf(Object.keys(objAttr._additionalProperties), 1,
				"No se ha encontrado el número de propiedades adicionales esperado");

			assert.isDefined(objAttr.get("hola"),
				"El getter de value no devuelve nada para una propiedad existente pero ajena al schema");

			assert.strictEqual(objAttr.get("hola"), newValue.hola,
				"El getter de value no devuelve el valor esperado para la propiedad ajena al schema");

			assert.isTrue(objAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");
		},

		"check deserialize": function() {

			var prop;
			objAttr.deserialize(newValue);

			assert.deepEqual(objAttr.get("value"), serializedNewValue, "Deserialize no ha propagado el valor");
			for (prop in value) {
				assert.deepEqual(objAttr.get(prop).get("value"), serializedNewValue[prop],
					"Deserialize no ha propagado el valor de " + prop);
			}

			/*assert.strictEqual(objAttr.get("hola"), null,
				"Deserialize ha propagado el valor de la propiedad ajena al schema");*/

			assert.lengthOf(Object.keys(objAttr._additionalProperties), 1,
				"No se ha encontrado el número de propiedades adicionales esperado");

			objAttr.reset();
			assert.deepEqual(objAttr.get("value"), serializedValue,
				"El valor no ha vuelto a su estado inicial antes de cambiarlo con deserialize hacia valor inicial");

			for (prop in value) {
				assert.deepEqual(objAttr.get(prop).get("value"), serializedValue[prop],
					"El valor de " + prop + " no ha vuelto a su estado inicial");
			}
			assert.isUndefined(objAttr.get("hola"),
				"El valor de la propiedad ajena al schema no ha vuelto a su estado inicial");

			assert.lengthOf(Object.keys(objAttr._additionalProperties), 0,
				"No se ha encontrado el número de propiedades adicionales esperado");

			objAttr.deserialize(newValue, true);
			assert.deepEqual(objAttr.get("value"), serializedNewValue, "Deserialize no ha propagado el valor");
			assert.deepEqual(objAttr.get("_initValue"), serializedNewValue,
				"Deserialize no ha propagado el valor inicial");

			var newValueCopy = lang.clone(newValue);
			newValueCopy.hola = "otro valor";
			objAttr.set("value", newValueCopy);
			assert.isFalse(objAttr.get("hasChanged"),
				"No se ha actualizado el estado de modificación tras cambiar el valor de una propiedad adicional");

			objAttr.deserialize(value, true);
		}
	});

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with not serialize additional properties tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			schema = {
				type: "object",
				properties: {
					p1: {
						type: ["object", "null"],
						required: [ "id" ],
						properties: {
							"id": {
								type: "number"
							}
						}
					},
					name: {
						type: "string",
						"default": "hola"
					}
				}
			};

			objAttr = new ObjAttr({});

			objAttr.build(schema).then(dfd.callback(function() {

			}));
		},

		beforeEach: function() {

			objAttr.reset();
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(objAttr.get("schema"), "Schema no definido");
		},

		"check serialize default value": function() {

			var serialized = objAttr.serialize(),
				serializeValue = {
					p1: null,
					name: "hola"
				};

			assert.deepEqual(serialized, serializeValue, "Serialize no devuelve el valor esperado");
		},

		"check serialize with set value": function() {

			var value = {
				p1: {
					id: 10
				},
				name: "adios"
			};

			objAttr.set("value", value);

			var serialized = objAttr.serialize();

			assert.deepEqual(serialized, value, "Serialize no devuelve el valor esperado");
		},

		"check serialize with set null object": function() {

			var value = {
				p1: {
					id: 10
				},
				name: "adios"
			};

			objAttr.set("value", value);

			var serialized = objAttr.serialize();

			assert.deepEqual(serialized, value, "Serialize no devuelve el valor esperado");

			value = {
				p1: null,
				name: "hola"
			};

			objAttr.set("value", value);

			serialized = objAttr.serialize();

			assert.deepEqual(serialized, value, "Serialize no devuelve el valor esperado");
		},

		"check serialize with set null value": function() {

			var value = {
				p1: {
					id: 10
				},
				name: "adios"
			};

			objAttr.set("value", value);

			var serialized = objAttr.serialize();

			assert.deepEqual(serialized, value, "Serialize no devuelve el valor esperado");

			value = {
				p1: {
					id: null
				},
				name: "hola"
			};

			objAttr.set("value", value);

			serialized = objAttr.serialize();

			value.p1 = null;

			assert.deepEqual(serialized, value, "Serialize no devuelve el valor esperado");
		},

		"check serialize set total null": function() {

			var value = {
				p1: null,
				name: null
			};

			objAttr.set("value", value);

			var serialized = objAttr.serialize();

			assert.deepEqual(serialized, value, "Serialize no devuelve el valor esperado");
		}
	};

	specificProps.tests = specificTests;
	registerSuite("ObjAttr with null type", specificProps);


	specificTests = {
		"check default integer": function() {

			var valueDefault = {"id": 1},
				schema = {
					type: "object",
					required : ["id"],
					properties: {
						id: {
							"type": "integer"
						}
					},
					"default": JSON.stringify(valueDefault)
				},
				objAttr = new ObjAttr({});

			objAttr.build(schema).then(function() {

				var serialized = objAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(objAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default string": function() {

			var valueDefault = {"id": "1"},
				schema = {
					type: "object",
					required : ["id"],
					properties: {
						id: {
							"type": "string"
						}
					},
					"default": JSON.stringify(valueDefault)
				},
				objAttr = new ObjAttr({});

			objAttr.build(schema).then(function() {

				var serialized = objAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(objAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default object": function() {

			var valueDefault = {"props": {"id": "1"}},
				schema = {
					type: "object",
					required : [],
					properties: {
						props: {
							type: "object",
							required : ["id"],
							properties: {
								id: {
									"type": "string"
								}
							}
						}
					},
					"default": JSON.stringify(valueDefault)
				},
				objAttr = new ObjAttr({});

			objAttr.build(schema).then(function() {

				var serialized = objAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(objAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default array": function() {

			var valueDefault = {"props": ["1"]},
				schema = {
					type: "object",
					required : [],
					properties: {
						props: {
							"type": "array",
							"items": {
								type: "string"
							}
						}
					},
					"default": JSON.stringify(valueDefault)
				},
				objAttr = new ObjAttr({});

			objAttr.build(schema).then(function() {

				var serialized = objAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(objAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default complex": function() {

			var valueDefault = {
					"id": 1,
					"props": {
						"name": "pepe",
						"note": ["c"]
					}
				},
				valuePropsDefault = {
					"name": "hola",
					"note": ["a", "b"]
				},
				serializedClearContent = {
					"id": null,
					"props": valuePropsDefault
				},
				schema = {
					type: "object",
					required : [],
					properties: {
						id: {
							"type": "integer"
						},
						props: {
							type: "object",
							required : ["name"],
							properties: {
								name: {
									"type": "string"
								},
								note: {
									"type": "array",
									"items": {
										type: "string"
									}
								}
							},
							"default": JSON.stringify(valuePropsDefault)
						}
					},
					"default": JSON.stringify(valueDefault)
				},
				objAttr = new ObjAttr({});

			objAttr.build(schema).then(function() {

				var serialized = objAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(objAttr.isValid,
					"El modelo no es válido");

				objAttr._clearContent();

				serialized = objAttr.serialize();

				assert.strictEqual(serialized, serializedClearContent,
					"Serialize no devuelve el valor esperado");
			});
		}
	};

	registerSuite("ObjAttr with default value tests", specificTests);

	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			schema = {
				type: ['object', 'null'],
				properties: {
					name: {
						type: 'string'
					}
				},
				'default': '{"name": "pepito"}'
			};

			objAttr = new ObjAttr();

			objAttr.build(schema).then(dfd.callback(function() {}));
		},

		beforeEach: function() {

			objAttr.reset();
		}
	};

	specificTests = {
		'Should_OmitDefaultValue_When_PropertyIsNullable': function() {

			var serialized = objAttr.serialize();

			assert.deepEqual(serialized, null, 'El valor por defecto se ha asignado aunque la propiedad era anulable');
		}
	};

	specificProps.tests = specificTests;
	registerSuite('ObjAttr with null type and default value', specificProps);
});
