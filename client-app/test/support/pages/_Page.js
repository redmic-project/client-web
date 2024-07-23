define([
	'dojo/_base/declare'
], function (
	declare
) {

	return declare(null, {

		constructor: function(args) {

			this.remote = args.remote;
			this.externalContext = args.externalContext;
		}
	});
});
