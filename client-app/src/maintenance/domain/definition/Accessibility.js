define([
	'app/designs/textSearchList/main/Domain'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	DomainMain
	, declare
	, lang
) {

	return declare(DomainMain, {

		constructor: function(args) {

			this.config = {
				title: this.i18n.accessibility,
				target: this.services.accessibility
			};

			lang.mixin(this, this.config, args);
		}
	});
});
