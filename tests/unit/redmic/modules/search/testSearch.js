define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/base/Mediator"
	, "redmic/modules/search/Search"
	, "redmic/modules/search/TextSearchImpl"
	, "redmic/modules/search/FacetsImpl"
	, "redmic/modules/search/MapSearchImpl"
], function(
	declare
	, lang
	, put
	, Mediator
	, Search
	, TextSearchImpl
	, FacetsImpl
	, MapSearchImpl
){
	var timeout, search;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Search catalog tests", {
		before: function() {
			timeout = 300;
			search = new declare([TextSearchImpl, Search])();
		},

		after: function() {
			Mediator.publish(search.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {
				assert.ok(search.textSearch, "Search no se ha creado correctamente.");
			},

			"show in node": function() {

				var dfd = this.async(timeout);
				content = put("div");

				Mediator.once(search.getChannel("SHOWN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se mostró correctamente.");
					assert.isNotNull(search.node,
						"El search tiene el campo node a null, por tanto no se ha mostrado correctamente."
					);
				}));

				Mediator.publish(search.getChannel("SHOW"), {
					node: content
				});
			},

			"hide node": function() {

				var dfd = this.async(timeout);

				Mediator.once(search.getChannel("HIDDEN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se ocultó correctamente.");
					assert.isNull(search.node,
						"El search no tiene el campo node a null, por tanto sigue estando mostrado a pesar de llamar a hide."
					);
				}));

				Mediator.publish(search.getChannel("HIDE"));
			},

			"update target": function() {

				var dfd = this.async(timeout),
					newTarget = "/newTarget";

				Mediator.once(search.getChannel("UPDATETARGET"),
					dfd.callback(function(obj) {
					assert.deepEqual(obj.target, newTarget, "El search no escucha el canal de actualizar target correctamente");
					assert.deepEqual(search.target, newTarget, "El search no actualiza el target correctamente");
				}));

				Mediator.publish(search.getChannel("UPDATETARGET"), {
					target: newTarget
				});
			},

			"publish change search params": function() {
				var dfd = this.async(timeout),
					labelService = "activity";

				Mediator.once(search.getChannel("SEARCH_PARAMS_CHANGED"),
					dfd.callback(function(obj) {
					assert.deepEqual(obj, labelService, "El search no publica correctamente el cambio de servicio de búsqueda");
				}));
				search.emit(search.events.CHANGE_SEARCH_PARAMS, labelService);
			}
		}
	});

	registerSuite("TextSearch tests", {
		before: function() {
			timeout = 300;
			search = new declare([TextSearchImpl, Search])({
				parentChannel: ""
			});
		},

		after: function() {
			Mediator.publish(search.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {
				assert.ok(search.textSearch, "El textSearch no se ha creado correctamente.");
			},

			"pub request": function() {

				var dfd = this.async(timeout),
					expectedResult = {query:{ "wildcard": { "scientificname": "*zos*" }}};

				Mediator.once(search._buildChannel(search.queryChannel, search.actions.REQUEST),
					dfd.callback(function(obj) {
					assert.deepEqual(obj, expectedResult,
						"El search no envía la búsqueda al queryCatalog correctamente"
					);
				}));

				search.emit(search.events.SEARCH, expectedResult);
			},

			"close": function() {

				var dfd = this.async(timeout);

				Mediator.once(search.getChannel("CLOSED"), dfd.callback(function(obj) {
					assert.ok(obj.success,
						"El search no se ha cerrado correctamente"
					);
				}));

				Mediator.publish(search.getChannel("CLOSE"));
			},

			"pub suggestions request": function() {

				var dfd = this.async(timeout),
					expectedResult = {"my-suggest": {"text": "Z", "completion": {"field": "scientificname.suggest", "size": 5}}};

				Mediator.once(search._buildChannel(search.storeChannel, search.actions.REQUESTSUGGESTIONS),
					dfd.callback(function(obj) {
					assert.deepEqual(obj.query, expectedResult,
						"El search no envía la búsqueda al masterStore correctamente");
				}));

				search.textSearch.emit("requestSuggests", expectedResult);
			},

			"get suggestions": function() {

				var dfd = this.async(timeout);

				Mediator.once(search._buildChannel(search.storeChannel, search.actions.AVAILABLESUGGESTIONS),
					dfd.callback(function(obj) {
					assert.ok(obj.success, "El search no escucha del masterStore correctamente");
				}));

				Mediator.publish(search._buildChannel(search.storeChannel, search.actions.AVAILABLESUGGESTIONS), {
					success:true
				});
			},

			"get update textSearch params": function() {

				var dfd = this.async(timeout),
					highlightField = 'scientificname',
					suggestFields = ["scientificname", "scientificname.raw^2", "validAs.scientificname.raw^2",
						"validAs.scientificname", "aphia"];

				Mediator.once(search.getChannel("UPDATE_TEXT_SEARCH_PARAMS"),
					dfd.callback(function(obj) {
					assert.deepEqual(obj.highlightField, highlightField, "Search no recibió el campo highlight correctamente");
					assert.deepEqual(obj.suggestFields, suggestFields, "Search no recibió el campo suggestFields correctamente");
				}));

				Mediator.publish(search.getChannel("UPDATE_TEXT_SEARCH_PARAMS"), {
					highlightField: highlightField,
					suggestFields: suggestFields
				});
			}
		}
	});

	registerSuite("FacetsSearch tests", {
		before: function() {
			timeout = 300;
			search = new declare([FacetsImpl, Search])();
		},

		after: function() {
			Mediator.publish(search.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {
				assert.ok(search.facets, "Search no se ha creado correctamente.");
			},

			"pub request": function() {

				var dfd = this.async(timeout),
					expectedResult = {
						facets: [
							{"peculiarity.interest.name": ["Uso ornamental"]},
							{"peculiarity.endemicity.name": ["Desconocida", "Otro"]}]};

				Mediator.once(search._buildChannel(search.queryChannel, search.actions.REQUEST),
					dfd.callback(function(obj) {
					assert.deepEqual(obj, expectedResult,
						"El search no envía la búsqueda al queryCatalog correctamente"
					);
				}));

				search.emit(search.events.SEARCH, expectedResult);
			},

			"update facets": function() {

				var dfd = this.async(timeout),
					newAggs = {
						"type": { "terms": { "field": "type.name" } }
					};

				Mediator.once(search.getChannel("UPDATE_FACETS"),
					dfd.callback(function(obj) {
					assert.deepEqual(obj.aggs, newAggs, "El search no escucha el canal de actualizar facets correctamente");
					assert.deepEqual(search.aggs, newAggs, "El search no actualiza facets correctamente");
				}));

				Mediator.publish(search.getChannel("UPDATE_FACETS"), {aggs: newAggs, prefixFieldFacet: ""});
			}
		}
	});

	registerSuite("MapSearch tests", {
		before: function() {
			timeout = 300;
			search = new declare([MapSearchImpl, Search])();
		},

		after: function() {
			Mediator.publish(search.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {
				assert.ok(search.mapSearch, "Search no se ha creado correctamente.");
			},

			"pub request": function() {

				var dfd = this.async(timeout),
					expectedResult = {"geo_bounding_box": {
						"_northEast": {
							"o.LatLng" : {
								"lat": 29.180941290001776,
								"lng": -15.150146484375002
							}
						},
						"_southWest": {
							"o.LatLng": {
								"lat": 28.217289755957054,
								"lng": -16.248779296875004
							}
						}
					}};

				Mediator.once(search._buildChannel(search.queryChannel, search.actions.REQUEST),
					dfd.callback(function(obj) {
					assert.deepEqual(obj, expectedResult,
						"El search no envía la búsqueda al queryCatalog correctamente"
					);
				}));

				search.emit(search.events.SEARCH, expectedResult);
			}
		}
	});
});
