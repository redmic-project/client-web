define([
	"app/designs/textSearchFacetsList/main/Activity"
	, "app/base/views/extensions/_EditionWizardView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	ActivityMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, aspect
){
	return declare([ActivityMain, _EditionWizardView], {
		//	summary:
		//		Vista de Activity.
		//	description:
		//		Muestra la información.

		constructor: function (args) {
			//this.authenticate();

			this.config = {
				addPath: this.viewPaths.activityAdd,
				activityTarget: redmicConfig.services.activity,
				selectionTarget: redmicConfig.services.activity,
				activityProjectTarget: redmicConfig.services.activityProject,
				perms: null
			};

			lang.mixin(this, this.config, args);

			this.target = this.activityTarget;
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				selectionTarget: this.selectionTarget,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.activityEdit
							},{
								icon: "fa-copy",
								btnId: "copy",
								title: "copy",
								href: this.viewPaths.activityAdd
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.activityDetails
						},{
							icon: "fa-keyboard-o",
							btnId: "goToChildren",
							href: [
								lang.replace(this.viewPaths.activityGeoDataAdd, {
									activityid: "{id}",
									id: "new"
								}),
								this.viewPaths.activityCitation,
								this.viewPaths.activitySurveyStation,
								this.viewPaths.activityObjectCollection,
								this.viewPaths.activityTracking,
								this.viewPaths.activityInfrastructure,
								this.viewPaths.activityArea
							],
							condition: function(item) {

								return true;
								/*var validActivityType = [2, 10, 6, 31, 32, 7, 13, 19];
								return (item.activityType && validActivityType.indexOf(item.activityType.id) !== -1);*/
							},
							chooseHref: function(item) {

								var activityTypeId = item.activityType.id,
									activityCategory = item.activityCategory,
									validActivityTypeCitation = [2, 10];

								if (activityCategory === "ci" || validActivityTypeCitation.indexOf(activityTypeId) !== -1) {
									return 1;
								}
								if (activityCategory === "ft") {
									return 2;
								}
								if (activityCategory === "oc") {
									return 3;
								}
								if (["at", "pt", "tr"].indexOf(activityCategory) !== -1) {
									return 4;
								}
								if (activityCategory === "if") {
									return 5;
								}
								if (activityCategory === "ar") {
									return 6;
								}

								return 0;
							},
							title: "data-loader"
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					vFlags: null,
					qFlags: null,
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CONNECT', this._createTarget);
		},

		_createTarget: function() {

			var target = this.activityTarget;

			if (this.pathVariableId && Number.isInteger(parseInt(this.pathVariableId, 10))) {
				target = lang.replace(this.activityProjectTarget, {
					id: this.pathVariableId
				});
			}

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: target,
				refresh: true
			});
		}
	});
});
