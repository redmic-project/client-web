define([
	'src/utils/Mediator'
	, 'redmic/modules/search/FacetsImpl'
], function(
	Mediator
	, FacetsImpl
) {

	var timeout = 500,
		facets;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('FacetsImpl (Search module)', {
		before: function() {

			facets = new FacetsImpl({
				parentChannel: 'test',
				aggs: {
					themeInspire: {
						open: true,
						terms: {
							field: 'themeInspire.name'
						}
					}
				}
			});
		},

		beforeEach: function() {

			facets._nestedAggs = {};
			facets._facetsInstances = {};
			facets._updateAgreggationGroupsDefinitions(facets._originalAggregationGroupsDefinition);
		},

		afterEach: function() {

			Mediator.publish(facets.getChannel('RESET'));
		},

		after: function() {

			Mediator.publish(facets.getChannel('DESTROY'));
		},

		tests: {
			Should_PublishAddToQueryToObtainAggregationData_When_GetFacetsMethodIsCalled: function() {

				var dfd = this.async(timeout);

				Mediator.once(facets._buildChannel(facets.queryChannel, facets.actions.ADD_TO_QUERY),
					dfd.callback(function(req) {

					assert.property(req, 'query', 'El objeto de publicación no contiene la propiedad esperada');
					assert.property(req.query, 'aggs', 'El objeto de petición no contiene la propiedad esperada');

					Mediator.publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
						'sterms#themeInspire': {
							buckets: [{
								key: 'Species distribution',
								doc_count: 1
							}]
						}
					});
				}));

				facets._getFacets();
			},

			Should_SelectElementFromFacets_When_FacetsChangeEventIsReceived: function() {

				var dfd = this.async(timeout);

				Mediator.once(facets._buildChannel(facets.queryChannel, facets.actions.ADD_TO_QUERY),
					dfd.callback(function() {

					assert.lengthOf(Object.keys(facets._selectionByAggregationGroup), 0, 'Había una selección previa');

					facets._onFacetChangeEvent({'themeInspire.name': ['Species distribution']}, 'themeInspire');

					assert.lengthOf(Object.keys(facets._selectionByAggregationGroup), 1,
						'No había un único grupo de agregación seleccionado');

					assert.property(facets._selectionByAggregationGroup, 'themeInspire',
						'La clave del grupo de agregación seleccionado no es la esperada');

					assert.lengthOf(Object.keys(facets._selectionByAggregationGroup.themeInspire), 1,
						'No había un único valor seleccionado dentro del grupo de agregación');

					assert.include(facets._selectionByAggregationGroup.themeInspire, 'Species distribution',
						'El valor seleccionado dentro del grupo de agregación no es el esperado');

					Mediator.publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
						'sterms#themeInspire': {
							buckets: [{
								key: 'Species distribution',
								doc_count: 1
							}]
						}
					});
				}));

				facets._getFacets();
			},

			Should_AddFacetsInstance_When_FacetsDataIsReceived: function() {

				var dfd = this.async(timeout);

				Mediator.once(facets._buildChannel(facets.queryChannel, facets.actions.ADD_TO_QUERY), function() {

					Mediator.once(facets._buildChannel(facets.loadingChannel, facets.actions.LOADED),
						dfd.callback(function() {

						assert.lengthOf(Object.keys(facets._facetsInstances), 1,
							'No había una única instancia de grupo de agregación creada');

						assert.property(facets._facetsInstances, 'themeInspire',
							'La clave del grupo de agregación instanciado no es la esperada');
					}));

					assert.lengthOf(Object.keys(facets._facetsInstances), 0,
						'Ya existía alguna instancia de grupo de agregación');

					Mediator.publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
						'sterms#themeInspire': {
							buckets: [{
								key: 'Species distribution',
								doc_count: 1
							}]
						}
					});
				});

				facets._getFacets();
			},

			Should_ReplaceFacetsDefinitionsAndInstances_When_FacetsAreUpdated: function() {

				var dfd = this.async(timeout);

				Mediator.once(facets._buildChannel(facets.queryChannel, facets.actions.ADD_TO_QUERY), function() {

					assert.lengthOf(Object.keys(facets.aggs), 1,
						'No había una única definición de grupo de agregación tras actualizar');

					assert.property(facets.aggs, 'themeInspire2',
						'La clave del grupo de agregación definido no es la esperada tras actualizar');

					assert.lengthOf(Object.keys(facets._groupsOrder), 1,
						'No había un único elemento en la ordenación de grupos de agregación tras actualizar');

					assert.include(facets._groupsOrder, 'themeInspire2',
						'La clave en la ordenación de grupos de agregación no es la esperada tras actualizar');

					Mediator.once(facets._buildChannel(facets.loadingChannel, facets.actions.LOADED),
						dfd.callback(function() {

						assert.lengthOf(Object.keys(facets._facetsInstances), 1,
							'No había una única instancia de grupo de agregación creada tras actualizar');

						assert.property(facets._facetsInstances, 'themeInspire2',
							'La clave del grupo de agregación instanciado no es la esperada tras actualizar');
					}));

					Mediator.publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
						'sterms#themeInspire2': {
							buckets: [{
								key: 'Species distribution 2',
								doc_count: 1
							}]
						}
					});
				});

				assert.lengthOf(Object.keys(facets.aggs), 1, 'No había una única definición de grupo de agregación');

				assert.property(facets.aggs, 'themeInspire',
					'La clave del grupo de agregación definido no es la esperada');

				Mediator.publish(facets.getChannel('UPDATE_FACETS'), {
					aggs: {
						themeInspire2: {
							terms: {
								field: 'themeInspire2.name'
							}
						}
					}
				});
			}
		}
	});
});
