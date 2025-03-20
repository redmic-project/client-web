define([
	"dojo/_base/declare"
	, "dojo/_base/lang"

	, "./_TrackingByFilter"
	, "./_TrackingWithList"
], function(
	declare
	, lang

	, _TrackingByFilter
	, _TrackingWithList
){
	return declare([_TrackingWithList, _TrackingByFilter], {
		//	summary:
		//
		//	description:
		//

		constructor: function (args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);
		},

		_dataAvailable: function(items) {

			var data = items.data.data;

			if (!data || !data.length) {
				this._clear();
				return;
			}

			for (var i = 0; i < data.length; i++) {
				var item = data[i];

				item.pathGenerate = 'root.' + this.pathVariableId + '.' + item.uuid;
				item.activityId = this.pathVariableId;

				this._injectItemInBrowserWork(item);
			}
		}
	});
});
