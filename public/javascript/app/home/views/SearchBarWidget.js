define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/layout/dataDisplayer/DataDisplayer'
	, 'redmic/modules/search/TextImpl'
], function(
	redmicConfig
	, declare
	, lang
	, _Filter
	, _Module
	, _Show
	, DataDisplayer
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
				'class': 'searchBarPanel',
				filterConfig: {
					initQuery: {
						returnFields: redmicConfig.returnFields.activity
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				queryChannel: this.queryChannel
			}, this.textSearchConfig || {}]);

			this.textSearch = new TextImpl(this.textSearchConfig);

			this._infoInstance = new DataDisplayer({
				parentChannel: this.getChannel(),
				data: this.i18n.findDataInActivitiesStart + ' ' + this.i18n.findDataInActivitiesEnd,
				'class': this.infoTooltipClass
			});
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

			this._publish(this._infoInstance.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_handleFilterParams: function(filterParams) {

			if (filterParams.suggest) {
				return;
			}

			var textObj = filterParams.text || {},
				searchText = textObj.text || '';

			this._emitEvt('SHOW_SEARCH_RESULTS', {
				target: this.target,
				searchText: searchText,
				queryChannel: this.queryChannel
			});
		},

		_onTotalActivitiesPropSet: function(propEvt) {

			var newData = this.i18n.findDataInActivitiesStart + ' <b>' + propEvt.value + '</b> ' +
				this.i18n.findDataInActivitiesEnd;

			this._publish(this._infoInstance.getChannel('SET_PROPS'), {
				data: newData
			});
		}
	});
});
