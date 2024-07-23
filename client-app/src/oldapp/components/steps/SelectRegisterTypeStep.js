define([
	"app/components/steps/_SelectOptionBox"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	_SelectOptionBox
	, declare
	, lang
){
	return declare(_SelectOptionBox, {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {
				label: "this.i18n.selectRegisterType",
				boxDescription: true,
				optionBox: {
					"fixed": {
						parameter: {
							icon: "fa-close",
							value: "parameter",
							description: "descriptionParameter"
						},
						collect: {
							icon: "fa-close",
							value: "collect",
							description: "descriptionCollect"
						},
						places: {
							icon: "fa-close",
							value: "places",
							description: "descriptionPlaces"
						}
					},
					"changed": {
						track: {
							icon: "fa-close",
							value: "track",
							description: "descriptionTrack"
						},
						trackParameter: {
							icon: "fa-close",
							value: "trackParameter",
							description: "descriptionTrackParameter"
						}
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_beforeShow: function() {

			this._clearContent();
			this.boxes = this.optionBox[this._wizardResults[this.optionBoxValue]];
			this._createContent();
		},

		_onClickBox: function(key) {

			this.inherited(arguments);

			this._results = this.boxes[key].value;

			this._isCompleted = true;
			this._emitEvt('REFRESH_STATUS');

			this._emitEvt('GO_FORWARD');
		},

		_getNextStepId: function(currentStep, _stepResults) {

			if (this._results === "track") {
				return "track";
			}

			if (this._results === "trackParameter") {
				return "trackParameter";
			}

			if (this._results === "parameter") {
				return "parameter";
			}

			if (this._results === "collect") {
				return "collect";
			}

			if (this._results === "places") {
				return "places";
			}
		}
	});
});