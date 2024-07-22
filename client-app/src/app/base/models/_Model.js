define([
	"app/base/models/attr/ObjAttr"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "dojo/topic"
	, 'uuid/uuidv4.min'
	, "RWidgets/Utilities"
], function (
	ObjAttr
	, declare
	, lang
	, Evented
	, topic
	, uuid
	, Utilities
){
	var _Model = declare([ObjAttr, Evented], {
		//	summary:
		//		Padre genérico, común para todos los modelos.
		//	description:
		//		Proporciona los métodos para trabajar con la información.

		//	modelTitle: String
		//		Identificador del modelo
		//	idProperty: String
		//		Ruta hasta el identificador
		//	dataPathSeparator: String
		//		Separador usado por tv4 para indicar las rutas de los errores en sus resultados de validación
		//	initValues: Object
		//		Valores iniciales pasados desde fuera (para edición)
		//	isNew: Boolean
		//		Indicador de si la instancia ha sido guardada previamente
		//	topicChannel: String
		//		Base del canal de topic para compartir con las subinstancias y escucharlas
		//	_uuid: String
		//		Identificador único y universal de la instancia
		//	_globalValidation: Object
		//		Objeto donde almacenamos los errores de validación de todo el modelo
		//	_childrenHaveChanged: Object
		//		Objeto donde almacenamos los flags de modificación de las propiedades
		//	_events: Object
		//		Definición de eventos usados por el modelo para informar hacia afuera

		constructor: function(args) {

			this._modelConfig = {
				modelTitle: "Model",
				idProperty: "id",
				dataPathSeparator: "/",
				isNew: true,
				_events: {
					VALUE_CHANGED: "valueChanged",
					VALUE_ADDED: "valueAdded",
					VALUE_REMOVED: "valueRemoved",
					VALUE_REINDEXED: "valueReindexed",
					VALIDATION_ERRORS_CHANGED: "validationErrorsChanged"
				}
			};

			lang.mixin(this, this._modelConfig, args);
		},

		postscript: function() {

			this._generateUuid();
			this._createTopicChannel();
		},

		_generateUuid: function() {
			//	summary:
			//		Asigna un nuevo UUID a la instancia.

			this._uuid = uuid();
		},

		_modelUuidGetter: function() {
			//	summary:
			//		Getter de modelUuid.

			return this._uuid;
		},

		_createTopicChannel: function() {
			//	summary:
			//		Crea la cadena que representa al canal para escuchar a las subinstancias.

			this.topicChannel = this.get("modelUuid") + ":";
		},

		_build: function() {
			//	summary:
			//		Realiza las tareas propias del componente tras construir el schema

			this._listenChildrenProperties();

			this.inherited(arguments);

			this._listenIdProperty();
			this._propagateInitValues();
		},

		_listenIdProperty: function() {
			//	summary:
			//		Crea la escucha al valor de la propiedad identificadora.

			var idPropertyInstance = this.getId();

			idPropertyInstance && idPropertyInstance.watch("value", lang.hitch(this, this._onChangeIdProperty));
		},

		getId: function() {
			//	summary:
			//		Busca y devuelve la instancia de la propiedad identificadora.
			//	returns:
			//		Instancia de la propiedad identificadora.

			var instance = this._getPropertyInstance(this.idProperty, this);

			return instance;	// return Object
		},

		_onChangeIdProperty: function(name, oldValue, value) {
			//	summary:
			//		Escucha cambios en la propiedad identificadora para decidir si el modelo se corresponde con un
			//		valor nuevo o estamos editando.

			this.set("isNew", value === null || value < 0 || isNaN(value));
		},

		_propagateInitValues: function() {
			//	summary:
			//		Propaga los valores iniciales a las subinstancias contenidas en el modelo y después los elimina
			//		de la instancia del modelo.

			if (this.initValues) {
				this.deserialize(this.initValues, true);
				delete this.initValues;
			}
		},

		_listenChildrenProperties: function() {
			//	summary:
			//		Escucha lo que tengan que decir las instancias de las propiedades anidadas

			this._globalValidation = {};
			this._childrenHaveChanged = {};

			topic.subscribe(this.topicChannel + "addValidationError", lang.hitch(this, this._addValidationError));

			topic.subscribe(this.topicChannel + "removeValidationError", lang.hitch(this, this._removeValidationError));

			topic.subscribe(this.topicChannel + "notifyValueChange", lang.hitch(this, this._onValueChangeNotification));

			topic.subscribe(this.topicChannel + "notifyValueDeleted",
				lang.hitch(this, this._onValueDeletedNotification));

			topic.subscribe(this.topicChannel + "addedValue",
				lang.hitch(this, this._onAddedOrRemovedValueNotification, this._events.VALUE_ADDED));

			topic.subscribe(this.topicChannel + "removedValue",
				lang.hitch(this, this._onAddedOrRemovedValueNotification, this._events.VALUE_REMOVED));

			topic.subscribe(this.topicChannel + "reindexedValue",
				lang.hitch(this, this._onReindexedValueNotification, this._events.VALUE_REINDEXED));
		},

		_addValidationError: function(/*Object*/ obj) {
			//	summary:
			//		Almacena los errores de validación propios y los procedentes de las propiedades hijas.
			//	obj:
			//		Información recibida.

			var path = obj.path,
				validation = obj.validation;

			this._globalValidation[path] = validation;

			this.isValid = false;

			this._emitValidationErrors();
		},

		_removeValidationError: function(/*Object*/ obj) {
			//	summary:
			//		Elimina los errores de validación propios y los procedentes de las propiedades hijas.
			//	obj:
			//		Información recibida.

			var path = obj.path;

			this._findAndRemoveDescendantsErrorsInAncestors(path);

			if (this._globalValidation[path]) {
				delete this._globalValidation[path];

				this.isValid = !Object.keys(this._globalValidation).length;
				this._emitValidationErrors();
			}
		},

		/*_emitValidationErrors: function() {
			//	summary:
			//		Emite el evento de cambio en errores globales de validación
			clearTimeout(this._timeoutHandlerEmitValidationErrors);

			this._timeoutHandlerEmitValidationErrors = setTimeout(lang.hitch(this, this._emitValidationErrorsWithTimeout));
		},

		_emitValidationErrorsWithTimeout: function() {

			this.emit(this._events.VALIDATION_ERRORS_CHANGED, this._globalValidation);
		},*/

		_emitValidationErrors: function() {
			//	summary:
			//		Emite el evento de cambio en errores globales de validación

			this.emit(this._events.VALIDATION_ERRORS_CHANGED, this._globalValidation);
		},

		_findAndRemoveDescendantsErrorsInAncestors: function(/*String*/ path) {
			//	summary:
			//		Busca en los errores de los elementos ancestro los errores causados anteriormente por un
			//		descendiente que actualmente es válido, para eliminar su rastro en todos sus ancestros

			var resolvedPath = this._resolveUuidsInPath(path) || path,
				pathSplitted = resolvedPath.split(this.pathSeparator),
				pathSplittedCopy = lang.clone(pathSplitted);

			while (pathSplitted.length > 0) {
				var descendantId = pathSplitted.pop(),
					ancestorPath = pathSplitted.join(this.pathSeparator) || this.pathSeparator;

				this._findAndRemoveDescendantErrorsInAncestor(ancestorPath, descendantId);
				if (descendantId !== resolvedPath) {
					this._findAndRemoveDescendantErrorsInAncestor(ancestorPath, resolvedPath);
				}
			}
		},

		_findAndRemoveDescendantErrorsInAncestor: function(/*String*/ ancestorPath, /*String*/ descendantId) {
			//	summary:
			//		Busca los errores ya resueltos de un elemento descendiente para un ancestro específico.

			var ancestorValidationErrors = this._globalValidation[ancestorPath];

			if (!ancestorValidationErrors || !ancestorValidationErrors.errors) {
				return;
			}

			var errors = ancestorValidationErrors.errors;

			for (var i = 0; i < errors.length; i++) {
				var error = errors[i],
					dataPath = error.dataPath,
					dataPathSplitted = dataPath.split(this.dataPathSeparator);

				while (dataPathSplitted.length > 0) {
					var pathOfPossibleDescendantWithError = dataPathSplitted.join(this.dataPathSeparator);

					if (pathOfPossibleDescendantWithError === descendantId) {
						this._globalValidation[ancestorPath].errors.splice(i, 1);
						i--;
					}

					dataPathSplitted.splice(0, 1);
				}
			}

			if (!this._globalValidation[ancestorPath].errors.length) {
				delete this._globalValidation[ancestorPath];
			}
		},

		_onValueChangeNotification: function(/*Object*/ obj) {
			//	summary:
			//		Notifica que se ha producido un cambio de valor propio o de una propiedad hija. Mantiene el
			//		registro de cambios en los diferentes niveles actualizado.
			//	obj:
			//		Información recibida.

			var path = obj.path,
				value = obj.value,
				modified = obj.modified;

			modified && this._updateAncestorsValidation(path);
			this._updateHasChanged(path, modified);

			var resolvedPath = this._resolveUuidsInPath(path),
				pubObj = {};

			if (resolvedPath) {
				pubObj[resolvedPath] = value;
				this.emit(this._events.VALUE_CHANGED, pubObj);
			}
		},

		_onValueDeletedNotification: function(/*Object*/ obj) {
			//	summary:
			//		Escucha que se ha producido un borrado de un valor de una propiedad hija. Mantiene el
			//		registro de cambios en los diferentes niveles actualizado.
			//	obj:
			//		Información recibida.

			var path = obj.path;

			this._updateHasChanged(path, false);
		},

		_onAddedOrRemovedValueNotification: function(/*String*/ evtName, /*Object*/ obj) {
			//	summary:
			//		Notifica que se ha añadido o eliminado un elemento a una propiedad hija de tipo array.
			//	obj:
			//		Información recibida.

			var path = obj.path,
				value = obj.value,
				generatedId = obj.generatedId,
				index = obj.index,
				resolvedPath = this._resolveUuidsInPath(path),
				pubObj = {};

			if (resolvedPath) {
				var valueObj = {
					value: value,
					generatedId: generatedId,
					index: index
				};

				pubObj[resolvedPath] = valueObj;

				this.emit(evtName, pubObj);
			}
		},

		_onReindexedValueNotification: function(/*String*/ evtName, /*Object*/ obj) {
			//	summary:
			//		Notifica que se ha reindexado un elemento en una propiedad hija de tipo array.
			//	obj:
			//		Información recibida.

			var path = obj.path,
				oldIndex = obj.oldIndex,
				newIndex = obj.newIndex,
				pubObj = {};

			if (path) {
				pubObj[path] = {
					oldIndex: oldIndex,
					newIndex: newIndex
				};
				this.emit(evtName, pubObj);
			}
		},

		_resolveUuidsInPath: function(/*String*/ path) {
			//	summary:
			//		Detecta UUIDs en un path y los traduce al indice que le corresponde como elemento de un array.
			//	path:
			//		Path de una subinstancia.
			//	returns:
			//		Path con los UUIDs encontrados sustituidos por su posición en el array

			var regExp = new RegExp("([\\w|\\" + this.pathSeparator + "]*)" +
				"([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})", "ig"),

				instance = this,
				resolvedPath = "",
				results;

			while ((results = regExp.exec(path)) !== null) {
				var pathToArray = results[1],
					itemUuid = results[2];

				if (results.index) {
					pathToArray = pathToArray.substring(1);
				}
				pathToArray = pathToArray.slice(0, -1);

				instance = this._getPropertyInstance(pathToArray, instance);
				if (!instance) {
					return;
				}

				var indexForUuid = instance._getItemIndex(itemUuid);

				if (indexForUuid === -1) {
					return;
				}

				if (resolvedPath.length) {
					resolvedPath += this.pathSeparator;
				}

				resolvedPath += pathToArray + this.pathSeparator + indexForUuid;
			}

			return resolvedPath || path;
		},

		_getPropertyInstance: function(path, instance) {
			//	summary:
			//		Busca una subinstancia a partir del path proporcionado.
			//	path:
			//		Ruta hasta una subinstancia
			//	instance:
			//		Instancia de la propiedad de partida
			//	returns:
			//		Instancia a la que apunta 'path' o null si no se encuentra

			var pathSplitted = path.split(this.pathSeparator);

			for (var i = 0; i < pathSplitted.length; i++) {
				if (instance && instance.get) {
					instance = instance.get(pathSplitted[i]);
				} else {
					return null;
				}
			}

			return instance;
		},

		_updateAncestorsValidation: function(/*String*/ path) {
			//	summary:
			//		Actualiza la validación de todos los ancestros del elemento correspondiente al path especificado.
			//	path:
			//		Identificador de la propiedad descendiente.

			var pathSplitted = path.split(this.pathSeparator);

			while (pathSplitted.length > 0) {
				var descendantId = pathSplitted.pop(),
					ancestorPath = pathSplitted.join(this.pathSeparator),
					resolvedAncestorPath = this._resolveUuidsInPath(ancestorPath) || ancestorPath,
					ancestorInstance = this._getPropertyInstance(resolvedAncestorPath, this);

				if (ancestorInstance) {
					ancestorInstance._validate/*AndUpdateStatus*/();
				} else {
					this._updateValidation();
				}
			}
		},

		_updateHasChanged: function(/*String*/ key, /*Boolean*/ modified) {
			//	summary:
			//		Actualiza el estado de modificación propio en base al procedente de las propiedades hijas.
			//	key:
			//		Identificador de la propiedad.
			//	modified:
			//		Estado actual de modificación de la propiedad.

			if (modified) {
				if (key && key.length) {
					this._childrenHaveChanged[key] = true;
				}
				this.hasChanged = true;
			} else {
				delete this._childrenHaveChanged[key];

				for (var prop in this._childrenHaveChanged) {
					if (this._childrenHaveChanged[prop]) {
						this.hasChanged = true;
						return;
					}
				}

				this.hasChanged = false;
			}
		},

		copy: function() {
			//	summary:
			//		Crea una instancia nueva del modelo con los mismos valores.
			//		Sólo se modifica el valor del identificador, ya que son objetos diferentes y no deben coincidir
			//		nunca.
			//	returns:
			//		Nueva instancia generada.

			var copyProps = {};
			lang.mixin(copyProps, this._modelConfig, {
				modelTitle: this.modelTitle,
				idProperty: this.idProperty,
				pathSeparator: this.pathSeparator,
				initValues: this.serialize()
			});

			var copyInstance = new _Model(copyProps);
			copyInstance.build(this.get("schema"), true);

			copyInstance.getId().deserialize(null, true);

			return copyInstance;	// return Object
		},

		getIdValue: function() {
			//	summary:
			//		Busca y devuelve el valor de la propiedad identificadora.
			//	returns:
			//		Valor de la propiedad identificadora.

			return Utilities.getDeepProp(this.serialize(), this.idProperty, this.pathSeparator);
		}
	});

	return _Model;
});
