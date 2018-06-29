define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Evented'
	, 'dojo/has'
	, 'redmic/base/RedmicLocalStorage'
], function(
	declare
	, lang
	, Evented
	, has
	, RedmicLocalStorage
){
	var Credentials = declare(Evented, {
		//	summary:
		//		Almacén de las credenciales del usuario.
		//	description:
		//		Engloba los datos de acceso del usuario actual y permite interactuar con ellos.
		//		Listo para importar y usar, con instancia persistente (sólo se crea una vez).

		//	validProps: Array
		//		Propiedades permitidas para el control del usuario.
		validProps: ['accessToken', 'userId', 'userName', 'userEmail', 'userRole', 'allowedModules', 'cookiesAccepted',
			'selectIds'],


		constructor: function(args) {

			for (var i = 0; i < this.validProps.length; i++) {
				var prop = this.validProps[i],
					evt1 = 'changed:' + prop,
					evt2 = 'removed:' + prop;

				// Re-emitimos los eventos de RedmicLocalStorage renombrados
				RedmicLocalStorage.on(evt1, lang.hitch(this, this._emitWrapper, evt1));
				RedmicLocalStorage.on(evt2, lang.hitch(this, this._emitWrapper, evt2));
			}
		},

		set: function(/*String*/ key, value) {
			//	summary:
			//		Da valor a un campo.
			//	key:
			//		Clave del elemento a asignar.
			//	value:
			//		Valor a asignar al elemento.

			if (this._isValid(key)) {
				RedmicLocalStorage.setItem(key, value);
			}
		},

		get: function(/*String*/ key) {
			//	summary:
			//		Devuelve un campo.
			//	key:
			//		Clave del elemento a obtener.
			//	returns:
			//		Valor del campo.

			if (this._isValid(key)) {
				return RedmicLocalStorage.getItem(key);
			}
		},

		has: function(/*String*/ key) {
			//	summary:
			//		Comprueba si existe una propiedad en las credenciales.
			//	key:
			//		Propiedad a comprobar.
			//	returns:
			//		Booleano indicando su presencia.

			return RedmicLocalStorage.has(key);
		},

		remove: function(/*String*/ key) {
			//	summary:
			//		Elimina una propiedad en las credenciales.
			//	key:
			//		Propiedad a eliminar.

			RedmicLocalStorage.removeItem(key);
		},

		clear: function() {
			//	summary:
			//		Elimina todas las propiedades de las credenciales.

			RedmicLocalStorage.clear();
		},

		_isValid: function(/*String*/ key) {
			//	summary:
			//		Comprueba si una propiedad es válida.
			//	key:
			//		Clave a comprobar.
			//	returns:
			//		Validez de la propiedad.

			return this.validProps.indexOf(key) !== -1;	// return Boolean
		},

		_emitWrapper: function(/*String*/ name, /*Object*/ obj) {
			//	summary:
			//		Envoltorio del método emit() de Evented.
			//	name:
			//		Nombre del evento a emitir.
			//	obj:
			//		Objeto a emitir.

			this.emit(name, obj);
		}
	});

	var credentialsInstance;
	if (has('host-browser')) {
		if (!window.credentials) {
			window.credentials = new Credentials();
		}
		credentialsInstance = window.credentials;
	} else if (has('host-node')) {
		if (!global.credentials) {
			global.credentials = new Credentials();
		}
		credentialsInstance = global.credentials;
	} else {
		console.error('Cannot create a credentials instance, environment not supported');
	}

	return credentialsInstance;
});
