define([
	"app/administrative/models/DocumentModel"
	, "app/base/views/_View"
	, "app/base/views/extensions/_EditionView"
	, "app/base/views/extensions/_FormInDialogView"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/i18n!app/nls/translation"
	, "src/utils/Mediator"
	, "redmic/modules/base/Selector"
	, "redmic/modules/store/MasterStore"
], function(
	Model
	, _View
	, _EditionView
	, _FormInDialogView
	, declare
	, lang
	, i18n
	, Mediator
	, Selector
	, MasterStore
){
	var timeout, view, callback, target, selector;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("_EditionView event tests", {
		before: function() {

			timeout = 100;
			target = "/test/contacts/";
			selector = new Selector({
				parentChannel: "app"
			});

			Mediator.publish(selector.getChannel(selector.actions.SELECT), {
				target: target,
				items: 1
			});

			masterStore = new MasterStore({
				parentChannel: "app"
			});

			// Se declara junto con _FormInDialogView para que tenga formulario
			view = new declare([_View, _EditionView, _FormInDialogView])({
				mediator: Mediator,
				parentChannel: "",
				ownChannel: "",
				model: Model,
				formTemplate: "administrative/views/templates/forms/Document",
				i18n: i18n,
				target: target,
				idProperty: this.idProperty,
				selector: selector
			});
			view._initialize();
		},

		after: function() {

			Mediator.removeDescendantChannels("app");
		},

		tests: {
			"create _EditionView": function() {

				assert.ok(view.actions, "No se ha creado bien la extensión de edición en vistas");
				assert.ok(view.events, "No se ha creado bien la extensión de edición en vistas");
			},

			"add element": function() {
				var dfd = this.async(timeout);

				Mediator.once(view._buildChannel(view.form.ownChannel, view.form.actions.SHOW),
					dfd.callback(function() {}));
				view.emit(view.events.ADD);
			},

			"edit element": function() {
				var dfd = this.async(timeout);

				Mediator.once(view._buildChannel(view.form.ownChannel, view.form.actions.SHOW),
					dfd.callback(function() {}));
				view.emit(view.events.EDIT);
			},

			"copy element": function() {
				var dfd = this.async(timeout);

				Mediator.once(view._buildChannel(view.form.ownChannel, view.form.actions.SHOW),
					dfd.callback(function() {}));
				view.emit(view.events.COPY);
			},

			"remove element": function() {
				var dfd = this.async(timeout);

				Mediator.once(view._buildChannel(view.persistence.ownChannel, view.persistence.REMOVE),
					dfd.callback(function() {}));
				view.emit(view.events.REMOVE);
			}
		}
	});

	registerSuite("_EditionView catch tests", {
		before: function() {

			timeout = 100;
			target = "/test/contacts/";
			selector = new Selector({
				parentChannel: "app"
			});

			Mediator.publish(selector.getChannel("SELECT"), {
				items: 1,
				target: target
			});

			masterStore = new MasterStore({
				parentChannel: "app"
			});

			// Se declara junto con _FormInDialogView para que tenga formulario
			view = new declare([_View, _EditionView, _FormInDialogView])({
				mediator: Mediator,
				parentChannel: "",
				ownChannel: "",
				model: Model,
				formTemplate: "administrative/views/templates/forms/Document",
				i18n: i18n,
				target: target,
				idProperty: this.idProperty,
				selector: selector
			});
			view._initialize();
		},

		afterEach: function() {

			callback && callback.remove();
		},

		after: function() {

			Mediator.removeDescendantChannels("app");
		},

		tests: {
			"catch add event fired by manager": function() {
				var dfd = this.async(timeout);

				callback = view.on(view.events.ADD, dfd.callback(function () {}));
				Mediator.publish(view._buildChannel(view.managerChannel, view.actions.ADD));
			},

			"catch edit event fired by manager": function() {
				var dfd = this.async(timeout);

				callback = view.on(view.events.EDIT, dfd.callback(function () {}));
				Mediator.publish(view._buildChannel(view.managerChannel, view.actions.EDIT));
			},

			"catch remove event fired by manager": function() {
				var dfd = this.async(timeout);

				callback = view.on(view.events.REMOVE, dfd.callback(function () {}));
				Mediator.publish(view._buildChannel(view.managerChannel, view.actions.REMOVE));
			},

			"catch copy event fired by manager": function() {
				var dfd = this.async(timeout);

				callback = view.on(view.events.COPY, dfd.callback(function () {}));
				Mediator.publish(view._buildChannel(view.managerChannel, view.actions.COPY));
			}
		}
	});
});
