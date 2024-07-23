define([
	'app/maintenance/domains/_HierarchicalDomain'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/ObjectTypeList'
], function(
	_HierarchicalDomain
	, declare
	, lang
	, ObjectTypeListTemplate
){
	return declare(_HierarchicalDomain, {
		//	summary:
		//		Vista de ObjectType.

		constructor: function(args) {

			this.config = {
				title: this.i18n.objectType,
				target: this.services.objectType
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: ObjectTypeListTemplate
			}, this.browserConfig || {}]);
		}
	});
});
