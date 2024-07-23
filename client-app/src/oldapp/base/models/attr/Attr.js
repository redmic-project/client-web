define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment/moment.min'
	, "./_Attr"
], function(
	declare
	, lang
	, moment
	, _Attr
){
	return declare(_Attr, {
		//	summary:
		//		Atributos y métodos adicionales para los modelos de propiedades finales.
		//	description:
		//		Proporciona atributos y métodos a los modelos.

		//	_initValue: Any
		//		Valor inicial interno (para edición)
		//	value: Array
		//		Valor actual

		constructor: function(args) {

			this.config = {
				_initValue: null,
				value: null
			};

			lang.mixin(this, this.config, args);
		},

		_build: function() {
			//	summary:
			//		Realiza las tareas propias del componente tras construir el schema

			// Observamos el valor para validar dinámicamente
			this.watch("value", this._valueWatcher);

			this._validate();	// Para validar al inicio
		},

		serialize: function() {
			//	summary:
			//		Serializador de la propiedad.
			//	returns:
			//		Valor.

			return this.value;
		},

		deserialize: function(/*Any*/ value, /*Boolean?*/ toInitValue, /*Boolean?*/ keepAllData) {
			//	summary:
			//		Deserializador de la propiedad.
			//	value:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.

			if (toInitValue) {
				this.set("_initValue", value);
			}

			this.set("value", value);
		},

		_valueWatcher: function(/*String*/ name, /*Any*/ oldValue, /*Any*/ value) {
			//	summary:
			//		Vigilante del atributo value. Se encarga de controlar su valor
			//		y actuar en consecuencia.
			//	name:
			//		Nombre de la propiedad (siempre será value)
			//	oldValue:
			//		Antiguo valor
			//	value:
			//		Nuevo valor

			// Si no cambia con respecto al valor, nos vamos
			if (oldValue === value) {
				return;
			}

			// Siempre que cambia el valor, validamos
			this._validateAndUpdateStatus();
		},

		_evaluateHasChanged: function(value, initValue) {
			//	summary:
			//		Devuelve si el valor ha cambiado con respecto al original de la instancia.

			return value === initValue ? false : true;
		},

		__initValueSetter: function(value) {
			//	summary:
			//		Setter de _initValue para convertir la entrada.

			this._initValue = this._getNormalizedValue(value);

			this.hasChanged = false;
		},

		_valueSetter: function(value) {
			//	summary:
			//		Setter de value para convertir la entrada.

			this.value = this._getNormalizedValue(value);
		},

		_getNormalizedValue: function(value) {
			//	summary:
			//		Devuelve la entrada, convertida si es necesario.

			var type = this.get("schema").type;

			if (type === "string" || (type instanceof Array && type.indexOf("string") === 0)) {
				var format = this.get("schema").format;
				if (format && (format === 'date' || format === 'date-time' || format === 'duration')) {
					return this._getNormalizedTemporalValue(value, format);
				}

				var valueType = typeof value;
				if (valueType === 'number' || valueType === 'boolean') {
					return value.toString();
				}
			}

			return value;
		},

		_getNormalizedTemporalValue: function(value, format) {
			//	summary:
			//		Devuelve la entrada de tipo temporal, convertida si es necesario.

			if (!value || !(value instanceof Date || typeof value === 'number' || typeof value === 'string')) {
				return value;
			}

			var temporalValue;
			if (format === 'date' || format === 'date-time') {
				temporalValue = this._getNormalizedDateOrDateTimeValue(value, format);
			} else if (format === 'duration') {
				temporalValue = this._getNormalizedDurationValue(value);
			}

			return temporalValue || value;
		},

		_getNormalizedDateOrDateTimeValue: function(value, format) {
			//	summary:
			//		Devuelve la entrada de tipo fecha o fecha-hora, convertida si es necesario.

			var momentInstance = moment(value),
				year = momentInstance.year(),
				formatPattern;

			if (format === 'date') {
				formatPattern = "YYYY-MM-DD";
			} else if (format === 'date-time') {
				formatPattern = "YYYY-MM-DDTHH:mm:ss.SSSZ";
			}

			if (formatPattern && momentInstance.isValid() && (year >= 0 && year <= 9999)) {
				return momentInstance.format(formatPattern);	// return string
			}

			return value;
		},

		_getNormalizedDurationValue: function(value) {
			//	summary:
			//		Devuelve la entrada de tipo duración, convertida si es necesario.

			var momentInstance = moment.duration(value),
				durationInMilliseconds = momentInstance.asMilliseconds();

			if (!!durationInMilliseconds && durationInMilliseconds > 0) {
				return momentInstance.toJSON();	// return string
			}

			return value;
		},

		reset: function() {
			//	summary:
			//		Retorna el valor actual al valor inicial almacenado.
			//		Si no hay valor inicial equivale a clear().

			this.set("value", this._initValue);
		},

		clear: function() {
			//	summary:
			//		Limpia el estado actual.

			this.set("value", this._getDefaultValue());
		},

		_clearContent: function() {
			//	summary:
			//		Limpia el estado actual.

			this.set("value", null);
		},

		_setDefaultValue: function() {
			//	summary:
			//		Comprueba si existe default, y si es así lo setea en el valor y en inicial

			if (!this._schema.hasOwnProperty("default")) {
				return;
			}

			var defaultValue = this._schema["default"],
				type = this._schema.type;

			if (type instanceof Array) {
				type = type[0];
			}

			if (type === "integer" || type === "number") {
				defaultValue = Number(defaultValue);
				if (isNaN(defaultValue)) {
					console.error("Default value '%s' is not valid for this schema", this._schema["default"],
						this._schema);
					return;
				}
			} else if (type === "boolean") {
				if (defaultValue === "true") {
					defaultValue = true;
				} else if (defaultValue === "false") {
					defaultValue = false;
				} else {
					console.error("Default value '%s' is not valid for this schema", this._schema["default"],
						this._schema);
					return;
				}
			}

			this._defaultValue = defaultValue;

			this.deserialize(defaultValue, true);
		}
	});
});
