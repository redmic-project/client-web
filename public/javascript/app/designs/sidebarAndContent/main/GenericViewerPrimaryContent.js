define([
	"app/base/views/extensions/_OnShownAndRefresh"
	, "app/catalog/views/ActivitiesCatalogView"
	, "app/designs/base/_Main"
	, "app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/designs/sidebarAndContent/Controller"
	, "app/designs/sidebarAndContent/layout/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/base/Credentials"
	, "redmic/modules/base/_Selection"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_ShowInPopup"
	, "templates/ActivityList"
	, "templates/LoadingCustom"
], function(
	_OnShownAndRefresh
	, ActivitiesCatalogView
	, _Main
	, ListFilter
	, ListController
	, ListLayout
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, aspect
	, Credentials
	, _Selection
	, _Store
	, _ShowInPopup
	, templateList
	, templateLoadingCustom
){
	return declare([Layout, Controller, _Main, _OnShownAndRefresh, _Selection, _Store], {
		//	summary:
		//		Main para visor genérico.
		//	description:
		//

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.activity,
				labelActiveDefault: 'activities',

				mainActions: {
					CHANGE_TO_SECONDARY: "changeToSecondary"
				},
				mainEvents: {
					CHANGE_TO_SECONDARY: "changeToSecondary"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setEmptySelection", lang.hitch(this, this._setEmptySelectionAfter));
		},

		_setMainConfigurations: function() {

			this.sidebarConfig = this._merge([{
				items: [{
					label: "activities",
					icon: "fa-tasks",
					active: true
				}]
			}, this.sidebarConfig || {}],
			{
				arrayMergingStrategy: "concatenate"
			});

			this.browserActivitiesConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.activities,
				browserConfig: {
					template: templateList,
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-angle-right",
								btnId: "changeToSecondary",
								returnItem: true
							}]
						}
					},
					noDataMessage: {
						definition: templateLoadingCustom,
						props: {
							message: this.i18n.selectActivitiesInCatalog,
							iconClass: "fa fa-plus-circle",
							clickable: true
						}
					}
				},
				buttonsInTopZone: true,
				buttons: {
					"activitiesCatalog": {
						className: "fa-sitemap",
						title: this.i18n['activities-catalog']
					}
				},
				target: this.target
			}, this.browserActivitiesConfig || {}]);

			this.activitiesCatalogConfig = this._merge([{
				parentChannel: this.getChannel(),
				width: 12,
				lockBackground: true,
				mask: {}
			}, this.activitiesCatalogConfig || {}]);
		},

		_initializeMain: function() {

			this.browserActivities = new declare([ListLayout, ListController, ListFilter])(this.browserActivitiesConfig);
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.browserActivities.getChildChannel("iconKeypad", "KEYPAD_INPUT"),
				callback: "_subIconKeypadBrowserActivities"
			},{
				channel: this.browserActivities.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subBtnEventBrowserActivities"
			},{
				channel: this.browserActivities.getChildChannel("browser", "NO_DATA_MSG_CLICKED"),
				callback: "_subNoDataMsgClickedBrowserActivities"
			});
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'CHANGE_TO_SECONDARY',
				channel: this.getChannel("CHANGE_TO_SECONDARY")
			});
		},

		_dataAvailable: function(res) {

			var resData = res.data,
				activities = resData && resData.data;

			if (!activities) {
				return;
			}

			var layersManagerChannel = this.checkChildChannel('layersManager');

			if (layersManagerChannel) {
				this._publish(this.getChildChannel('layersManager', 'SET_PROPS'), {
					activities: activities
				});
			}
		},

		_subIconKeypadBrowserActivities: function(res) {

			if (res.inputKey === "activitiesCatalog") {
				this._showActivitiesCatalog();
			}
		},

		_subBtnEventBrowserActivities: function(res) {

			var callback = "_" + res.btnId + "Callback";
			this[callback] && this[callback](res);
		},

		_subNoDataMsgClickedBrowserActivities: function(res) {

			this._showActivitiesCatalog();
		},

		_changeToSecondaryCallback: function(res) {

			this._emitEvt('CHANGE_TO_SECONDARY', {
				primaryData: res.item,
				title: res.item && res.item.name,
				source: 'activities'
			});
		},

		_onControllerMeOrAncestorShown: function() {

			this._listenToSelection();
		},

		_listenToSelection: function() {

			this._changeSelection && this._updateSelection();

			this._changeSelection = false;
			this._noSetSelection = false;
		},

		_onControllerMeOrAncestorHidden: function() {

			this.inherited(arguments);

			this._noSetSelection = true;
		},

		_beforeShow: function() {

			this._updateSelection();
		},

		_updateSelection: function() {

			var selectIds = Credentials.get("selectIds"),
				selectId = selectIds && selectIds[this.target];

			if (selectId) {
				this._publish(this.browserActivities.getChildChannel('filter', 'ADD_TO_QUERY'), {
					query: {
						terms: {
							selection: selectId
						}
					}
				});
			}
		},

		_setEmptySelectionAfter: function() {

			if (this._noSetSelection) {
				this._changeSelection = true;
				return;
			}

			if (this._getEmptySelection())
				this.browserActivities.getChildChannel('browser', 'CLEAR');
			else
				this._updateSelection();
		},

		_activitiesCallback: function() {

			return {
				instance: this.browserActivities
			};
		},

		_showActivitiesCatalog: function() {

			this._publish(this.getChannel("DISCONNECT"));

			if (!this.activitiesCatalog) {
				this.activitiesCatalog = new declare(ActivitiesCatalogView)
					.extend(_ShowInPopup)(this.activitiesCatalogConfig);
			}

			this._noSetSelection = true;

			this._publish(this.activitiesCatalog.getChannel("CONNECT"));

			this._once(this.activitiesCatalog.getChannel("HIDDEN"), lang.hitch(this, this._subActivitiesCatalogHidden));
			this._publish(this.activitiesCatalog.getChannel("SHOW"));
		},

		_subActivitiesCatalogHidden: function() {

			this._publish(this.getChannel("CONNECT"));

			this._publish(this.activitiesCatalog.getChannel("DISCONNECT"));

			this._listenToSelection();
		}
	});
});
