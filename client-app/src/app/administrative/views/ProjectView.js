define([
	"app/designs/textSearchFacetsList/main/Project"
	, "app/base/views/extensions/_EditionWizardView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	ProjectMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, aspect
){
	return declare([ProjectMain, _EditionWizardView], {
		// summary:
		// 	Vista de Project.
		// description:
		// 	Muestra la información.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.projectAdd,
				projectTarget: redmicConfig.services.project,
				selectionTarget: redmicConfig.services.project,
				projectProgramTarget: redmicConfig.services.projectProgram,
				perms: null
			};

			lang.mixin(this, this.config, args);

			this.target = this.projectTarget;
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
								href: this.viewPaths.projectEdit
							},{
								icon: "fa-copy",
								btnId: "copy",
								title: "copy",
								href: this.viewPaths.projectAdd
							}]
						},{
							icon: "fa-info-circle",
							btnId: "details",
							title: "info",
							href: this.viewPaths.projectDetails
						},{
							icon: "fa-tasks",
							btnId: "goToChildren",
							title: "activity",
							href: this.viewPaths.projectActivity
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('CONNECT', this._createTarget);
		},

		_createTarget: function() {

			var target = this.projectTarget;

			if (this.pathVariableId && Number.isInteger(parseInt(this.pathVariableId, 10))) {
				target = lang.replace(this.projectProgramTarget, {
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
