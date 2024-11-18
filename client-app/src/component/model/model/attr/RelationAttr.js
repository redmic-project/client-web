define([
	"src/component/model/model/attr/Attr"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	Attr
	, declare
	, lang
){
	return declare(Attr, {
		//	summary:
		//		Métodos y atributos adicionales para los modelos con relaciones.
		//	description:
		//		Proporciona métodos y atributos a los modelos que incluyen propiedades relacionadas con otro modelo.

		//	idProperty: String
		//		Nombre de la propiedad que identifica a la relación
		//	labelProperty: String
		//		Nombre de la propiedad que describe o da nombre a la relación
		//	_additionalProperties: Object
		//		Almacén para los valores de las propiedades de la relación
		//	_initAdditionalProperties: Object
		//		Almacén para los valores iniciales de las propiedades de la relación

		constructor: function(args) {

			this.config = {
				idProperty: "id",
				labelProperty: "name",
				_additionalProperties: {},
				_initAdditionalProperties: null
			};

			lang.mixin(this, this.config, args);

			// Si le pasamos propiedades en el schema, las usamos
			var schema = this.get("schema");
			for (var key in schema) {
				if (key in this.config) {
					this[key] = schema[key];
				}
			}
		},

		_get: function(/*String*/ name, /*Object*/ names) {
			//	summary:
			//		Sobreescribimos el método de Stateful.
			//		Si tiene el parámetro buscado dentro de '_additionalProperties' lo devuelve.
			//	tags:
			//		extension private
			//	name:
			//		The property to get.
			//	names:
			//		Hash of names of custom attributes

			if (name in this._additionalProperties) {
				return this._additionalProperties[name];
			} else {
				return this.inherited(arguments);
			}
		},

		deserialize: function(/*Any*/ value, /*Boolean?*/ toInitValue, /*Boolean?*/ keepAllData) {
			//	summary:
			//		Deserializador de la propiedad.
			//	valus:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.

			this._clearAdditionalProperties();

			var idValue = this._deserializePropertiesAndGetIdValue(value, toInitValue);

			this.inherited(arguments, [idValue, toInitValue, keepAllData]);
		},

		_deserializePropertiesAndGetIdValue: function(/*Any*/ value, /*Boolean?*/ toInitValue) {
			//	summary:
			//		Deserializador de las propiedades de la relación.
			//	valus:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor de las propiedades como inicial o no.

			var idValue;

			if (typeof value !== "object" || (value && !Object.keys(value).length)) {
				idValue = value;
			} else if (!value) {
				idValue = null;
				this._additionalProperties[this.labelProperty] = idValue;
			} else {
				idValue = value[this.idProperty];
				this._additionalProperties[this.labelProperty] = value[this.labelProperty];
			}

			this._additionalProperties[this.idProperty] = idValue;

			if (toInitValue) {
				this._initAdditionalProperties = lang.clone(this._additionalProperties);
			}

			return idValue;
		},

		__initValueSetter: function(value) {
			//	summary:
			//		Setter de _initValue para convertir la entrada.

			var idValue = this._deserializePropertiesAndGetIdValue(value);

			this.inherited(arguments, [idValue]);
		},

		_valueSetter: function(value) {
			//	summary:
			//		Setter de value para convertir la entrada.

			var idValue = this._deserializePropertiesAndGetIdValue(value);

			this.inherited(arguments, [idValue]);
		},

		reset: function() {
			//	summary:
			//		Retorna el valor actual al valor inicial almacenado.
			//		Si no hay valor inicial equivale a clear().

			this._resetAdditionalProperties();

			this.inherited(arguments);
		},

		_resetAdditionalProperties: function() {
			//	summary:
			//		Retorna el valor actual de las propiedades adicionales al valor inicial almacenado.
			//		Si no hay valor inicial equivale a '_clearAdditionalProperties'.

			if (this._initAdditionalProperties) {
				this._additionalProperties = lang.clone(this._initAdditionalProperties);
			} else {
				this._clearAdditionalProperties();
			}
		},

		clear: function() {
			//	summary:
			//		Limpia el estado actual.

			this._clearAdditionalProperties();

			this.inherited(arguments);
		},

		_clearAdditionalProperties: function() {
			//	summary:
			//		Limpia el valor actual de las propiedades adicionales.

			this._additionalProperties = {};
		}
	});
});
