define([
	'src/maintenance/domain/_HierarchicalDomain'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	_HierarchicalDomain
	, declare
	, lang
){
	return declare(_HierarchicalDomain, {
		//	summary:
		//		Vista de InfrastructureType.

		constructor: function(args) {

			this.config = {
				title: this.i18n['infrastructure-type'],
				target: this.services.infrastructureType
			};

			lang.mixin(this, this.config, args);
		}
	});
});
