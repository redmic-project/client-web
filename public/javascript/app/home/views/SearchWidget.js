define([
	'app/home/views/_DashboardItem'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/search/TextImpl'
], function(
	_DashboardItem
	, redmicConfig
	, declare
	, lang
	, _Filter
	, TextImpl
) {

	return declare([_DashboardItem, _Filter], {
		//	summary:
		//		Widget contenedor de barra de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createItems();

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.contentNode
			});
		},

		_createItems: function() {

			console.log('entra', this.target);
			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				queryChannel: this.queryChannel
			}, this.textSearchConfig || {}]);

			this.textSearch = new TextImpl(this.textSearchConfig);
		}
	});
});
