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

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
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

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
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

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ArrayAttr with RelationAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
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

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
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

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ArrayAttr with GeometryAttr elements tests", specificProps);

	specificProps = {
		before: function() {

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

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
			arrayAttr.build(schema).then(function() {

				arrayAttr.deserialize(value, true);
			});
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

			var valueDefault = [1],
				schema = {
					"type": "array",
					"items": {
						type: "integer"
					},
					"default": JSON.stringify(valueDefault)
				},
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

			var valueDefault = ["1"],
				schema = {
					"type": "array",
					"items": {
						type: "string"
					},
					"default": JSON.stringify(valueDefault)
				},
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

			var valueDefault = [{id: 1}],
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
				},
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

			var valueDefault = [["1"]],
				schema = {
					"type": "array",
					"items": {
						type: "array",
						"items": {
							type: "string"
						}
					},
					"default": JSON.stringify(valueDefault)
				},
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

			// ArrayAttr necesita tiempo para requerir la definición de sus items
			var dfd = this.async(timeout);
			setTimeout(lang.hitch(dfd, dfd.resolve), timeout - 1);

			var value = [[[[-15.705093745999932,28.59109120200003],[-15.316666667999982,28.36666667000003],[-14.599999999999966,28.31666666900003],[-14.504999999999939,28.06333333300006],[-14.733333332999962,27.750000000000057],[-15.146883332999948,27.86036666700005],[-15.385788531999935,27.861680168000078],[-15.384753247999981,27.926196745000027],[-15.358547956999928,27.93109262200005],[-15.384397467999975,27.96739774100007],[-15.367359398999952,27.989907971000036],[-15.373178980999967,28.00939567300003],[-15.419745749999947,28.06075803300007],[-15.411019242999942,28.100891124000043],[-15.42769666099997,28.14678224800008],[-15.411976451999976,28.12812552300005],[-15.406894870999963,28.15828677500008],[-15.407925921999947,28.137109268000074],[-15.407617073999972,28.132893941000077],[-15.40463428399994,28.13067385900007],[-15.40484506499996,28.121302068000034],[-15.404587313999969,28.121303027000067],[-15.398129357999949,28.16170648900004],[-15.40524368499996,28.166095683000037],[-15.40687416399993,28.178094473000044],[-15.420158583999978,28.181605267000066],[-15.43300088899997,28.170665031000055],[-15.442912900999943,28.166405862000033],[-15.437539466999965,28.13773360600004],[-15.467410639999969,28.126054561000046],[-15.526840214999936,28.15521127900007],[-15.598548987999948,28.14427407900007],[-15.637473676999946,28.17212199000005],[-15.666461358999982,28.157975794000038],[-15.683201769999982,28.170594937000033],[-15.708604608999963,28.16603004700005],[-15.69623820399994,28.151605282000048],[-15.709311423999964,28.121226198000045],[-15.710882975999937,28.083060342000067],[-15.765672192999943,28.046182914000042],[-15.786254133999932,28.021127680000063],[-15.822712543999955,28.013773468000068],[-15.819550773999936,28.000000000000057],[-15.999999999999943,28.000000000000057],[-15.999999999999943,27.733333333000076],[-16.216249999999945,27.976366667000036],[-16.325349999999958,28.058933333000027],[-16.548066667999933,28.024600000000078],[-16.42570566699993,28.149307342000043],[-16.424693910999963,28.204588152000042],[-16.361431464999953,28.30437390800006],[-16.36107709999993,28.37862492900007],[-16.300590390999957,28.414404670000067],[-16.24275765999994,28.46805749400005],[-16.247016791999954,28.455679343000043],[-16.235586444999967,28.479072087000077],[-16.24624732099994,28.471025847000078],[-16.237009694999927,28.48554530800004],[-16.225244019999934,28.48373663800004],[-16.167128660999936,28.518511708000062],[-16.124988815999927,28.53262488400003],[-16.129437706999965,28.53672545200004],[-16.119592920999935,28.552645230000053],[-16.120791555999972,28.558501874000058],[-16.119729020999955,28.559401752000042],[-16.121695602999978,28.55899366700004],[-16.12557509399994,28.561890386000073],[-16.124358383999947,28.563279042000033],[-16.12628198699997,28.571132959000067],[-16.13403396999996,28.573886900000048],[-16.13737935499995,28.582928484000035],[-16.06666666899997,28.800000000000068],[-15.705093745999932,28.59109120200003]],[[-16.13225076599997,28.581151763000037],[-16.13220820899994,28.581207083000038],[-16.132272943999965,28.58123677900005],[-16.132262357999934,28.581164843000067],[-16.13225076599997,28.581151763000037]],[[-16.132251680999957,28.581103558000052],[-16.13227372999995,28.581033336000075],[-16.13226799299997,28.581013167000037],[-16.132204813999977,28.581052414000055],[-16.132251680999957,28.581103558000052]],[[-16.13446593599997,28.578726680000045],[-16.13437212599996,28.578378987000065],[-16.13427540899994,28.57834170800004],[-16.134162880999952,28.578660349000074],[-16.13446593599997,28.578726680000045]],[[-16.134534242999962,28.578165170000034],[-16.134481019999953,28.578169586000058],[-16.134457435999934,28.57820137300007],[-16.134538685999928,28.578179032000037],[-16.134534242999962,28.578165170000034]],[[-16.134512685999937,28.57799521800007],[-16.134581898999954,28.577985072000047],[-16.134634716999926,28.577895278000028],[-16.134550960999945,28.577884244000074],[-16.134512685999937,28.57799521800007]],[[-16.13447640399994,28.57712013200006],[-16.134438915999965,28.57712351400005],[-16.134439378999957,28.57713804100007],[-16.134475936999934,28.577133765000042],[-16.13447640399994,28.57712013200006]],[[-16.134810330999926,28.57699576500005],[-16.134785731999955,28.57699010400006],[-16.134772878999968,28.577021530000025],[-16.13480444199996,28.577028126000073],[-16.134810330999926,28.57699576500005]],[[-16.13383522199996,28.57507966600008],[-16.133791695999946,28.575072899000077],[-16.13379568099998,28.575110773000063],[-16.133825599999966,28.575116661000038],[-16.13383522199996,28.57507966600008]],[[-16.13357117499993,28.574797927000077],[-16.133537875999934,28.57484856900004],[-16.13358472999994,28.57486063300007],[-16.133591045999935,28.574839370000063],[-16.13357117499993,28.574797927000077]],[[-16.130853139999942,28.574060926000072],[-16.13088070999993,28.573962047000066],[-16.130810012999973,28.573919313000033],[-16.130772044999958,28.57402116700007],[-16.130853139999942,28.574060926000072]],[[-16.12978063099996,28.57388989100008],[-16.12985042699995,28.573809974000028],[-16.129773160999946,28.573726590000035],[-16.129712833999974,28.57386969600003],[-16.12978063099996,28.57388989100008]],[[-16.12994960599997,28.57375300900003],[-16.130034984999952,28.573830189000034],[-16.13004580699993,28.573828655000057],[-16.130016171999955,28.573743971000056],[-16.12994960599997,28.57375300900003]],[[-16.12781767699994,28.572125293000056],[-16.127881934999948,28.572015098000065],[-16.127733562999936,28.572003514000073],[-16.12773199199995,28.57208629200005],[-16.12781767699994,28.572125293000056]],[[-16.12708369199993,28.571674426000072],[-16.12696658699997,28.571632256000044],[-16.126936513999965,28.571659673000056],[-16.12696114499994,28.57169719500007],[-16.12708369199993,28.571674426000072]],[[-16.12688175699998,28.571529437000038],[-16.126860246999968,28.571525735000023],[-16.12690714599995,28.571561358000054],[-16.126917340999967,28.571539521000034],[-16.12688175699998,28.571529437000038]],[[-16.126679732999946,28.571472088000064],[-16.126631002999943,28.571370142000035],[-16.126381978999973,28.571181048000028],[-16.126318999999967,28.571344302000057],[-16.126679732999946,28.571472088000064]],[[-16.126822215999937,28.571401227000024],[-16.12687591499997,28.571432100000038],[-16.12690510899995,28.571399004000057],[-16.12686985099998,28.571352364000063],[-16.126822215999937,28.571401227000024]],[[-16.126184141999943,28.57091192200005],[-16.126118711999936,28.570941076000054],[-16.126118521999956,28.570951998000055],[-16.12617536399995,28.570980590000033],[-16.126184141999943,28.57091192200005]],[[-16.126125096999942,28.570791830000076],[-16.126164477999964,28.570726338000043],[-16.126163282999983,28.570710193000025],[-16.126059631999965,28.570807987000023],[-16.126125096999942,28.570791830000076]],[[-16.126180671999975,28.569299710000053],[-16.12626474299998,28.569273830000043],[-16.12629389899996,28.569198766000056],[-16.126080917999957,28.56932174700006],[-16.126180671999975,28.569299710000053]],[[-16.12601941899993,28.569210972000064],[-16.126112921999948,28.569120482000073],[-16.126078639999946,28.56906932100003],[-16.126011845999926,28.569075832000067],[-16.12601941899993,28.569210972000064]],[[-16.12613470499997,28.569178607000026],[-16.12614790599997,28.569198895000056],[-16.126178852999942,28.569157662000066],[-16.12614955999993,28.569143103000044],[-16.12613470499997,28.569178607000026]],[[-16.125607999999943,28.568998313000066],[-16.125636548999978,28.568991036000057],[-16.12570913899998,28.568895033000047],[-16.125622870999962,28.56891614700004],[-16.125607999999943,28.568998313000066]],[[-16.125862042999927,28.568775801000072],[-16.125914741999964,28.568770579000045],[-16.125950899999964,28.56870015100003],[-16.12585261399994,28.568716039000037],[-16.125862042999927,28.568775801000072]],[[-16.12600744899993,28.566434979000064],[-16.12578560399993,28.566349091000063],[-16.125628243999927,28.56637593800008],[-16.12598795399998,28.566457254000056],[-16.12600744899993,28.566434979000064]],[[-16.12527645399996,28.56643364200005],[-16.125287628999956,28.566369377000058],[-16.125198761999968,28.56642462800005],[-16.12526780199994,28.566456368000047],[-16.12527645399996,28.56643364200005]],[[-16.125419584999975,28.56637613500004],[-16.125369561999946,28.566392526000072],[-16.12533948099997,28.566390338000076],[-16.12540022899998,28.566411405000053],[-16.125419584999975,28.56637613500004]],[[-16.12575297899997,28.56571396000004],[-16.12574689799993,28.565642167000078],[-16.125639236999973,28.56567979400006],[-16.125735126999928,28.56568883600005],[-16.12575297899997,28.56571396000004]],[[-16.12640648599995,28.565505100000053],[-16.126417062999963,28.565471167000055],[-16.126361162999956,28.56543480600004],[-16.126371821999953,28.565495008000028],[-16.12640648599995,28.565505100000053]],[[-16.12644259399997,28.565497400000027],[-16.126474464999944,28.565494969000042],[-16.12644039999998,28.565425755000035],[-16.126425746999928,28.56544185100006],[-16.12644259399997,28.565497400000027]],[[-16.125967440999943,28.565077772000052],[-16.125978995999958,28.565049155000054],[-16.12593368599994,28.56504727400005],[-16.125930898999968,28.565054247000035],[-16.125967440999943,28.565077772000052]],[[-16.12639372299998,28.565007534000074],[-16.12642467699993,28.565062966000028],[-16.126448678999964,28.565070438000078],[-16.126435319999928,28.56498715200007],[-16.12639372299998,28.565007534000074]],[[-16.126277045999927,28.564851187000045],[-16.126237379999964,28.564860902000078],[-16.126277952999942,28.564897932000065],[-16.126309366999976,28.56486220100004],[-16.126277045999927,28.564851187000045]],[[-16.12595491999997,28.56469862000006],[-16.125825073999977,28.56468814400006],[-16.125776504999976,28.564735390000067],[-16.125926125999968,28.56474037600003],[-16.12595491999997,28.56469862000006]],[[-16.125797544999955,28.564675917000045],[-16.125858651999977,28.56463470500006],[-16.12567682799994,28.56464893900005],[-16.12573662999995,28.564677325000048],[-16.125797544999955,28.564675917000045]],[[-16.123723737999967,28.56234644700004],[-16.12391562199997,28.562288358000046],[-16.12337215699995,28.562191590000054],[-16.123659687999975,28.56225482600007],[-16.123723737999967,28.56234644700004]],[[-16.122673040999928,28.56122251900007],[-16.122719684999936,28.561215455000024],[-16.12274777899995,28.56119446300005],[-16.122672740999974,28.561165300000027],[-16.122673040999928,28.56122251900007]],[[-16.12298052099993,28.56092140900006],[-16.123035932999926,28.56070984100006],[-16.12303139599993,28.560658071000034],[-16.122806408999963,28.56084288200003],[-16.12298052099993,28.56092140900006]],[[-16.12307761699998,28.56078449900008],[-16.12319237199995,28.560741309000036],[-16.12322831499995,28.56063153200006],[-16.123098011999957,28.56062557000007],[-16.12307761699998,28.56078449900008]],[[-16.123017619999928,28.560901155000067],[-16.12305286299994,28.56089860800006],[-16.123064916999965,28.560801482000045],[-16.12302923699997,28.560830208000027],[-16.123017619999928,28.560901155000067]],[[-16.12305747099998,28.56026379800005],[-16.122769691999963,28.56031157700005],[-16.12265794299998,28.560406730000068],[-16.123029132999932,28.560435158000075],[-16.12305747099998,28.56026379800005]],[[-16.12271571399998,28.55999360100003],[-16.122704816999942,28.560035931000073],[-16.122732407999933,28.56007352000006],[-16.12273574699998,28.56004136100006],[-16.12271571399998,28.55999360100003]],[[-16.120595598999955,28.559878527000023],[-16.120709164999937,28.559714496000026],[-16.12011334999994,28.559766970000055],[-16.12027815999994,28.559967486000062],[-16.120595598999955,28.559878527000023]],[[-16.12129013799995,28.559730673000047],[-16.12135127299996,28.559724139000025],[-16.12138017999996,28.55968426800007],[-16.121286819999966,28.55965290000006],[-16.12129013799995,28.559730673000047]],[[-16.12157336499996,28.559642238000038],[-16.121679649999976,28.559658481000042],[-16.12170337999993,28.559618175000026],[-16.121653084999934,28.559608671000035],[-16.12157336499996,28.559642238000038]],[[-16.122352606999982,28.55984028000006],[-16.122401371999956,28.559840509000026],[-16.122405278999963,28.559832895000056],[-16.12237387899995,28.559821783000075],[-16.122352606999982,28.55984028000006]],[[-16.12266534099996,28.55983218800003],[-16.12265184699993,28.559851524000067],[-16.12269860999993,28.559846083000025],[-16.122691287999942,28.559830439000052],[-16.12266534099996,28.55983218800003]],[[-16.12151474899997,28.559426405000067],[-16.121495874999937,28.55934317300006],[-16.12134486599996,28.559461068000076],[-16.121448520999934,28.559465429000056],[-16.12151474899997,28.559426405000067]],[[-16.119665769999926,28.55924219600007],[-16.119838124999944,28.55916177200004],[-16.119950182999958,28.55901467800004],[-16.11951242699996,28.559259444000077],[-16.119665769999926,28.55924219600007]],[[-16.12016388799998,28.559089722000067],[-16.120234900999947,28.559095978000073],[-16.120243590999962,28.559050669000044],[-16.12019334599995,28.559059469000033],[-16.12016388799998,28.559089722000067]],[[-16.12022325099997,28.558808680000027],[-16.120185283999945,28.558756600000038],[-16.120097984999973,28.558859264000034],[-16.12016383899993,28.558875599000032],[-16.12022325099997,28.558808680000027]],[[-16.118595754999944,28.55693479100006],[-16.11849471299996,28.556935461000023],[-16.11846320799998,28.556977158000052],[-16.11869336899997,28.55700322200005],[-16.118595754999944,28.55693479100006]],[[-16.11864157399998,28.556820772000037],[-16.118576530999974,28.55671750500005],[-16.118489808999982,28.55684487600007],[-16.118646978999948,28.556901751000055],[-16.11864157399998,28.556820772000037]],[[-16.118883815999936,28.556713212000034],[-16.11889294699995,28.55664090500005],[-16.11878524699995,28.556671324000035],[-16.11883198099997,28.556709659000035],[-16.118883815999936,28.556713212000034]],[[-16.119285265999963,28.556654277000064],[-16.11943184599994,28.556626064000056],[-16.119108315999938,28.556563594000067],[-16.11910784099996,28.55657960900004],[-16.119285265999963,28.556654277000064]],[[-16.119139907999966,28.555575263000037],[-16.119201163999946,28.55542186300005],[-16.118679997999948,28.55547646800005],[-16.118990246999942,28.555614458000036],[-16.119139907999966,28.555575263000037]],[[-16.119539892999967,28.555160829000044],[-16.119569896999963,28.555140635000043],[-16.11953973699997,28.555103635000023],[-16.119503572999974,28.55514443100003],[-16.119539892999967,28.555160829000044]],[[-16.11959984799995,28.55202164700006],[-16.119673921999947,28.552012345000037],[-16.119676341999934,28.551947367000025],[-16.11955575199994,28.552002524000045],[-16.11959984799995,28.55202164700006]],[[-16.119406642999934,28.551464319000047],[-16.11969460399996,28.551408820000063],[-16.119074101999956,28.551514879000024],[-16.119263261999947,28.55152272400005],[-16.119406642999934,28.551464319000047]],[[-16.12025598599996,28.551287785000056],[-16.120159695999973,28.551321839000025],[-16.120057582999948,28.551309703000072],[-16.120222514999966,28.55136563700006],[-16.12025598599996,28.551287785000056]],[[-16.120434512999964,28.551194078000037],[-16.120503449999944,28.55100863800004],[-16.12011178499995,28.551038731000062],[-16.12025519699995,28.55118529600003],[-16.120434512999964,28.551194078000037]],[[-16.119736647999957,28.55085237700007],[-16.119677442999944,28.550802169000065],[-16.119601887999977,28.55083755900006],[-16.119631552999977,28.55088691000003],[-16.119736647999957,28.55085237700007]],[[-16.12173532999998,28.550297354000065],[-16.121730329999934,28.55036279500007],[-16.121800218999965,28.550338859000078],[-16.121795531999965,28.550330630000076],[-16.12173532999998,28.550297354000065]],[[-16.12356548799994,28.54950977900006],[-16.123534320999966,28.54948468500004],[-16.123508938999976,28.549487485000043],[-16.12354169799994,28.549526764000063],[-16.12356548799994,28.54950977900006]],[[-16.12411831099996,28.54948620500005],[-16.124176890999934,28.549495683000032],[-16.124181479999947,28.54946959700004],[-16.12408407199996,28.54947209200003],[-16.12411831099996,28.54948620500005]],[[-16.123903956999982,28.549165466000034],[-16.123826074999954,28.549108438000076],[-16.123740725999937,28.549160779000033],[-16.12386116099998,28.549244714000054],[-16.123903956999982,28.549165466000034]],[[-16.12498145799998,28.549056592000056],[-16.124926481999978,28.549037949000024],[-16.124847863999946,28.54909165400005],[-16.12490126199998,28.549100228000043],[-16.12498145799998,28.549056592000056]],[[-16.124777268999935,28.54904513400004],[-16.124850702999936,28.54899235700003],[-16.124550227999976,28.549014035000027],[-16.124572092999927,28.549051509000037],[-16.124777268999935,28.54904513400004]],[[-16.12443713199997,28.548966694000057],[-16.124454557999968,28.548895283000036],[-16.124327886999936,28.54899712100007],[-16.124404587999948,28.549001531000044],[-16.12443713199997,28.548966694000057]],[[-16.12503818899995,28.54896039600004],[-16.12504723899997,28.54904638900007],[-16.12516229399995,28.549055761000034],[-16.125167877999957,28.549012735000076],[-16.12503818899995,28.54896039600004]],[[-16.124725284999954,28.548793596000053],[-16.12469417899996,28.54878771700004],[-16.124638302999927,28.548817116000066],[-16.124734193999927,28.548830636000048],[-16.124725284999954,28.548793596000053]],[[-16.126465206999967,28.547615903000064],[-16.126375251999946,28.547693413000047],[-16.126178381999978,28.547703900000045],[-16.126537232999965,28.54780745200003],[-16.126465206999967,28.547615903000064]],[[-16.126080274999936,28.54763867400004],[-16.126056924999943,28.547436495000056],[-16.12577386499993,28.54738448100005],[-16.12595946299996,28.54761056700005],[-16.126080274999936,28.54763867400004]],[[-16.126244370999927,28.54757885400005],[-16.126272935999964,28.547606244000065],[-16.12635783099995,28.547575863000077],[-16.12629082099994,28.547513781000077],[-16.126244370999927,28.54757885400005]],[[-16.126690735999944,28.547093380000035],[-16.126674041999934,28.547050864000028],[-16.126555423999946,28.547066677000032],[-16.126670605999948,28.547121789000073],[-16.126690735999944,28.547093380000035]],[[-16.126540184999953,28.546987098000045],[-16.126523135999946,28.547006347000035],[-16.12659051199995,28.547013523000032],[-16.12658840299997,28.546999804000052],[-16.126540184999953,28.546987098000045]],[[-16.126572091999947,28.54690787800007],[-16.126537344999974,28.54689696500003],[-16.126504241999953,28.546918540000036],[-16.12656751999998,28.546942194000053],[-16.126572091999947,28.54690787800007]],[[-16.126825380999946,28.544015284000068],[-16.12674660899995,28.544009963000065],[-16.12671771099997,28.544054862000053],[-16.12673846599995,28.544063056000027],[-16.126825380999946,28.544015284000068]],[[-16.125523718999943,28.54359940300003],[-16.125432014999944,28.543602339000074],[-16.125376677999952,28.54364088500006],[-16.125667860999954,28.543637984000043],[-16.125523718999943,28.54359940300003]],[[-16.12640112899993,28.54329236800004],[-16.12636899699993,28.54328694900005],[-16.12635120999994,28.54341646900008],[-16.12638797799997,28.54340998200007],[-16.12640112899993,28.54329236800004]],[[-16.12757619399997,28.541550345000076],[-16.127539398999943,28.541550424000036],[-16.12749593799998,28.54157248300004],[-16.12756443799998,28.541612602000043],[-16.12757619399997,28.541550345000076]],[[-16.128097485999945,28.53836592500005],[-16.128276100999926,28.538136310000027],[-16.12825518699998,28.53802582000003],[-16.127942437999934,28.53839962400008],[-16.128097485999945,28.53836592500005]],[[-16.128078718999973,28.537802621000026],[-16.12826040799996,28.53775322100006],[-16.12828570399995,28.537713867000036],[-16.127968763999945,28.53765568500006],[-16.128078718999973,28.537802621000026]],[[-16.128329288999964,28.53749651100003],[-16.128155780999975,28.537543423000045],[-16.12813037799998,28.53757263400007],[-16.128236915999935,28.537607002000072],[-16.128329288999964,28.53749651100003]],[[-16.12864069899996,28.53710000800004],[-16.128568470999937,28.537101105000033],[-16.128594005999958,28.537184009000043],[-16.12861424199997,28.53718286700007],[-16.12864069899996,28.53710000800004]],[[-16.127504949999945,28.53597891000004],[-16.12735064499998,28.53598022700004],[-16.12766959499993,28.536072213000068],[-16.12762130799996,28.53601029200007],[-16.127504949999945,28.53597891000004]],[[-16.124860703999957,28.533921071000066],[-16.12480149099997,28.533759686000053],[-16.124638550999975,28.53372144900004],[-16.124618753999982,28.53391298400004],[-16.124860703999957,28.533921071000066]],[[-16.12482966899995,28.53338444700006],[-16.124766560999944,28.533417362000023],[-16.124819569999943,28.53346137400007],[-16.124847027999976,28.533420540000066],[-16.12482966899995,28.53338444700006]],[[-16.13682842099996,28.53285377000003],[-16.13685038899996,28.532862838000028],[-16.13687540199993,28.532836581000026],[-16.13683580199995,28.532813102000034],[-16.13682842099996,28.53285377000003]],[[-16.137914525999975,28.531779913000037],[-16.137939334999942,28.53171857500007],[-16.13782243099996,28.53172653100006],[-16.13784652299995,28.531773443000077],[-16.137914525999975,28.531779913000037]],[[-16.138292864999983,28.531605960000036],[-16.138257039999928,28.53157327100007],[-16.138239601999942,28.531585457000062],[-16.138276246999965,28.53165537900003],[-16.138292864999983,28.531605960000036]],[[-16.13879070799993,28.53061172100007],[-16.138767513999937,28.530661665000025],[-16.138818988999958,28.530661377000058],[-16.13880661999997,28.53061647000004],[-16.13879070799993,28.53061172100007]],[[-16.138916551999955,28.528370796000047],[-16.13888727099993,28.528411584000025],[-16.138953200999936,28.528441204000046],[-16.13893154899995,28.528399732000025],[-16.138916551999955,28.528370796000047]],[[-16.13855588499996,28.52817112200006],[-16.13850724499997,28.52818590700008],[-16.138533264999978,28.528224932000057],[-16.138571927999976,28.52819376800005],[-16.13855588499996,28.52817112200006]],[[-16.13847260199998,28.526860433000024],[-16.138436765999927,28.526902711000048],[-16.138495250999938,28.526964290000024],[-16.13850880299998,28.526945349000073],[-16.13847260199998,28.526860433000024]],[[-16.13964735299993,28.526490197000044],[-16.13959939199998,28.526445480000064],[-16.139583569999957,28.526453790000062],[-16.139669640999955,28.526544236000063],[-16.13964735299993,28.526490197000044]],[[-16.140464361999932,28.526330879000056],[-16.140514803999963,28.526339300000075],[-16.14042126199996,28.52627743000005],[-16.14041696299995,28.526289064000025],[-16.140464361999932,28.526330879000056]],[[-16.140777629999945,28.52595285500007],[-16.14107874499996,28.526018883000063],[-16.14074698899998,28.525496948000068],[-16.140600329999927,28.52566414300003],[-16.140777629999945,28.52595285500007]],[[-16.14237281399994,28.525290686000062],[-16.142427372999975,28.525338740000052],[-16.142495848999943,28.525266302000034],[-16.142326259999948,28.525213566000048],[-16.14237281399994,28.525290686000062]],[[-16.142052328999966,28.525317967000035],[-16.142028332999928,28.525333097000043],[-16.142041137999968,28.525361564000036],[-16.142060234999974,28.525352748000046],[-16.142052328999966,28.525317967000035]],[[-16.141395285999977,28.525102552000078],[-16.14136949699997,28.52509544000003],[-16.14132254599997,28.525115050000068],[-16.141441517999965,28.525134700000024],[-16.141395285999977,28.525102552000078]],[[-16.142433411999946,28.524852516000067],[-16.142469476999963,28.524841182000046],[-16.14244021899998,28.52480797900006],[-16.142422261999968,28.52482500900004],[-16.142433411999946,28.524852516000067]],[[-16.143353592999972,28.52353634700006],[-16.14326409199998,28.52357795900008],[-16.143377544999964,28.523667766000074],[-16.14345092399998,28.523591423000028],[-16.143353592999972,28.52353634700006]],[[-16.14459018499997,28.520715516000053],[-16.14456656799996,28.520705012000064],[-16.144465528999945,28.52081826700004],[-16.14457757799994,28.52078958800007],[-16.14459018499997,28.520715516000053]],[[-16.144847183999957,28.520587849000037],[-16.144814820999954,28.520580288000076],[-16.144772099999955,28.520654532000037],[-16.144811532999938,28.52065623900006],[-16.144847183999957,28.520587849000037]],[[-16.272831158999963,28.443025893000026],[-16.272785125999974,28.443061586000056],[-16.272904091999976,28.443133697000064],[-16.272896080999942,28.44306242500005],[-16.272831158999963,28.443025893000026]],[[-16.29202468899996,28.42552301300003],[-16.291997653999942,28.42552805300005],[-16.291971742999976,28.42558691000005],[-16.29206011599996,28.425573390000068],[-16.29202468899996,28.42552301300003]],[[-16.359591975999933,28.379708793000077],[-16.359654415999955,28.379702060000056],[-16.359676546999935,28.379678581000064],[-16.359582004999936,28.379670373000067],[-16.359591975999933,28.379708793000077]],[[-16.35951382199994,28.379633300000023],[-16.35951940399997,28.379664517000037],[-16.35956149699996,28.379651507000062],[-16.359560089999945,28.379642748000037],[-16.35951382199994,28.379633300000023]],[[-16.359564553999974,28.379486347000068],[-16.359603300999936,28.379481376000058],[-16.359473349999973,28.379435768000064],[-16.35948138799995,28.37945705100003],[-16.359564553999974,28.379486347000068]],[[-16.36091739999995,28.368721357000027],[-16.361004824999952,28.368686765000064],[-16.361038081999936,28.36854694500005],[-16.36085544799994,28.368559482000023],[-16.36091739999995,28.368721357000027]],[[-16.364027386999965,28.363045080000063],[-16.363997413999982,28.362945713000045],[-16.363914482999974,28.363012870000034],[-16.36396572299998,28.36308056300004],[-16.364027386999965,28.363045080000063]],[[-16.368172837999964,28.348762279000027],[-16.368125447999944,28.348765400000048],[-16.36811150699998,28.34879127100004],[-16.368169747999957,28.348791110000036],[-16.368172837999964,28.348762279000027]],[[-16.375373512999943,28.292101525000078],[-16.375496975999965,28.29210088600007],[-16.376159352999935,28.291146926000067],[-16.375987171999952,28.291082559000074],[-16.375373512999943,28.292101525000078]],[[-16.377270886999952,28.289519348000056],[-16.37669792899993,28.290062628000044],[-16.376584905999948,28.29051152100004],[-16.377274684999975,28.289604465000025],[-16.377270886999952,28.289519348000056]],[[-16.378101846999982,28.288281831000063],[-16.377721880999957,28.288612640000053],[-16.377664736999975,28.288731820000066],[-16.377825954999935,28.288793173000045],[-16.378101846999982,28.288281831000063]],[[-16.383671530999948,28.281882127000074],[-16.38361439099998,28.28193469200005],[-16.38370601099996,28.282062539000037],[-16.383734038999933,28.28201920400005],[-16.383671530999948,28.281882127000074]],[[-16.38357851199993,28.281884883000032],[-16.383579175999955,28.281810850000056],[-16.38352653299995,28.281803512000067],[-16.383529496999927,28.281845099000066],[-16.38357851199993,28.281884883000032]],[[-16.38359793799998,28.28154127600004],[-16.38354640999995,28.28158467800006],[-16.38360292599998,28.281621949000055],[-16.383637626999928,28.28160189600004],[-16.38359793799998,28.28154127600004]],[[-16.383931523999934,28.272914565000065],[-16.383880544999954,28.272928448000073],[-16.38388078199995,28.272941253000056],[-16.38394534699995,28.272964228000035],[-16.383931523999934,28.272914565000065]],[[-16.38411341799997,28.272673267000073],[-16.384099874999947,28.27267368400004],[-16.38410291899993,28.272685928000044],[-16.38411398599993,28.272686393000072],[-16.38411341799997,28.272673267000073]],[[-16.38400506599993,28.272625727000047],[-16.383994023999946,28.27264301300005],[-16.384044177999954,28.27265529500005],[-16.384026450999954,28.272634941000035],[-16.38400506599993,28.272625727000047]],[[-16.38391357599994,28.27255772600006],[-16.383923145999972,28.272586646000036],[-16.384001385999966,28.272591034000072],[-16.383933230999958,28.272571914000025],[-16.38391357599994,28.27255772600006]],[[-16.38381838899994,28.27216261600006],[-16.383787007999956,28.272141977000047],[-16.38377442099994,28.272148522000066],[-16.383801888999926,28.272167748000072],[-16.38381838899994,28.27216261600006]],[[-16.38373424899993,28.27215449700003],[-16.383718182999928,28.272156086000052],[-16.383749561999934,28.272161581000034],[-16.383745316999978,28.27215659600006],[-16.38373424899993,28.27215449700003]],[[-16.38429767599996,28.272424752000063],[-16.384302134999928,28.27243926500006],[-16.384315409999942,28.27242119600004],[-16.384302805999937,28.27241783200003],[-16.38429767599996,28.272424752000063]],[[-16.384801117999928,28.271597582000027],[-16.38478606999996,28.271603095000046],[-16.38479657099998,28.271616464000033],[-16.384808048999957,28.271608577000052],[-16.384801117999928,28.271597582000027]],[[-16.38700976399997,28.267143677000035],[-16.38699624999998,28.267150980000054],[-16.387013442999944,28.267164010000045],[-16.38701863299997,28.267156989000057],[-16.38700976399997,28.267143677000035]],[[-16.387006906999943,28.26709070800007],[-16.386997820999966,28.267091269000048],[-16.38699478199993,28.267099080000037],[-16.38700717599994,28.267094162000035],[-16.387006906999943,28.26709070800007]],[[-16.387501182999927,28.265360479000037],[-16.387493390999964,28.265360918000056],[-16.38748618099993,28.26536940300008],[-16.38750207199996,28.26536920600006],[-16.387501182999927,28.265360479000037]],[[-16.388460099999975,28.263703984000074],[-16.38846026799996,28.263691735000066],[-16.388446965999947,28.263691789000063],[-16.38844556999993,28.263701343000037],[-16.388460099999975,28.263703984000074]],[[-16.388828151999974,28.263133390000064],[-16.388876616999937,28.26309278800005],[-16.388876367999956,28.263060236000058],[-16.388815585999964,28.263114699000027],[-16.388828151999974,28.263133390000064]],[[-16.38886447599998,28.263123499000073],[-16.38886950999995,28.263120902000026],[-16.388867652999977,28.263116851000063],[-16.388862314999926,28.26311876400007],[-16.38886447599998,28.263123499000073]],[[-16.388810100999933,28.26301639500008],[-16.38879871599994,28.263003180000055],[-16.388779969999973,28.263029175000042],[-16.388803352999957,28.26304241200006],[-16.388810100999933,28.26301639500008]],[[-16.389023975999976,28.263005286000066],[-16.389030615999957,28.26300329600008],[-16.389028510999935,28.262995790000048],[-16.38902324999998,28.26299885800006],[-16.389023975999976,28.263005286000066]],[[-16.389120848999937,28.26289775500004],[-16.389126916999942,28.262887712000065],[-16.38911037799994,28.26288263600003],[-16.38911544599995,28.26290244000006],[-16.389120848999937,28.26289775500004]],[[-16.39042297499998,28.26101941400003],[-16.390406799999937,28.261014877000036],[-16.39040327899994,28.261016890000064],[-16.390409336999937,28.261026530000038],[-16.39042297499998,28.26101941400003]],[[-16.39093076299997,28.260598885000036],[-16.39090971199994,28.260604280000052],[-16.39093121899998,28.260627717000034],[-16.39094313299995,28.260600835000048],[-16.39093076299997,28.260598885000036]],[[-16.39159177299996,28.260455870000044],[-16.391596643999947,28.260458871000026],[-16.39159360499997,28.260443089000034],[-16.391587911999977,28.26044821100004],[-16.39159177299996,28.260455870000044]],[[-16.391753268999935,28.260496645000046],[-16.391755521999983,28.260503689000075],[-16.391762462999964,28.260493429000064],[-16.39175802799997,28.260493411000027],[-16.391753268999935,28.260496645000046]],[[-16.391702719999955,28.260501357000066],[-16.391697086999955,28.26049862600007],[-16.391688502999955,28.260503190000065],[-16.39171247099995,28.26050735900003],[-16.391702719999955,28.260501357000066]],[[-16.391816775999928,28.260525006000023],[-16.391820743999972,28.260525968000024],[-16.391829521999966,28.260515851000036],[-16.39181429599995,28.260518425000043],[-16.391816775999928,28.260525006000023]],[[-16.39228934399995,28.260168469000064],[-16.392282123999962,28.26016119600007],[-16.392275867999956,28.260173959000042],[-16.392286095999964,28.260175082000046],[-16.39228934399995,28.260168469000064]],[[-16.39244447599998,28.259911784000053],[-16.392446819999975,28.259903131000044],[-16.392435028999955,28.25990646400004],[-16.392439213999978,28.259910880000064],[-16.39244447599998,28.259911784000053]],[[-16.39247112299995,28.25990405700003],[-16.39248024099993,28.25989969500006],[-16.39246247799997,28.259890616000064],[-16.392460143999926,28.259899268000026],[-16.39247112299995,28.25990405700003]],[[-16.392476683999973,28.25989270900004],[-16.392479118999972,28.259894210000027],[-16.392495157999974,28.259883513000034],[-16.39247680099993,28.25988601100005],[-16.392476683999973,28.25989270900004]],[[-16.399463724999976,28.247754119000035],[-16.39952634699995,28.247737674000064],[-16.39953849899996,28.247724634000065],[-16.399440762999973,28.24768856700007],[-16.399463724999976,28.247754119000035]],[[-16.413681718999953,28.217794095000045],[-16.41335990799996,28.21753666500007],[-16.413014905999944,28.217855625000027],[-16.413368652999964,28.218090017000065],[-16.413681718999953,28.217794095000045]],[[-15.423073833999979,28.180285437000066],[-15.422945029999937,28.180320651000045],[-15.422931792999975,28.18053474800007],[-15.423055462999969,28.18047106000006],[-15.423073833999979,28.180285437000066]],[[-15.43203895299996,28.17265777500006],[-15.431723243999954,28.17229965300004],[-15.43155827399994,28.172389458000055],[-15.431933447999938,28.172809905000065],[-15.43203895299996,28.17265777500006]],[[-15.432382625999935,28.172382434000042],[-15.432554885999934,28.172322674000043],[-15.432567551999966,28.17208783500007],[-15.43237881999994,28.17228218400004],[-15.432382625999935,28.172382434000042]],[[-15.432035436999968,28.172089596000035],[-15.431985488999942,28.172043318000078],[-15.431942367999966,28.17217759500005],[-15.432038470999942,28.172180496000067],[-15.432035436999968,28.172089596000035]],[[-15.432624182999973,28.17207612800007],[-15.432695422999927,28.171958436000068],[-15.43255593999993,28.17179701500004],[-15.432549010999935,28.17188234100007],[-15.432624182999973,28.17207612800007]],[[-16.428037401999973,28.171476142000074],[-16.427982661999977,28.171495667000045],[-16.42798726199993,28.17153533100003],[-16.428044434999947,28.171545566000077],[-16.428037401999973,28.171476142000074]],[[-16.42789872399993,28.171310617000074],[-16.427833931999942,28.17134017400008],[-16.42785631299995,28.171414852000055],[-16.42789079299996,28.171403663000035],[-16.42789872399993,28.171310617000074]],[[-15.709870989999956,28.164966210000046],[-15.709823179999944,28.164968002000023],[-15.70979837599998,28.16498167000003],[-15.709919365999951,28.165010073000076],[-15.709870989999956,28.164966210000046]],[[-15.70986981699997,28.16452158000004],[-15.70976617599996,28.164518127000065],[-15.709666751999976,28.164676925000037],[-15.709709747999966,28.164689637000038],[-15.70986981699997,28.16452158000004]],[[-16.42794633099993,28.164103177000072],[-16.42795608399996,28.16412060300007],[-16.427968850999946,28.16410343000007],[-16.42795161999993,28.164094232000025],[-16.42794633099993,28.164103177000072]],[[-16.43033925499998,28.164742447000037],[-16.430355326999972,28.164762387000053],[-16.43038067799995,28.164761834000046],[-16.430371992999937,28.164739009000073],[-16.43033925499998,28.164742447000037]],[[-16.43003259699998,28.16474499900005],[-16.430017757999963,28.16474732900008],[-16.430008619999967,28.164757019000035],[-16.430031345999964,28.164764363000074],[-16.43003259699998,28.16474499900005]],[[-16.42992324399995,28.16479153000006],[-16.429916332999937,28.164811748000034],[-16.429946124999958,28.164805046000026],[-16.429928135999944,28.164790992000064],[-16.42992324399995,28.16479153000006]],[[-15.708597340999972,28.160335691000057],[-15.708576046999951,28.160334592000027],[-15.708520660999966,28.160396820000074],[-15.708597332999943,28.160401027000034],[-15.708597340999972,28.160335691000057]],[[-15.70637428699996,28.157356608000043],[-15.706354744999942,28.157625524000025],[-15.706451307999941,28.157642502000044],[-15.70648424899997,28.157473740000057],[-15.70637428699996,28.157356608000043]],[[-15.70595644499997,28.157112721000033],[-15.705813043999967,28.157122396000034],[-15.70577413899997,28.157171016000063],[-15.706070350999937,28.157216094000034],[-15.70595644499997,28.157112721000033]],[[-15.700160135999965,28.154251329000033],[-15.700116378999951,28.154280528000072],[-15.700200140999982,28.15442325500004],[-15.700218763999942,28.154345828000032],[-15.700160135999965,28.154251329000033]],[[-15.70443169799995,28.142680392000045],[-15.70484708999993,28.142451983000058],[-15.704839552999942,28.14230563600006],[-15.704204649999951,28.142432322000047],[-15.70443169799995,28.142680392000045]],[[-16.46861277599993,28.10990497100005],[-16.468453369999963,28.10989139900005],[-16.46841201099994,28.109927114000072],[-16.46868720499998,28.110090226000068],[-16.46861277599993,28.10990497100005]],[[-15.706507790999979,28.10863935100008],[-15.706602349999969,28.10862604500005],[-15.706621298999949,28.108464973000025],[-15.706469278999975,28.108622470000057],[-15.706507790999979,28.10863935100008]],[[-15.706878109999934,28.108502285000043],[-15.707036459999927,28.108311978000074],[-15.706707438999956,28.108161022000047],[-15.706770047999953,28.108448320000036],[-15.706878109999934,28.108502285000043]],[[-16.471190631999946,28.10840597500004],[-16.471198570999945,28.108444032000023],[-16.471212608999963,28.108462744000065],[-16.471234496999955,28.108379421000052],[-16.471190631999946,28.10840597500004]],[[-16.47111504299994,28.10841565800007],[-16.47105126799994,28.10841989800008],[-16.471126728999934,28.108498567000026],[-16.471140352999953,28.10847347500004],[-16.47111504299994,28.10841565800007]],[[-16.472619787999975,28.10640610100006],[-16.472562710999966,28.10640720200007],[-16.47253812599996,28.106439082000065],[-16.472589417999927,28.106475707000072],[-16.472619787999975,28.10640610100006]],[[-16.473004871999933,28.103841037000052],[-16.47305655599996,28.10378941600004],[-16.472921542999927,28.10375398700006],[-16.472924243999955,28.103787091000072],[-16.473004871999933,28.103841037000052]],[[-16.474046718999944,28.103267483000025],[-16.474090217999958,28.103212059000043],[-16.474090802999967,28.10320200700005],[-16.474030057999983,28.10323777800005],[-16.474046718999944,28.103267483000025]],[[-16.47410933499998,28.103259914000034],[-16.474126284999954,28.103272728000036],[-16.47417718899993,28.10323859700003],[-16.474129061999975,28.10322496200007],[-16.47410933499998,28.103259914000034]],[[-16.474280869999973,28.10310554800003],[-16.47420186599993,28.103156218000038],[-16.474187824999944,28.10318343600005],[-16.474270243999968,28.103196378000064],[-16.474280869999973,28.10310554800003]],[[-16.476119513999947,28.10181876400003],[-16.476116203999936,28.10175461800003],[-16.47603328699995,28.101702252000052],[-16.476041920999933,28.101751492000062],[-16.476119513999947,28.10181876400003]],[[-16.47600497899998,28.10170505700006],[-16.47600530899996,28.10167114400008],[-16.475964509999926,28.101658975000078],[-16.475991266999927,28.101751812000032],[-16.47600497899998,28.10170505700006]],[[-16.476096665999933,28.10167463700003],[-16.476110861999928,28.101678167000046],[-16.47612377799993,28.101647666000076],[-16.476088337999954,28.10165065600006],[-16.476096665999933,28.10167463700003]],[[-16.476191209999968,28.101818741000045],[-16.47616951699996,28.101852757000074],[-16.476224240999954,28.10189697900006],[-16.47625302399996,28.101846298000055],[-16.476191209999968,28.101818741000045]],[[-16.47623432299997,28.10194124000003],[-16.476256133999982,28.101915147000057],[-16.476247201999968,28.101900604000036],[-16.476218065999944,28.101919501000054],[-16.47623432299997,28.10194124000003]],[[-16.475817527999936,28.10204658600003],[-16.475863059999938,28.101986708000027],[-16.475784485999952,28.10195415000004],[-16.47578132899997,28.102008328000068],[-16.475817527999936,28.10204658600003]],[[-16.475892336999948,28.10201893800007],[-16.475918847999935,28.102054403000068],[-16.475950945999955,28.102010203000077],[-16.475889927999958,28.101984198000025],[-16.475892336999948,28.10201893800007]],[[-16.475938821999932,28.10204798700005],[-16.476046045999965,28.10208853100005],[-16.47607130199998,28.10207171600007],[-16.475971673999936,28.102008346000048],[-16.475938821999932,28.10204798700005]],[[-16.47587690599994,28.10202564800005],[-16.475857013999928,28.102029851000054],[-16.475847200999965,28.102052033000064],[-16.47587879799994,28.102041946000043],[-16.47587690599994,28.10202564800005]],[[-16.476665047999973,28.101021717000037],[-16.47660716699994,28.100977311000065],[-16.476592512999957,28.101101650000032],[-16.47661534599996,28.10109145900003],[-16.476665047999973,28.101021717000037]],[[-16.476690220999956,28.10096390800004],[-16.47672487099993,28.100955962000057],[-16.47671714599994,28.100917335000076],[-16.47666206899993,28.100928298000042],[-16.476690220999956,28.10096390800004]],[[-16.476862393999966,28.10083376500006],[-16.476838975999954,28.10082940600006],[-16.476815037999927,28.100906786000053],[-16.476898459999973,28.100866771000028],[-16.476862393999966,28.10083376500006]],[[-16.476795985999956,28.100852649000046],[-16.47675516399994,28.10087442500003],[-16.476772574999927,28.100909067000032],[-16.47678396899994,28.100897473000032],[-16.476795985999956,28.100852649000046]],[[-16.47696015899993,28.100826521000045],[-16.476983519999976,28.100823752000053],[-16.47700052899995,28.100791826000034],[-16.47695816099997,28.100787679000064],[-16.47696015899993,28.100826521000045]],[[-16.477042145999974,28.100786567000057],[-16.477059365999935,28.100790849000077],[-16.477083946999926,28.100735159000067],[-16.477012168999977,28.10076188000005],[-16.477042145999974,28.100786567000057]],[[-15.708703301999947,28.09768777900007],[-15.708669864999933,28.097689694000053],[-15.70865329399993,28.097726943000055],[-15.708725533999939,28.09772200200007],[-15.708703301999947,28.09768777900007]],[[-15.708015815999943,28.09650102100005],[-15.708252179999931,28.096336850000057],[-15.70827017299996,28.09610222300006],[-15.707892686999969,28.096328695000068],[-15.708015815999943,28.09650102100005]],[[-15.708396668999967,28.09642444800005],[-15.708448497999939,28.096340223000027],[-15.708380253999962,28.09625771000003],[-15.708376366999971,28.096402131000048],[-15.708396668999967,28.09642444800005]],[[-15.70788233099995,28.095878176000042],[-15.707891075999953,28.095861395000043],[-15.70787151099995,28.09584886700003],[-15.707864079999979,28.095876763000035],[-15.70788233099995,28.095878176000042]],[[-15.708030880999956,28.09586030300005],[-15.708101949999957,28.095858547000034],[-15.708161276999931,28.095799955000075],[-15.708072614999935,28.095781212000077],[-15.708030880999956,28.09586030300005]],[[-15.707775840999943,28.095674160000044],[-15.707744013999957,28.095685599000035],[-15.707774781999944,28.095757889000026],[-15.707794974999956,28.095748154000034],[-15.707775840999943,28.095674160000044]],[[-15.707724643999939,28.095496371000024],[-15.707703207999941,28.09550293600006],[-15.707705738999948,28.095537883000077],[-15.707744438999953,28.095526906000032],[-15.707724643999939,28.095496371000024]],[[-15.707496072999959,28.09303326400004],[-15.707487495999942,28.09306487500004],[-15.707517179999968,28.093073063000077],[-15.707528318999948,28.09305653200005],[-15.707496072999959,28.09303326400004]],[[-15.707770422999943,28.091788391000023],[-15.707746191999945,28.091785971000036],[-15.707734121999977,28.091800394000074],[-15.707775942999945,28.091824623000036],[-15.707770422999943,28.091788391000023]],[[-15.708010399999978,28.090808233000075],[-15.707966308999971,28.090817939000033],[-15.707963805999952,28.09085690300003],[-15.708009855999933,28.090860158000055],[-15.708010399999978,28.090808233000075]],[[-15.708351112999935,28.090530751000074],[-15.708284387999981,28.090618556000038],[-15.708356811999977,28.090653089000057],[-15.708389046999969,28.090626546000067],[-15.708351112999935,28.090530751000074]],[[-15.70826341299994,28.09034775200007],[-15.708296120999933,28.090311133000057],[-15.708173315999943,28.09028478600004],[-15.70821293299997,28.090396722000037],[-15.70826341299994,28.09034775200007]],[[-15.716746734999958,28.07625875000008],[-15.71667910399998,28.076377877000027],[-15.716859857999964,28.076343336000036],[-15.716844101999982,28.07630626400004],[-15.716746734999958,28.07625875000008]],[[-15.723800189999963,28.069045592000066],[-15.723728752999932,28.069112793000045],[-15.723794966999947,28.06917440500007],[-15.72386780599993,28.069135630000062],[-15.723800189999963,28.069045592000066]],[[-15.729784947999974,28.06477342100004],[-15.729746965999936,28.064786432000062],[-15.72976042299996,28.064905948000046],[-15.72983172599993,28.064848366000035],[-15.729784947999974,28.06477342100004]],[[-15.74488685199998,28.051609167000038],[-15.744835742999953,28.051613479000025],[-15.744857643999978,28.05167610600006],[-15.744891726999981,28.05166530500003],[-15.74488685199998,28.051609167000038]],[[-15.746439790999943,28.051466615000038],[-15.746408148999933,28.051384561000077],[-15.746337561999951,28.051406158000077],[-15.746357039999964,28.051546518000066],[-15.746439790999943,28.051466615000038]],[[-15.746787855999969,28.051425591000054],[-15.746838964999938,28.05142558400007],[-15.746853573999942,28.05138240100007],[-15.746790284999975,28.05138671700007],[-15.746787855999969,28.051425591000054]],[[-15.745215454999936,28.051330595000024],[-15.745210589999942,28.05131115900008],[-15.745178942999928,28.051296040000068],[-15.74518868399997,28.051339234000068],[-15.745215454999936,28.051330595000024]],[[-15.746215847999963,28.051321940000037],[-15.746228017999954,28.05128091100005],[-15.74616473499998,28.05128307700005],[-15.746164741999962,28.051304670000036],[-15.746215847999963,28.051321940000037]],[[-15.746597987999962,28.051196693000065],[-15.746554180999965,28.05125068500007],[-15.746683183999949,28.05125283600006],[-15.746663713999965,28.051226927000073],[-15.746597987999962,28.051196693000065]],[[-15.748497560999965,28.050675643000034],[-15.748454713999934,28.050693136000064],[-15.748497967999981,28.05075356900005],[-15.748517367999966,28.050730978000047],[-15.748497560999965,28.050675643000034]],[[-15.751449083999944,28.048523143000068],[-15.751427551999939,28.04851111100004],[-15.751410094999926,28.04853195900006],[-15.751441395999962,28.048545680000075],[-15.751449083999944,28.048523143000068]],[[-15.751545705999945,28.048339190000036],[-15.751574835999975,28.04831136300004],[-15.751520074999974,28.048290811000072],[-15.751520278999976,28.048328904000073],[-15.751545705999945,28.048339190000036]],[[-15.75588507499998,28.047704622000026],[-15.755708026999969,28.04781099300004],[-15.755694656999935,28.04786473200005],[-15.755834811999932,28.047794878000047],[-15.75588507499998,28.047704622000026]],[[-15.75438225299996,28.047714375000055],[-15.754387460999965,28.047593144000075],[-15.75432309599995,28.04760033900004],[-15.754300715999932,28.04779783300006],[-15.75438225299996,28.047714375000055]],[[-15.753985403999934,28.04759481900004],[-15.753842624999947,28.047538273000043],[-15.753738204999934,28.047722262000036],[-15.753956875999961,28.047735198000055],[-15.753985403999934,28.04759481900004]],[[-15.754785339999955,28.04753953200003],[-15.754816615999971,28.047548062000033],[-15.75492152299995,28.04745584500006],[-15.754800662999969,28.047484059000055],[-15.754785339999955,28.04753953200003]],[[-15.757053527999972,28.046847773000025],[-15.756997159999969,28.046891303000052],[-15.757097287999954,28.047001700000067],[-15.757130102999952,28.046932301000027],[-15.757053527999972,28.046847773000025]],[[-15.756323590999955,28.046852571000045],[-15.756498694999948,28.046747942000025],[-15.756459151999934,28.046652864000066],[-15.756410433999974,28.046666925000068],[-15.756323590999955,28.046852571000045]],[[-15.768211940999947,28.03728503800005],[-15.768159039999944,28.037283880000075],[-15.768144174999975,28.037340941000025],[-15.768234351999979,28.037326508000035],[-15.768211940999947,28.03728503800005]],[[-15.768089163999946,28.03719165600006],[-15.768064792999951,28.037248264000027],[-15.768151461999935,28.037239655000064],[-15.768116053999961,28.03720620100006],[-15.768089163999946,28.03719165600006]],[[-15.768198039999959,28.036765957000057],[-15.768148461999942,28.036762805000023],[-15.768119789999957,28.03681265700004],[-15.768216390999953,28.036840281000025],[-15.768198039999959,28.036765957000057]],[[-15.770217627999955,28.034918410000046],[-15.770183773999975,28.034982988000024],[-15.770261819999973,28.035002473000077],[-15.77026570199996,28.034957588000054],[-15.770217627999955,28.034918410000046]],[[-15.770534810999948,28.034818022000024],[-15.77048835499994,28.034853162000047],[-15.770579908999935,28.034856594000075],[-15.770576233999975,28.034834869000065],[-15.770534810999948,28.034818022000024]],[[-15.771291923999968,28.034203337000065],[-15.771219607999967,28.034222645000057],[-15.771242276999942,28.034283151000068],[-15.771299030999955,28.034255527000028],[-15.771291923999968,28.034203337000065]],[[-15.77826109199998,28.028496439000037],[-15.777979204999951,28.02858554900007],[-15.777726732999952,28.02874628400008],[-15.778225532999954,28.028915754000025],[-15.77826109199998,28.028496439000037]],[[-15.789401046999956,28.021157824000056],[-15.78945445599993,28.021129381000037],[-15.78933174599996,28.021170427000072],[-15.789360889999955,28.021173347000058],[-15.789401046999956,28.021157824000056]],[[-15.789321456999971,28.02112792500003],[-15.78938091699996,28.020938878000038],[-15.78897789499996,28.021136108000064],[-15.789289432999965,28.021173694000026],[-15.789321456999971,28.02112792500003]],[[-15.801045421999959,28.01728586300004],[-15.801217202999965,28.017214697000043],[-15.800872830999936,28.017155493000075],[-15.800946728999975,28.01738649200007],[-15.801045421999959,28.01728586300004]],[[-15.799953656999946,28.017140193000046],[-15.799805311999933,28.017007813000077],[-15.799683327999958,28.017216346000055],[-15.799958797999977,28.017282633000036],[-15.799953656999946,28.017140193000046]],[[-15.801872645999936,28.017232638000053],[-15.801710993999961,28.017233455000053],[-15.801689008999972,28.017259039000066],[-15.80194191299995,28.017240583000046],[-15.801872645999936,28.017232638000053]],[[-15.802347235999946,28.016989720000026],[-15.802347750999957,28.016913892000048],[-15.802218829999958,28.016903478000074],[-15.802281797999967,28.016992034000054],[-15.802347235999946,28.016989720000026]],[[-15.802505451999934,28.016975590000072],[-15.802560893999953,28.01696268300003],[-15.802552871999978,28.016926117000025],[-15.802510912999935,28.01693016200005],[-15.802505451999934,28.016975590000072]],[[-15.807853730999966,28.016692283000054],[-15.807815206999976,28.01669983000005],[-15.807929670999954,28.01675206300007],[-15.80792426499994,28.016739079000047],[-15.807853730999966,28.016692283000054]],[[-15.803618871999959,28.016551099000026],[-15.803641229999982,28.016527905000032],[-15.803625112999953,28.016499872000054],[-15.803574640999955,28.016529865000052],[-15.803618871999959,28.016551099000026]],[[-15.804710859999943,28.016517675000046],[-15.804828251999936,28.01651236500004],[-15.804865243999927,28.016490214000044],[-15.804636205999941,28.016505970000026],[-15.804710859999943,28.016517675000046]],[[-15.806830228999956,28.01641178600005],[-15.806825311999944,28.016359523000062],[-15.806746422999936,28.016351564000047],[-15.806780599999968,28.01639805800005],[-15.806830228999956,28.01641178600005]],[[-15.75394930799996,28.047413154000026],[-15.753927828999963,28.047411511000064],[-15.753910576999942,28.047470461000046],[-15.753953357999933,28.04744084400005],[-15.75394930799996,28.047413154000026]],[[-15.709070598999972,28.09796421300007],[-15.70910945199995,28.097965429000055],[-15.70911670199996,28.097924031000048],[-15.709086037999953,28.09793280100007],[-15.709070598999972,28.09796421300007]],[[-15.709382318999928,28.09809522300003],[-15.709456771999953,28.09812469800005],[-15.709503032999976,28.098073114000044],[-15.709451607999938,28.098045271000046],[-15.709382318999928,28.09809522300003]],[[-15.709081641999944,28.09810796100004],[-15.70903616499993,28.09817516700008],[-15.709106384999927,28.09820043900004],[-15.709114650999936,28.09816803500007],[-15.709081641999944,28.09810796100004]],[[-15.704947105999963,28.165342474000056],[-15.704909344999976,28.165365252000072],[-15.704924699999935,28.16540186700007],[-15.704985528999941,28.16538777900007],[-15.704947105999963,28.165342474000056]],[[-15.697899941999935,28.16426325100008],[-15.697959327999968,28.164254328000027],[-15.697961305999968,28.164220106000073],[-15.697841380999932,28.16427365800007],[-15.697899941999935,28.16426325100008]],[[-15.698157100999936,28.164177170000073],[-15.698295597999959,28.164139761000058],[-15.69805989899993,28.16396668400006],[-15.698071951999964,28.16418852700008],[-15.698157100999936,28.164177170000073]],[[-15.701936258999979,28.164039848000073],[-15.701994451999951,28.16397936900006],[-15.701891391999936,28.163913578000063],[-15.70188593499995,28.163971711000045],[-15.701936258999979,28.164039848000073]],[[-15.440637838999976,28.167781104000028],[-15.44056308599994,28.167796917000032],[-15.440512827999953,28.168010980000076],[-15.44064849299997,28.16794484600007],[-15.440637838999976,28.167781104000028]],[[-15.441457473999947,28.166916565000065],[-15.441417197999954,28.166802441000073],[-15.441379741999981,28.166794500000037],[-15.441321796999944,28.16692974800003],[-15.441457473999947,28.166916565000065]],[[-15.441719900999942,28.16689949700003],[-15.441763071999958,28.16688242400005],[-15.441708716999926,28.16684258300006],[-15.44169362699995,28.166886023000075],[-15.441719900999942,28.16689949700003]],[[-15.43238318799996,28.15523876900005],[-15.432314410999936,28.155186386000025],[-15.432273782999971,28.15527244200007],[-15.43237901499998,28.15528770000003],[-15.43238318799996,28.15523876900005]],[[-15.586318226999936,28.14743117000006],[-15.586516382999946,28.147137969000028],[-15.586170267999933,28.146966758000076],[-15.586021050999932,28.147483226000077],[-15.586318226999936,28.14743117000006]],[[-15.570546668999953,28.14606320100006],[-15.57050346799997,28.146070828000063],[-15.57046123899994,28.14612348600008],[-15.570530919999953,28.14612588600005],[-15.570546668999953,28.14606320100006]],[[-15.54421353999993,28.14700504800004],[-15.544203250999942,28.14694806600005],[-15.54418716999993,28.146945964000054],[-15.544158838999977,28.14699061400006],[-15.54421353999993,28.14700504800004]],[[-15.544297945999972,28.14700092100003],[-15.544302389999928,28.146951202000025],[-15.544282373999977,28.146948402000078],[-15.544268913999929,28.146963250000056],[-15.544297945999972,28.14700092100003]],[[-15.432186275999982,28.15486261500007],[-15.432157510999957,28.154867119000073],[-15.432150256999932,28.15489189400006],[-15.432179662999943,28.154899745000023],[-15.432186275999982,28.15486261500007]],[[-15.43218443099994,28.154385257000058],[-15.43217158699997,28.15442323800005],[-15.432225436999943,28.154413445000046],[-15.432204130999935,28.154393455000047],[-15.43218443099994,28.154385257000058]],[[-15.43230214099998,28.154210954000064],[-15.432265773999973,28.15417627100004],[-15.432238694999967,28.154207346000078],[-15.432276940999941,28.154243071000053],[-15.43230214099998,28.154210954000064]],[[-15.43233392999997,28.15417573900004],[-15.432362006999938,28.154167580000035],[-15.432356724999977,28.154135453000038],[-15.432325934999938,28.154147772000044],[-15.43233392999997,28.15417573900004]],[[-15.434093076999943,28.15417770600004],[-15.434354834999965,28.153984457000035],[-15.43402279999998,28.153849103000027],[-15.434136985999942,28.15412000200007],[-15.434093076999943,28.15417770600004]],[[-15.432280576999972,28.15410887400003],[-15.432252841999968,28.154108708000024],[-15.43221553799998,28.154119550000075],[-15.432272701999977,28.15412625700003],[-15.432280576999972,28.15410887400003]],[[-15.432296944999962,28.154101411000056],[-15.432339901999967,28.154092889000026],[-15.432339772999967,28.154081199000075],[-15.432318875999954,28.154069062000076],[-15.432296944999962,28.154101411000056]],[[-15.43262658599997,28.15409997300003],[-15.432656092999935,28.15407502000005],[-15.432648535999931,28.15405977900008],[-15.432619776999957,28.154083530000037],[-15.43262658599997,28.15409997300003]],[[-15.432670180999935,28.154065289000073],[-15.432785063999972,28.154011487000048],[-15.432816551999963,28.15396224500006],[-15.432673026999964,28.153992965000043],[-15.432670180999935,28.154065289000073]],[[-15.43277571799996,28.153956497000024],[-15.43277784399993,28.153922865000027],[-15.432770975999972,28.153916983000045],[-15.432740898999953,28.153957266000077],[-15.43277571799996,28.153956497000024]],[[-15.432821564999927,28.153952498000024],[-15.43284304399998,28.15395482200006],[-15.432861413999944,28.153921121000053],[-15.43281284699998,28.153937333000044],[-15.432821564999927,28.153952498000024]],[[-15.432735183999966,28.154063396000026],[-15.432746662999932,28.154083833000072],[-15.432772390999958,28.154071438000074],[-15.43275419899993,28.154048215000046],[-15.432735183999966,28.154063396000026]],[[-15.433194879999974,28.153852698000037],[-15.43320592799995,28.153821710000045],[-15.433140052999931,28.153857431000063],[-15.43315364199998,28.15387826700004],[-15.433194879999974,28.153852698000037]],[[-15.433226607999927,28.153825463000032],[-15.433228554999971,28.153802953000024],[-15.433262945999957,28.153789457000073],[-15.433182337999938,28.153803586000038],[-15.433226607999927,28.153825463000032]],[[-15.434434796999938,28.154198793000035],[-15.434509116999948,28.154209010000045],[-15.434520577999933,28.154164191000064],[-15.434426693999967,28.154146895000054],[-15.434434796999938,28.154198793000035]],[[-15.43336245699993,28.153539962000025],[-15.433335617999944,28.153516911000054],[-15.433327401999975,28.153568220000068],[-15.433383276999962,28.153550702000075],[-15.43336245699993,28.153539962000025]],[[-15.433296775999963,28.153517910000062],[-15.433282701999929,28.153508016000046],[-15.433277602999965,28.153536557000052],[-15.43329846499995,28.15353756500008],[-15.433296775999963,28.153517910000062]],[[-15.433376952999936,28.15346498400004],[-15.433354895999969,28.153478540000037],[-15.43338581699993,28.153503799000077],[-15.43339272999998,28.153487718000065],[-15.433376952999936,28.15346498400004]],[[-15.43347777699995,28.153288729000053],[-15.433475932999954,28.153265807000025],[-15.433449249999967,28.153246113000023],[-15.433444846999976,28.15327064400003],[-15.43347777699995,28.153288729000053]],[[-15.433455408999976,28.15318458400003],[-15.43343929699995,28.153202427000053],[-15.433476490999965,28.15320485500007],[-15.433472232999975,28.153194334000034],[-15.433455408999976,28.15318458400003]],[[-15.43353794199993,28.153077002000032],[-15.433508373999928,28.153059050000024],[-15.43341727099994,28.153109881000034],[-15.433508192999966,28.153135617000032],[-15.43353794199993,28.153077002000032]],[[-15.433485627999971,28.153017815000055],[-15.433456856999953,28.153035870000053],[-15.43349649399994,28.153050395000037],[-15.433501889999945,28.153029805000074],[-15.433485627999971,28.153017815000055]],[[-15.433511322999948,28.152987195000037],[-15.433492709999939,28.152990793000072],[-15.433489863999966,28.153009921000034],[-15.433526461999975,28.153003468000065],[-15.433511322999948,28.152987195000037]],[[-15.433103265999932,28.152769447000026],[-15.433088892999933,28.15277132500006],[-15.433083366999938,28.152780044000053],[-15.433100862999936,28.152787274000048],[-15.433103265999932,28.152769447000026]],[[-15.43256603499998,28.15231317100006],[-15.43254239099997,28.152314365000052],[-15.432523757999945,28.152338534000023],[-15.432532015999982,28.152343121000058],[-15.43256603499998,28.15231317100006]],[[-15.431892329999982,28.15084841600003],[-15.431860278999977,28.150891828000056],[-15.431963830999962,28.15094603400007],[-15.431948587999955,28.150865760000045],[-15.431892329999982,28.15084841600003]],[[-15.432213794999939,28.150352996000038],[-15.432193306999977,28.15038680400005],[-15.432323308999969,28.150426193000044],[-15.432310952999956,28.15040541600007],[-15.432213794999939,28.150352996000038]],[[-15.432357908999961,28.14999853100005],[-15.432191097999976,28.14996606400007],[-15.432151175999934,28.149996909000038],[-15.432310004999977,28.15006290900004],[-15.432357908999961,28.14999853100005]],[[-15.510147840999934,28.14870882100007],[-15.510092418999932,28.148822857000027],[-15.510235940999962,28.148853646000077],[-15.510232851999945,28.148803739000073],[-15.510147840999934,28.14870882100007]],[[-15.510034099999928,28.14851931900006],[-15.50998990599993,28.14852289600003],[-15.510180376999926,28.148643770000035],[-15.510157380999942,28.148592204000067],[-15.510034099999928,28.14851931900006]],[[-15.513274209999963,28.148352788000068],[-15.513218911999957,28.14833634000007],[-15.513256253999941,28.148437879000028],[-15.513272782999934,28.14842722900005],[-15.513274209999963,28.148352788000068]],[[-15.514133491999928,28.14729016000007],[-15.514071206999972,28.14728211700003],[-15.514201515999957,28.147572267000044],[-15.514264208999975,28.147412219000046],[-15.514133491999928,28.14729016000007]],[[-15.510392124999953,28.148126904000037],[-15.51037165699995,28.148084572000073],[-15.510317784999927,28.148108811000043],[-15.510383886999932,28.148185195000053],[-15.510392124999953,28.148126904000037]],[[-15.49629428999998,28.146941635000076],[-15.496400412999947,28.14665099800004],[-15.496314978999976,28.146335375000035],[-15.49608326899994,28.146828407000044],[-15.49629428999998,28.146941635000076]],[[-15.496044329999961,28.14671904200003],[-15.495963161999953,28.146725745000026],[-15.495920937999927,28.146791921000045],[-15.496028076999949,28.146812087000058],[-15.496044329999961,28.14671904200003]],[[-15.49667094199998,28.14681987800003],[-15.496767279999972,28.146739316000037],[-15.496613615999934,28.14663472700005],[-15.496612508999931,28.146776697000064],[-15.49667094199998,28.14681987800003]],[[-15.496926350999956,28.146813202000033],[-15.496952311999962,28.146901463000063],[-15.497065947999943,28.14686406800007],[-15.496925282999939,28.146738382000024],[-15.496926350999956,28.146813202000033]],[[-15.496414732999938,28.145496034000075],[-15.496671251999942,28.145383839000033],[-15.496642048999945,28.145318608000025],[-15.496396355999934,28.145393393000063],[-15.496414732999938,28.145496034000075]],[[-15.487193913999931,28.138732185000038],[-15.487151705999963,28.138735052000072],[-15.487145203999944,28.138794527000073],[-15.487214455999947,28.138795499000025],[-15.487193913999931,28.138732185000038]],[[-15.486852086999932,28.138288913000054],[-15.48678390799995,28.13830233500005],[-15.486799037999958,28.138364684000067],[-15.48684232599993,28.138348390000033],[-15.486852086999932,28.138288913000054]],[[-15.47950289499994,28.13684131900004],[-15.479456538999955,28.136863922000032],[-15.47950029499998,28.136936734000074],[-15.479540480999958,28.13686638200005],[-15.47950289499994,28.13684131900004]],[[-15.47979844699995,28.136722872000064],[-15.47977487299994,28.136752842000078],[-15.479810394999959,28.136780755000075],[-15.479828459999965,28.136744016000023],[-15.47979844699995,28.136722872000064]],[[-15.480245142999934,28.13656670200004],[-15.48021898899998,28.136588739000047],[-15.480271229999971,28.136620917000073],[-15.480275297999981,28.13658320600007],[-15.480245142999934,28.13656670200004]],[[-15.481014750999975,28.13656153900007],[-15.481064597999932,28.136508882000044],[-15.481017225999949,28.136461232000045],[-15.480968932999929,28.136514995000027],[-15.481014750999975,28.13656153900007]],[[-15.480891465999946,28.13642995300006],[-15.48091345599994,28.13641712900005],[-15.480918735999978,28.13640021300006],[-15.480890129999977,28.136413682000068],[-15.480891465999946,28.13642995300006]],[[-15.481200408999939,28.136357790000034],[-15.481179484999927,28.136301419000063],[-15.48112569999995,28.136313262000044],[-15.48113469499998,28.136366705000057],[-15.481200408999939,28.136357790000034]],[[-15.481432867999956,28.13632491000004],[-15.481453200999965,28.136317374000043],[-15.48144980099994,28.13629946800006],[-15.48142515099994,28.136300249000044],[-15.481432867999956,28.13632491000004]],[[-15.481153555999981,28.13627342700005],[-15.481143284999973,28.13626521200007],[-15.481119903999968,28.136274267000033],[-15.48113720899994,28.136288767000053],[-15.481153555999981,28.13627342700005]],[[-15.482597856999973,28.13618053500005],[-15.482668020999938,28.13617385200007],[-15.482673432999945,28.136152412000058],[-15.482612648999975,28.136124967000057],[-15.482597856999973,28.13618053500005]],[[-15.481783769999936,28.13606495600004],[-15.481810046999954,28.13603838800003],[-15.48174139799994,28.136023816000034],[-15.481739924999943,28.13608607200007],[-15.481783769999936,28.13606495600004]],[[-15.478606741999954,28.136616287000038],[-15.478562495999938,28.13657978300006],[-15.478538341999979,28.13660741700005],[-15.478556413999968,28.13661813300007],[-15.478606741999954,28.136616287000038]],[[-15.478700383999978,28.13661101300005],[-15.478712275999953,28.136578393000036],[-15.478746231999935,28.136572840000042],[-15.478693975999931,28.13655549300006],[-15.478700383999978,28.13661101300005]],[[-15.43305928999996,28.152848265000046],[-15.43307974499993,28.152841882000075],[-15.433068678999973,28.15281509700003],[-15.433043259999977,28.152828429000067],[-15.43305928999996,28.152848265000046]],[[-15.437100548999979,28.169741353000063],[-15.437063162999948,28.169688620000045],[-15.437021234999975,28.16972864400003],[-15.437045938999972,28.169763941000042],[-15.437100548999979,28.169741353000063]],[[-15.43437126899994,28.171024467000052],[-15.434339879999982,28.17102844900006],[-15.434295687999963,28.171143826000048],[-15.434372764999978,28.171134943000027],[-15.43437126899994,28.171024467000052]],[[-15.406925961999946,28.18052928000003],[-15.406884419999926,28.180543116000024],[-15.406883641999968,28.180717112000025],[-15.406931971999938,28.180674415000055],[-15.406925961999946,28.18052928000003]],[[-15.406761427999982,28.180355125000062],[-15.406254990999969,28.180291364000027],[-15.406200501999933,28.180338213000027],[-15.406861883999966,28.180473169000038],[-15.406761427999982,28.180355125000062]],[[-15.407960725999942,28.17996815600003],[-15.407632965999937,28.179847250000023],[-15.407360972999982,28.179428227000074],[-15.407543653999937,28.17986102100008],[-15.407960725999942,28.17996815600003]],[[-15.40711295899996,28.17952462200003],[-15.406826042999967,28.179651419000038],[-15.407204626999942,28.17992831400005],[-15.407248986999946,28.179574471000024],[-15.40711295899996,28.17952462200003]],[[-15.412415203999956,28.179521753000074],[-15.412614800999961,28.179496572000062],[-15.41257066199995,28.179290467000044],[-15.412384330999942,28.17933718200004],[-15.412415203999956,28.179521753000074]],[[-15.414201271999957,28.179544002000057],[-15.414365668999949,28.179386202000046],[-15.414259870999956,28.17925333900007],[-15.41419996999997,28.17927486800005],[-15.414201271999957,28.179544002000057]],[[-15.414392654999972,28.17950755100003],[-15.414375216999929,28.179569230000027],[-15.41446590399994,28.179558331000067],[-15.414442386999951,28.179456651000066],[-15.414392654999972,28.17950755100003]],[[-15.412071914999956,28.179592358000036],[-15.411881262999941,28.17963372400004],[-15.411896260999981,28.17972978800003],[-15.412033038999937,28.179725216000065],[-15.412071914999956,28.179592358000036]],[[-15.414544206999949,28.177704007000045],[-15.414544004999982,28.17760710400006],[-15.414479391999976,28.177597668000033],[-15.41445105899993,28.17764189500008],[-15.414544206999949,28.177704007000045]],[[-15.408765623999955,28.17891454200003],[-15.40869087699997,28.178951523000023],[-15.40872901399996,28.179046761000052],[-15.408804216999954,28.178996012000027],[-15.408765623999955,28.17891454200003]],[[-15.402287164999962,28.172235413000067],[-15.402249301999973,28.172183854000025],[-15.401922562999971,28.172390979000056],[-15.402060183999936,28.17240111900003],[-15.402287164999962,28.172235413000067]],[[-15.403311241999972,28.172052457000063],[-15.403250664999973,28.172034176000068],[-15.403223005999962,28.172077027000057],[-15.403265593999947,28.172095425000066],[-15.403311241999972,28.172052457000063]],[[-15.403542770999934,28.171798669000054],[-15.40350256399995,28.17180419500005],[-15.40343293999996,28.17187513400006],[-15.403548236999939,28.17184373300006],[-15.403542770999934,28.171798669000054]],[[-15.40327283199997,28.170692408000036],[-15.403378386999975,28.170399426000074],[-15.402333966999947,28.170885846000033],[-15.402878585999929,28.17102793600003],[-15.40327283199997,28.170692408000036]],[[-15.403757634999977,28.170658040000035],[-15.403830691999929,28.170644276000075],[-15.403864287999966,28.170603880000044],[-15.403734921999956,28.170580259000076],[-15.403757634999977,28.170658040000035]],[[-15.404539305999947,28.168907648000072],[-15.404629213999954,28.168629297000052],[-15.404161347999946,28.168741629000067],[-15.404325583999935,28.168945000000065],[-15.404539305999947,28.168907648000072]],[[-15.404766238999969,28.167248193000034],[-15.404628066999976,28.167211645000066],[-15.404525069999977,28.167327025000077],[-15.40469283699997,28.167359198000042],[-15.404766238999969,28.167248193000034]],[[-15.403245549999951,28.166426216000048],[-15.403374007999957,28.16635848800007],[-15.403405288999977,28.166290306000064],[-15.403261548999978,28.166256868000062],[-15.403245549999951,28.166426216000048]],[[-15.414355101999945,28.075716103000047],[-15.414500809999936,28.075736047000078],[-15.41441423599997,28.07555749000005],[-15.414337904999968,28.075634695000076],[-15.414355101999945,28.075716103000047]],[[-14.507983865999961,28.069597827000052],[-14.507934187999979,28.06962545300007],[-14.507989831999964,28.06967999400007],[-14.508003261999932,28.069622433000063],[-14.507983865999961,28.069597827000052]],[[-14.511654480999937,28.06930873700003],[-14.511424983999973,28.069332807000023],[-14.51149861999994,28.069572421000032],[-14.51166139999998,28.069360838000023],[-14.511654480999937,28.06930873700003]],[[-14.512440934999972,28.068699672000037],[-14.51283811899998,28.068627051000078],[-14.512840855999968,28.06774038100008],[-14.511921190999942,28.068931904000067],[-14.512440934999972,28.068699672000037]],[[-15.386683696999967,28.029827597000065],[-15.38704093299998,28.02964030700008],[-15.386953023999979,28.02930391500007],[-15.386541988999966,28.02956732900003],[-15.386683696999967,28.029827597000065]],[[-15.385494755999957,28.027492059000053],[-15.385214048999956,28.02750885100005],[-15.384795492999956,28.02792458700003],[-15.385497073999943,28.027974310000047],[-15.385494755999957,28.027492059000053]],[[-15.385026437999954,28.027503076000073],[-15.385021995999978,28.027395440000078],[-15.384859960999961,28.02737895000007],[-15.38488995399996,28.02752545800007],[-15.385026437999954,28.027503076000073]],[[-15.38088075099995,28.013955604000046],[-15.380828857999973,28.01386376100004],[-15.380773265999949,28.01388044400005],[-15.380809620999969,28.013970280000024],[-15.38088075099995,28.013955604000046]],[[-15.380895467999949,28.01389129000006],[-15.380940279999948,28.01387853700004],[-15.38093897999994,28.013844436000056],[-15.380892484999947,28.01385613700006],[-15.380895467999949,28.01389129000006]],[[-15.381008632999965,28.013889568000025],[-15.380963558999952,28.01393794300003],[-15.380965703999948,28.013946351000072],[-15.381017738999958,28.013930688000073],[-15.381008632999965,28.013889568000025]],[[-15.359737908999932,27.939571409000052],[-15.359324355999945,27.939007038000057],[-15.358877889999974,27.93910008200004],[-15.359429759999955,27.93981346700008],[-15.359737908999932,27.939571409000052]]]];

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
								maximum: 9000000000000000,
								minimum: -9000000000000000
							}
						}
					}
				}
			};

			arrayAttr = new ArrayAttr();
			arrayAttr.build(schema).then(function() {
				arrayAttr.deserialize(value, false);
			});
		}
	};

	registerSuite("ArrayAttr with Polygon GeometryAttr elements tests", specificTests);
});
