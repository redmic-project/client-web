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

		_fillSideContent: function() {

			this.inherited(arguments);

			var borderContainer = this._createBrowserWork();

			this.tabContainer.addChild(borderContainer, 0);

			this.tabContainer.selectChild(borderContainer);
		},

		_dataAvailable: function(items) {

			var data = items.data.data;

			for (var i = 0; i < data.length; i++) {
				var item = data[i];

				item.pathGenerate = 'root.' + this.pathVariableId + '.' + item.uuid;
				item.activityId = this.pathVariableId;

				this._injectItemInBrowserWork(item);
			}
		}
	});
});
