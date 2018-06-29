define([
	"dojo/_base/declare", 
	"dojo/store/util/QueryResults", 
	"redmic/store/util/SimpleQueryEngine" 
	/*=====, "./api/Store" =====*/
],
function(
	declare, 
	QueryResults, 
	SimpleQueryEngine 
	/*=====, Store =====*/
){

// module:
//		dojo/store/Memory

// No base class, but for purposes of documentation, the base class is dojo/store/api/Store
var base = null;
/*===== base = Store; =====*/

return declare("dojo.store.Memory", base, {
	idSec : 1,
	// summary:
	//		This is a basic in-memory object store. It implements dojo/store/api/Store.
	constructor: function(options){
		// summary:
		//		Creates a memory object store.
		// options: dojo/store/Memory
		//		This provides any configuration information that will be mixed into the store.
		//		This should generally include the data property to provide the starting set of data.
		for(var i in options){
			this[i] = options[i];
		}
		this.setData(this.data || []);
	},
	// data: Array
	//		The array of all the objects in the memory store
	data:null,

	// idProperty: String
	//		Indicates the property to use as the identity property. The values of this
	//		property should be unique.
	idProperty: "id",

	// index: Object
	//		An index of data indices into the data array by id
	index:null,

	// queryEngine: Function
	//		Defines the query engine to use for querying the data store
	queryEngine: SimpleQueryEngine,
	get: function(id){
		// summary:
		//		Retrieves an object by its identity
		// id: Number
		//		The identity to use to lookup the object
		// returns: Object
		//		The object in the store that matches the given id.
		return this.data[this.index[id]];
	},

	getIdentity: function(object){
		// summary:
		//		Returns an object's identity
		// object: Object
		//		The object to get the identity from
		// returns: Number

		var idObj = object && object.getId && object.getId();

		return idObj ? idObj.get ? idObj.get("value") : idObj : object[this.idProperty];
	},

	calculateId: function(){
		return this.idSec++;
	},

	put: function(object, options){
		// summary:
		//		Stores an object
		// object: Object
		//		The object to store.
		// options: dojo/store/api/Store.PutDirectives?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		// returns: Number
		var data = this.data,
			index = this.index,
			idProperty = this.idProperty,
			// Comprobamos si es una instancia
			instance = object && object.get ? true : false,
			id;

		// Si es una instancia significa que estamos modificando, por lo q se realiza sobre ek modelo y no hay que hacer nada
		// En caso contrario se crea la instancia con el objeto pasado y se guarda
		if (!instance) {
			// convertimos el objeto en una instancia del modelo
			object = this.getModelInstance(object);
			id = object.getId().get("value");
			//object.set("id", id);

			if (id in index) {
				// object exists
				if (options && options.overwrite === false) {
					throw new Error("Object already exists");
				}
				// replace the entry in data
				data[index[id]] = object;
			} else {
				// add the new object
				index[id] = data.push(object) - 1;
			}
		} else {
			id = object.getId() ? object.getId().get("value") : object[idProperty];
			//object.set("id", id);
			if (index[id] === undefined){  // instancia vacia no insertada en el store
				index[id] = data.push(object) - 1;
			} else {
				data[index[id]] = object;
			}
		}

		return this.get(id);
	},

	add: function(object, options){
		// summary:
		//		Creates an object, throws an error if the object already exists
		// object: Object
		//		The object to store.
		// options: dojo/store/api/Store.PutDirectives?
		//		Additional metadata for storing the data.  Includes an "id"
		//		property if a specific id is to be used.
		// returns: Instance
		(options = options || {}).overwrite = true;
		// call put with overwrite being false
		return this.put(object, options); // retorna la instancia completa
	},

	getModelInstance: function (obj) {
		// Guarda la instancia del modelo con las propiedades pasadas
		return new this.model({
			store: this,
			initValues: obj
		});

	},

	addModelInstance: function (obj) {
		// Guarda la instancia del modelo con las propiedades a null
		var model = this.getModelInstance(obj);
		model.save();
		return model;

	},

	remove: function(id){
		// summary:
		//		Deletes an object by its identity
		// id: Number
		//		The identity to use to delete the object
		// returns: Boolean
		//		Returns true if an object was removed, falsy (undefined) if no object matched the id
		var index = this.index;
		var data = this.data;

		if(id in index){
			data.splice(index[id], 1);
			// now we have to reindex
			this.setData(data);

			return true;
		}

	},
	query: function(query, options){
		// summary:
		//		Queries the store for objects.
		// query: Object
		//		The query to use for retrieving objects from the store.
		// options: dojo/store/api/Store.QueryOptions?
		//		The optional arguments to apply to the resultset.
		// returns: dojo/store/api/Store.QueryResults
		//		The results of the query, extended with iterative methods.
		//
		// example:
		//		Given the following store:
		//
		// 	|	var store = new Memory({
		// 	|		data: [
		// 	|			{id: 1, name: "one", prime: false },
		//	|			{id: 2, name: "two", even: true, prime: true},
		//	|			{id: 3, name: "three", prime: true},
		//	|			{id: 4, name: "four", even: true, prime: false},
		//	|			{id: 5, name: "five", prime: true}
		//	|		]
		//	|	});
		//
		//	...find all items where "prime" is true:
		//
		//	|	var results = store.query({ prime: true });
		//
		//	...or find all items where "even" is true:
		//
		//	|	var results = store.query({ even: true });
		return QueryResults(this.queryEngine(query, options)(this.data));
	},
	setData: function(data){
		// summary:
		//		Sets the given data as the source for this store, and indexes it
		// data: Object[]
		//		An array of objects to use as the source of data.
		if(data.items){
			// just for convenience with the data format IFRS expects
			this.idProperty = data.identifier || this.idProperty;
			data = this.data = data.items;
		}else{
			this.data = data;
		}
		this.index = {};
		for(var i = 0, l = data.length; i < l; i++){
			this.index[data[i].getId() ? data[i].getId().get("value") : data[i][idProperty]] = i;
		}
	}
});

});
