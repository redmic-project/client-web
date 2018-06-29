define([
	'app/maintenance/domains/_HierarchicalDomain'
	, 'dojo/_base/declare'
	, "dojo/_base/lang"
], function(
	_HierarchicalDomain
	, declare
	, lang
){
	return declare(_HierarchicalDomain, {
		//	summary:
		// 		Vista de Attribute Type.

		constructor: function(args) {

			this.config = {
				title: this.i18n.attributeType,
				target: this.services.attributeType
			};

			lang.mixin(this, this.config, args);
		}
	});
});
