define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_GenerateReport'
	, 'src/detail/_DetailAdministrativeAncestor'
	, 'src/redmicConfig'
	, 'templates/ActivityList'
	, 'templates/ProjectInfo'
], function(
	declare
	, lang
	, _GenerateReport
	, _DetailAdministrativeAncestor
	, redmicConfig
	, ActivityListTemplate
	, ProjectInfoTemplate
) {

	return declare([_DetailAdministrativeAncestor, _GenerateReport], {
		//	summary:
		//		Vista de detalle de proyectos.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.project,
				reportService: 'project',
				pathParent: redmicConfig.viewPaths.projectCatalog,
				templateInfo: ProjectInfoTemplate,
				_descendantTargetBase: redmicConfig.services.activityProject,
				_descendantFields: redmicConfig.returnFields.activity
			};

			lang.mixin(this, this.config, args);
		},

		_getAdditionalDescendantListConfig: function() {

			return {
				title: 'activities',
				target: this.descendantTarget,
				template: ActivityListTemplate,
				href: redmicConfig.viewPaths.activityDetails
			};
		}
	});
});
