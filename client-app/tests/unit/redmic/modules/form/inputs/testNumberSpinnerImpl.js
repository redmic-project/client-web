define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/base/Mediator"
	, "redmic/modules/model/ModelImpl"
	, "redmic/modules/form/inputs/NumberSpinnerImpl"
	, "tests/redmic/modules/model/SupportModel"
], function(
	declare
	, lang
	, Mediator
	, ModelImpl
	, NumberSpinnerImpl
	, Model
){

	var timeout, modelInstance, widget;

	var configInstances = function(obj) {

			modelInstance = new ModelImpl({
				model: Model,
				ownChannel: obj.ownChannelModel
			});

			widget = new NumberSpinnerImpl({
				channelModel: modelInstance.getChannel(),
				propertyName: obj.propertyName,
				ownChannel: obj.ownChannelWidget,
				props: obj.props ? obj.props : {}
			});
	};

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Model implement tests", {
		before: function() {

			timeout = 10;
		},

		tests: {
			"creation instance": function() {

				configInstances({
					ownChannelModel: "model",
					ownChannelWidget: "widget",
					propertyName: "properties/number"
				});

				assert.ok(modelInstance);
				assert.ok(widget);
			},

			"setValue valid": function() {

				var propertyName = "properties/number";

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], 1);
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], 1);
				}));

				widget.widget.set("value", 1);
			},

			"setValue model valid": function() {

				var propertyName = "properties/number";

				configInstances({
					ownChannelModel: "model2",
					ownChannelWidget: "widget2",
					propertyName: propertyName
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], 1);
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], 1);
				}));

				var obj = {};
				obj[propertyName] = 1;
				Mediator.publish(modelInstance.getChannel("SET_VALUE"), obj);
			},

			"setValue invalid": function() {

				var propertyName = "properties/number";

				configInstances({
					ownChannelModel: "model3",
					ownChannelWidget: "widget3",
					propertyName: propertyName
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName].valid, false);
				}));

				widget.widget.set("value", "valor");
			}
		}
	});
});