define([
	"app/components/steps/_SelectOptionBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	_SelectOptionBox
	, declare
	, lang
	, put
){
	return declare(_SelectOptionBox, {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {
				label: this.i18n.selectActivityCategory,
				boxDescription: true,
				title: this.i18n.selectActivityCategory,
				optionsBoxes: {
					'ft': {
						icon: 'fa-bar-chart'
					},
					'oc': {
						icon: 'fa-trash'
					},
					'if': {
						icon: 'fa-map-marker'
					},
					'at': {
						icon: 'fr.fr-track'
					},
					'pt': {
						icon: 'fr.fr-track'
					},
					'ar': {
						icon: 'fr.fr-grid'
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_beforeShow: function(obj) {

			this._clearContent();

			this.boxes = {};

			var data = obj.data,
				item, box;

			for (var i = 0; i < data.length; i++) {
				item = data[i];
				box = this.optionsBoxes[item];

				if (box) {
					box.value = item + '-category';
					box.description = item + '-description';
					this.boxes[item] = lang.clone(box);
				}
			}

			this._createContent();
		}
	});
});
