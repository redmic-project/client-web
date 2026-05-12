define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_CustomLayout'
	, 'src/detail/_DetailAdministrativeAncestor'
	, 'src/detail/_GenerateReport'
	, 'src/redmicConfig'
	, 'templates/ActivityList'
	, 'templates/ProjectInfo'
], function(
	declare
	, lang
	, _CustomLayout
	, _DetailAdministrativeAncestor
	, _GenerateReport
	, redmicConfig
	, ActivityListTemplate
	, ProjectInfoTemplate
) {

	return declare([_DetailAdministrativeAncestor, _CustomLayout, _GenerateReport], {
		//	summary:
		//		Vista de detalle de proyectos.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.project,
				reportService: 'project',
				pathParent: redmicConfig.viewPaths.projectCatalog,
				templateInfo: ProjectInfoTemplate,
				descendantsTarget: redmicConfig.services.activityProject,
				_descendantFields: redmicConfig.returnFields.activity
			};

			lang.mixin(this, this.config, args);
		},

		_getAdditionalDescendantListConfig: function() {

			return {
				title: 'activities',
				template: ActivityListTemplate,
				href: redmicConfig.viewPaths.activityDetails
			};
		},

		_itemAvailable: function(res) {

			this.inherited(arguments);

			this._emitEvt('GET_WIDGETS_CONFIG', {
				externalConfigPropName: 'detailLayouts.project',
				entityId: res.data?.id,
				entityName: 'project'
			});
		}
	});
});
