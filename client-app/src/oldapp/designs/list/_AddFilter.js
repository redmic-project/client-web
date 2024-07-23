define([
	'dojo/_base/declare'
	, 'redmic/modules/base/_Filter'
], function (
	declare
	, _Filter
) {

	return declare(_Filter, {
		//	summary:
		//		Extensión de diseño con módulo browser para agregar comunicación con módulo filter

		_setQueryChannelInModules: function() {

			this.browserConfig.queryChannel = this.queryChannel;
		}
	});
});
