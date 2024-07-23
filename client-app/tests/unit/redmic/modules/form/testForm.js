define([
	"app/base/models/_Persistent"
	, "app/administrative/domains/models/CountryModel"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/i18n!app/nls/translation"
	, "put-selector/put"
	, "src/utils/Mediator"
	, "redmic/dialog/LockDialogImpl"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/UploadFileImpl"
	, "redmic/modules/form/form/FormContainer"
], function(
	_Persistent
	, Model
	, declare
	, lang
	, i18n
	, put
	, Mediator
	, LockDialogImpl
	, FormContainerImpl
	, UploadFileImpl
	, FormContainer
){
	var timeout, form, item, target, instance, templatePath;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Form tests", {
		before: function() {
			timeout = 500;

			target = "/api/countries";

			templatePath = "administrative/domains/views/templates/forms/Country";

			form = new FormContainerImpl({
				target: target,
				idProperty: "id",
				//showBtn : {"submit":{},"cancel":{}},
				i18n: i18n,
				parentChannel: "country",
				model: Model,
				template: templatePath
			});

			item = {id: 1, name: "name", name_en: "name_en", code: "code"};

			instance = new declare([Model, _Persistent])({
				i18n: i18n,
				target: target,
				initValues: item
			});

		},

		afterEach: function() {
		},

		after: function() {
			Mediator.publish(form.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {

				assert.ok(form._initialize, "El módulo form no se ha inicializado correctamente.");
			},

			"Show form in node": function() {

				var dfd = this.async(timeout, 2);

				Mediator.once(form.getChannel(form.actions.SHOWN), dfd.callback(function(res) {
					assert.ok(res.success, "No se envió la publicación de form mostrado.");

					Mediator.once(form.getChannel(form.actions.HIDDEN), dfd.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de form ocultado.");
					}));

					Mediator.publish(form.getChannel(form.actions.HIDE));  // Cerramos para el siguiente
				}));

				var node = put("div");

				Mediator.publish(form.getChannel(form.actions.SHOW), {data: instance, node: node});
			},

			"Hide form node": function() {

				var dfd = this.async(timeout, 2),
					node = put("div");

				Mediator.once(form.getChannel(form.actions.SHOWN), dfd.callback(function(res) {

					Mediator.once(form.getChannel(form.actions.HIDDEN), dfd.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de form ocultado.");
					}));

					Mediator.publish(form.getChannel(form.actions.HIDE));
				}));

				Mediator.publish(form.getChannel(form.actions.SHOW), {data: instance, node: node});
			},

			"setMethod suscription": function() {

				var method = function() {};

				assert.isUndefined(form.form.newMethod,
					"El método que queremos setear a continuación ya existía");

				Mediator.publish(form.getChannel("SETMETHOD"), {
					newMethod: method
				});
				form._render();

				assert.isDefined(form.form.newMethod,
					"El método no existe tras haber sido seteado");
			},

			"Send save": function() {

				var dfd = this.async(timeout);

				Mediator.once(form.getChannel(form.actions.SAVE), dfd.callback(function(res) {
					assert.ok(res, "Form no envía la instancia a guadar correctamente");
				}));

				form.form = new FormContainer({
					region: "center",
					template: templatePath,
					instance: instance,
					target: target,
					i18n: i18n
				});

				form.emit(form.events.SAVE);
			},

			"Receive saved": function() {

				var dfd = this.async(timeout);

				Mediator.once(form.getChannel(form.actions.SAVED), dfd.callback(function(res) {
					assert.ok(res.success, "El módulo form no se ha cancelado correctamente.");
				}));

				Mediator.publish(form.getChannel(form.actions.SAVED), {success: true, data: {}});
			},

			"Cancel form": function() {

				var dfd = this.async(timeout*2);

				Mediator.once(form.getChannel(form.actions.CANCELED), dfd.callback(function(res) {
					assert.ok(res.success, "El módulo form no se ha cancelado correctamente.");
				}));

				form.emit(form.events.CANCEL);
			}
		}
	});


	/*registerSuite("Form tests (LockDialogImpl)", {
		before: function() {
			timeout = 500;

			target = "/api/countries";

			templatePath = "administrative/domains/views/templates/forms/Country";

			form = new FormContainerImpl({
				target: target,
				idProperty: "id",
				showBtn : {"submit":{},"cancel":{}},
				i18n: i18n,
				parentChannel: "country",
				model: Model,
				template: templatePath
			});

			item = {id: 1, name: "name", name_en: "name_en", code: "code"};

			instance = new declare([Model, _Persistent])({
				i18n: i18n,
				target: target,
				initValues: item
			});
		},

		afterEach: function() {
		},

		after: function() {
			Mediator.publish(form.getChannel("DISCONNECT"));
		},

		"creation": function() {

			assert.ok(form._initialize, "El módulo form no se ha inicializado correctamente.");
		},

		"Show form dialog": function() {  //TODO: Hay que hacer hide y esperar para ocultar el
			//dialog y dejarlo preparado para el siguiente (hacer el afterEach o similar)

			var dfd = this.async(timeout, 2);

			Mediator.once(form.getChannel(form.actions.SHOWN), dfd.callback(function(res) {
				assert.ok(res.success, "No se envió la publicación de dialog mostrado.");

				assert.isTrue(form.dialog.open, "Dialog no se ha abierto correctamente.");

				Mediator.once(form.getChannel(form.actions.HIDDEN), dfd.callback(function(res) {
					assert.ok(res.success, "No se envió la publicación de dialog ocultado.");
				}));

				Mediator.publish(form.getChannel(form.actions.HIDE));  // Cerramos para el siguiente
			}));

			Mediator.publish(form.getChannel(form.actions.SHOW), {data: instance});
		},

		"Hide form dialog": function() {

			var dfd = this.async(timeout, 2);

			Mediator.once(form.getChannel(form.actions.SHOWN), dfd.callback(function(res) {

				assert.isTrue(form.dialog.open, "Dialog no se ha abierto correctamente.");

				Mediator.once(form.getChannel(form.actions.HIDDEN), dfd.callback(function(res) {
					assert.ok(res.success, "No se envió la publicación de dialog ocultado.");
					assert.isFalse(form.dialog.open, "Dialog no se ha cerrado correctamente.");
				}));

				Mediator.publish(form.getChannel(form.actions.HIDE));
			}));

			Mediator.publish(form.getChannel(form.actions.SHOW), {data: instance});
		}
	});*/


	registerSuite("Form with UploadFile tests", {
		before: function() {
			timeout = 500;

			target = "/api/countries";


			form = new declare([UploadFileImpl, Form])({
				target: target,
				idProperty: "id",
				showBtn : {"submit":{},"cancel":{}},
				i18n: i18n,
				parentChannel: "country"
			});
		},

		afterEach: function() {
		},

		after: function() {
			Mediator.publish(form.getChannel("DISCONNECT"));
		},

		tests: {
			"creation": function() {

				assert.ok(form._created, "El módulo form no se ha inicializado correctamente.");
			},

			"uploadFile finish correctly": function() {

				var dfd = this.async(timeout*2);

				Mediator.once(form.getChannel(form.actions.SAVED), dfd.callback(function(res) {
					assert.ok(res.success, "El módulo form ha actualizado datos correctamente");
				}));

				form.emit(form.events.SAVED, {success: true});
			}
		}
	});

});
