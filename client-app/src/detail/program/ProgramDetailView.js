define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_GenerateReport'
	, 'src/detail/_DetailAdministrativeAncestor'
	, 'src/redmicConfig'
	, 'templates/ProgramInfo'
	, 'templates/ProjectList'
], function(
	declare
	, lang
	, _GenerateReport
	, _DetailAdministrativeAncestor
	, redmicConfig
	, ProgramInfoTemplate
	, ProjectListTemplate
) {

	return declare([_DetailAdministrativeAncestor, _GenerateReport], {
		//	summary:
		//		Vista de detalle de programas.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.program,
				reportService: 'program',
				pathParent: redmicConfig.viewPaths.programCatalog,
				templateInfo: ProgramInfoTemplate,
				_descendantTargetBase: redmicConfig.services.projectProgram,
				_descendantFields: redmicConfig.returnFields.project
			};

			lang.mixin(this, this.config, args);
		},

		_getAdditionalDescendantListConfig: function() {

			return {
				title: 'projects',
				target: this.descendantTarget,
				template: ProjectListTemplate,
				href: redmicConfig.viewPaths.projectDetails
			};
		}
	});
});
