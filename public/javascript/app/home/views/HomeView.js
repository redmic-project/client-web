define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, 'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/InitialInfo"
	, 'redmic/modules/base/_Filter'
	, "redmic/base/Credentials"
	, 'app/home/views/SearchBarWidget'
	, 'app/home/views/SearchFastFilterWidget'
	, 'app/home/views/SearchFilterWidget'
	, 'app/home/views/SearchResultsWidget'
	, "app/home/views/SocialWidget"
	, "app/home/views/WidgetLastActivity"
	, "app/home/views/WidgetFavourites"
], function(
	Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, TemplateDisplayer
	, TemplateInfo
	, _Filter
	, Credentials
	, SearchBarWidget
	, SearchFastFilterWidget
	, SearchFilterWidget
	, SearchResultsWidget
	, SocialWidget
	, WidgetLastActivity
	, WidgetFavourites
) {

	return declare([Layout, Controller, _Filter], {
		//	summary:
		//		Vista inicial de la aplicación.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				propsWidget: {
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
						windowTitle: 'fastFilters',
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
						windowTitle: 'starredActivities',
						omitTitleCloseButton: true
					}
				},
				info: {
					width: 3,
					height: 1,
					type: TemplateDisplayer,
					props: {
						windowTitle: 'info',
						template: TemplateInfo,
						"class": "mediumSolidContainer.borderRadiusBottom",
						target: "initial_info"
					}
				},
				social: {
					width: 3,
					height: 1,
					type: SocialWidget,
					props: {
						windowTitle: 'followUs'
					}
				},
				favourites: {
					width: 3,
					height: 5,
					type: WidgetFavourites,
					props: {
						windowTitle: 'favourites',
						"class": "containerDetails"
					}
				},
				lastActivities: {
					width: 3,
					height: 5,
					type: WidgetLastActivity,
					props: {
						windowTitle: 'lastActivities',
						template: TemplateInfo,
						"class": "containerDetails"
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_putMetaTags: function() {
			// TODO esto es necesario porque se trata de una vista detalle, que define el método original,
			// pero no interesa en este caso. Pisando nuevamente el método, se comporta como define _View.
			// Revisar el proceso de rellenar metatags

			this._putDefaultMetaTags();
		},

		_afterShow: function(request) {

			this._listenWidgets();

			var obj = {
				queryChannel: this.queryChannel
			};

			this._publish(this._getWidgetInstance('searchFastFilter').getChannel('SET_PROPS'), obj);
			this._publish(this._getWidgetInstance('searchFilter').getChannel('SET_PROPS'), obj);
		},

		_listenWidgets: function() {

			this._setSubscriptions([{
				channel: this._getWidgetInstance('searchBar').getChannel('SHOW_SEARCH_RESULTS'),
				callback: lang.hitch(this, this._showSearchResults)
			},{
				channel: this._getWidgetInstance('searchBar').getChannel('HIDE_SEARCH_RESULTS'),
				callback: lang.hitch(this, this._hideSearchResults)
			},{
				channel: this._getWidgetInstance('searchBar').getChannel('TOGGLE_ADVANCED_SEARCH'),
				callback: lang.hitch(this, this._toggleAdvancedSearch)
			}]);
		},

		_showSearchResults: function(searchDefinition) {

			var obj = {
				target: searchDefinition.target,
				queryChannel: searchDefinition.queryChannel
			};

			this._publish(this._getWidgetInstance('searchResults').getChannel('SET_PROPS'), lang.mixin({
				windowTitle: 'searchResults'
			}, obj));

			this._publish(this._getWidgetInstance('searchFastFilter').getChannel('SET_PROPS'), obj);
			this._publish(this._getWidgetInstance('searchFilter').getChannel('SET_PROPS'), obj);
		},

		_hideSearchResults: function(searchDefinition) {

			var resultsWidget = this._getWidgetInstance('searchResults');

			this._publish(resultsWidget.getChannel('CLEAR_DATA'), searchDefinition);
			this._publish(resultsWidget.getChannel('SET_PROPS'), {
				windowTitle: 'starredActivities'
			});

			this._hideWidget('searchFilter');
		},

		_toggleAdvancedSearch: function(searchDefinition) {

			if (!this._advancedSearchShown) {
				if (this._advancedSearchShown === undefined) {
					this._publish(this._getWidgetInstance('searchFilter').getChannel('SET_PROPS'), {
						target: searchDefinition.target,
						queryChannel: searchDefinition.queryChannel
					});
				}
				this._advancedSearchShown = true;
				this._showWidget('searchFilter');
			} else {
				this._advancedSearchShown = false;
				this._hideWidget('searchFilter');
			}
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('info').getChannel("CLEAR"));
		},

		_refreshModules: function() {

			var obj = {
				info: ''
			};

			if (Credentials.get("userRole") === "ROLE_GUEST") {
				obj.roleGuest = this.i18n.contentInfo1 + " ";
				obj.roleGuest += this.i18n.visitor;
				obj.roleGuest += this.i18n.contentInfo2;
				obj.register = this.i18n.register.toLowerCase();
				obj.info += this.i18n.contentInfo3;
			}

			obj.info += this.i18n.contentSend;

			this._emitEvt('INJECT_ITEM', {
				data: obj,
				target: "initial_info"
			});
		}
	});
});
