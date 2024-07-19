define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Evented'
	, 'dojo/on'
], function(
	declare
	, lang
	, Evented
	, on
) {

	var RedmicLocalStorage = declare(Evented, {
		//	summary:
		//		Widget envoltorio de localStorage de HTML5.
		//	description:
		//		Permite ampliar métodos y funcionalidades del localStorage nativo.
		//		Listo para importar y usar, con instancia persistente (sólo se crea una vez).

		//	_prefix: String
		//		Prefijo que se coloca a todas las propiedades almacenadas.
		_prefix: 'REDMIC_',

		constructor: function(args) {

			// Detecta cambio remoto
			on(window, 'storage', lang.hitch(this, function(evt) {

				if (!evt.oldValue && !evt.newValue && (!evt.key || !evt.key.length)) {
					this.emit('cleared');
					return;
				}

				// Clave sin prefijo
				var key = this._getKeyWithoutPrefix(evt.key);

				if (evt.newValue) {
					this.emit('changed:' + key, {
						key: key,
						value: evt.newValue,
						oldValue: evt.oldValue
					});
				} else {
					this.emit('removed:' + key);
				}
			}));
		},

		setItem: function(/*String*/ key, value) {
			//	summary:
			//		Da valor a un campo de localStorage y emite un evento.
			//	key:
			//		Clave del elemento a asignar.
			//	value:
			//		Valor a asignar al elemento.

			// Si se le pasa un objeto, se serializa a string antes
			if (value && typeof value === 'object') {
				value = JSON.stringify(value);
			}

			// Si se le pasa un número, se convierte a string antes
			if (value !== undefined && value !== null && typeof value === 'number') {
				value = value.toString();
			}

			// Si el value es nulo o sin longitud, se borra la clave
			if (!value || (value && !value.length)) {
				this.removeItem(key);
				return;
			}

			localStorage.setItem(this._prefix + key, value);

			this.emit('changed:' + key, {
				key: key,
				value: value
			});
		},

		getItem: function(/*String*/ key) {
			//	summary:
			//		Devuelve un campo de localStorage.
			//	key:
			//		Clave del elemento a obtener.
			//	returns:
			//		Valor del campo.

			var ret = localStorage.getItem(this._prefix + key);

			// Si el valor es nulo o sin longitud, se devuelve nulo
			if (!ret || (ret && !ret.length)) {
				return null;
			}

			// Comprobamos si el valor puede ser un objeto
			try {
				ret = JSON.parse(ret);
			} catch (err) {}

			return ret;
		},

		removeItem: function(/*String*/ key) {
			//	summary:
			//		Elimina un campo de localStorage y emite un evento.
			//	key:
			//		Clave del elemento a eliminar.

			localStorage.removeItem(this._prefix + key);

			this.emit('removed:' + key);
		},

		clear: function() {
			//	summary:
			//		Limpia el localStorage de nuestras propiedades y emite un evento.

			var redmicKeys = this.keys(),
				i;

			for (i = 0; i < redmicKeys.length; i++) {
				this.removeItem(redmicKeys[i]);
			}

			this.emit('cleared');
		},

		length: function() {
			//	summary:
			//		Devuelve el número de campos de localStorage.
			//	returns:
			//		Número de elementos.

			return this.keys().length;	// return Integer
		},

		key: function(/*Integer*/ index) {
			//	summary:
			//		Devuelve la clave de un elemento según su orden.
			//	index:
			//		Índice del elemento buscado.
			//	returns:
			//		Clave del elemento.

			var ret = localStorage.key(index);
			if (ret && ret.length) {
				ret = this._getKeyWithoutPrefix(ret);	// Clave sin prefijo
			}

			return ret;	// return String
		},

		keys: function() {
			//	summary:
			//		Devuelve las claves de nuestras propiedades almacenadas en localStorage.
			//	returns:
			//		Array de claves.

			var retArray = [],
				allKeys = Object.keys(localStorage),
				i;

			for (i = 0; i < allKeys.length; i++) {
				var prop = allKeys[i];
				// Si la propiedad lleva nuestro prefijo
				if (prop.substring(0, this._prefix.length) == this._prefix) {
					retArray.push(this._getKeyWithoutPrefix(prop));
				}
			}

			return retArray;	// return Array
		},

		has: function(/*String*/ key) {
			//	summary:
			//		Comprueba si existe una propiedad nuestra en localStorage.
			//	key:
			//		Propiedad a comprobar.
			//	returns:
			//		Booleano indicando su presencia.

			return localStorage.hasOwnProperty(this._prefix + key) && this.getItem(key);	// return Boolean
		},

		_getKeyWithoutPrefix: function(/*String*/ key) {
			//	summary:
			//		Limpia una clave de una propiedad de nuestro prefijo, para hacerlo transparente al usuario.
			//	key:
			//		Clave a limpiar.
			//	returns:
			//		String de la clave de la propiedad limpia.

			return key.replace(this._prefix, '');	// return String
		}

	});

	if (!window.redmicLocalStorage) {
		window.redmicLocalStorage = new RedmicLocalStorage();
	}

	return window.redmicLocalStorage;
});
