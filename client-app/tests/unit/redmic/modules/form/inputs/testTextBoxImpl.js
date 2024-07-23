define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/util/Mediator"
	, "src/component/model/ModelImpl"
	, "src/component/form/inputs/TextBoxImpl"
	, "tests/src/component/model/SupportModel"
], function(
	declare
	, lang
	, Mediator
	, ModelImpl
	, TextBoxImpl
	, Model
){

	var timeout, modelInstance, widget;

	var configInstances = function(obj) {

			modelInstance = new ModelImpl({
				model: Model,
				ownChannel: obj.ownChannelModel
			});

			widget = new TextBoxImpl({
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

		/*afterEach: function() {
			map.clear();
		},

		after: function() {
			Mediator.publish(map.getChannel("DISCONNECT"));
		},*/

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
			},

			"setValue invalid, widget type email": function() {

				var propertyName = "properties/email";

				configInstances({
					ownChannelModel: "model4",
					ownChannelWidget: "widget4",
					propertyName: propertyName,
					props: {
						type: "email"
					}
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], "email");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName].valid, false);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "email");
				}));

				widget.widget.set("value", "email");
			},

			"setValue valid, widget type email": function() {

				var propertyName = "properties/email";

				configInstances({
					ownChannelModel: "model5",
					ownChannelWidget: "widget5",
					propertyName: "properties/email",
					props: {
						type: "email"
					}
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], "email@hotmail.com");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "email@hotmail.com");
				}));

				widget.widget.set("value", "email@hotmail.com");
			},

			"setValue invalid, widget type password": function() {

				var propertyName = "properties/password";

				configInstances({
					ownChannelModel: "model6",
					ownChannelWidget: "widget6",
					propertyName: propertyName,
					props: {
						type: "password",
						validator: lang.hitch(this, function(value){
							if (value.length >= 6)
								return true;
							else
								return false;
						})
					}
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName].valid, false);
				}));

				widget.widget.set("value", "aaa");
			},

			"setValue valid, widget type password": function() {

				var propertyName = "properties/password";

				configInstances({
					ownChannelModel: "model7",
					ownChannelWidget: "widget7",
					propertyName: propertyName,
					props: {
						type: "password",
						validator: lang.hitch(this, function(value){
							if (value && value.length >= 6)
								return true;
							else
								return false;
						})
					}
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					function(obj) {
						assert.equal(obj[propertyName], "aaa123456");
				});

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					function(obj) {
						assert.equal(obj[propertyName], undefined);
				});

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "aaa123456");
						assert.equal(widget.widget.get("value"), "aaa123456");
						assert.equal(widget.widget.validator(), true);
				}));

				widget.widget.set("value", "aaa123456");
			}/*,

			"setValue invalid, widget type password confirm": function() {

				var propertyName = "properties/confirm";

				configInstances({
					ownChannelModel: "model8",
					ownChannelWidget: "widget8",
					propertyName: propertyName,
					props: {
						type: "password"
					}
				});

				widget.widget.validator = lang.hitch(this, function(value){
					if (value === modelInstance.get("password").get("value"))
						return true;
					else
						return false;
				});

				Mediator.publish(modelInstance.getChannel("SET_VALUE"), {
					propertyName: "aaa123456"
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "aaa");
				}));

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName].valid, false);
				}));

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "aaa");
						assert.equal(widget.widget.validator(), false);
				}));

				widget.widget.set("value", "aaa");
			},

			"setValue valid, widget type password confirm": function() {

				var propertyName = "properties/confirm";

				configInstances({
					ownChannelModel: "model9",
					ownChannelWidget: "widget9",
					propertyName: propertyName,
					props: {
						type: "password"
					}
				});

				widget.widget.validator = lang.hitch(this, function(value){
					console.log(modelInstance.get("password"))
					if (value === modelInstance.get("password").get("value"))
						return true;
					else
						return false;
				});

				Mediator.publish(modelInstance.getChannel("SET_VALUE"), {
					propertyName: "aaa123456"
				});

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel("CHANGE"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "aaa123456");
				}));

				Mediator.once(modelInstance.getChannel("IS_VALID"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], undefined);
				}));

				Mediator.once(widget.getChannel("CHANGED"),
					dfd.callback(function(obj) {
						assert.equal(obj[propertyName], "aaa123456");
						assert.equal(widget.widget.get("value"), "aaa123456");
						assert.equal(widget.widget.validator(), true);
				}));

				widget.widget.set("value", "aaa123456");
			}*/
		}
	});
});
