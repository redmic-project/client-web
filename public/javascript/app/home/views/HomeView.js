define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/InitialTitle"
	, "templates/InitialInfo"
	, "redmic/base/Credentials"
	, 'app/home/views/SearchWidget'
	, "app/home/views/SocialWidget"
	, "app/home/views/WidgetLastActivity"
	, "app/home/views/WidgetFavourites"
], function(
	Controller
	, Layout
	, _AddTitle
	, redmicConfig
	, declare
	, lang
	, TemplateDisplayer
	, TemplateTitle
	, TemplateInfo
	, Credentials
	, SearchWidget
	, SocialWidget
	, WidgetLastActivity
	, WidgetFavourites
){
	return declare([Layout, Controller/*, _AddTitle*/], {
		//	summary:
		//		Vista detalle de Activity.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				centerTitle: true,
				noScroll: true,
				propsWidget: {
					omitTitleButtons: true
				}
			};

			this.titleWidgetConfig = {
				template: TemplateTitle,
				target: "initial_title"
			};

			this.widgetConfigs = {
				search: {
					width: 6,
					height: 1,
					type: SearchWidget,
					props: {
						omitTitleBar: true,
						"class": "containerDetails"
					}
				},
				favourites: {
					width: 3,
					height: 4,
					type: WidgetFavourites,
					props: {
						title: this.i18n.favourites,
						"class": "containerDetails"
					}
				},
				lastActivities: {
					width: 3,
					height: 6,
					type: WidgetLastActivity,
					props: {
						title: this.i18n.lastActivities,
						template: TemplateInfo,
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

			this.startup();
		},

		_clearModules: function() {

			this._publish(this._widgets.info.getChannel("CLEAR"));
		},

		_refreshModules: function() {

			this._emitEvt('INJECT_ITEM', {
				data: {},
				target: "initial_title"
			});

			var object = {};

			object.info = "";

			if (Credentials.get("userRole") === "ROLE_GUEST") {
				object.roleGuest = this.i18n.contentInfo1 + " ";
				object.roleGuest += this.i18n.visitor;
				object.roleGuest += this.i18n.contentInfo2;
				object.register = this.i18n.register.toLowerCase();
				object.info += this.i18n.contentInfo3;
			}

			object.info += this.i18n.contentSend;

			this._emitEvt('INJECT_ITEM', {
				data: object,
				target: "initial_info"
			});
		}
	});
});
