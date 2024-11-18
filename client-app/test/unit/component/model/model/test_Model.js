define([
	"src/component/model/model/_Model"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
], function(
	_Model
	, lang
	, Utilities
){
	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	var model, schema, value, newValue, invalidPropertyValues, invalidValue, specificProps, specificTests,
		expectedModifiedChildrenNumber, expectedInvalidPropertyNumber, arrayPropPath,

		timeout = 100,

		getDeepChildrenNumber = function(obj, schemaParam) {
			//	summary:
			//		Devuelve el número de propiedades o elementos del object o array proporcionado más, a su vez,
			//		el número de propiedades o elementos de sus propiedades o items anidados que sean de tipo object
			//		o array. Omite la recursividad si detecta que llega un object que pertenece a una relación.

			var count = 0;

			for (var key in obj) {
				var prop = obj[key],
					subSchema;

				if (schemaParam) {
					subSchema = schemaParam.properties ? schemaParam.properties[key] : schemaParam[key];
				}

				if (prop && typeof prop === "object" && (prop instanceof Array || (subSchema && !subSchema.url))) {
					count += getDeepChildrenNumber(prop, subSchema);
				}

				count++;
			}

			return count;
		},

		getDeepSchemaPropsNumber = function(schemaParam) {
			//	summary:
			//		Devuelve el número de propiedades en el schema proporcionado del object más, a su vez, el número
			//		de propiedades de sus propiedades anidadas que sean de tipo object. Omite la recursividad si
			//		detecta que llega un schema que no corresponde a un objeto.

			var count = 0,
				props = schemaParam ? schemaParam.properties : null;

			if (!props) {
				return count;
			}

			for (var key in props) {
				var prop = props[key];

				if (prop.type === "object") {
					count += getDeepSchemaPropsNumber(prop);
				}

				count++;
			}

			return count;
		},

		getInvalidValue = function(valueParam, invalidPropertyValuesParam) {
			//	summary:
			//		Mezcla el valor válido y las propiedades inválidas proporcionados, para devolver un valor
			//		inválido apropiado.

			var partialInvalidValue = lang.clone(valueParam);
			lang.mixin(partialInvalidValue, invalidPropertyValuesParam);

			return partialInvalidValue;
		},

		commonProps = {
			beforeEach: function() {

				model.reset();
			}
		},

		commonTests = {
			"check _generateUuid": function() {

				assert.isTrue(Utilities.isValidUuid(model.get("modelUuid")));
			},

			"check getId": function() {

				var idPropertyInstance = model.getId();
				assert.isDefined(idPropertyInstance, "La instancia de la propiedad identificadora no existe");
				assert.strictEqual(idPropertyInstance.get("value"), Utilities.getDeepProp(value, model.idProperty),
					"El valor de la propiedad identificadora no es correcto");
			},

			"check getIdValue": function() {

				assert.strictEqual(model.getIdValue(), Utilities.getDeepProp(value, model.idProperty),
					"El valor identificador no es correcto");
			},

			"check copy": function() {

				var copy = model.copy();

				assert.notEqual(model.get("modelUuid"), copy.get("modelUuid"),
					"Los UUIDs de la instancia y de su copia coinciden");

				assert.notEqual(model.getId().get("value"), copy.getId().get("value"),
					"Los identificadores de la instancia y de su copia coinciden");

				assert.isNull(copy.getId().get("value"), "La copia sigue teniendo valor en su propiedad identificadora");

				copy.getId().set("value", model.getId().get("value"));
				assert.deepEqual(model.serialize(), copy.serialize(),
					"Los modelos no son iguales al serializar tras igualar sus identificadores");
			},

			"check isNew": function() {

				assert.isFalse(model.get("isNew"), "La instancia cree que es nueva inicialmente");
				assert.isTrue(model.copy().get("isNew"), "La copia de la instancia cree que no es nueva");

				model.getId().set("value", null);
				assert.isTrue(model.get("isNew"), "La instancia cree que no es nueva");

				model.reset();
				assert.isFalse(model.get("isNew"), "La instancia cree que es nueva tras resetear");

				model.clear();
				assert.isTrue(model.get("isNew"), "La instancia cree que no es nueva tras limpiar");
			},

			"check isValid and number of validation errors stored globally": function() {

				assert.isTrue(model.get("isValid"), "Hay errores de validación con datos válidos");
				assert.lengthOf(Object.keys(model._globalValidation), 0,
					"Hay errores de validación cuando 'isValid' tiene valor true");

				model.deserialize(invalidValue);

				assert.isFalse(model.get("isValid"), "No hay errores de validación con datos inválidos");
				assert.lengthOf(Object.keys(model._globalValidation), expectedInvalidPropertyNumber,
					"No se ha producido error en el número de propiedades esperado");
			},

			"check isValid and children validation errors stored globally": function() {

				model.deserialize(invalidValue);
				assert.isFalse(model.get("isValid"), "No hay errores de validación con datos inválidos");

				var invalidPropertyNames = Object.keys(invalidPropertyValues),
					validPropertyNames = Utilities.without(Object.keys(value), invalidPropertyNames),
					i;

				for (i = 0; i < invalidPropertyNames.length; i++) {
					var invalidPropertyName = invalidPropertyNames[i],
						invalidPropertyValidation = model._globalValidation[invalidPropertyName];

					assert.isDefined(invalidPropertyValidation, "No hay errores almacenados para la propiedad '" +
						invalidPropertyName + "'");

					assert.isFalse(invalidPropertyValidation.valid, "La propiedad '" + invalidPropertyName +
						"' no es errónea con un valor erróneo");
				}

				for (i = 0; i < validPropertyNames.length; i++) {
					var validPropertyName = validPropertyNames[i];
					assert.isUndefined(model._globalValidation[validPropertyName],
						"Hay errores almacenados para la propiedad '" + validPropertyName + "' con un valor correcto");
				}
			},

			"check isValid and root validation errors creation": function() {

				model.deserialize(invalidValue);
				assert.isFalse(model.get("isValid"), "No hay errores de validación con datos inválidos");

				var rootValidation = model._globalValidation[model.pathSeparator];
				assert.isDefined(rootValidation, "No hay errores almacenados para la propiedad raíz");
			},

			"check root validation errors stored globally": function() {

				model.deserialize(invalidValue);

				var rootValidation = model._globalValidation[model.pathSeparator],
					propsInsideInvalidValue = getDeepChildrenNumber(invalidPropertyValues, schema),
					validationErrorsNumberInRoot = Object.keys(rootValidation.errors).length;

				assert.isAtLeast(validationErrorsNumberInRoot, propsInsideInvalidValue - 1,
					"No se ha producido el número de errores mínimo esperado en la propiedad raíz");

				assert.isAtMost(validationErrorsNumberInRoot, propsInsideInvalidValue,
					"No se ha producido el número de errores máximo esperado en la propiedad raíz");
			},

			"check isValid and validation errors after reset": function() {

				model.deserialize(newValue);

				model.reset();
				assert.isTrue(model.get("isValid"), "Hay errores de validación tras resetear");
				assert.lengthOf(Object.keys(model._globalValidation), 0,
					"Hay errores de validación cuando 'isValid' tiene valor true tras resetear");
			},

			"check isValid and validation errors after clear": function() {

				model.clear();
				assert.isFalse(model.get("isValid"), "No hay errores de validación tras limpiar");
				assert.lengthOf(Object.keys(model._globalValidation), getDeepSchemaPropsNumber(schema) + 1,
					"No se ha producido error en el número de propiedades esperado tras limpiar");
			},

			"check validation errors (relative to properties) in root get removed when property is valid": function() {

				model.deserialize(invalidValue);

				var firstInvalidPropertyName = "id",
					propertyInstance = model.get(firstInvalidPropertyName),
					propertyValidation = model._globalValidation[firstInvalidPropertyName],
					propertyValidationErrors = propertyValidation.errors,
					i;

				assert.isDefined(propertyValidation, "No hay errores almacenados para la primera propiedad inválida");
				assert.isAtLeast(propertyValidationErrors.length, 1,
					"No hay ningún error almacenado para la primera propiedad inválida");

				var rootValidation = model._globalValidation[model.pathSeparator],
					rootErrors = rootValidation.errors,
					errorFoundInRoot, rootError;

				for (i = 0; i < rootErrors.length; i++) {
					rootError = rootErrors[i];

					if (rootError.dataPath === "/" + firstInvalidPropertyName) {
						errorFoundInRoot = true;
						break;
					}
				}
				assert.isTrue(errorFoundInRoot, "No se ha encontrado un error relativo a la propiedad en la raíz");

				var propertyError, errorFoundInProperty;
				for (i = 0; i < propertyValidationErrors.length; i++) {
					propertyError = propertyValidationErrors[i];

					if (rootError.message === propertyError.message) {
						errorFoundInProperty = true;
						break;
					}
				}
				assert.isTrue(errorFoundInProperty,
					"No se ha encontrado el error registrado por la raíz en la propiedad");

				propertyInstance.set("value", value[firstInvalidPropertyName]);
				assert.isTrue(propertyInstance.get("isValid"),
					"Hay errores de validación en la propiedad tras setear un valor válido");

				propertyValidation = model._globalValidation[firstInvalidPropertyName];
				assert.isUndefined(propertyValidation, "Hay errores almacenados para la propiedad que ya es válida");

				rootValidation = model._globalValidation[model.pathSeparator];

				if (!rootValidation) {
					return;
				}

				rootErrors = rootValidation.errors;
				errorFoundInRoot = false;

				for (i = 0; i < rootErrors.length; i++) {
					rootError = rootErrors[i];

					if (rootError.dataPath === "/" + firstInvalidPropertyName) {
						errorFoundInRoot = true;
						break;
					}
				}
				assert.isFalse(errorFoundInRoot,
					"Se ha encontrado un error relativo a la propiedad que ya es válida en la raíz");
			},

			"check validationErrorsChanged emission": function() {

				var dfd = this.async(timeout);

				model.on("validationErrorsChanged", dfd.callback(function(obj) {

					delete model.onvalidationErrorsChanged;

					var errorKeys = Object.keys(obj),
						error = obj.id;

					assert.lengthOf(errorKeys, 1,
						"No se ha emitido el número de errores esperado con el evento 'validationErrorsChanged'");

					assert.isDefined(error, "No ha fallado la propiedad que se ha seteado incorrectamente");
				}));

				model.get("id").deserialize("mal");
			},

			"check hasChanged": function() {

				assert.isFalse(model.get("hasChanged"), "El modelo cree que ha cambiado");
				assert.lengthOf(Object.keys(model._childrenHaveChanged), 0,
					"Hay cambios en las propiedades hijas cuando 'hasChanged' tiene valor false");

				model.deserialize(newValue);
				assert.isTrue(model.get("hasChanged"),
					"El modelo cree que no ha cambiado tras deserializar un nuevo valor");

				assert.lengthOf(Object.keys(model._childrenHaveChanged), expectedModifiedChildrenNumber,
					"No existe el número de cambios esperado en las propiedades hijas tras deserializar");
			},

			"check hasChanged and changes in children after simple property set": function() {

				model.get("hola").set("value", "otro valor");
				assert.isTrue(model.get("hasChanged"), "El modelo cree que no ha cambiado tras setear una propiedad");
				assert.lengthOf(Object.keys(model._childrenHaveChanged), 1,
					"No existe el número de cambios esperado en las propiedades hijas tras setear una propiedad");
			},

			"check hasChanged and changes in children after additional property set": function() {

				var modifiedValue = lang.clone(value);
				modifiedValue.propiedadAdicional = "esta no está en el schema";

				model.reset();
				assert.isFalse(model.get("hasChanged"), "El modelo cree que ha cambiado tras resetear");

				model.deserialize(modifiedValue);
				assert.isTrue(model.get("hasChanged"),
					"El modelo cree que no ha cambiado tras deserializar un valor con propiedad adicional");

				assert.lengthOf(Object.keys(model._childrenHaveChanged), 0,
					"No existe el número de cambios esperado tras deserializar un valor con propiedad adicional");
			},

			"check hasChanged and changes in children after reset": function() {

				model.deserialize(newValue);

				model.reset();
				assert.isFalse(model.get("hasChanged"), "El modelo cree que ha cambiado tras resetear");
				assert.lengthOf(Object.keys(model._childrenHaveChanged), 0,
					"Hay cambios en las propiedades hijas cuando 'hasChanged' tiene valor false tras resetear");
			},

			"check hasChanged and changes in children after clear": function() {

				model.clear();
				assert.isTrue(model.get("hasChanged"), "El modelo cree que no ha cambiado tras limpiar");
				assert.lengthOf(Object.keys(model._childrenHaveChanged), getDeepSchemaPropsNumber(schema),
					"No existe el número de cambios esperado en las propiedades hijas tras limpiar");
			},

			"check valueChanged emission": function() {

				var dfd = this.async(timeout),
					minExpectedChanges = expectedModifiedChildrenNumber * 2,
					count = 0;

				setTimeout(dfd.callback(function() {

					delete model.onvalueChanged;
					assert.isAtLeast(count, minExpectedChanges,
						"No se ha emitido el evento 'valueChanged' el mínimo de veces esperado");
				}), timeout - 1);

				model.on("valueChanged", function(obj) {

					count++;
					var keys = Object.keys(obj),
						path = keys[0],
						pathSplitted = path.split(model.pathSeparator);

					for (var i = 0; i < pathSplitted.length; i++) {
						assert.isFalse(Utilities.isValidUuid(pathSplitted[i]),
							"Se está publicando un UUID como parte de un path en un cambio de valor");
					}
				});

				model.deserialize(newValue);
			}
		};


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				name: "pepito",
				hola: "hola"
			};

			newValue = {
				id: 2,
				name: "juanito",
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno"
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
					"name": {
						type: "string"
					},
					"hola": {
						type: "string"
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("_Model with Attr elements (integer, string) and generic tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				number: {
					id: 1,
					name: "1"
				},
				hola: "hola"
			};

			newValue = {
				id: 2,
				number: {
					id: 2,
					name: "2"
				},
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno",
				number: {
					id: "1",
					name: "1"
				}
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
					"number": {
						type: "integer",
						url: "number"
					},
					"hola": {
						type: "string"
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("_Model with RelationAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				numbers: [1, 2],
				hola: "hola"
			};

			newValue = {
				id: 2,
				numbers: [3, 4],
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno",
				numbers: ["27"]
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
					"numbers": {
						type: "array",
						minItems: 2,
						items: {
							type: "integer"
						}
					},
					"hola": {
						type: "string"
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			arrayPropPath = 'numbers';

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	specificTests = {
		Should_EmitValueAddedWithValidInfo_When_AddNewItemToArray: function() {

			var dfd = this.async(timeout),
				newItem = 5;

			model.on('valueAdded', dfd.callback(function(obj) {

				delete model.onvalueAdded;

				var additionInfo = obj[arrayPropPath];

				assert.isDefined(additionInfo, 'No se ha emitido con la clave esperada, la ruta de la propiedad');
				assert.isDefined(additionInfo.generatedId,
					'No se ha emitido el identificador autogenerado para el item');

				assert.strictEqual(additionInfo.index, Utilities.getDeepProp(value, arrayPropPath).length,
					'No se ha emitido el índice esperado del item dentro del array');

				assert.strictEqual(additionInfo.value, newItem, 'No se ha emitido el valor esperado del item añadido');
			}));

			model.get(arrayPropPath).addValue(newItem);
		},

		Should_EmitValueRemovedWithValidInfo_When_RemoveItemFromArray: function() {

			var dfd = this.async(timeout),
				itemIndex = 1;

			model.on('valueRemoved', dfd.callback(function(obj) {

				delete model.onvalueRemoved;

				var deletionInfo = obj[arrayPropPath];

				assert.isDefined(deletionInfo, 'No se ha emitido con la clave esperada, la ruta de la propiedad');
				assert.isDefined(deletionInfo.generatedId,
					'No se ha emitido el identificador autogenerado para el item');

				assert.strictEqual(deletionInfo.index, itemIndex,
					'No se ha emitido el índice esperado del item dentro del array');

				assert.strictEqual(deletionInfo.value, Utilities.getDeepProp(value, arrayPropPath)[itemIndex],
					'No se ha emitido el valor esperado del item eliminado');
			}));

			model.get(arrayPropPath).deleteValue(itemIndex);
		},

		Should_EmitValueReindexedWithValidInfo_When_RemovePreviousItemFromArray: function() {

			var dfd = this.async(timeout),
				arrayInstance = model.get(arrayPropPath),
				itemIndex = 0,
				nextItemGeneratedId = arrayInstance._getGeneratedId(itemIndex + 1);

			model.on('valueReindexed', dfd.callback(function(obj) {

				delete model.onvalueReindexed;

				var arrayItemPath = arrayPropPath + '/' + nextItemGeneratedId,
					reindexationInfo = obj[arrayItemPath];

				assert.isDefined(reindexationInfo, 'No se ha emitido con la clave esperada, la ruta de la propiedad');
				assert.strictEqual(reindexationInfo.oldIndex, itemIndex + 1,
					'No se ha emitido el antiguo índice esperado del item dentro del array');

				assert.strictEqual(reindexationInfo.newIndex, itemIndex,
					'No se ha emitido el nuevo índice esperado del item dentro del array');
			}));

			arrayInstance.deleteValue(itemIndex);
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("_Model with ArrayAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				number: {
					integerPart: 1,
					fractionalPart: 5
				},
				hola: "hola"
			};

			newValue = {
				id: 2,
				number: {
					integerPart: 3,
					fractionalPart: 14
				},
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno",
				number: {
					integerPart: "3",
					fractionalPart: "14"
				}
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
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
					},
					"hola": {
						type: "string"
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("_Model with ObjAttr elements tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				numbers: [{
					value: 1
				},{
					value: 2
				}],
				hola: 'hola'
			};

			newValue = {
				id: 2,
				numbers: [{
					value: 3
				},{
					value: 4
				}],
				hola: 'adios'
			};

			invalidPropertyValues = {
				id: 'uno',
				numbers: [{
					value: '27'
				}]
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: 'object',
				properties: {
					'id': {
						type: 'integer'
					},
					'numbers': {
						type: 'array',
						minItems: 2,
						items: {
							type: 'object',
							properties: {
								'value': {
									type: 'integer'
								}
							}
						}
					},
					'hola': {
						type: 'string'
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema) + 2;
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 2;

			arrayPropPath = 'numbers';

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	specificTests = {
		Should_OmitValueAddedEmission_When_ClearArrayValue: function() {

			var dfd = this.async(timeout),
				removeEventListening = function() {

					delete model.onvalueAdded;
				};

			setTimeout(dfd.callback(removeEventListening), timeout - 1);

			model.on('valueAdded', function() {

				removeEventListening();
				dfd.reject(new Error('Se ha emitido el evento de item añadido al limpiar el array'));
			});

			model.get(arrayPropPath).clear();
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite('_Model with ArrayAttr inside ObjAttr tests', specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				numberCollection: {
					integerParts: [{
						id: 1,
						name: "uno"
					},{
						id: 2,
						name: "dos"
					}],
					fractionalParts: [{
						id: 5,
						name: "cinco"
					},{
						id: 6,
						name: "seis"
					}]
				},
				hola: "hola"
			};

			newValue = {
				id: 2,
				numberCollection: {
					integerParts: [{
						id: 3,
						name: "tres"
					}],
					fractionalParts: [{
						id: 7,
						name: "siete"
					}]
				},
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno",
				numberCollection: {
					integerParts: [{
						id: "tres",
						name: 3
					}],
					fractionalParts: [{
						id: "catorce",
						name: 14
					}]
				}
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
					"numberCollection": {
						type: "object",
						properties: {
							"integerParts": {
								type: "array",
								minItems: 2,
								items: {
									type: "integer",
									url: "number"
								}
							},
							"fractionalParts": {
								type: "array",
								minItems: 2,
								items: {
									type: "integer",
									url: "number"
								}
							}
						}
					},
					"hola": {
						type: "string"
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("_Model with RelationAttr, inside ArrayAttr, inside ObjAttr tests", specificProps);


	var expectedValidationErrorsNumberInRoot;

	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			expectedValidationErrorsNumberInRoot = 7;

			value = {
				id: 1,
				numberCollection: {
					integerParts: [{
						id: 1,
						name: "uno"
					},{
						id: 2,
						name: "dos"
					}],
					fractionalParts: [{
						id: 5,
						name: "cinco"
					},{
						id: 6,
						name: "seis"
					}]
				},
				hola: "hola"
			};

			newValue = {
				id: 2,
				numberCollection: {
					integerParts: [{
						id: 3,
						name: "tres"
					}],
					fractionalParts: [{
						id: 7,
						name: "siete"
					}]
				},
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno",
				numberCollection: {
					integerParts: [{
						id: "tres"
					}],
					fractionalParts: [{
						id: "catorce"
					}]
				}
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
					"numberCollection": {
						type: "object",
						properties: {
							"integerParts": {
								type: "array",
								minItems: 2,
								items: {
									type: "object",
									properties: {
										"id": {
											type: "integer"
										},
										"name": {
											type: "string"
										}
									}
								}
							},
							"fractionalParts": {
								type: "array",
								minItems: 2,
								items: {
									type: "object",
									properties: {
										"id": {
											type: "integer"
										},
										"name": {
											type: "string"
										}
									}
								}
							}
						}
					},
					"hola": {
						type: "string"
					}
				}
			};

			expectedModifiedChildrenNumber = 11;
			expectedInvalidPropertyNumber = 11;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	specificTests = {};

	lang.mixin(specificProps, commonProps);

	lang.mixin(specificTests, commonTests, {
		"check root validation errors stored globally": function() {

			model.deserialize(getInvalidValue(value, invalidPropertyValues));

			var rootValidation = model._globalValidation[model.pathSeparator];

			assert.lengthOf(Object.keys(rootValidation.errors), expectedValidationErrorsNumberInRoot,
				"No se ha producido el número de errores esperado en la propiedad raíz");
		}
	});
	specificProps.tests = specificTests;
	registerSuite("_Model with Attr, inside ObjAttr, inside ArrayAttr, inside ObjAttr tests", specificProps);


	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				number: {
					integerPart: 1,
					fractionalPart: 5
				},
				hola: "hola"
			};

			newValue = {
				id: 2,
				number: {
					integerPart: 3,
					fractionalPart: 14
				},
				hola: "adios"
			};

			invalidPropertyValues = {
				id: "uno",
				number: {
					integerPart: "3",
					fractionalPart: "14"
				}
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						$ref: "#/definitions/integerNumber"
					},
					"number": {
						type: "object",
						properties: {
							$ref: "#/definitions/decimalNumber"
						}
					},
					"hola": {
						type: "string"
					}
				},
				definitions: {
					decimalNumber: {
						"integerPart": {
							$ref: "#/definitions/integerNumber"
						},
						"fractionalPart": {
							$ref: "#/definitions/integerNumber"
						}
					},
					integerNumber: {
						type: "integer"
					}
				}
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});
			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("_Model for schema with references tests", specificProps);

	specificProps = {
		before: function() {

			var dfd = this.async(timeout);

			value = {
				id: 1,
				name: "pepito",
				hola: "hola",
				value: "value"
			};

			newValue = {
				id: 2,
				name: "juanito",
				hola: "adios",
				value: "valueeee"
			};

			invalidPropertyValues = {
				id: "uno"
			};

			invalidValue = getInvalidValue(value, invalidPropertyValues);

			schema = {
				type: "object",
				properties: {
					"id": {
						type: "integer"
					},
					"name": {
						type: "string"
					},
					"hola": {
						type: "string"
					},
					"value": {
						type: "string"
					}
				},
				required: ['value', 'name']
			};

			expectedModifiedChildrenNumber = getDeepChildrenNumber(newValue, schema);
			expectedInvalidPropertyNumber = getDeepChildrenNumber(invalidPropertyValues, schema) + 1;

			model = new _Model({
				serializeAdditionalProperties: true,
				initValues: value
			});

			model.build(schema).then(dfd.callback(function() {}));
		}
	};

	specificTests = {

	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("_Model with Attr elements (integer, string) and generic tests with required", specificProps);
});
