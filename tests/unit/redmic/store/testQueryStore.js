define([
	"dojo/_base/lang"
	, "dojo/_base/declare"
	, "dojo/store/Observable"
	, "redmic/store/QueryStore"
], function(
	lang
	, declare
	, Observable
	, Store
){

	var collection;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("QueryStore tests", {
		before: function() {
			timeout = 5000;
			collection = new Observable(new Store());
		},

		tests: {
			"creation store": function() {
				assert.ok(collection, 'El store no se ha creado correctamente');
			},

			"initialize store": function() {
				collection.target = "https://redmic.local/test/contacts/";
				assert.equal(collection.target, "https://redmic.local/test/contacts/", 'La url del servicio no se ha seteado correctamente');
			},

			"get item": function() {
				var dfd = this.async(timeout),
					id = 1;
				collection.get(id).then(
					dfd.callback(function (result) {
						headers = collection._getHeaders("get", {});
						assert.equal(headers.Accept,"application/javascript, application/json", "Acepta application/javascript, application/json");
						assert.equal(result.id, id, 'Debería devolver un elemento con id = 1 y es id = ' + result.id);
					}));
			},

			"get item no exist": function() {
				var dfd = this.async(timeout),
					id = 100;

				collection.get(id).then(
					dfd.callback(function (result) {
						// Esperamos un error (reject)
						assert.isNull(result._uid, 'No debería entrar. Get de objeto no existente ');
					}),
					dfd.rejectOnError(function(err){
						assert.ok(err.error, 'Debería devolver un error');
						dfd.resolve();
					})
				);
			},

			"query with range 2 items": function() {
				var dfd = this.async(timeout),
					start = 0,
					count = 2;

				collection.query({},{start:start,count:count}).then(
					dfd.callback(function(results){
						headers = collection._getHeaders("query", {start:start,count:count});
						assert.equal(headers.Accept,"application/javascript, application/json", "La cabecera [Accept] debería ser application/javascript, application/json");
						assert.equal(headers.Range,"items=0-1", "La cabecera [Range] debería ser items=0-1");
						assert.equal(headers.X-Range,"items=0-1", "La cabecera [X-Range] debería ser items=0-1");
						assert.equal(results.length, count, 'Debería devolver dos elementos ');
					})
				);
			},

			"query no items result": function() {
				var dfd = this.async(timeout),
					start = 500,
					count = 5;

				collection.query({},{start:start,count:count}).then(
					dfd.callback(function(result){
						headers = collection._getHeaders("query", {start:start,count:count});
						assert.equal(headers.Accept,"application/javascript, application/json", "La cabecera [Accept] debería ser application/javascript, application/json");
						assert.equal(headers.Range,"items=500-504", "La cabecera [Range] debería ser items=500-504");
						assert.equal(headers.X-Range,"items=500-504", "La cabecera [X-Range] debería ser items=500-504");
						assert.equal(result.length, 0, 'Debería no devolver datos');
					})
				);
			},

			"query with pagination [2 element in the last page]": function() {
				var dfd = this.async(timeout),
					start = 2,
					count = 3;

				collection.query({},{start:start,count:count}).then(
					dfd.callback(function(result){
						headers = collection._getHeaders("query", {start:start,count:count});
						assert.equal(headers.Accept,"application/javascript, application/json", "La cabecera [Accept] debería ser application/javascript, application/json");
						assert.equal(headers.Range,"items=2-4", "La cabecera [Range] debería ser items=2-4");
						assert.equal(headers.X-Range,"items=2-4", "La cabecera [X-Range] debería ser items=2-4 " + result);
						for (var i=0; i<result.length-1; i++){
							assert(result[i].id < result[i+1].id, 'Debería estar ordenados por id ');
						}
						assert.equal(result.length, count, 'Debería tener cacheado 3 elementos ');
					})
				);
			},

			"query with sort by id": function() {
				var dfd = this.async(timeout),
					start = 0,
					count = 10,
					attribute = "id",
					descending = true;

				collection.query({},{start:start, count:count, sort: [{attribute: attribute, descending:descending }]}).then(
					dfd.callback(function(results){
						headers = collection._getHeaders("query", {start:start,count:count});
						assert.equal(headers.Accept,"application/javascript, application/json", "La cabecera [Accept] debería ser application/javascript, application/json");
						assert.equal(headers.Range,"items=0-9", "La cabecera [Range] debería ser items=0-9");
						assert.equal(headers.X-Range,"items=0-9", "La cabecera [X-Range] debería ser items=0-9");

						var query = collection._getQuery({},{start:start, count:count, sort: [{attribute: attribute, descending:descending }]});
						assert.equal(query, "?sort=(-id)", "La query debería ser ?sort=(-id)");

					})
				);
			},

			"TEXT query instances from store": function() {
				var dfd = this.async(timeout),
					start = 0,
					count = 10;

				collection.query({text:"prueba1@"},{start:start, count:count}).then(
					dfd.callback(function(results){
						var headers = collection._getHeaders("query", {start:start,count:count});
						assert.equal(headers.Accept,"application/javascript, application/json", "La cabecera [Accept] debería ser application/javascript, application/json");
						assert.equal(headers.Range,"items=0-9", "La cabecera [Range] debería ser items=0-9");
						assert.equal(headers.X-Range,"items=0-9", "La cabecera [X-Range] debería ser items=0-9");

						var query = collection._getQuery({text:"prueba1@"},{start:start, count:count});
						assert.equal(query, "?text=prueba1%40", "La query debería ser ?text=prueba1%40");

						//assert.equal(results.length, 1, 'Debería devolver 1 elemento ');
					})
				);
			},


			"WHERE query instances from store": function() {
				var dfd = this.async(timeout),
					start = 0,
					count = 10;

				collection.query({where:"email LIKE '%prueba1@%'"},{start:start, count:count}).then(
					dfd.callback(function(results){
						headers = collection._getHeaders("query", {start:start,count:count});
						assert.equal(headers.Accept,"application/javascript, application/json", "La cabecera [Accept] debería ser application/javascript, application/json");
						assert.equal(headers.Range,"items=0-9", "La cabecera [Range] debería ser items=0-9");
						assert.equal(headers.X-Range,"items=0-9", "La cabecera [X-Range] debería ser items=0-9");

						var query = collection._getQuery({where:"email LIKE '%prueba1@%'"},{start:start, count:count});
						assert.equal(query, "?where=email%20LIKE%20'%25prueba1%40%25'", "La query debería ser ?where=email%20LIKE%20%27%25prueba1%40%25'");

						//assert.equal(results.length, 1, 'Debería devolver 1 elemento ');
					})
				);
			},

			"Query by post": function() {
				var dfd = this.async(timeout);

				collection.post({where:"email LIKE '%prueba1@%'"}, {}).then(
					dfd.callback(function(results){
						var headers = collection._getHeaders("post", {});
						assert.equal(headers['Content-Type'],"application/json", "El contenido debería ser application/json");
						assert.equal(headers.Accept,"application/javascript, application/json", "Debería aceptar application/javascript, application/json");
						//assert.equal(results.get("surname").get("value"), "testSurnameUpdate", 'Debería devolver el elemento modificado');
						//assert.include(collection.data, results, "Debería estar la instancia almacenada en data"); // TODO: apitest no soporta query por post
					}), dfd.reject.bind(dfd)
				);
			}
		}
	});
});