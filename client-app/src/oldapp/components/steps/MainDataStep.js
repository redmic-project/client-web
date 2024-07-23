define([
	"app/components/steps/_MainData"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/_PublicateChanges"
], function (
	_MainData
	, declare
	, lang
	, FormContainerImpl
	, _PublicateChanges
){
	return declare(_MainData, {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {
				ownChannel: "mainDataStep"
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			var props = {
				storeChannel: this.getChannel(),
				modelChannel: this.modelChannel,
				modelTarget: this.modelTarget,
				modelSchema: this.modelSchema,
				template: this.formTemplate,
				dataTemplate: this.dataTemplate
			};

			this._createForm(props);
		},

		_createFormDefinition: function() {

			return declare([FormContainerImpl]).extend(_PublicateChanges);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt("SHOW_FORM", {
				node: this.containerNode
			});
		}
	});
});
