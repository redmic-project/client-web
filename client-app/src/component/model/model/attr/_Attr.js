define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/Stateful"
	, "dojo/topic"
	, "json-schema-ref-parser/ref-parser.min"
	, "src/util/tv4"
], function(
	declare
	, lang
	, Deferred
	, Stateful
	, topic
	, refParser
	, tv4
){
	return declare(Stateful, {
		//	summary:
		//		Base común para todas los tipos de Attr.
		//	description:
		//		Proporciona atributos y métodos a los modelos.

		//	modelInstanceName: String
		//		Nombre de la propiedad
		//	modelInstancePath: String
		//		Ruta de la propiedad dentro del modelo
		//	isValid: Boolean
		//		Validez del valor actual
		//	hasChanged: Boolean
		//		Indica si valor actual es distinto a cuando se creó
		//	isRequired: Boolean
		//		Obligatoriedad de la propiedad
		//	pathSeparator: String
		//		Separador de niveles en los path de propiedades del modelo
		//	topicChannel: String
		//		Base del canal de topic usado para informar al ancestro
		//	_schema: Object
		//		Schema del modelo
		//	_validation: Object
		//		Resultado de validación del modelo con el valor actual

		constructor: function(args) {

			this.config = {
				modelInstanceName: "",
				modelInstancePath: "",
				isValid: true,
				hasChanged: false,
				isRequired: false,
				pathSeparator: "/"
			};

			lang.mixin(this, this.config, args);
		},

		postscript: function() {

			// Completamos la ruta
			this.modelInstancePath += this.modelInstanceName;
		},

		build: function(/*Object*/ schema, /*Boolean?*/ omitDereferencing) {
			//	summary:
			//		Construye la instancia en base al schema recibido
			//	schema:
			//		Definición del schema a seguir
			//	omitDereferencing:
			//		Flag para omitir el proceso de resolución de referencias en el schema de entrada. Al omitir el
			//		proceso, eliminamos la asincronía y el método deja de devolver una promesa

			if (!schema) {
				console.error("Schema not defined for model '%s'", this.modelInstanceName);
				return;
			}

			if (omitDereferencing) {

				this._setSchemaAndContinueBuilding(schema);
				return;
			}

			var buildDfd = new Deferred(),
				promise = refParser.dereference(schema);

			promise.then(lang.hitch(this, function(buildDfd, schema) {

				this._setSchemaAndContinueBuilding(schema);
				buildDfd.resolve();
			}, buildDfd));

			return buildDfd;
		},

		_setSchemaAndContinueBuilding: function(/*Object*/ schema) {
			//	summary:
			//		Setea el schema con las referencias resueltas y continua la construcción
			//	schema:
			//		Schema a seguir con las referencias resueltas

			this._schema = schema;
			this._build();

			var propertyType = this._schema.type;
			if (propertyType instanceof Array && propertyType.indexOf('null') !== -1) {
				return;
			}

			this._setDefaultValue();
		},

		_getDefaultValue: function() {
			//	summary:
			//		Getter para la propiedad default del schema.

			return this._defaultValue !== undefined ? this._defaultValue : null;
		},

		_validateAndUpdateStatus: function() {

			//	summary:
			//		Valida el valor actual y actualiza el estado de modificación
			var value = this.serialize();

			this._validate();

			this._updateHasChangedStatus(value);
			this._notifyValueChange(value);
		},

		_validate: function() {
			//	summary:
			//		Validador de la propiedad.

			this._updateValidation();

			var path = this._getModelInstancePath();

			if (this.isValid) {
				this._publishRemoveValidationError(path);
			} else {
				this._publishAddValidationError(path, this._validation);
			}
		},

		_updateValidation: function() {
			//	summary:
			//		Evalúa la validez de la propiedad.
			this._exceptionByUpdateValidation = true;

			var validation = tv4.validateMultiple(this.get("value"), this.get("schema"));

			delete this._exceptionByUpdateValidation;

			this._validation = validation;
			this.isValid = validation.valid;
		},

		_getModelInstancePath: function() {
			//	summary:
			//		Devuelve el path de la instancia, incluyendo la representación del nivel raíz para que no se muestre
			//		como cadena vacía.

			return this.modelInstancePath || this.pathSeparator;
		},

		_publishRemoveValidationError: function(/*String*/ path) {
			//	summary:
			//		Publica a la raíz del modelo la eliminación de errores de validación de la instancia.

			this._publishToRoot("removeValidationError", {
				path: path
			});
		},

		_publishAddValidationError: function(/*String*/ path, /*Object*/ validation) {
			//	summary:
			//		Publica a la raíz del modelo la creación de errores de validación de la instancia.

			this._publishToRoot("addValidationError", {
				path: path,
				validation: validation
			});
		},

		_publishToRoot: function(/*String*/ action, /*Object*/ objToPub) {
			//	summary:
			//		Publica a la raíz del modelo.

			if (this.topicChannel && this.topicChannel.length) {
				topic.publish(this.topicChannel + action, objToPub);
			}
		},

		_updateHasChangedStatus: function(value) {
			//	summary:
			//		Actualiza y propaga si el valor ha cambiado con respecto al original de la instancia.
			//	value:
			//		Valor de la instancia

			this.hasChanged = this._evaluateHasChanged(value, this._initValue);
		},

		_notifyValueChange: function(value) {
			//	summary:
			//		Notifica de un cambio de valor y del estado de modificación propio al ancestro
			//	value:
			//		Valor a notificar

			this._publishNotifyValueChange({
				path: this.modelInstancePath,
				value: value,
				modified: this.hasChanged
			});
		},

		_publishNotifyValueChange: function(/*Object*/ objToPub) {
			//	summary:
			//		Publica a la raíz del modelo el cambio de valor de la instancia.

			if (!objToPub || !objToPub.path || !objToPub.path.length) {
				return;
			}

			this._publishToRoot("notifyValueChange", objToPub);
		},

		_publishNotifyValueDeleted: function(/*Object*/ objToPub) {
			//	summary:
			//		Publica a la raíz del modelo el borrado de valor de la instancia.

			if (!objToPub || !objToPub.path || !objToPub.path.length) {
				return;
			}

			this._publishToRoot("notifyValueDeleted", objToPub);
		},

		_schemaGetter: function() {
			//	summary:
			//		Getter de schema.

			return this._schema;
		},

		_validationGetter: function() {
			//	summary:
			//		Getter de validation.

			return this._validation;
		},

		_modelPathGetter: function() {
			//	summary:
			//		Getter de modelInstancePath.

			return this.modelInstancePath;
		},

		_modelNameGetter: function() {
			//	summary:
			//		Getter de modelName.

			var schema = this.get("schema"),
				modelTitle = schema && schema.title ? schema.title : "",
				modelPath = this._getModelInstancePath();

			return modelTitle + (modelTitle.length ? " " : "") + "(" + modelPath + ")";
		},

		destroy: function() {
			//	summary:
			//		Realiza acciones finales antes de eliminar la instancia

			var path = this._getModelInstancePath();

			this._publishRemoveValidationError(path);
			this._publishNotifyValueChange({
				path: this.modelInstancePath
			});
		},

		reinitializeWithCurrentValue: function() {

			this._initValue = this.serialize();

			this._validateAndUpdateStatus();
		}
	});
});
