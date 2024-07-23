define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/utils/Mediator"
	, "redmic/modules/model/ModelImpl"
	, "redmic/modules/form/inputs/TextAreaImpl"
	, "tests/redmic/modules/model/SupportModel"
], function(
	declare
	, lang
	, Mediator
	, ModelImpl
	, TextAreaImpl
	, Model
){

	var timeout, modelInstance, widget;

	var configInstances = function(obj) {

			modelInstance = new ModelImpl({
				model: Model,
				ownChannel: obj.ownChannelModel
			});

			widget = new TextAreaImpl({
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
					propertyName: "properties/note"
				});

				assert.ok(modelInstance);
				assert.ok(widget);
			},

			"setValue valid": function() {

				var propertyName = "properties/note";

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], "valor de la nota");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "valor de la nota");
				}));

				widget.widget.set("value", "valor de la nota");
			},

			"setValue model valid": function() {

				var propertyName = "properties/note";

				configInstances({
					ownChannelModel: "model2",
					ownChannelWidget: "widget2",
					propertyName: propertyName
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], "desde el model");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "desde el model");
				}));

				var obj = {};
				obj[propertyName] = "desde el model";
				Mediator.publish(modelInstance.getChannel("SET_VALUE"), obj);
			},

			"setValue invalid": function() {

				var propertyName = "properties/radius";

				configInstances({
					ownChannelModel: "model3",
					ownChannelWidget: "widget3",
					propertyName: propertyName
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], "valor");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName].valid, false);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "valor");
				}));

				widget.widget.set("value", "valor");
			}
		}
	});
});
