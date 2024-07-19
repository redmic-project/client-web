define([
	"app/base/views/extensions/_EditionWizardView"
	, "app/base/views/extensions/_GetActivityData"
	, "app/base/views/extensions/_ListenActivityDataAndAccessByActivityCategory"
	, "app/designs/mapWithSideContent/main/Tracking"
	, "app/designs/mapWithSideContent/main/_TrackingWithListByFilter"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function(
	_EditionWizardView
	, _GetActivityData
	, _ListenActivityDataAndAccessByActivityCategory
	, Tracking
	, _TrackingWithListByFilter
	, redmicConfig
	, declare
	, lang
	, put
) {

	return declare([Tracking, _TrackingWithListByFilter, _EditionWizardView, _GetActivityData,
		_ListenActivityDataAndAccessByActivityCategory], {
		//	summary:
		//		Vista de Tracking.
		//	description:
		//		Permite visualizar seguimientos.

		constructor: function (args) {

			this.config = {
				pathSeparator: ".",
				templateTarget: redmicConfig.services.elementsTrackingActivity,
				trackingPointsPath: redmicConfig.viewPaths.activityTrackingPoints,
				addPath: redmicConfig.viewPaths.activityGeoDataAdd,
				editPath: redmicConfig.viewPaths.activityGeoDataEdit,
				loadPath: redmicConfig.viewPaths.activityGeoDataLoad,
				idProperty: 'uuid',
				sideContentRegion: "left",
				activityCategory: ["at", "pt"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.filterConfig = this._merge([{
				initQuery: {
					vFlags: null,
					qFlags: null,
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);

			this._replaceVariablesInTargetAndPaths();

			this.browserWorkConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-table",
							btnId: "table",
							title: "table",
							href: this.trackingPointsPath
						},{
							groupId: "edition",
							icons: [/*{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.editPath
							},*/{
								icon: "fa-upload",
								btnId: "load",
								title: "load",
								href: this.loadPath
							}]
						}]
					}
				}
			}, this.browserWorkConfig || {}]);
		},

		_fillTopContent: function() {

			this.buttonsNode = put(this.topbarNode, 'div');

			this.inherited(arguments);
		},

		_replaceVariablesInTargetAndPaths: function() {

			this.trackingPointsPath = this._replaceVariablesInStringWithItem(this.trackingPointsPath);
			this.addPath = this._replaceVariablesInStringWithItem(this.addPath);
			this.editPath = this._replaceVariablesInStringWithItem(this.editPath);
			this.loadPath = this._replaceVariablesInStringWithItem(this.loadPath);
		},

		_replaceVariablesInStringWithItem: function(str) {

			return lang.replace(str, {
				activityid: "{activityId}",
				id: "{" + this.idProperty + "}"
			});
		},

		_getBrowserConfig: function() {

			return this.browserWorkConfig;
		},

		_setBrowserConfig: function(browserConfig) {

			this.browserWorkConfig = browserConfig;
		},

		_removeCallback: function(evt) {

			var item = evt.item;

			this._emitEvt('REMOVE', item.uuid);
		},

		_beforeShow: function(req) {

			if (!(this.pathVariableId && Number.isInteger(parseInt(this.pathVariableId, 10))))
				this._goTo404();

			var newTarget = lang.replace(this.templateTarget, {
					id: this.pathVariableId
				}),
				target = this.target || [];

			if (target.length === 1) {
				target.unshift(newTarget);
			} else {
				target[0] = newTarget;
			}

			this.dataAddPath = {
				activityId: this.pathVariableId
			};

			this.dataAddPath[this.idProperty] = 'new';

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: target,
				refresh: true
			});
		},

		_updateTarget: function() {

			this.inherited(arguments);

			this._publish(this.getChannel("CLEAR"));
		}
	});
});
