define([
	"src/component/model/model/attr/ArrayAttr"
	, "src/component/model/model/attr/Attr"
	, "src/component/model/model/attr/RelationAttr"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "src/component/model/model/attr/_ComplexAttr"
], function(
	ArrayAttr
	, Attr
	, RelationAttr
	, declare
	, lang
	, Utilities
	, _ComplexAttr
){
	var ObjAttr = declare(_ComplexAttr, {
		//	summary:
		//		Métodos y atributos comunes para los modelos con propiedades anidadas.
		//	description:
		//		Proporciona métodos y atributos a los modelos.
		//		Se apoya en los métodos definidos en las propiedades anidadas en él.

		//	_initValue: Any
		//		Valor inicial interno (para edición)
		//	_properties: Object
		//		Instancias de las propiedades anidadas
		//	_additionalProperties: Object
		//		Valor actual para propiedades no definidas en el schema

		constructor: function(args) {

			this.config = {
				_initValue: {},
				_properties: {},
				_additionalProperties: {}
			};

			lang.mixin(this, this.config, args);
		},

		_build: function() {
			//	summary:
			//		Realiza las tareas propias del componente tras construir el schema

			// Construimos las propiedades anidadas
			this._buildProperties(this.get("schema").properties);

			this._clearContent();	// Para inicializar los valores de esta instancia y las hijas
		},

		_serialize: function(noSerializeNullValue) {
			//	summary:
			//		Serializador de la propiedad de tipo object.
			//	returns:
			//		Valor.

			var result = this.serializeAdditionalProperties ? (lang.clone(this._additionalProperties) || {}) : {},
				resultWithoutNulls, prop, instance, value,
				isRetNull = this._isTypeNull();

			if (this.serializeAdditionalProperties && noSerializeNullValue) {
				for (prop in result) {
					value = result[prop];

					if (value === undefined || value === null) {
						delete result[prop];
					}
				}
			}

			resultWithoutNulls = lang.clone(result);

			if (Object.keys(result).length > 0) {
				isRetNull = false;
			}

			for (prop in this._properties) {
				instance = this._properties[prop];
				value = instance.serialize(noSerializeNullValue);

				result[prop] = value;

				if (value !== undefined && value !== null) {

					if (isRetNull) {
						if (value instanceof Array) {
							if (value.length > 0) {
								isRetNull = false;
							}
						} else if (value instanceof Object) {
							if (Object.keys(value).length > 0) {
								isRetNull = false;
							}
						} else {
							isRetNull = false;
						}
					}

					resultWithoutNulls[prop] = value;
				}
			}

			if (isRetNull) {
				return null;
			}

			return noSerializeNullValue ? resultWithoutNulls : result;	// return Object
		},

		_deserialize: function(/*Any*/ value, /*Boolean?*/ toInitValue) {
			//	summary:
			//		Deserializador de los elementos de la propiedad de tipo object.
			//	value:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.

			var suitable = this._checkValueSuitability(value);

			// Si nos llega un valor no apto, lo preservamos pero no lo procesamos
			if (!suitable) {

				console.error("Tried to deserialize an unsuitable object '%O' at model '%s' with this schema:", value,
					this.get("modelName"), this.get("schema"));

				this._unsuitableValueSet = true;
				this._unsuitableValue = value;
			}

			if (value) {

				this._additionalProperties = lang.clone(value);

				// Propagamos los subvalores a donde corresponda
				for (var prop in value) {
					var instance = this._properties[prop];

					if (instance) {
						suitable && instance.deserialize(value[prop], toInitValue);
						delete this._additionalProperties[prop];
					}
				}
			}

			if (toInitValue) {
				this._initValue = this.serialize();
			}
		},

		_checkValueSuitability: function(value) {
			//	summary:
			//		Comprueba si el valor recibido es apto

			if (value === null && this._isTypeNull()) {
				return true;
			}

			if (typeof value !== "object" || value === null || value instanceof Array) {
				return false;
			}

			var schemaPropRequiredNames = this._schema.required || [],
				valuePropNames = Object.keys(value);

			// Si el objeto que llega tiene menos propiedades que las definidas en requiridas del schema, no es apto
			if (valuePropNames.length < schemaPropRequiredNames.length) {
				return false;
			}

			// Si el objeto que llega no tiene todas las propiedades definidas en requiridas del schema, no es apto
			for (var i = 0; i < schemaPropRequiredNames.length; i++) {
				var propName = schemaPropRequiredNames[i];
				if (valuePropNames.indexOf(propName) < 0) {
					return false;
				}
			}

			return true;
		},

		_buildProperties: function(/*Object*/ subSchema) {
			//	summary:
			//		Constructor de las propiedades.
			//	tags:
			//		private
			//	subSchema:
			//		Sub-schema con las propiedades anidadas

			var instanceProps, propSchema, Definition;

			for (var prop in subSchema) {
				propSchema = subSchema[prop];
				instanceProps = this._getPropsForNewInstance(prop, propSchema);

				var type = this._getSubSchemaType(propSchema);

				if (type === "object") {
					Definition = ObjAttr;
				} else if (type === "array") {
					Definition = ArrayAttr;
				} else if (propSchema.url) {
					Definition = RelationAttr;
				} else {
					Definition = Attr;
				}

				var instance = new Definition(instanceProps);

				this._properties[prop] = instance;
				instance.build(propSchema, true);
			}
		},

		_getChildIsRequired: function(/*String*/ prop) {
			//	summary:
			//		Comprueba si una propiedad es requerida según el schema de su ancestro.
			//	prop:
			//		Nombre de la propiedad que comprobamos.
			//	returns:
			//		Estado de requerido de la propiedad 'prop'.

			var requiredProps = this.get("schema").required;

			if (!requiredProps || !(requiredProps instanceof Array)) {
				return false;
			}

			return requiredProps.indexOf(prop) !== -1;
		},

		_get: function(/*String*/ name, /*Object*/ names) {
			//	summary:
			//		Sobreescribimos el método de Stateful.
			//		Si tiene función getter la usa.
			//		Si no está lo busca dentro de su atributo _properties.
			//		Si no lo encontró lo busca dentro de su atributo value.
			//		Si no, busca el atributo en si mismo.
			//	tags:
			//		extension
			//	name:
			//		The property to get.
			//	names:
			//		Hash of names of custom attributes

			if (!this._exceptionByUpdateValidation) {
				if (name in this._properties) {
					return this._properties[name];
				}

				if (this._additionalProperties && typeof this._additionalProperties === "object") {
					if (name in this._additionalProperties) {
						return this._additionalProperties[name];
					}
				}
			}

			if (typeof this[names.g] === "function") {
				return this[names.g]();
			}

			return this[name];
		},

		_evaluateHasChanged: function(value, initValue) {
			//	summary:
			//		Devuelve si el valor ha cambiado con respecto al original de la instancia.

			var prop, instance;
			for (prop in this._properties) {
				instance = this._properties[prop];
				if (instance.get("hasChanged")) {
					return true;
				}
			}

			if (this.serializeAdditionalProperties && this._additionalProperties) {
				var propValue;

				for (prop in this._additionalProperties) {
					propValue = this._additionalProperties[prop];
					if (!initValue || (!initValue[prop] && propValue) || (initValue[prop] && !propValue) ||
						(!Utilities.isEqual(propValue, initValue[prop]))) {
						return true;
					}
				}
			}

			return false;
		},

		reset: function(/*Array?*/ propsToReset) {
			//	summary:
			//		Retorna el valor actual al valor inicial almacenado.
			//		Si no hay valor inicial equivale a clear().
			//	propsToReset:
			//		Listado de propiedades específicas a resetear, obviando al resto.

			if (propsToReset) {
				this._doActionOnSpecificProps(propsToReset, "reset");
			} else {
				for (var prop in this._properties) {
					this._properties[prop].reset();
				}
			}

			this._additionalProperties = {};
			this._additionalProperties = this.serialize();

			if (this._additionalProperties && typeof this._additionalProperties === "object") {
				for (var key in this._properties) {
					delete this._additionalProperties[key];
				}
			}

			this._validateAndUpdateStatus();
		},

		_clearContent: function(/*Array?*/ propsToClear) {
			//	summary:
			//		Limpia el estado actual.
			//	propsToClear:
			//		Listado de propiedades específicas a limpiar, obviando al resto.

			if (propsToClear) {
				this._doActionOnSpecificProps(propsToClear, "clear");
			} else {
				for (var prop in this._properties) {
					var instance = this._properties[prop];
					instance.clear();
				}
			}

			this._additionalProperties = {};
			this._validateAndUpdateStatus();
		},

		_doActionOnSpecificProps: function(/*Array*/ props, /*String*/ action) {
			//	summary:
			//		Resetea o limpia propiedades específicas.

			for (var i = 0; i < props.length; i++) {
				var prop = props[i],
					instance;

				if (prop.indexOf(this.pathSeparator) === -1) {

					instance = this.get(prop);
				} else {

					var propSplitted = prop.split(this.pathSeparator);

					instance = this.get(propSplitted[0]);
					prop = propSplitted[propSplitted.length - 1];

					for (var j = 1; j < propSplitted.length; j++) {
						instance = instance ? instance.get(propSplitted[j]) : null;
					}
				}

				this._doActionOnSpecificProp(prop, action, instance);
			}
		},

		_doActionOnSpecificProp: function(/*String*/ prop, /*String*/ action, /*Object*/ instance) {
			//	summary:
			//		Resetea o limpia una propiedad específica.

			if (!instance && this._additionalProperties[prop] === undefined) {
				console.error("Tried to %s an missing property '%s' at model '%s' with this schema:", action, prop,
					this.get("modelName"), this.get("schema"));
			}

			instance && instance[action]();
		},

		destroy: function() {
			//	summary:
			//		Realiza acciones finales antes de eliminar la instancia

			for (var prop in this._properties) {
				var instance = this._properties[prop];
				instance.destroy();
			}

			this.inherited(arguments);
		},

		reinitializeWithCurrentValue: function() {

			for (var prop in this._properties) {
				var instance = this._properties[prop];

				if (instance) {
					instance.reinitializeWithCurrentValue();
				}
			}

			this.inherited(arguments);
		}
	});

	return ObjAttr;
});
