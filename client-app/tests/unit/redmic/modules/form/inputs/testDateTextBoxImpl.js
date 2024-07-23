define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/util/Mediator"
	, "src/component/model/ModelImpl"
	, "src/component/form/inputs/DateTextBoxImpl"
	, "tests/src/component/model/SupportModel"
	, "moment"
], function(
	declare
	, lang
	, Mediator
	, ModelImpl
	, DateTextBoxImpl
	, Model
	, moment
){

	var timeout, modelInstance, widget;

	var configInstances = function(obj) {

			modelInstance = new ModelImpl({
				model: Model,
				ownChannel: obj.ownChannelModel
			});

			widget = new DateTextBoxImpl({
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
					propertyName: "properties/date"
				});

				assert.ok(modelInstance);
				assert.ok(widget);
			},

			"setValue valid": function() {

				var propertyName = "properties/date";

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(moment(obj[propertyName]).format("YYYY-MM-DD"), "2001-01-01");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(moment(obj[propertyName]).format("YYYY-MM-DD"), "2001-01-01");
				}));

				widget.widget.set("value", "2001-01-01");
			},

			"setValue model valid": function() {

				var propertyName = "properties/date";

				configInstances({
					ownChannelModel: "model2",
					ownChannelWidget: "widget2",
					propertyName: propertyName
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(moment(obj[propertyName]).format("YYYY-MM-DD"), "2001-01-01");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(moment(obj[propertyName]).format("YYYY-MM-DD"), "2001-01-01");
				}));

				var obj = {};
				obj[propertyName] = "2001-01-01";
				Mediator.publish(modelInstance.getChannel("SET_VALUE"), obj);
			},

			"setValue invalid": function() {

				var propertyName = "properties/date";

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
