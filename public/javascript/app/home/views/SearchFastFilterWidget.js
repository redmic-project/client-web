define([
	'app/home/views/_DashboardItem'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/search/FacetsImpl'
], function(
	_DashboardItem
	, declare
	, lang
	, put
	, _Module
	, _Show
	, _Store
	, FacetsImpl
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchFastFilterWidget',
				className: 'facets'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.facetsSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				aggs: {
					"activityType": {
						"open": true,
						"terms": {
							"field": "activityType.name"
						}
					},
					"territorialScope": {
						"terms": {
							"field": "scope.name"
						}
					}
				}
			}, this.facetsSearchConfig || {}]);

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
		},

		_onTargetPropSet: function(evt) {

			this._setPropToChildModules(evt.prop, evt.value);
		},

		_onQueryChannelPropSet: function(evt) {

			this._setPropToChildModules(evt.prop, evt.value);
		},

		_setPropToChildModules: function(prop, value) {

			this._publish(this.facetsSearch.getChannel('DESTROY'));

			this.facetsSearchConfig[prop] = value;
			this.facetsSearch = new FacetsImpl(this.facetsSearchConfig);
		}
	});
});
