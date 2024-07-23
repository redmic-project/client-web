define([
	"src/utils/Mediator"
], function(
	Mediator
){
	var methods, methodAliases;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Mediator tests", {
		before: function() {
			methods = ["subscribe", "publish", "remove", "once"];

			methodsAliases = {};
			methodsAliases[methods[0]] = ["on", "bind"];
			methodsAliases[methods[1]] = ["trigger", "emit"];
			methodsAliases[methods[2]] = ["off"];
			methodsAliases[methods[3]] = [];
		},

		tests: {
			"check expected methods": function() {
				for (var i = 0; i < methods.length; i++) {
					var method = methods[i];
					assert.ok(Mediator[method], "Mediator no cuenta con el método esperado '" + method + "'.");
				}
			},

			"check expected method aliases": function() {
				for (var method in methodsAliases) {
					var methodAliases = methodsAliases[method];
					for (var i = 0; i < methodAliases.length; i++) {
						var methodAlias = methodAliases[i];
						assert.ok(Mediator[methodAlias], "Mediator no cuenta con el método de alias '" +
							methodAlias + "'.");
						assert.deepEqual(Mediator[methodAlias], Mediator[method],
							"El alias '" + methodAlias + "' no existe para el método '" + method + "'.");
					}
				}
			}
		}
	});

});
