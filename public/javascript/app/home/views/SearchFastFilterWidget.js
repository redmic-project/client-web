define([
	'app/home/views/_DashboardItem'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/search/FacetsImpl'
], function(
	_DashboardItem
	, redmicConfig
	, declare
	, lang
	, put
	, _Filter
	, _Module
	, _Show
	, _Store
	, FacetsImpl
) {

	return declare([_Module, _Show, _Filter], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchFastFilterWidget',
				target: redmicConfig.services.activity,
				className: 'facets'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.facetsSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				queryChannel: this.queryChannel,
				aggs: {
					"activityType": {
						"open": true,
						"terms": {
							"field": "activityType.name",
							"size": 100
						}
					},
					"territorialScope": {
						"terms": {
							"field": "scope.name",
							"size": 20
						}
					}
				}
			}, this.compositeSearchConfig || {}]);

			this.facetsSearch = new FacetsImpl(this.facetsSearchConfig);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			var facetsSearchNode = put(this.domNode, 'div.' + this.className);

			this._publish(this.facetsSearch.getChannel("SHOW"), {
				node: facetsSearchNode
			});
		}
	});
});
