define([
	'redmic/base/Mediator'
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

		after: function() {

			Mediator.publish(facets.getChannel('DESTROY'));
		},

		tests: {
			Should_AddFacetsGroup_When_FacetsDataWasRequested: function() {

				var dfd = this.async(timeout);

				Mediator.once(facets._buildChannel(facets.queryChannel, facets.actions.ADD_TO_QUERY), function() {

					Mediator.once(facets._buildChannel(facets.loadingChannel, facets.actions.LOADED),
						dfd.callback(function() {

						facets._onFacetChangeEvent({'themeInspire.name': ['Species distribution']}, 'themeInspire');

						assert.lengthOf(Object.keys(facets._facetsInstances), 1);
					}));

					assert.lengthOf(Object.keys(facets._facetsInstances), 0);

					Mediator.publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
						'sterms#themeInspire': {
							buckets: [{
								key: 'Species distribution',
								doc_count: 1
							}]
						}
					});
				});

				Mediator.publish(facets.getChannel('UPDATE_FACETS'), {
					aggs: {
						themeInspire: {
							terms: {
								field: 'themeInspire.name'
							}
						}
					}
				});
			},

		}
	});
});
