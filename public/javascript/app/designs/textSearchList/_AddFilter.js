define([
	"dojo/_base/declare"
	, "redmic/modules/base/_Filter"
], function (
	declare
	, _Filter
){
	return declare(_Filter, {
		//	summary:
		//

		_setQueryChannelInModules: function() {

			this.browserConfig.queryChannel = this.queryChannel;

			this.textSearchConfig.queryChannel = this.queryChannel;
		}
	});
});
