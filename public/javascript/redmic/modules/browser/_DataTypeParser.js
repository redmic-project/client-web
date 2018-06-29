define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);
		},

		_dataAvailable: function(response) {

			if (!this._initData && this.initialDataSave) {
				this._initData = lang.clone(response);
			}

			if (response.data.features) {
				response.data.data = response.data.features;
				delete response.data.features;
			}

			var data = response.data,
				newData = lang.clone(data[0]);

			for (var i = 1; i < data.length; i++) {
				data[i].data.splice(0,1);
				newData.data = this._merge([data[i].data, newData.data || {}], {
					arrayMergingStrategy: 'combine'
				});
			}

			if (!newData) {
				return;
			}

			newData.total = newData.data.length;

			newData = {
				data: newData
			};

			this._addData(newData);
		}
	});
});
