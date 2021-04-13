define([
	'app/home/views/_DashboardItem'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/browser/ListImpl'
], function(
	_DashboardItem
	, redmicConfig
	, declare
	, lang
	, put
	, _Store
	, ListImpl
) {

	return declare([_DashboardItem, _Store], {
		//	summary:
		//		Widget contenedor de resultados de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchResultsWidget',
				events: {
					'SHOW_SEARCH_RESULTS': 'showSearchResults',
					'HIDE_SEARCH_RESULTS': 'hideSearchResults'
				},
				actions: {
					'SHOW_SEARCH_RESULTS': 'showSearchResults',
					'HIDE_SEARCH_RESULTS': 'hideSearchResults'
				},
				target: redmicConfig.services.activity,
				className: 'searchResultsPanel'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target
			}, this.browserConfig || {}]);

			this.browser = new ListImpl(this.browserConfig);
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

			this._publish(this.browser.getChannel("SHOW"), {
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

			var searchResult = filterParams.text.text;

			this._emitEvt('SHOW_SEARCH_RESULTS', {
				target: this.target,
				searchResult: searchResult
			});
		}
	});
});
