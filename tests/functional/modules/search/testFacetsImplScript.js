require([
	'dojo/dom'
	, 'redmic/modules/search/FacetsImpl'
], function(
	dom
	, FacetsImpl
) {

	var facets = new FacetsImpl({
		parentChannel: 'test',
		aggs: {
			themeInspire: {
				open: true,
				terms: {
					field: 'themeInspire.name'
				}
			},
			territorialScope: {
				open: false,
				terms: {
					field: 'scope.name'
				}
			}
		}
	});

	facets._publish(facets.getChannel('SHOW'), {
		node: dom.byId('container')
	});

	facets._publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
		'sterms#themeInspire': {
			buckets: [{
				key: 'Species distribution',
				doc_count: 1
			}]
		},
		'sterms#territorialScope': {
			buckets: [{
				key: '1',
				doc_count: 1
			},{
				key: '2',
				doc_count: 1
			},{
				key: '3',
				doc_count: 1
			},{
				key: '4',
				doc_count: 1
			},{
				key: '5',
				doc_count: 1
			},{
				key: '6',
				doc_count: 1
			}]
		}
	});
});
