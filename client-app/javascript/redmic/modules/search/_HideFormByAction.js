define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);
		},

		_afterSubmitted: function() {

			this._publish(this.getChannel('HIDE'));
		},

		_formCancelled: function(obj) {

			this._publish(this.getChannel('HIDE'));
		}
	});
});
