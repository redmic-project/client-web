define([
	'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'src/home/item/ProductWidget'
	, 'src/home/item/SearchBarWidget'
	, 'src/home/item/SearchFastFilterWidget'
	, 'src/home/item/SearchFilterWidget'
	, 'src/home/item/SearchResultsWidget'
	, 'src/home/item/SocialWidget'
	, 'src/home/item/StatsWidget'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/util/Credentials'
	, 'src/component/base/_Filter'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'templates/InitialInfo'
], function(
	Controller
	, Layout
	, ProductWidget
	, SearchBarWidget
	, SearchFastFilterWidget
	, SearchFilterWidget
	, SearchResultsWidget
	, SocialWidget
	, StatsWidget
	, redmicConfig
	, declare
	, lang
	, Credentials
	, _Filter
	, TemplateDisplayer
	, TemplateInfo
) {

	return declare([Layout, Controller, _Filter], {
		//	summary:
		//		Vista inicial de la aplicación.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				propsWidget: {
				},
				filterConfig: {
					initQuery: {
						returnFields: redmicConfig.returnFields.activity,
						sorts: [{
							field: 'starred',
							order: 'DESC'
						}]
					}
				}
			};

			this.widgetConfigs = {
				searchBar: {
					width: 6,
					height: 1,
					type: SearchBarWidget,
					props: {
						omitTitleBar: true,
						resizable: false
					}
				},
				searchFilter: {
					width: 6,
					height: 3,
					type: SearchFilterWidget,
					hidden: true,
					props: {
						omitTitleBar: true
					}
				},
				searchFastFilter: {
					width: 2,
					height: 4,
					type: SearchFastFilterWidget,
					props: {
						title: 'fastFilters',
						omitTitleCloseButton: true,
						facetsSearchConfig: {
							query: {
								size: 10,
								sorts: [{
									field: 'id',
									order: 'DESC'
								}]
							}
						}
					}
				},
				searchResults: {
					width: 4,
					height: 4,
					type: SearchResultsWidget,
					props: {
						queryChannel: 'stub',
						title: 'starredActivities',
						omitTitleCloseButton: true
					}
				},
				info: {
					width: 3,
					height: 2,
					type: TemplateDisplayer,
					props: {
						title: 'info',
						template: TemplateInfo,
						'class': 'mediumSolidContainer.borderRadiusBottom',
						target: 'initial_info'
					}
				},
				products: {
					width: 3,
					height: 6,
					type: ProductWidget,
					props: {
						title: 'products'
					}
				},
				stats: {
					width: 3,
					height: 3,
					type: StatsWidget,
					props: {
						title: 'statistics'
					}
				},
				social: {
					width: 3,
					height: 1,
					type: SocialWidget,
					props: {
						title: 'followUs'
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_afterShow: function(request) {

			if (this._getPreviouslyShown()) {
				return;
			}

			this._listenAfterFirstShow();
			this._publishAfterFirstShow();
		},

		_listenAfterFirstShow: function() {

			var addedToQueryChannel = this.getChannel('ADDED_TO_QUERY');
			this._once(addedToQueryChannel, lang.hitch(this, function() {

				this._once(addedToQueryChannel, lang.hitch(this, function() {

					this._publish(this._getWidgetInstance('searchResults').getChannel('SET_PROPS'), {
						title: 'searchResults'
					});
				}));
			}));

			this._listenWidgets();
		},

		_listenWidgets: function() {

			this._setSubscriptions([{
				channel: this._getWidgetInstance('searchBar').getChannel('SEARCH_BY_TEXT'),
				callback: lang.hitch(this, this._onSearchByText)
			},{
				channel: this._getWidgetInstance('searchBar').getChannel('TOGGLE_ADVANCED_SEARCH'),
				callback: lang.hitch(this, this._toggleAdvancedSearch)
			},{
				channel: this._getWidgetInstance('searchFilter').getChannel('CANCELLED'),
				callback: lang.hitch(this, this._toggleAdvancedSearch)
			},{
				channel: this._getWidgetInstance('stats').getChannel('TOTAL_ACTIVITIES'),
				callback: lang.hitch(this, this._subStatsTotalActivities)
			}]);
		},

		_publishAfterFirstShow: function() {

			var obj = {
				queryChannel: this.queryChannel
			};

			this._publish(this._getWidgetInstance('searchFastFilter').getChannel('SET_PROPS'), obj);
			this._publish(this._getWidgetInstance('searchFilter').getChannel('SET_PROPS'), obj);
			this._publish(this._getWidgetInstance('searchResults').getChannel('SET_PROPS'), obj);
		},

		_onSearchByText: function(searchDefinition) {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					text: {
						text: searchDefinition.searchText || null
					},
					sorts: null
				}
			});
		},

		_toggleAdvancedSearch: function() {

			if (!this._advancedSearchShown) {
				this._advancedSearchShown = true;
				this._showWidget('searchFilter');
			} else {
				this._advancedSearchShown = false;
				this._hideWidget('searchFilter');
			}
		},

		_subStatsTotalActivities: function(res) {

			this._publish(this._getWidgetInstance('searchBar').getChannel('SET_PROPS'), {
				totalActivities: res.value
			});
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			var obj = {
				info: ''
			};

			if (Credentials.userIsGuest()) {
				obj.roleGuest = this.i18n.contentInfo1 + ' ';
				obj.roleGuest += this.i18n.visitor;
				obj.roleGuest += this.i18n.contentInfo2;
				obj.register = this.i18n.register.toLowerCase();
				obj.info += this.i18n.contentInfo3;
			}

			obj.info += this.i18n.contentSend;

			this._emitEvt('INJECT_ITEM', {
				data: obj,
				target: 'initial_info'
			});
		}
	});
});
