define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "RWidgets/Utilities"
	, 'uuid/uuidv4.min'
	, "src/component/model/model/attr/_ComplexAttr"
], function (
	declare
	, lang
	, Deferred
	, Utilities
	, uuid
	, _ComplexAttr
){
	var ArrayAttr = declare(_ComplexAttr, {
		//	summary:
		//		Métodos adicionales para los modelos con campos de tipo array.
		//	description:
		//		Proporciona métodos a los modelos que trabajan con arrays.

		//	_initValue: Any
		//		Valor inicial interno (para edición)
		//	_items: Object
		//		Instancias de los elementos que contiene esta instancia.
		//	_itemIdsByPosition: Object
		//		Índice por posición de las instancias contenidas en '_items'.
		//	_length: Integer
		//		Número de elementos que contiene la instancia.

		constructor: function(args) {

			this.config = {
				_initValue: [],
				_items: {},
				_itemIdsByPosition: {},
				_length: 0
			};

			lang.mixin(this, this.config, args);
		},

		_build: function() {
			//	summary:
			//		Realiza las tareas propias del componente tras construir el schema

			this._validate();	// Para validar al inicio
		},

		_serialize: function(noSerializeNullValue) {
			//	summary:
			//		Serializador de la propiedad de tipo array.
			//	returns:
			//		Valor.

			var retObj = [];

			for (var i in this._items) {
				var item = this._items[i];
				if (item.serialize) {
					retObj.push(item.serialize(noSerializeNullValue));
				}
			}

			if (retObj.length === 0 && this._isTypeNull()) {
				return null;
			}

			return retObj;	// return Array
		},

		_deserialize: function(/*Any*/ value, /*Boolean?*/ toInitValue) {
			//	summary:
			//		Deserializador de los elementos de la propiedad de tipo array.
			//	value:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.

			// Si llega un array de elementos, se añade poco a poco

			if (value instanceof Array) {

				if (toInitValue && !value.length) {
					this._initValue = this.serialize();
				}

				for (var i = 0; i < value.length; i++) {
					this.addValue(value[i], toInitValue);
				}
			} else if (value === null && this._isTypeNull()) {

				if (toInitValue) {
					this._initValue = [];
				}

				this._clearContent();
			// Si no llega un array, preservamos el valor no apto
			} else {
				console.error("Tried to deserialize an unsuitable array '%O' at model '%s' with this schema:", value,
					this.get("modelName"), this.get("schema"));

				this._unsuitableValueSet = true;
				this._unsuitableValue = value;
			}
		},

		deleteValue: function(/*integer*/ index) {
			//	summary:
			//		Elimina una posición dentro del array
			//	index:
			//		Índice de la posición a eliminar

			if (Utilities.isValidNumber(index) && index >= 0 && !this._itemIdsByPosition[index]) {
				console.error("Tried to remove non-existent element from empty position '%s' at array model '%s'",
					index, this.get("modelName"));

				return;
			}

			var generatedIndex = this._getGeneratedId(index);

			if (!this._items[generatedIndex]) {
				console.error("Tried to remove non-existent element with UUID '%s' at array model '%s'", generatedIndex,
					this.get("modelName"));

				return;
			}

			this._deleteValue(generatedIndex, this._getItemIndex(generatedIndex));
			this._validateAndUpdateStatus();

			return generatedIndex;
		},

		_getGeneratedId: function(index) {
			//	summary:
			//		Devuelve el identificador correcto según el caso. Para positivos, sabemos que buscamos una posición
			//		dentro del array, así que buscamos que id autogenerado le corresponde. Si no llega un entero
			//		positivo, suponemos que se trata de el mismo UUID que buscamos y lo devolvemos tal cual.
			//	returns:
			//		Id autogenerado correspondiente al buscado.

			return (Utilities.isValidNumber(index) && index >= 0) ? this._itemIdsByPosition[index] : index;
		},

		_getItemIndex: function(/*String*/ itemUuid) {
			//	summary:
			//		Devuelve el índice que le corresponde dentro del array al UUID especificado.
			//	itemUuid:
			//		UUID del elemento cuyo índice es buscado
			//	returns:
			//		Índice del elemento dentro del array (o -1 si no se encuentra)

			for (var i = 0; i < this._length; i++) {
				if (this._itemIdsByPosition[i] === itemUuid) {
					return i;
				}
			}

			return -1;
		},

		_deleteValue: function(/*String*/ generatedIndex, /*Integer*/ positionIndex) {
			//	summary:
			//		Elimina un elemento del array buscándolo por su id generado
			//	generatedIndex:
			//		UUID correspondiente al elemento
			//	positionIndex:
			//		Índice de posición correspondiente al elemento dentro del array

			var instance = this._items[generatedIndex],
				value = instance.serialize();

			instance.destroy();

			delete this._items[generatedIndex];
			delete this._itemIdsByPosition[positionIndex];

			this._length--;

			for (var i = positionIndex + 1; i <= this._length; i++) {
				this._itemIdsByPosition[i - 1] = this._itemIdsByPosition[i];
				delete this._itemIdsByPosition[i];

				var item = this._items[this._itemIdsByPosition[i - 1]],
					path = item.get('modelPath');

				this._publishNotifyReindexedValue({
					path: path,
					oldIndex: i,
					newIndex: i - 1
				});
			}

			this._publishNotifyAddedOrRemovedValue("removedValue", {
				path: this.modelInstancePath,
				value: value,
				generatedId: generatedIndex,
				index: positionIndex
			});
		},

		addValue: function(/*Any*/ value, /*Boolean?*/ toInitValue) {
			//	summary:
			//		Añade un valor al array
			//	value:
			//		Valor a añadir
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.

			var generatedIndex = this._generateId();

			if (this._items[generatedIndex]) {
				console.error("Tried to add element with duplicated UUID '%s' at array model '%s'", generatedIndex,
					this.get("modelName"));

				return;
			}

			var positionIndex = this._length,
				instance = this._addValue(generatedIndex, positionIndex);

			instance.then(lang.hitch(this, this._onInitValueAdded, value, toInitValue, positionIndex, generatedIndex));
			instance.then(lang.hitch(this, this._onValueAdded, value, positionIndex, generatedIndex));

			return generatedIndex;
		},

		_publishNotifyAddedOrRemovedValue: function(/*String*/ action, /*Object*/ objToPub) {
			//	summary:
			//		Publica a la raíz del modelo el cambio de valor de la instancia.

			if (!objToPub || !objToPub.path || !objToPub.path.length || !objToPub.generatedId) {
				return;
			}

			this._publishToRoot(action, objToPub);
		},

		_publishNotifyReindexedValue: function(/*Object*/ objToPub) {
			//	summary:
			//		Publica a la raíz del modelo el cambio de índice de una instancia hija.

			if (!objToPub || !objToPub.path || !objToPub.path.length) {
				return;
			}

			this._publishToRoot("reindexedValue", objToPub);
		},

		_generateId: function() {
			//	summary:
			//		Genera y devuelve un nuevo UUID

			return uuid();	// return String
		},

		_addValue: function(/*String*/ generatedIndex, /*Integer*/ positionIndex) {
			//	summary:
			//		Añade un elemento al array con su id generado
			//	generatedIndex:
			//		UUID correspondiente al elemento
			//	positionIndex:
			//		Posición correspondiente al elemento dentro del array

			if (this._itemIdsByPosition[positionIndex]) {
				console.error("Tried to add element to used position '%s' at array model '%s'", positionIndex,
					this.get("modelName"));

				return;
			}

			var instance = this._buildItems(this.get("schema").items, generatedIndex, positionIndex);

			this._items[generatedIndex] = instance;
			this._itemIdsByPosition[positionIndex] = generatedIndex;
			this._length++;

			instance.then(lang.hitch(this, function(generatedIndex, resolvedInstance) {

				this._items[generatedIndex] = resolvedInstance;
				this._validateAndUpdateStatus();

			}, generatedIndex));

			return instance;
		},

		_onValueAdded: function(value, index, generatedIndex, instance) {
			//	summary:
			//		Deserializa los valores de la subinstancia una vez que ha sido instanciada
			//	value:
			//		Valor.
			//	index:
			//		Índice del elemento dentro del array
			//	generatedIndex:
			//		UUID correspondiente al elemento

			//this._validateAndUpdateStatus();

			this._publishNotifyAddedOrRemovedValue("addedValue", {
				path: this.modelInstancePath,
				value: value,
				generatedId: generatedIndex,
				index: index
			});
		},

		_onInitValueAdded: function(value, toInitValue, index, generatedIndex, instance) {
			//	summary:
			//		Deserializa los valores de la subinstancia una vez que ha sido instanciada
			//	value:
			//		Valor.
			//	toInitValue:
			//		Flag para poner el valor como inicial o no.
			//	index:
			//		Índice del elemento dentro del array
			//	generatedIndex:
			//		UUID correspondiente al elemento
			//	instance:
			//		Instancia del elemento añadido

			// Si no vamos a inicializar con el nuevo valor ...
			if (!toInitValue) {
				var previousInitValue = this._initValue ? this._initValue[index] : undefined;
				// ... y existían valores iniciales para el índice actual ...
				if (previousInitValue !== undefined) {
					// ... le mandamos dichos valores iniciales como tal
					instance.deserialize(previousInitValue, true);
				}
			}

			instance.deserialize(value, toInitValue);

			if (toInitValue) {
				this._initValue = this.serialize();
			}
		},

		_buildItems: function(/*Object*/ schema, /*String*/ itemUuid, /*Integer*/ index) {
			//	summary:
			//		Constructor de los elementos del array.
			//	schema:
			//		Sub-schema con los elementos del array
			//	itemUuid:
			//		UUID del elemento que vamos a construir
			//	index:
			//		Índice del elemento que vamos a construir

			var props = this._getPropsForNewInstance(itemUuid, schema),
				previousInitValue = this._initValue ? this._initValue[index] : undefined,
				dfd = new Deferred();

			if (previousInitValue !== undefined) {
				props._initValue = previousInitValue;
			}

			var type = this._getSubSchemaType(schema);

			if (type === "object") {
				this._buildObjAttrItem(schema, props, dfd);
			} else if (type === "array") {
				this._buildArrayAttrItem(schema, props, dfd);
			} else if (schema.url) {
				this._buildRelationAttrItem(schema, props, dfd);
			} else {
				this._buildAttrItem(schema, props, dfd);
			}

			return dfd;
		},

		_getChildIsRequired: function(/*String*/ itemUuid) {
			//	summary:
			//		Comprueba si un elemento es requerido según el schema de su ancestro.
			//	itemUuid:
			//		UUID del elemento que comprobamos.
			//	returns:
			//		Estado de requerido del elemento.

			/*var minItems = this.get("schema").minItems;

			if (!minItems) {
				return false;
			}

			return this._length < minItems;*/

			return false;
		},

		_buildObjAttrItem: function(/*Object*/ schema, /*Object*/ props, /*Object*/ dfd) {
			//	summary:
			//		Construye un elemento de tipo ObjAttr.
			//	schema:
			//		Schema sobre el que construir el elemento
			//	props:
			//		Propiedades para construir el elemento
			//	dfd:
			//		Deferred de petición de la definición

			this._buildItem({
				name: "_requiredObjAttr",
				path: "src/component/model/model/attr/ObjAttr"
			}, schema, props, dfd);
		},

		_buildArrayAttrItem: function(/*Object*/ schema, /*Object*/ props, /*Object*/ dfd) {
			//	summary:
			//		Construye un elemento de tipo ArrayAttr.
			//	schema:
			//		Schema sobre el que construir el elemento
			//	props:
			//		Propiedades para construir el elemento
			//	dfd:
			//		Deferred de petición de la definición

			var name = "_requiredArrayAttr";

			this[name] = ArrayAttr;
			this._resolveBuildItemDfd(name, schema, props, dfd);
		},

		_buildRelationAttrItem: function(/*Object*/ schema, /*Object*/ props, /*Object*/ dfd) {
			//	summary:
			//		Construye un elemento de tipo RelationAttr.
			//	schema:
			//		Schema sobre el que construir el elemento
			//	props:
			//		Propiedades para construir el elemento
			//	dfd:
			//		Deferred de petición de la definición

			this._buildItem({
				name: "_requiredRelationAttr",
				path: "src/component/model/model/attr/RelationAttr"
			}, schema, props, dfd);
		},

		_buildAttrItem: function(/*Object*/ schema, /*Object*/ props, /*Object*/ dfd) {
			//	summary:
			//		Construye un elemento de tipo Attr.
			//	schema:
			//		Schema sobre el que construir el elemento
			//	props:
			//		Propiedades para construir el elemento
			//	dfd:
			//		Deferred de petición de la definición

			this._buildItem({
				name: "_requiredAttr",
				path: "src/component/model/model/attr/Attr"
			}, schema, props, dfd);
		},

		_buildItem: function(/*Object*/ options, /*Object*/ schema, /*Object*/ props, /*Object*/ dfd) {
			//	summary:
			//		Construye un elemento acorde a los datos proporcionados.
			//	options:
			//		Detalles del item a construir. Contiene su ruta para requerirlo y el nombre del atributo que
			//		guardará la definición o la promesa de que se está requiriendo para una petición anterior.
			//	schema:
			//		Schema sobre el que construir el elemento
			//	props:
			//		Propiedades para construir el elemento
			//	dfd:
			//		Deferred de petición de la definición

			var name = options.name,
				path = options.path,
				promiseName = name + "Promise";

			if (this[name]) {
				this._resolveBuildItemDfd(name, schema, props, dfd);
			} else if (this[promiseName]) {
				this[promiseName].then(lang.hitch(this, this._resolveBuildItemDfd, name, schema, props, dfd));
			} else {
				this[promiseName] = new Deferred();

				require([path], lang.hitch(this, function(name, promiseName, schema, props, dfd, Definition) {

					this[name] = Definition;
					this._resolveBuildItemDfd(name, schema, props, dfd);
					this[promiseName].resolve();
				}, name, promiseName, schema, props, dfd));
			}
		},

		_resolveBuildItemDfd: function(/*String*/ name, /*Object*/ schema, /*Object*/ props, /*Object*/ dfd) {
			//	summary:
			//		Construye un elemento cuando ya tenemos disponible su definición o cuando se cumple una promesa
			//		de definición generada por otra instancia.
			//	name:
			//		Nombre del atributo que guarda la definición o la promesa de que se está requiriendo para una
			//		petición anterior.
			//	schema:
			//		Schema sobre el que construir el elemento
			//	props:
			//		Propiedades para construir el elemento
			//	dfd:
			//		Deferred de petición de la definición

			var Definition = this[name],
				instance = new Definition(props);

			instance.build(schema, true);
			dfd.resolve(instance);
		},

		get: function(/*String*/ name, /*Boolean?*/ createMissingInstances) {
			//	summary:
			//		Sobreescribimos el método público de Stateful.
			//	tags:
			//		extension
			//	name:
			//		The property to get.
			//	createMissingInstances:
			//		Flag que indica que se deben crear aquellas instancias que no existan (si pedimos mediante un
			//		índice o un UUID.

			if (Utilities.isValidNumber(parseInt(name, 10)) || Utilities.isValidUuid(name)) {
				var generatedIndex = this._getGeneratedId(name);

				if (createMissingInstances && !this._items[generatedIndex]) {
					generatedIndex = this._generateId();

					var positionIndex = this._length,
						instance = this._addValue(generatedIndex, positionIndex);

					instance.then(lang.hitch(this, this._onValueAdded, null, positionIndex, generatedIndex));

					return instance;
				}
			}

			return this.inherited(arguments);
		},

		_get: function(/*String*/ name, /*Object*/ names) {
			//	summary:
			//		Sobreescribimos el método de Stateful.
			//	tags:
			//		extension
			//	name:
			//		The property to get.
			//	names:
			//		Hash of names of custom attributes

			if (!Utilities.isValidNumber(parseInt(name, 10)) && !Utilities.isValidUuid(name)) {
				return this.inherited(arguments);
			}

			var generatedIndex = this._getGeneratedId(name);

			return this._items[generatedIndex];
		},

		_itemsGetter: function() {
			//	summary:
			//		Getter de _items.

			var items = [];

			for (var generatedId in this._items) {
				var item = this._items[generatedId];
				items.push({
					generatedId: generatedId,
					value: item.get("value")
				});
			}

			return items;	// return Array
		},

		_evaluateHasChanged: function(value, initValue) {
			//	summary:
			//		Devuelve si el valor ha cambiado con respecto al original de la instancia.

			if (this._isTypeNull() && !value && (!initValue || initValue.length === 0)) {
				return false;
			}

			if (!value || !initValue || value.length !== initValue.length) {
				return true;
			}

			var itemUuid, instance;
			for (itemUuid in this._items) {
				instance = this._items[itemUuid];
				if (instance.get && instance.get("hasChanged")) {
					return true;
				}
			}

			return false;
		},

		reset: function() {
			//	summary:
			//		Retorna el valor actual al valor inicial almacenado.
			//		Si no hay valor inicial equivale a clear().

			this.deserialize(this._initValue, true);
		},

		_clearContent: function() {
			//	summary:
			//		Limpia el estado actual.

			this._clearArray();
			this._validateAndUpdateStatus();
		},

		_clearArray: function() {
			//	summary:
			//		Limpia y destruye a sus items y a si mismo.

			for (var i = 0; i < this._length; i++) {
				var itemId = this._itemIdsByPosition[i],
					instance = this._items[itemId];

				instance._clearContent();

				delete this._itemIdsByPosition[i];
				delete this._items[itemId];

				instance.destroy();
			}

			this._length = 0;
		},

		destroy: function() {
			//	summary:
			//		Realiza acciones finales antes de eliminar la instancia

			this._clearArray();

			this.inherited(arguments);
		},

		reinitializeWithCurrentValue: function() {

			for (var i in this._items) {
				var instance = this._items[i];

				if (instance) {
					instance.reinitializeWithCurrentValue();
				}
			}

			this.inherited(arguments);
		}
	});

	return ArrayAttr;
});
