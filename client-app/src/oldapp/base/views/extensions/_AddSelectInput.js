define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/form/input/SelectImpl"

	, "./_AddSelectInputItfc"
], function(
	declare
	, lang
	, aspect
	, SelectImpl

	, _AddSelectInputItfc
){
	return declare(_AddSelectInputItfc, {
		//	summary:
		//		Extensión que añade instancia de input select

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setAddSelectInputConfigurations));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineAddSelectInputSubscriptions));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeAddSelectInput));
		},

		_setAddSelectInputConfigurations: function() {

			this.selectInputConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty
			}, this.selectInputConfig || {}]);
		},

		_initializeAddSelectInput: function() {

			this.selectInput = new SelectImpl(this.selectInputConfig);
		},

		_defineAddSelectInputSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.selectInput.getChannel("VALUE_CHANGED"),
				callback: "_subSelectInputChanged"
			});
		},

		_subSelectInputChanged: function(res) {

			this._onSelectInputChange(res);
		}
	});
});
