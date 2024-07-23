define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_Attr"
], function(
	declare
	, lang
	, _Attr
){
	return declare(_Attr, {
		//	summary:
		//		Base común para los modelos que contienen subinstancias (objects y arrays).
		//	description:
		//		Proporciona métodos y atributos a los modelos complejos.

		//	_unsuitableValueSet: Boolean
		//		Indica si el último valor seteado fue no apto, para devolverlo como valor propio
		//	_unsuitableValue: Any
		//		Último valor seteado (si fue no apto, si no se habrá limpiado)

		constructor: function(args) {

			this.config = {
				serializeAdditionalProperties: false
			};

			lang.mixin(this, this.config, args);
		},

		serialize: function(noSerializeNullValue) {
			//	summary:
			//		Serializador de la propiedad.
			//	returns:
			//		Valor.

			if (this._unsuitableValueSet) {
				return !!this._unsuitableValue ? lang.clone(this._unsuitableValue) : this._unsuitableValue;
			}

			var serialized = this._serialize(noSerializeNullValue);
			return !!serialized ? lang.clone(serialized) : serialized;
		},

		deserialize: function(/*Object*/ value, /*Boolean?*/ toInitValue, /*Boolean?*/ keepAllData) {
			//	summary:
			//		Deserializador de la propiedad.
			//	value:
			//		Valor.
			//	toInitvalue:
			//		Flag para poner el valor como inicial o no.

			this._deserializeElements(value, toInitValue, keepAllData);
		},

		_deserializeElements: function(/*Any*/ value, /*Boolean?*/ toInitValue, /*Boolean?*/ keepAllData) {
			//	summary:
			//		Deserializador de los elementos de la propiedad.
			//	value:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.
			if (!keepAllData) {
				this._clearContent();
			}

			this._unsuitableValueSet = false;
			delete this._unsuitableValue;

			this._deserialize(value, toInitValue);

			this._validateAndUpdateStatus();
		},

		_valueGetter: function() {
			//	summary:
			//		Getter de value.

			return this.serialize();
		},

		_valueSetter: function(value) {
			//	summary:
			//		Setter de value.

			this._deserializeElements(value);
		},

		_getPropsForNewInstance: function(/*String*/ modelInstanceName, /*Object*/ schema) {
			//	summary:
			//		Devuelve un objeto de propiedades iniciales para pasar a una instancia hija.
			//	modelInstanceName:
			//		Nombre de la propiedad o UUID del elemento a construir
			//	schema:
			//		Subschema correspondiente a la propiedad o al elemento a construir

			return {
				modelInstanceName: modelInstanceName,
				modelInstancePath: this.modelInstancePath.length ? this.modelInstancePath + this.pathSeparator : "",
				isRequired: this._getChildIsRequired(modelInstanceName),
				pathSeparator: this.pathSeparator,
				topicChannel: this.topicChannel,
				serializeAdditionalProperties: this.serializeAdditionalProperties
			};
		},

		_isValidGetter: function() {
			//	summary:
			//		Getter de isValid.

			this._updateValidation();

			return this.isValid;
		},

		_hasChangedGetter: function() {
			//	summary:
			//		Getter de hasChanged.

			var value = this.serialize();

			this._updateHasChangedStatus(value);

			return this.hasChanged;
		},

		_getSubSchemaType: function(schema) {

			if (schema.type instanceof Array) {
				return schema.type[0];
			}

			return schema.type;
		},

		_isTypeNull: function() {

			var type = this._schema.type;

			if (type instanceof Array && type.indexOf("null") !== -1) {
				return true;
			}

			return false;
		},

		clear: function(/*Array?*/ propsToClear) {
			//	summary:
			//		Limpia el estado actual.

			this._clearContent(propsToClear);

			if (this._defaultValue) {
				this._deserialize(this._defaultValue, false);
			}
		},

		_setDefaultValue: function() {
			//	summary:
			//		Comprueba si existe default, y si es así lo setea en el valor y en inicial

			if (!this._schema.hasOwnProperty("default")) {
				return;
			}

			var defaultValue = this._schema["default"];

			this._defaultValue = JSON.parse(defaultValue);

			this.deserialize(this._defaultValue, true);
		}
	});
});
