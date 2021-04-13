define([
	'app/home/views/_DashboardItem'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/search/TextImpl'
], function(
	_DashboardItem
	, redmicConfig
	, declare
	, lang
	, put
	, _Filter
	, TextImpl
) {

	return declare([_DashboardItem, _Filter], {
		//	summary:
		//		Widget contenedor de barra de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchWidget',
				events: {
					'SHOW_SEARCH_RESULTS': 'showSearchResults',
					'HIDE_SEARCH_RESULTS': 'hideSearchResults'
				},
				actions: {
					'SHOW_SEARCH_RESULTS': 'showSearchResults',
					'HIDE_SEARCH_RESULTS': 'hideSearchResults'
				},
				target: redmicConfig.services.activity,
				className: 'searchBarPanel'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				queryChannel: this.queryChannel,
				legacyMode: false
			}, this.textSearchConfig || {}]);

			this.textSearch = new TextImpl(this.textSearchConfig);
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SHOW_SEARCH_RESULTS',
				channel: this.getChannel('SHOW_SEARCH_RESULTS')
			},{
				event: 'HIDE_SEARCH_RESULTS',
				channel: this.getChannel('HIDE_SEARCH_RESULTS')
			});
		},

		_afterShow: function() {

			var parentNode = put(this.contentNode, 'div.' + this.className);

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: parentNode
			});
		},

		_handleFilterParams: function(filterParams) {

			if (filterParams.suggest) {
				return;
			}

			if (!filterParams.text) {
				this._emitEvt('HIDE_SEARCH_RESULTS', {
					target: this.target
				});
				return;
			}

			var searchText = filterParams.text.text;

			this._emitEvt('SHOW_SEARCH_RESULTS', {
				target: this.target,
				searchText: searchText
			});
		}
	});
});
