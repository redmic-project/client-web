define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/utils/Mediator"
	, "redmic/modules/model/ModelImpl"
	, "redmic/modules/form/inputs/CheckBoxImpl"
	, "tests/redmic/modules/model/SupportModel"
], function(
	declare
	, lang
	, Mediator
	, ModelImpl
	, CheckBoxImpl
	, Model
){

	var timeout, modelInstance, widget;

	var configInstances = function(obj) {

			modelInstance = new ModelImpl({
				model: Model,
				ownChannel: obj.ownChannelModel
			});

			widget = new CheckBoxImpl({
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
					propertyName: "properties/boolean"
				});

				assert.ok(modelInstance);
				assert.ok(widget);
			},

			"setValue valid": function() {

				var propertyName = "properties/boolean";

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], true);
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], true);
				}));

				widget.widget.set("checked", true);
			},

			"setValue model valid": function() {

				var propertyName = "properties/boolean";

				configInstances({
					ownChannelModel: "model2",
					ownChannelWidget: "widget2",
					propertyName: propertyName
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], true);
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], true);
				}));

				var obj = {};
				obj[propertyName] = true;
				Mediator.publish(modelInstance.getChannel("SET_VALUE"), obj);
			},

			"setValue invalid": function() {

				var propertyName = "properties/boolean";

				configInstances({
					ownChannelModel: "model3",
					ownChannelWidget: "widget3",
					propertyName: propertyName,
					props: {
						checked: true
					}
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], undefined);
				}));

				widget.widget.set("checked", false);
			}
		}
	});
});
