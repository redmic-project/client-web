define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/i18n!app/nls/translation"
	, 'put-selector'
	, "src/util/Mediator"
	, "redmic/dialog/LockDialogImpl"
	, "RWidgets/layout/Keypad"
	, "src/component/layout/details/Details"
	, "src/component/layout/details/DojoTemplateImpl"
	, "src/component/layout/details/HandleBarsTemplateImpl"
	, "RWidgets/TemplateWidget"
	, "templates/ActivityList"
	, "templates/DocumentInfo"
	, "templates/SpeciesList"
], function(
	declare
	, lang
	, i18n
	, put
	, Mediator
	, LockDialogImpl
	, Keypad
	, Details
	, DojoTemplateImpl
	, HandleBarsTemplateImpl
	, TemplateWidget
	, templateListActivity
	, template
	, templateListSpecies
){
	var timeout, details, target, detailsViewTemplate, item;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Details tests dojo template", {
		before: function() {
			timeout = 500;

			target = "/api/documents";

			details = new declare([DojoTemplateImpl, Details])({
				target: target,
				showBtn : {"left":{},"right":{}, "check":{}},
				i18n: i18n,
				template: template.Document,
				parentChannel: ""
			});

			item = {id: 1, surname: "surname",firstname: "firstname"};
		},

		after: function() {

			Mediator.publish(details.getChannel("DISCONNECT"));
		},

		afterEach: function() {

			details.selection = {};
		},

		tests: {
			"Creation": function() {

				assert.equal(details.target, target, "Details no se ha creado correctamente.");
			},

			"Get item selected from selector": function() {

				var dfdSelected = this.async(timeout);

				Mediator.once(details._buildChannel(details.selectorChannel, details.actions.SELECTED),
					dfdSelected.callback(function(res) {
					assert.ok(res.success, "No se seleccionó correctamente el item enviado.");
					assert.deepEqual(res.body.ids, [2],
						"El objeto recibido como seleccionado no coincide con el enviado");
					assert.deepEqual({2: true}, details._getSelection(),
						"La estructura de seleccionados de Details debería devolver el id 2 a true");
				}));

				Mediator.publish(details._buildChannel(details.selectorChannel, details.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [2],
						total: 1
					}
				});
			},

			"Request select item to selector": function() {

				var dfdSelected = this.async(timeout);

				Mediator.once(details._buildChannel(details.selectorChannel, details.actions.SELECT),
					dfdSelected.callback(function(req) {
					assert.equal(req.items, 1, "El objeto recibido como seleccionado no coincide con el enviado");
					assert.equal(req.target, details.target, "El target no coincide con el enviado");
				}));

				details.emit(details.events.SELECT, {target: target, items: 1});
			},

			"Get item deselected from selector": function() {

				var dfdDeselected = this.async(timeout);

				Mediator.publish(details._buildChannel(details.selectorChannel, details.actions.SELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1],
						total: 1
					}
				});

				assert.deepEqual({1: true}, details._getSelection(),
					"La estructura de seleccionados de Details debería devolver el id 1 a true");

				Mediator.once(details._buildChannel(details.selectorChannel, details.actions.DESELECTED),
					dfdDeselected.callback(function(res) {
					assert.ok(res.success, "No se deseleccionó correctamente el item enviado.");
					assert.deepEqual(res.body.ids, [1],
						"Objecto recibido como deseleccionado no coincide con el enviado");
					assert.deepEqual({}, details._getSelection(),
						"La estructura de seleccionados de Details no debería devolver ningún id");
				}));

				Mediator.publish(details._buildChannel(details.selectorChannel, details.actions.DESELECTED), {
					success: true,
					body: {
						target: target,
						ids: [1],
						total: 0
					}
				});
			},

			"Request deselect item to selector": function() {

				var dfdSelected = this.async(timeout);

				Mediator.once(details._buildChannel(details.selectorChannel, details.actions.DESELECT),
					dfdSelected.callback(function(req) {
					assert.equal(req.items, 1, "El objeto recibido como seleccionado no coincide con el enviado");
					assert.equal(req.target, details.target, "El target no coincide con el enviado");
				}));

				// Para emular el evento del details
				details.emit(details.events.DESELECT, {target: target, items: 1});
			},

			"Get selectGroup from selector and select items": function() {

				var dfdSelectedGroup = this.async(timeout);

				Mediator.once(details._buildChannel(details.selectorChannel, details.actions.SELECTED_GROUP),
					dfdSelectedGroup.callback(function(groupSelected) {
					assert.isTrue(groupSelected.success, "No se recibió correctamente el grupo de seleccionados");
					assert.deepEqual(groupSelected.body.selection.items, {1: true, 3: true},
						"El item deseleccionado debe devolver id 1 y 3 a true.");
					assert.equal(groupSelected.body.target, target,
						"El target del servicio no corresponde con el enviado");
					assert.equal(groupSelected.body.selection.total, 2, "El total de seleccionados debe ser 2");
					assert.deepEqual({1: true, 3: true}, details._getSelection(),
						"La estructura de seleccionados de Details debería devolver el id 1 y 3 a true");
				}));

				Mediator.publish(details._buildChannel(details.selectorChannel, details.actions.SELECTED_GROUP), {
					success: true,
					body: {
						selection: {
							items: {1: true, 3: true},
							total: 2
						},
						target: target
					}
				});
			},

			"Request selectGroup to selector": function() {

				var dfdDeselectedGroup = this.async(timeout);

				Mediator.once(details._buildChannel(details.selectorChannel, details.actions.GROUP_SELECTED),
				dfdDeselectedGroup.callback(function(groupSelected) {
					assert.equal(groupSelected.target, target,
						"El target del servicio no corresponde con el enviado.");
				}));

				details.emit(details.events.GROUP_SELECTED);
			}
		}
	});

	registerSuite("Details tests dojo template with LockDialogImpl", {
		before: function() {
			timeout = 500;

			target = "/api/documents";

			details = new declare([HandleBarsTemplateImpl, Details, LockDialogImpl])({
				target: target,
				showBtn : {"left":{},"right":{}, "check":{}},
				i18n: i18n,
				template: template.Document,
				parentChannel: ""
			});

			item = {id: 1, surname: "surname",firstname: "firstname"};
		},

		after: function() {

			Mediator.publish(details.getChannel("DISCONNECT"));
		},

		tests: {
			"Creation": function() {

				assert.isTrue(details.dialog._created, "Dialog no se ha creado correctamente.");
			},

			"Show dialog": function() {  //TODO: Hay que hacer hide y esperar para ocultar el
				//dialog y dejarlo preparado para el siguiente (hacer el afterEach o similar)

				var dfd = this.async(timeout, 2);

				Mediator.once(details.getChannel("SHOWN"), dfd.callback(function(res) {
					assert.ok(res.success, "No se envió la publicación de dialog mostrado.");

					Mediator.once(details.getChannel("HIDDEN"), dfd.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de dialog ocultado.");
					}));
				}));

				Mediator.publish(details.getChannel("SHOW"), {body: {data: item}});

				assert.isTrue(details.dialog.open, "Dialog no se ha abierto correctamente.");

				Mediator.publish(details.getChannel("HIDE"));  // Cerramos para el siguiente
			},

			"Hide dialog": function() {

				var dfd = this.async(timeout, 2);

				Mediator.publish(details.getChannel("SHOW"), {body: {data: item}});

				assert.isTrue(details.dialog.open, "Dialog no se ha abierto correctamente.");

				Mediator.once(details.getChannel("SHOWN"), dfd.callback(function(res) {

					Mediator.once(details.getChannel("HIDDEN"), dfd.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de dialog ocultado.");
					}));

					Mediator.publish(details.getChannel("HIDE"));

					assert.isFalse(details.dialog.open, "Dialog no se ha cerrado correctamente.");
				}));
			}
		}
	});

	registerSuite("Details tests handleBars with LockDialogImpl + Keypad", {
		before: function() {

			timeout = 500;

			target = "/api/documents";

			detailsKeypad = new declare([HandleBarsTemplateImpl, Details, LockDialogImpl, Keypad])( {
				target: target,
				showBtn : {"left":{},"right":{}, "check":{}},
				i18n: i18n,
				template: template.Document,
				parentChannel: ""
			});

			item = {id: 1, surname: "surname",firstname: "firstname"};
		},

		after: function() {

			Mediator.publish(detailsKeypad.getChannel("DISCONNECT"));
		},

		afterEach: function() {

			detailsKeypad.selection = {};
		},

		tests: {
			"CheckBox is checked when item is selected": function() {

				var dfdSelected = this.async(timeout);

				detailsKeypad.selection = {1: true};

				Mediator.once(detailsKeypad.getChannel("SHOWN"),
					dfdSelected.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de mostrado.");
						assert.isTrue(detailsKeypad._isSelected(),
							"La función debe devolver true ya que el item está en la estructura de seleccionados");
				}));

				Mediator.publish(detailsKeypad.getChannel("SHOW"), {data: item});
			},

			"CheckBox is no checked when item is no selected": function() {

				var dfdSelected = this.async(timeout);

				detailsKeypad.selection = {};

				Mediator.once(detailsKeypad.getChannel("SHOWN"),
					dfdSelected.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de mostrado.");
						assert.isFalse(detailsKeypad._isSelected(),
							"La función debe devolver false ya que el item no está en la estructura de seleccionados");
				}));

				Mediator.publish(detailsKeypad.getChannel("SHOW"), {data: item});
			}
		}
	});

	registerSuite("Details tests handleBars template", {
		before: function() {
			timeout = 500;

			target = "/api/documents";

			i18n = {
				"Published": "Publicado",
				"title": "Especie",
				"statistics": "Estadisticas",
				"map": "Mapa",
				"aphia": "Aphia",
				"authorship": "Autor",
				"note": "Nota",
				"updated": "Actualizado",
				"activity": "Actividades",
				"project": "Proyectos",
				"documents": "Documentos",
				"program": "Programas",
				"endemicity": "Endemicidad"
			};

			details = new declare([HandleBarsTemplateImpl, Details])({
				target: this.target,
				idProperty: this.idProperty,
				i18n: i18n,
				parentChannel: "",
				template: templateListSpecies
			});
		},

		after: function() {

			Mediator.publish(details.getChannel("DISCONNECT"));
		},

		tests: {
			"show": function() {

				var data = {
					"img": "https://www.redmic.es/api/mediastorage/photobank/species/groupicon/Algas.png",
					"index":"species",
					"type":"specie",
					"id":"5956",
					"score":1.0,
					"_source":{
						"id":5956,
						"rank":{"id":10,"name_en":"Species","name":"Species"},
						"peculiarity":{
							"endemicity":{"id":6,"name_en":"Unknown","name":"Desconocida"},
							"canarycatalogue":null,
							"interest":{"id":6,"name_en":"Ornamental","name":"Uso ornamental"},
							"origin":{"id":1,"name_en":"Other","name":"Otro"},
							"euprotection":{"id":1,"name_en":"Not recorded","name":"No registrada"},
							"ecology":{"id":1,"name_en":"Other","name":"Otro"},
							"spainprotection":{"id":4,"name_en":"Special protection","name":"Protección especial"},
							"permanence":{"id":1,"name_en":"Other","name":"Otra"},
							"canaryprotection":{"id":1,"name_en":"Not recorded","name":"No catalogada"},
							"spaincatalogue":null,
							"eudirective":null
						},
						"authorship":"(Audouin, 1826)",
						"updated":"2015-03-06 08:47:01.300173",
						"aphia":111229,
						"path":"root.1.15.164.332.773.2308.5956",
						"children":null,
						"commonname":" ",
						"scientificname":"Caberea boryi",
						"note":" "
					}
				},
				node = put("div"),
				dfd = this.async(timeout);

				Mediator.once(details.getChannel("SHOWN"),
					dfd.callback(function(res) {
						assert.ok(res.success, "No se envió la publicación de mostrado.");
				}));
				Mediator.publish(details.getChannel("SHOW"), {data: data, node: node});
			},

			"show fail (No data found)": function() {

				var node = put("div"),
				dfd = this.async(timeout);

				Mediator.once(details.errorChannel,
					dfd.callback(function(res) {
						assert.isNotNull(res.error, "No se mostró correctamente.");
						assert.isNotNull(details.node, "No se mostró correctamente.");
				}));
				Mediator.publish(details.getChannel("SHOW"), {data: null, node: node});
			},

			"hide": function() {

				var dfd = this.async(timeout);
				Mediator.once(details.getChannel("HIDDEN"),
					dfd.callback(function(res) {
						assert.ok(res.success, "No se ocultó el template.");
						assert.isNull(details.node, "No se ocultó el template.");
				}));
				Mediator.publish(details.getChannel("HIDE"));
			},

			"update template": function() {

				var dfd = this.async(timeout);
				Mediator.once(details.getChannel("UPDATETEMPLATE"),
					dfd.callback(function(res) {
						assert.deepEqual(res.template, templateListActivity, "No se envió el template.");
						assert.ok(res.i18n, "No se envió el i18n.");
				}));
				Mediator.publish(details.getChannel("UPDATETEMPLATE"), {
					template: templateListActivity,
					i18n: i18n
				});
			}
		}
	});
});
