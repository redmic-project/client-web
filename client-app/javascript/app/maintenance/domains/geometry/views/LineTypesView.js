define([
	'app/maintenance/domains/_HierarchicalDomain'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'templates/LineTypeList'
], function(
	_HierarchicalDomain
	, declare
	, lang
	, LineTypeListTemplate
){
	return declare(_HierarchicalDomain, {
		//	summary:
		//		Vista de LineType.

		constructor: function(args) {

			this.config = {
				title: this.i18n.lineType,
				target: this.services.lineType
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				template: 'maintenance/domains/geometry/views/templates/forms/LineTypes'
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				template: LineTypeListTemplate
			}, this.browserConfig || {}]);
		}
	});
});
