define([
	"src/utils/Credentials"
	, "src/utils/RedmicLocalStorage"
], function(
	Credentials
	, RedmicLocalStorage
){

	var key1, key2, value1, value2, handler;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Credentials tests", {
		before: function() {
			key1 = "userName";
			key2 = "invalidProp";
			value1 = "pepito";
			value2 = "piscinas";

			RedmicLocalStorage.clear();
		},

		afterEach: function() {
			RedmicLocalStorage.clear();
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

			"check set": function() {
				// Guardamos con nuestro método y recuperamos con el base
				Credentials.set(key1, value1);
				assert.strictEqual(value1, RedmicLocalStorage.getItem(key1), "El valor obtenido no es igual al guardado previamente.");
				// Guardamos con valor nulo la misma propiedad
				Credentials.set(key1, null);
				assert.strictEqual(null, RedmicLocalStorage.getItem(key1), "El valor obtenido no es nulo tal y como se guardó.");
				// Ahora, con una propiedad no permitida
				Credentials.set(key2, value2);
				assert.notStrictEqual(value2, RedmicLocalStorage.getItem(key2), "La propiedad seteada no era permitida, pero se guardó igualmente.");
			},

			"check get": function() {
				// Buscamos algo que no existe aun
				assert.strictEqual(null, Credentials.get(key1), "El valor buscado no existe pero al recuperarlo obtenemos algo válido.");

				// Guardamos con el método nativo y recuperamos con el nuestro
				RedmicLocalStorage.setItem(key1, value1);
				assert.strictEqual(value1, Credentials.get(key1), "El valor obtenido no es igual al guardado previamente.");
			},

			"check has": function() {
				assert.notOk(Credentials.has(key1), "La propiedad no existe pero se informa de que sí.");
				RedmicLocalStorage.setItem(key1, value1);
				assert.ok(Credentials.has(key1), "La propiedad existe pero se informa de que no es así.");
			},

			"check set event listening": function() {
				handler = Credentials.on("changed:" + key1, function(evt) {
					assert.strictEqual(key1, evt.key, "La clave de la propiedad que disparó el evento no es la esperada.");
					assert.strictEqual(value1, evt.value, "El valor de la propiedad que disparó el evento no es el esperado.");
				});
				Credentials.set(key1, value1);
			},

			"check remove event listening": function() {
				handler = Credentials.on("removed:" + key1, function() {
					assert.ok(1);
				});
				RedmicLocalStorage.setItem(key1, value1);
				Credentials.set(key1, null);
			}
		}
	});
});
