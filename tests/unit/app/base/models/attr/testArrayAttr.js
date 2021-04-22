define([
	"app/base/models/attr/ArrayAttr"
	, "dojo/_base/lang"
	, "../_ModelTestCommons"
], function(
	ArrayAttr
	, lang
	, _ModelTestCommons
){
	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	var arrayAttr, schema, name, path, value, serializedValue, newValue, serializedNewValue, serializedEmptyValue,
		emptyItemValue, specificProps, specificTests,

		pathSeparator = "/",
		timeout = 100,

		commonProps = {
			beforeEach: function() {

				arrayAttr.reset();
			}
		},

		commonTests = {
			"check getter": function() {

				assert.sameDeepMembers(arrayAttr.get("value"), serializedValue,
					"El getter de value no devuelve el valor esperado");

				assert.deepEqual(arrayAttr.get(0).get("value"), serializedValue[0],
					"El getter de 0 no devuelve el valor esperado");

				var itemUuid = arrayAttr._itemIdsByPosition[0];
				assert.isDefined(arrayAttr.get(itemUuid), "El getter de UUID no devuelve la instancia");
				assert.strictEqual(arrayAttr._getItemIndex(itemUuid), 0,
					"El método '_getItemIndex' no devuelve el índice esperado para el UUID proporcionado");

				assert.deepEqual(arrayAttr.get(1).get("value"), serializedValue[1],
					"El getter de 1 no devuelve el valor esperado");
			},

			Getter_ShouldReturnUndefined_WhenRequireMissingItem: function() {

				assert.isUndefined(arrayAttr.get(2), 'El getter de un índice inexistente devuelve una instancia nueva');
			},

			Getter_ShouldReturnInstancePromise_WhenRequireMissingItemWithAutocreation: function() {

				var dfd = this.async(timeout),
					extraItem = arrayAttr.get(-1, true);

				assert.isDefined(extraItem,
					'El getter de un índice inexistente con autocreación no devuelve nada');

				assert.isDefined(extraItem.then,
					'El getter de un índice inexistente con autocreación no devuelve una promesa de instancia nueva');

				extraItem.then(function(instance) {

					assert.deepEqual(instance.get('value'), emptyItemValue,
						'El getter generó una instancia que no devuelve un valor vacío al serializar');

					dfd.resolve();
				});
			},

			"check addValue": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				arrayAttr.addValue(newValue[newValue.length - 1]);

				var valueAfterItemAdded = arrayAttr.get("value");
				assert.lengthOf(valueAfterItemAdded, 3,
					"No se ha devuelto el número de elementos esperado tras añadir");

				assert.strictEqual(arrayAttr._length, 3,
					"La propiedad '_length' no está en sincronía con el número de elementos real tras añadir");

				assert.deepEqual(valueAfterItemAdded.pop(), serializedNewValue[serializedNewValue.length - 1],
					"No se ha devuelto en último lugar el elemento añadido");

				assert.sameDeepMembers(valueAfterItemAdded, serializedValue,
					"No se han devuelto los elementos iniciales antes del añadido posteriormente");

				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");
			},

			"check deleteValue": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				arrayAttr.deleteValue(value.length - 1);

				var valueAfterItemDeleted = arrayAttr.get("value");
				assert.lengthOf(valueAfterItemDeleted, 1,
					"No se ha devuelto el número de elementos esperado tras eliminar");

				assert.strictEqual(arrayAttr._length, 1,
					"La propiedad '_length' no está en sincronía con el número de elementos real tras eliminar");

				assert.deepEqual(valueAfterItemDeleted[0], serializedValue[0],
					"No se ha devuelto el elemento inicial restante tras eliminar el otro");

				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");
			},

			"check setter": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				arrayAttr.set("value", newValue);
				assert.sameDeepMembers(arrayAttr.get("value"), serializedNewValue,
					"El getter de value no devuelve el valor seteado");

				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");
			},

			"check deserialize": function() {

				arrayAttr.deserialize(newValue);
				assert.sameDeepMembers(arrayAttr.get("value"), serializedNewValue,
					"Deserialize no ha propagado el valor");

				arrayAttr.reset();
				assert.sameDeepMembers(arrayAttr.get("value"), serializedValue,
					"El valor no ha vuelto a su estado inicial antes de cambiarlo con deserialize hacia valor inicial");

				arrayAttr.deserialize(newValue, true);
				assert.sameDeepMembers(arrayAttr.get("value"), serializedNewValue,
					"Deserialize no ha propagado el valor");

				assert.sameDeepMembers(arrayAttr.get("_initValue"), serializedNewValue,
					"Deserialize no ha propagado el valor inicial");

				arrayAttr.deserialize(value, true);
			},

			"check serialize": function() {

				var serialized = arrayAttr.serialize();

				assert.sameDeepMembers(serialized, arrayAttr.get("value"),
					"Serialize no devuelve el mismo valor que el getter de value");

				assert.sameDeepMembers(serialized, serializedValue, "Serialize no ha devuelto el valor almacenado");
			},

			Serialize_ShouldReturnSameOutputThanGetter_WhenSerializeAutocreatedInstance: function() {

				var dfd = this.async(timeout),
					extraItem = arrayAttr.get(2, true);

				extraItem.then(function(instance) {

					assert.deepEqual(instance.serialize(), instance.get('value'),
						'Serialize no devuelve el mismo valor que el getter de value para una instancia nueva de item');

					dfd.resolve();
				});
			},

			"check reset": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				arrayAttr.set("value", newValue);
				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				arrayAttr.reset();
				assert.sameDeepMembers(arrayAttr.get("value"), serializedValue,
					"Reset no ha restaurado la instancia al valor original");

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras resetear");
			},

			"check clear": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				arrayAttr.set("value", newValue);
				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				arrayAttr.clear();
				assert.sameMembers(arrayAttr.get("value"), serializedEmptyValue,
					"Clear no ha limpiado el valor de la propiedad");

				var itemUuid = arrayAttr._itemIdsByPosition[0];
				assert.strictEqual(arrayAttr._getItemIndex(itemUuid), -1,
					"El método '_getItemIndex' no devuelve el valor esperado para el UUID inexistente proporcionado");

				assert.isTrue(arrayAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras limpiar");
			},

			"check validate": function() {

				assert.strictEqual(arrayAttr.get("schema"), schema, "El schema original se ha modificado");

				// Valores permitidos

				assert.isTrue(arrayAttr.get("isValid"), "El modelo cree que el valor no es válido");

				arrayAttr.set("value", newValue);
				assert.isTrue(arrayAttr.get("isValid"), "La validación falla con un valor válido");

				arrayAttr.clear();
				assert.isTrue(arrayAttr.get("isValid"), "El modelo cree que el valor vacío no es válido");

				arrayAttr.set("value", value.slice(0, 1));
				assert.isTrue(arrayAttr.get("isValid"), "El modelo cree que el valor array de longitud 1 no es válido");

				arrayAttr.set("value", newValue.slice(0).concat(value.slice(0, 1)));
				assert.isTrue(arrayAttr.get("isValid"), "El modelo cree que el valor array de longitud 4 no es válido");
			},

			"check hasChanged after set item value": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				var itemInstance = arrayAttr.get(0);
				assert.isDefined(itemInstance, "No se ha encontrado la instancia del elemento");

				itemInstance.deserialize(value[1]);

				assert.isTrue(arrayAttr.get("hasChanged"),
					"No se ha actualizado correctamente el estado de modificación tras setear un elemento");
			},

			"check isValid after set invalid value to item": function() {

				assert.isTrue(arrayAttr.get("isValid"), "El modelo cree que el valor no es válido");

				var itemInstance = arrayAttr.get(0);
				assert.isDefined(itemInstance, "No se ha encontrado la instancia del elemento");

				itemInstance.deserialize(null);

				assert.isFalse(arrayAttr.get("isValid"),
					"El modelo cree que el valor es válido tras setear un valor inválido en un elemento");
			},

			"check items compaction after delete intermediate item": function() {

				assert.isFalse(arrayAttr.get("hasChanged"),
					"No se ha inicializado correctamente el estado de modificación");

				arrayAttr.set("value", newValue);
				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				var expectedValueLengthAfterDelete = newValue.length - 1;

				arrayAttr.deleteValue(1);

				var valueAfterItemDeleted = arrayAttr.get("value");
				assert.lengthOf(valueAfterItemDeleted, expectedValueLengthAfterDelete,
					"No se ha devuelto el número de elementos esperado tras eliminar");

				assert.strictEqual(arrayAttr._length, expectedValueLengthAfterDelete,
					"La propiedad '_length' no está en sincronía con el número de elementos real tras eliminar");

				assert.deepEqual(valueAfterItemDeleted[0], serializedNewValue[0],
					"No se ha devuelto el elemento esperado en la posición 0 tras eliminar");

				assert.deepEqual(valueAfterItemDeleted[1], serializedNewValue[2],
					"No se ha devuelto el elemento esperado en la posición 1 tras eliminar");

				assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado el estado de modificación");

				assert.lengthOf(Object.keys(arrayAttr._itemIdsByPosition), expectedValueLengthAfterDelete,
					"El índice de elementos por posición no tiene el número de entradas esperado tras eliminar");

				var key,
					count = 0;

				for (key in arrayAttr._itemIdsByPosition) {
					var itemIdByPosition = arrayAttr._itemIdsByPosition[key];
					assert.strictEqual(key, count.toString(),
						"Las claves del índice de elementos por posición no son las esperadas");

					var itemInstance = arrayAttr._items[itemIdByPosition];
					assert.isDefined(itemInstance, "No se ha encontrado la instancia de un elemento indexado");

					assert.strictEqual(itemInstance.modelInstanceName, itemIdByPosition,
						"El atributo 'name' del elemento no se corresponde con su posición actual");

					var itemPathEnding = itemInstance.modelInstancePath.split(pathSeparator).pop();
					assert.strictEqual(itemPathEnding, itemIdByPosition,
						"El atributo 'path' del elemento no se corresponde con su posición actual");

					count++;
				}
			}
		};


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [1, 2];

			serializedValue = value.slice(0);

			newValue = ["a", "b", "c"];

			serializedNewValue = newValue.slice(0);

			serializedEmptyValue = [];

			emptyItemValue = null;

			schema = {
				"type": "array",
				"items": {
					type: ["number", "string"]
				}
			};

			name = "hijo";
			path = "padre/";

			arrayAttr = new ArrayAttr({
				modelInstanceName: name,
				modelInstancePath: path
			});
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(arrayAttr.get("schema"), "Schema no definido");
			assert.isNotOk(arrayAttr.value, "Atributo 'value' definido, no permitido");
			assert.strictEqual(arrayAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(arrayAttr.modelInstancePath, path + name,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");
		}
	};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check hasChanged after reinitialization to null": function() {

			assert.isFalse(arrayAttr.get("hasChanged"),
				"No se ha inicializado correctamente el estado de modificación");

			arrayAttr.clear();
			assert.isTrue(arrayAttr.get("hasChanged"), "No se ha actualizado correctamente el estado de modificación");

			arrayAttr.deserialize([], true);
			assert.isFalse(arrayAttr.get("hasChanged"),
				"No se ha reinicializado correctamente el estado de modificación");

			arrayAttr.deserialize(value, true);
			assert.isFalse(arrayAttr.get("hasChanged"),
				"No se ha reinicializado correctamente el estado de modificación");
		}
	});

	specificProps.tests = specificTests;
	registerSuite("ArrayAttr with Attr elements (number, string) and generic tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [1, 2];

			serializedValue = value.slice(0);

			newValue = value.slice(0);
			newValue.push(3);

			serializedNewValue = newValue.slice(0);

			serializedEmptyValue = [];

			emptyItemValue = null;

			schema = {
				"type": "array",
				"minItems": 2,
				"maxItems": 3,
				"items": {
					type: "integer"
				}
			};

			arrayAttr = new ArrayAttr();
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		},

		beforeEach: function() {

			arrayAttr.reset();
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(arrayAttr.get("schema"), "Schema no definido");
			assert.isNotOk(arrayAttr.value, "Atributo 'value' definido, no permitido");

			//assert.isTrue(arrayAttr.get(0).get("isRequired"),
			//	"La instancia de un elemento requerido del array cree que no lo es");

			//assert.isTrue(arrayAttr.get(1).get("isRequired"),
			//	"La instancia de un elemento requerido del array cree que no lo es");

			//assert.isFalse(arrayAttr.get(2).get("isRequired"),
			//	"La instancia de un elemento no requerido del array cree que si lo es");
		},

		"check validate": function() {

			assert.strictEqual(arrayAttr.get("schema"), schema, "El schema original se ha modificado");

			// Valores permitidos

			assert.isTrue(arrayAttr.get("isValid"), "El modelo cree que el valor no es válido");

			arrayAttr.set("value", newValue);
			assert.isTrue(arrayAttr.get("isValid"), "La validación falla con un valor válido");

			arrayAttr.set("value", [0, 0]);
			assert.isTrue(arrayAttr.get("isValid"), "La validación falla con un array válido de ceros");

			// Valores no permitidos

			arrayAttr.set("value", null);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor null es válido");

			arrayAttr.set("value", undefined);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor undefined es válido");

			arrayAttr.set("value", "a");
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que un valor de tipo string es válido");

			arrayAttr.set("value", 1);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que un valor de tipo entero es válido");

			arrayAttr.set("value", [null]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de null es válido");

			arrayAttr.set("value", [undefined]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de undefined es válido");

			arrayAttr.set("value", [null, undefined]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de null y undefined es válido");

			arrayAttr.set("value", []);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de longitud 0 es válido");

			arrayAttr.set("value", ["a", "b"]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de string es válido");

			arrayAttr.set("value", ["a", 2]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de string y entero es válido");

			arrayAttr.set("value", [1]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de longitud 1 es válido");

			arrayAttr.set("value", [1, 2, 3, 4]);
			assert.isFalse(arrayAttr.get("isValid"), "El modelo cree que el valor array de longitud 4 es válido");
		},

		"check invalid set": function() {

			_ModelTestCommons.setAndCheckInvalidValues(arrayAttr, [
				null, undefined, "a", 1, [null], [undefined], [null, undefined], [], ["a", "b"], ["a", 2], [1],
				[1, 2, 3, 4]
			]);
		}
	};

	specificProps.tests = specificTests;
	registerSuite("ArrayAttr with limits tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [{
				id: 1,
				name: "contacto1"
			},{
				id: 2,
				name: "contacto2"
			}];

			serializedValue = [1, 2];

			newValue = value.slice(0);
			newValue.push({
				id: 3,
				name: "contacto3"
			});

			serializedNewValue = serializedValue.slice(0);
			serializedNewValue.push(3);

			serializedEmptyValue = [];

			emptyItemValue = null;

			schema = {
				"type": "array",
				"items": {
					type: "integer",
					"url": "contact"
				}
			};

			arrayAttr = new ArrayAttr();
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ArrayAttr with RelationAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [{
				"prop1": 1,
				"prop2": "2"
			},{
				"prop1": 3,
				"prop2": "4"
			}];

			serializedValue = value.slice(0);

			newValue = value.slice(0);
			newValue.push({
				"prop1": 5,
				"prop2": "6"
			});

			serializedNewValue = newValue.slice(0);

			serializedEmptyValue = [];

			emptyItemValue = {
				"prop1": null,
				"prop2": null
			};

			schema = {
				"type": "array",
				"items": {
					type: "object",
					"properties": {
						prop1: {
							type: "integer"
						},
						prop2: {
							type: "string"
						}
					}
				}
			};

			name = "hijo";
			path = "padre/";

			arrayAttr = new ArrayAttr({
				pathSeparator: pathSeparator,
				modelInstanceName: name,
				modelInstancePath: path
			});
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(arrayAttr.get("schema"), "Schema no definido");
			assert.isNotOk(arrayAttr.value, "Atributo 'value' definido, no permitido");

			var pathLevel1 = path + name;
			assert.strictEqual(arrayAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(arrayAttr.modelInstancePath, pathLevel1,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");

			var itemIndex = 0,
				itemName = arrayAttr._itemIdsByPosition[itemIndex],
				firstElement = arrayAttr.get(itemIndex),
				pathLevel2 = pathLevel1 + pathSeparator + itemName;

			assert.strictEqual(firstElement.modelInstanceName, itemName,
				"El atributo 'modelInstanceName' no corresponde al item hijo");

			assert.strictEqual(firstElement.modelInstancePath, pathLevel2,
				"El atributo 'modelInstancePath' no corresponde al item hijo");

			var propertyName = "prop1",
				firstChildElement = firstElement.get(propertyName),
				pathLevel3 = pathLevel2 + pathSeparator + propertyName;

			assert.strictEqual(firstChildElement.modelInstanceName, propertyName,
				"El atributo 'modelInstanceName' no corresponde al item nieto");

			assert.strictEqual(firstChildElement.modelInstancePath, pathLevel3,
				"El atributo 'modelInstancePath' no corresponde al item nieto");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ArrayAttr with ObjAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [[1, 2], [3, 4]];

			serializedValue = value.slice(0);

			newValue = value.slice(0);
			newValue.push([5, 6]);

			serializedNewValue = newValue.slice(0);

			serializedEmptyValue = [];

			emptyItemValue = [];

			schema = {
				"type": "array",
				"items": {
					type: "array",
					"items": {
						type: "integer"
					}
				}
			};

			name = "hijo";
			path = "padre/";

			arrayAttr = new ArrayAttr({
				pathSeparator: pathSeparator,
				modelInstanceName: name,
				modelInstancePath: path
			});
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			assert.isOk(arrayAttr.get("schema"), "Schema no definido");
			assert.isNotOk(arrayAttr.value, "Atributo 'value' definido, no permitido");

			var pathLevel1 = path + name;
			assert.strictEqual(arrayAttr.modelInstanceName, name,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(arrayAttr.modelInstancePath, pathLevel1,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");

			var itemIndex = 0,
				itemName = arrayAttr._itemIdsByPosition[itemIndex],
				firstElement = arrayAttr.get(itemIndex),
				pathLevel2 = pathLevel1 + pathSeparator + itemName;

			assert.strictEqual(firstElement.modelInstanceName, itemName,
				"El atributo 'modelInstanceName' no corresponde al item hijo");

			assert.strictEqual(firstElement.modelInstancePath, pathLevel2,
				"El atributo 'modelInstancePath' no corresponde al item hijo");

			var firstChildElement = firstElement.get(itemIndex),
				firstChildElementName = firstElement._itemIdsByPosition[itemIndex],
				pathLevel3 = pathLevel2 + pathSeparator + firstChildElementName;

			assert.strictEqual(firstChildElement.modelInstanceName, firstChildElementName,
				"El atributo 'modelInstanceName' no corresponde al item nieto");

			assert.strictEqual(firstChildElement.modelInstancePath, pathLevel3,
				"El atributo 'modelInstancePath' no corresponde al item nieto");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ArrayAttr with ArrayAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [1, 2, 3]
				},
				properties: {}
			},{
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [4, 5, 6]
				},
				properties: {}
			}];

			serializedValue = value.slice(0);

			newValue = value.slice(0);
			newValue.push({
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [7, 8, 9]
				},
				properties: {}
			});

			serializedNewValue = newValue.slice(0);

			serializedEmptyValue = [];

			emptyItemValue = {
				type: null,
				geometry: {
					type: null,
					coordinates: []
				},
				properties: {}
			};

			schema = {
				"type": "array",
				"items": {
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
			};

			arrayAttr = new ArrayAttr();
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ArrayAttr with GeometryAttr elements tests", specificProps);

	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = [{
				"contact": {
					id: 1,
					firstname: "contacto1"
				},
				"contactRole": {
					id: 1,
					name: "rol1"
				},
				"organisation": {
					id: 1,
					name: "organizacion1"
				}
			},{
				"contact": {
					id: 2,
					firstname: "contacto2"
				},
				"contactRole": {
					id: 2,
					name: "rol2"
				},
				"organisation": {
					id: 2,
					name: "organizacion2"
				}
			}];

			serializedValue = [{
				"contact": 1,
				"contactRole": 1,
				"organisation": 1
			},{
				"contact": 2,
				"contactRole": 2,
				"organisation": 2
			}];

			newValue = value.slice(0);
			newValue.push({
				"contact": {
					id: 3,
					firstname: "contacto3"
				},
				"contactRole": {
					id: 3,
					name: "rol3"
				},
				"organisation":{
					id: 3,
					name: "organizacion3"
				}
			});

			serializedNewValue = serializedValue.slice(0);
			serializedNewValue.push({
				"contact": 3,
				"contactRole": 3,
				"organisation": 3
			});

			serializedEmptyValue = [];

			emptyItemValue = {
				"contact": null,
				"contactRole": null,
				"organisation": null
			};

			schema = {
				"type": "array",
				"items": {
					type: "object",
					required : [],
					properties: {
						contact: {
							"type": "integer",
							"url": "contact"
						},
						contactRole: {
							"type": "integer",
							"url": "contactRole"
						},
						organisation: {
							"type": "integer",
							"url": "organisation"
						}
					}
				}
			};

			name = "hijo";
			path = "padre/";

			arrayAttr = new ArrayAttr({
				pathSeparator: pathSeparator,
				modelInstanceName: name,
				modelInstancePath: path
			});
			arrayAttr.build(schema).then(dfd.callback(function() {

				arrayAttr.deserialize(value, true);
			}));
		}
	};

	specificTests = {
		"check constructor": function() {

			var itemIndex = 0,
				itemName = arrayAttr._itemIdsByPosition[itemIndex],
				relationName = "contact",
				relationPath = path + name + pathSeparator + itemName + pathSeparator + relationName,
				relationInstance = arrayAttr.get(itemIndex).get(relationName);

			assert.strictEqual(relationInstance.modelInstanceName, relationName,
				"El atributo 'modelInstanceName' no corresponde con la propiedad");

			assert.strictEqual(relationInstance.modelInstancePath, relationPath,
				"El atributo 'modelInstancePath' no corresponde con la propiedad");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;

	registerSuite("ArrayAttr with ObjAttr elements (containing RelationAttr elements) tests", specificProps);

	specificTests = {
		"check default integer": function() {

			var valueDefault = [1];
			schema = {
				"type": "array",
				"items": {
					type: "integer"
				},
				"default": JSON.stringify(valueDefault)
			};
			arrayAttr = new ArrayAttr({});

			arrayAttr.build(schema).then(function() {

				var serialized = arrayAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(arrayAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default string": function() {

			var valueDefault = ["1"];
			schema = {
				"type": "array",
				"items": {
					type: "string"
				},
				"default": JSON.stringify(valueDefault)
			};
			arrayAttr = new ArrayAttr({});

			arrayAttr.build(schema).then(function() {

				var serialized = arrayAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(arrayAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default object": function() {

			var valueDefault = [{id: 1}];
			schema = {
				"type": "array",
				"items": {
					type: "object",
					required : ["id"],
					properties: {
						id: {
							"type": "integer"
						}
					}
				},
				"default": JSON.stringify(valueDefault)
			};
			arrayAttr = new ArrayAttr({});

			arrayAttr.build(schema).then(function() {

				var serialized = arrayAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(arrayAttr.isValid,
					"El modelo no es válido");
			});
		},

		"check default array": function() {

			var valueDefault = [["1"]];
			schema = {
				"type": "array",
				"items": {
					type: "array",
					"items": {
						type: "string"
					}
				},
				"default": JSON.stringify(valueDefault)
			};
			arrayAttr = new ArrayAttr({});

			arrayAttr.build(schema).then(function() {

				var serialized = arrayAttr.serialize();

				assert.strictEqual(serialized, valueDefault,
					"Serialize no devuelve el valor esperado");

				assert.isTrue(arrayAttr.isValid,
					"El modelo no es válido");
			});
		}
	};

	registerSuite("ArrayAttr with default value tests", specificTests);

	specificTests = {
		'check build arrayAttr': function() {

			var dfd = this.async(timeout);

			value = [[[[-15.705093745999932,28.59109120200003],[-15.316666667999982,28.36666667000003],[-14.599999999999966,28.31666666900003],[-14.504999999999939,28.06333333300006],[-14.733333332999962,27.750000000000057],[-15.146883332999948,27.86036666700005],[-15.385788531999935,27.861680168000078],[-15.384753247999981,27.926196745000027],[-15.358547956999928,27.93109262200005],[-15.384397467999975,27.96739774100007],[-15.367359398999952,27.989907971000036],[-15.373178980999967,28.00939567300003],[-15.419745749999947,28.06075803300007],[-15.411019242999942,28.100891124000043],[-15.42769666099997,28.14678224800008],[-15.411976451999976,28.12812552300005],[-15.406894870999963,28.15828677500008],[-15.407925921999947,28.137109268000074],[-15.407617073999972,28.132893941000077],[-15.40463428399994,28.13067385900007],[-15.40484506499996,28.121302068000034],[-15.404587313999969,28.121303027000067],[-15.398129357999949,28.16170648900004],[-15.40524368499996,28.166095683000037],[-15.40687416399993,28.178094473000044],[-15.420158583999978,28.181605267000066],[-15.43300088899997,28.170665031000055],[-15.442912900999943,28.166405862000033],[-15.437539466999965,28.13773360600004],[-15.467410639999969,28.126054561000046],[-15.526840214999936,28.15521127900007],[-15.598548987999948,28.14427407900007],[-15.637473676999946,28.17212199000005],[-15.666461358999982,28.157975794000038],[-15.683201769999982,28.170594937000033],[-15.708604608999963,28.16603004700005],[-15.69623820399994,28.151605282000048],[-15.709311423999964,28.121226198000045],[-15.710882975999937,28.083060342000067],[-15.765672192999943,28.046182914000042],[-15.786254133999932,28.021127680000063],[-15.822712543999955,28.013773468000068],[-15.819550773999936,28.000000000000057],[-15.999999999999943,28.000000000000057],[-15.999999999999943,27.733333333000076],[-16.216249999999945,27.976366667000036],[-16.325349999999958,28.058933333000027],[-16.548066667999933,28.024600000000078],[-16.42570566699993,28.149307342000043],[-16.424693910999963,28.204588152000042],[-16.361431464999953,28.30437390800006],[-16.36107709999993,28.37862492900007],[-16.300590390999957,28.414404670000067],[-16.24275765999994,28.46805749400005],[-16.247016791999954,28.455679343000043],[-16.235586444999967,28.479072087000077],[-16.24624732099994,28.471025847000078],[-16.237009694999927,28.48554530800004],[-16.225244019999934,28.48373663800004],[-16.167128660999936,28.518511708000062],[-16.124988815999927,28.53262488400003],[-16.129437706999965,28.53672545200004],[-16.119592920999935,28.552645230000053],[-16.120791555999972,28.558501874000058],[-16.119729020999955,28.559401752000042],[-16.121695602999978,28.55899366700004],[-16.12557509399994,28.561890386000073],[-16.124358383999947,28.563279042000033],[-16.12628198699997,28.571132959000067],[-16.13403396999996,28.573886900000048],[-16.13737935499995,28.582928484000035],[-16.06666666899997,28.800000000000068],[-15.705093745999932,28.59109120200003]]]];

			schema = {
				type: "array",
				minItems: 1,
				items: {
					type: "array",
					minItems: 1,
					items: {
						type: "array",
						minItems: 4,
						items: {
							type: "array",
							minItems: 2,
							maxItems: 2,
							items: {
								type: "number",
								maximum: 180,
								minimum: -180
							}
						}
					}
				}
			};

			arrayAttr = new ArrayAttr();
			arrayAttr.build(schema).then(dfd.callback(function() {
				arrayAttr.deserialize(value, false);
			}));
		}
	};

	registerSuite("ArrayAttr with Polygon GeometryAttr elements tests", specificTests);
});
