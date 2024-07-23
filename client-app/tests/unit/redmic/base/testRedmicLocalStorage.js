define([
	"src/utils/RedmicLocalStorage"
], function(
	RedmicLocalStorage
){

	var prefix, key1, key2, value1, value2, objValue, handler;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("RedmicLocalStorage tests", {
		before: function() {
			prefix = RedmicLocalStorage._prefix;
			key1 = "nombre";
			key2 = "apellido";
			value1 = "pepito";
			value2 = "piscinas";
			objValue = {
				key1: value1,
				key2: value2
			};
			localStorage.clear();
		},

		afterEach: function() {
			localStorage.clear();
			handler && handler.remove();
		},

		tests: {
			"check support of HTML5 storage": function() {
				var support;
				try {
					support = 'localStorage' in window && window.localStorage !== null;
				} catch (e) {
					support = false;
				}
				assert.ok(support, "El navegador no soporta HTML5 storage.");
			},

			"check setItem": function() {
				// Guardamos con nuestro método y recuperamos con el nativo
				RedmicLocalStorage.setItem(key1, value1);
				assert.strictEqual(value1, localStorage.getItem(prefix + key1), "El valor obtenido no es igual al guardado previamente.");
			},

			"check getItem": function() {
				// Buscamos algo que no existe aun
				assert.strictEqual(null, RedmicLocalStorage.getItem(key1), "El valor buscado no existe pero al recuperarlo obtenemos algo válido.");

				// Guardamos con el método nativo y recuperamos con el nuestro
				localStorage.setItem(prefix + key1, value1);
				assert.strictEqual(value1, RedmicLocalStorage.getItem(key1), "El valor obtenido no es igual al guardado previamente.");
			},

			"check removeItem": function() {
				localStorage.setItem(prefix + key1, value1);
				RedmicLocalStorage.removeItem(key1);
				assert.strictEqual(null, localStorage.getItem(prefix + key1), "La propiedad se ha borrado pero se sigue encontrando.");
			},

			"check clear": function() {
				localStorage.setItem(prefix + key1, value1);
				localStorage.setItem(prefix + key2, value2);
				// Propiedad sin nuestro prefijo, ejemplo de propiedad ajena
				localStorage.setItem(key1, value1);
				RedmicLocalStorage.clear();
				assert.strictEqual(null, localStorage.getItem(prefix + key1), "La propiedad se ha borrado pero se sigue encontrando.");
				assert.strictEqual(null, localStorage.getItem(prefix + key2), "La propiedad se ha borrado pero se sigue encontrando.");
				assert.strictEqual(1, localStorage.length, "La propiedad ajena se ha borrado cuando deberíamos respetarla.");
			},

			"check length": function() {
				// Propiedad sin nuestro prefijo, no cuenta para la longitud
				localStorage.setItem(key1, value1);
				assert.strictEqual(0, RedmicLocalStorage.length(), "No existen propiedades pero se encuentra alguna.");
				localStorage.setItem(prefix + key1, value1);
				assert.strictEqual(1, RedmicLocalStorage.length(), "Existe una propiedad pero se encuentra un número distinto de ellas.");
				localStorage.setItem(prefix + key2, value2);
				assert.strictEqual(2, RedmicLocalStorage.length(), "Existen dos propiedades pero se encuentra un número distinto de ellas.");
			},

			"Should_ReturnItemKeyWithoutPrefix_When_GetItemKeyByIndex": function() {

				assert.strictEqual(null, RedmicLocalStorage.key(0), "Ya existe un elemento en la posición 0");

				localStorage.setItem(prefix + key1, value1);
				assert.strictEqual(key1, RedmicLocalStorage.key(0), "El elemento indexado no tiene la clave esperada");
			},

			"Should_ReturnItemKeysWithoutPrefix_When_GetAllItemKeys": function() {

				assert.isEmpty(RedmicLocalStorage.keys(), "Ya existen elementos antes de comenzar");

				localStorage.setItem(prefix + key1, value1);
				localStorage.setItem(prefix + key2, value2);

				assert.sameMembers([key1, key2], RedmicLocalStorage.keys(), "Los elementos indexados no tienen las claves esperadas");
			},

			"check has": function() {
				assert.notOk(RedmicLocalStorage.has(key1), "La propiedad no existe pero se informa de que sí.");
				localStorage.setItem(prefix + key1, value1);
				assert.ok(RedmicLocalStorage.has(key1), "La propiedad existe pero se informa de que no es así.");
			},

			"check _getKeyWithoutPrefix": function() {
				assert.strictEqual(key1, RedmicLocalStorage._getKeyWithoutPrefix(prefix + key1), "Las claves no se limpian correctamente de su prefijo.");
			},

			"check setItem & getItem with object value": function() {
				// Guardamos un valor de tipo objeto
				RedmicLocalStorage.setItem(key1, objValue);
				// Al recuperarlo, debe seguir siendo un objeto
				assert.deepEqual(objValue, RedmicLocalStorage.getItem(key1), "El valor obtenido no es igual al guardado previamente.");
			},

			"check set event listening": function() {
				handler = RedmicLocalStorage.on("changed:"+key1, function(evt) {
					assert.strictEqual(key1, evt.key, "La clave de la propiedad que disparó el evento no es la esperada.");
					assert.strictEqual(value1, evt.value, "El valor de la propiedad que disparó el evento no es el esperado.");
				});
				RedmicLocalStorage.setItem(key1, value1);
			},

			"check remove event listening": function() {
				handler = RedmicLocalStorage.on("removed:"+key1, function() {
					assert.ok(1);
				});
				localStorage.setItem(key1, value1);
				RedmicLocalStorage.removeItem(key1);
			},

			"check clear event listening": function() {
				handler = RedmicLocalStorage.on("cleared", function() {
					assert.ok(1);
				});
				localStorage.setItem(key1, value1);
				RedmicLocalStorage.clear();
			}
		}

	});

});
