define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/search/FacetsImpl'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, _Show
	, FacetsImpl
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget contenedor de filtros rápidos de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchFastFilterWidget',
				'class': 'facets'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.facetsSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				aggs: redmicConfig.aggregations.activity,
				query: {
					returnFields: redmicConfig.returnFields.activity

				}
			}, this.facetsSearchConfig || {}]);

			this.facetsSearch = new FacetsImpl(this.facetsSearchConfig);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._showFacets();
		},

		_showFacets: function() {

			this._publish(this.facetsSearch.getChannel('SHOW'), {
				node: this.domNode
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

			this._showFacets();
		}
	});
});
