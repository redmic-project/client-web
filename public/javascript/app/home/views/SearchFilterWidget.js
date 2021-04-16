define([
	'app/home/views/_DashboardItem'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/search/CompositeImpl'
], function(
	_DashboardItem
	, redmicConfig
	, declare
	, lang
	, put
	, _Module
	, _Show
	, _Store
	, CompositeImpl
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchFilterWidget',
				target: redmicConfig.services.activity,
				className: 'composite'
			};

			lang.mixin(this, this.config, args);
		},

		_createModules: function() {

			this.compositeSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				filterChannel: this.queryChannel
			}, this.compositeSearchConfig || {}]);

			this.compositeSearch = new CompositeImpl(this.compositeSearchConfig);
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._createModules();

			var compositeSearchNode = put(this.domNode, 'div.' + this.className);

			this._publish(this.compositeSearch.getChannel("SHOW"), {
				node: compositeSearchNode
			});
		}
	});
});
