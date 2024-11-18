define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'test/support/tests/_BaseCommons'
], function(
	declare
	, lang
	, _BaseCommons
) {

	return declare(_BaseCommons, {

		constructor: function(args) {

			this.config = {
				sidebarPrimaryValue: 'maintenance',
				sidebarSecondaryValue: '/maintenance/domains'
			};

			lang.mixin(this, this.config, args);
		}
	});
});
