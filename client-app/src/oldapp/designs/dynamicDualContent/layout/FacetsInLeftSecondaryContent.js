define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, './_Layout'
], function(
	declare
	, lang
	, put
	, _Layout
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para zona de filtrado en el contenido secundario por la izquierda.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'facetsInLeftSecondaryContentLayoutDynamicDualContentDesign',
				secondaryContentClass: 'isolatedFacetsZone'
			};

			lang.mixin(this, this.config, args);
		}
	});
});
