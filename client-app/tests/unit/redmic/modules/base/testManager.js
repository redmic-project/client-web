define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/Manager"
	, "src/utils/Mediator"
], function(
	declare
	, lang
	, Manager
	, Mediator
){
	var timeout, manager;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Manager tests", {
		before: function() {

			timeout = 100;

			manager = new Manager({
				parentChannel: "",
				ownChannel: "manager"
			});

		},

		afterEach: function() {

		},

		after: function() {
			Mediator.publish(manager.getChannel("DISCONNECT"));
		},

		tests: {
			"create Manager": function() {

				assert.ok(manager.actions, "No se ha creado bien la extensión de edición en vistas");
				assert.ok(manager.events, "No se ha creado bien la extensión de edición en vistas");
				assert.equal(manager.ownChannel, "manager", "No se ha creado bien la extensión de edición en vistas");
			},

			"fire add": function() {
				var dfd = this.async(timeout);

				Mediator.once(manager.getChannel("ADD"), dfd.callback(function() {}));
				manager.emit(manager.events.ADD);
			},

			"fire edit": function() {
				var dfd = this.async(timeout);

				Mediator.once(manager.getChannel("EDIT"), dfd.callback(function() {}));
				manager.emit(manager.events.EDIT);
			},

			"fire remove": function() {
				var dfd = this.async(timeout);

				Mediator.once(manager.getChannel("REMOVE"), dfd.callback(function() {}));
				manager.emit(manager.events.REMOVE);
			},

			"fire copy": function() {
				var dfd = this.async(timeout);

				Mediator.once(manager.getChannel("COPY"), dfd.callback(function() {}));
				manager.emit(manager.events.COPY);
			},

			"fire uploadfile": function() {
				var dfd = this.async(timeout);

				Mediator.once(manager.getChannel("UPLOAD_FILE"), dfd.callback(function() {}));
				manager.emit(manager.events.UPLOAD_FILE);
			},

			"fire refresh": function() {
				var dfd = this.async(timeout);

				Mediator.once(manager.getChannel("REFRESH"), dfd.callback(function() {}));
				manager.emit(manager.events.REFRESH);
			}
		}
	});

});
