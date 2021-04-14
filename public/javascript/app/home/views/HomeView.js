define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/InitialInfo"
	, "redmic/base/Credentials"
	, 'app/home/views/SearchBarWidget'
	, 'app/home/views/SearchResultsWidget'
	, "app/home/views/SocialWidget"
	, "app/home/views/WidgetLastActivity"
	, "app/home/views/WidgetFavourites"
], function(
	Controller
	, Layout
	, declare
	, lang
	, TemplateDisplayer
	, TemplateInfo
	, Credentials
	, SearchBarWidget
	, SearchResultsWidget
	, SocialWidget
	, WidgetLastActivity
	, WidgetFavourites
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista inicial de la aplicación.

		constructor: function(args) {

			this.config = {
				noScroll: true,
				propsWidget: {
					omitTitleButtons: true
				}
			};

			this.widgetConfigs = {
				searchBar: {
					width: 6,
					height: 1,
					type: SearchBarWidget,
					props: {
						omitTitleBar: true,
						"class": "containerDetails"
					}
				},
				searchFilter: {
					width: 2,
					height: 4,
					type: SearchResultsWidget,
					hidden: true,
					props: {
						"class": "containerDetails"
					}
				},
				searchResults: {
					width: 4,
					height: 4,
					type: SearchResultsWidget,
					hidden: true,
					props: {
						"class": "containerDetails"
					}
				},
				info: {
					width: 3,
					height: 1,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.info,
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
						title: this.i18n.followUs
					}
				},
				favourites: {
					width: 3,
					height: 5,
					type: WidgetFavourites,
					props: {
						title: this.i18n.favourites,
						"class": "containerDetails"
					}
				},
				lastActivities: {
					width: 3,
					height: 5,
					type: WidgetLastActivity,
					props: {
						title: this.i18n.lastActivities,
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

			//this.startup();
			this._listenWidgets();
		},

		_listenWidgets: function() {

			this._setSubscriptions([{
				channel: this._widgets.searchBar.getChannel('SHOW_SEARCH_RESULTS'),
				callback: lang.hitch(this, this._showSearchResults)
			},{
				channel: this._widgets.searchBar.getChannel('HIDE_SEARCH_RESULTS'),
				callback: lang.hitch(this, this._hideSearchResults)
			}]);
		},

		_showSearchResults: function(searchDefinition) {

			this._showWidget('searchFilter');
			this._showWidget('searchResults');
			this._reloadInteractive();

			this._publish(this._widgets.searchResults.getChannel('SEARCH_DATA'), searchDefinition);
		},

		_hideSearchResults: function(searchDefinition) {

			this._publish(this._widgets.searchResults.getChannel('CLEAR_DATA'), searchDefinition);

			this._hideWidget('searchFilter');
			this._hideWidget('searchResults');
			this._reloadInteractive();
			this._updateInteractive();
		},

		_clearModules: function() {

			this._publish(this._widgets.info.getChannel("CLEAR"));
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
