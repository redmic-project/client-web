require([
	'dojo/dom'
	, 'redmic/modules/search/FacetsImpl'
], function(
	dom
	, FacetsImpl
){

	var btn1Config = {
			zone: 'left',
			props: {
				'class': 'primary'
			}
		},
		btn2Config = {
			zone: 'center',
			props: {
				'class': 'success'
			}
		},
		btn3Config = {
			zone: 'right',
			props: {
				'class': 'warning'
			}
		},
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

	facets._publish(facets.getChannel('SHOW'), {
		node: dom.byId('container')
	});

	facets._publish(facets._buildChannel(facets.queryChannel, facets.actions.AVAILABLE_FACETS), {
		'sterms#themeInspire': {
			buckets: [{
				key: 'Species distribution',
				doc_count: 1
			}]
		}
	});
});
