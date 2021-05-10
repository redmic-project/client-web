define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/search/TextImpl'
], function(
	redmicConfig
	, declare
	, lang
	, _Filter
	, _Module
	, _Show
	, TextImpl
) {

	return declare([_Module, _Show, _Filter], {
		//	summary:
		//		Widget contenedor de barra de búsqueda sobre actividades

		constructor: function(args) {

			this.config = {
				ownChannel: 'searchWidget',
				events: {
					'SHOW_SEARCH_RESULTS': 'showSearchResults',
					'HIDE_SEARCH_RESULTS': 'hideSearchResults',
					'TOGGLE_ADVANCED_SEARCH': 'toggleAdvancedSearch'
				},
				actions: {
					'SHOW_SEARCH_RESULTS': 'showSearchResults',
					'HIDE_SEARCH_RESULTS': 'hideSearchResults',
					'TOGGLE_ADVANCED_SEARCH': 'toggleAdvancedSearch'
				},
				target: redmicConfig.services.activity,
				'class': 'searchBarPanel'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				queryChannel: this.queryChannel,
				highlightField: ['name'],
				suggestFields: ['name', 'code'],
				searchFields: ['name', 'code']
			}, this.textSearchConfig || {}]);

			this.textSearch = new TextImpl(this.textSearchConfig);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.textSearch.getChannel('EXPAND_SEARCH'),
				callback: '_subExpandSearch'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SHOW_SEARCH_RESULTS',
				channel: this.getChannel('SHOW_SEARCH_RESULTS')
			},{
				event: 'HIDE_SEARCH_RESULTS',
				channel: this.getChannel('HIDE_SEARCH_RESULTS')
			},{
				event: 'TOGGLE_ADVANCED_SEARCH',
				channel: this.getChannel('TOGGLE_ADVANCED_SEARCH')
			});
		},

		_subExpandSearch: function() {

			this._emitEvt('TOGGLE_ADVANCED_SEARCH', {
				target: this.target,
				queryChannel: this.queryChannel
			});
		},

		_afterShow: function() {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._publish(this.textSearch.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_handleFilterParams: function(filterParams) {

			if (filterParams.suggest) {
				return;
			}

			/*if (!filterParams.text) {
				this._emitEvt('HIDE_SEARCH_RESULTS', {
					target: this.target
				});
				return;
			}*/

			var searchText = filterParams.text.text;

			this._emitEvt('SHOW_SEARCH_RESULTS', {
				target: this.target,
				searchText: searchText,
				queryChannel: this.queryChannel
			});
		}
	});
});
