define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "src/util/Mediator"
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_DragAndDrop"
	, "src/component/browser/_EditionTable"
	, "src/component/browser/_Framework"
	, "src/component/browser/_GeoJsonParser"
	, "src/component/browser/_MultiTemplate"
	, "src/component/browser/_NoDataTemplate"
	, "src/component/browser/_Select"
	, "src/component/browser/_Table"
	, "src/component/browser/ListImpl"
	, "templates/DomainList"
], function(
	declare
	, lang
	, domClass
	, Mediator
	, _ButtonsInRow
	, _DragAndDrop
	, _EditionTable
	, _Framework
	, _GeoJsonParser
	, _MultiTemplate
	, _NoDataTemplate
	, _Select
	, _Table
	, ListImpl
	, template
){
	var timeout = 300,
		parentChannel = "containerList",
		target = "/api/domain",
		browser, item, data, specificProps, specificTests,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		getRow = function(idProperty) {

			return browser._getRow(idProperty);
		},

		publishData = function() {

			Mediator.publish(browser._buildChannel(browser.storeChannel, browser.actions.AVAILABLE), {
				res: {
					data: data,
					status: 200
				},
				target: target
			});
		},

		publishItem = function() {

			Mediator.publish(browser._buildChannel(browser.storeChannel, browser.actions.ITEM_AVAILABLE), {
				res: {
					data: item,
					status: 200
				},
				target: target
			});
		},

		commonTests = {
			"Should_HaveStructuresAvailable_When_ModuleListIsInitialized": function() {

				assert.ok(browser, "No se ha creado correctamente");
				assert.ok(browser.contentListNode, "No se ha creado correctamente");
				assert.ok(browser.rowsContainerNode, "No se ha creado correctamente");
				assert.ok(browser.template, "No se ha creado correctamente");
			},

			"Should_AddData_When_ReceiveDataAvailablePublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('REFRESHED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 10, "No se ha añadido correctamente");
					dfd.resolve();
				});

				publishData();
			},

			"Should_AddItem_When_ReceiveItemAvailablePublication": function() {

				var dfd = this.async(timeout+10000);

				Mediator.once(browser.getChannel('DATA_ADDED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 10, "No se ha añadido correctamente");
					dfd.resolve();
				});

				publishItem();
			},

			"Should_UpdateItem_When_ReceiveItemAvailablePublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('DATA_ADDED'), function() {

					assert.strictEqual(browser._rows['1'].data.name, 'hola', "No se ha actualizado correctamente");
					assert.strictEqual(Object.keys(browser._rows).length, 10, "No se ha actualizado correctamente");
					dfd.resolve();
				});

				item.name = 'hola',

				publishItem();
			},

			"Should_RemoveItem_When_ReceiveRemoveItemPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('DATA_REMOVED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 9, "No se ha eliminado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("REMOVE_ITEM"), {
					idProperty: 1
				});
			},

			"Should_ClearData_When_ReceiveClearPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('CLEARED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 0, "No se ha limpiado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("CLEAR"));
			},

			"Should_GotData_When_ReceiveGetDataPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('GOT_DATA'), function(req) {

					assert.strictEqual(Object.keys(browser._rows).length, req.data.length, "No se ha enviado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("GET_DATA"));
			},

			"Should_GotItem_When_ReceiveGetItemPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('GOT_ITEM'), function(req) {

					assert.strictEqual(item.id, req.item.id, "No se ha enviado correctamente");
					assert.strictEqual(item.name, req.item.name, "No se ha enviado correctamente");
					assert.strictEqual(item.name_en, req.item.name_en, "No se ha enviado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("GET_ITEM"), {
					idProperty: 1
				});
			},

			"Should_GotRowChannel_When_ReceiveGetRowChannelPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('GOT_ROW_CHANNEL'), function(req) {

					assert.strictEqual(req.channel, browser._rows['1'].instance.getChannel(),
						"No se ha enviado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("GET_ROW_CHANNEL"), {
					idProperty: 1
				});
			},

			"Should_SetTemplate_When_ReceiveUpdateTemplatePublication": function() {

				var template = 'Hola',
					dfd = this.async(timeout);

				Mediator.once(browser.getChannel('TEMPLATE_UPDATED'), function() {

					assert.strictEqual(browser.template, template, "No se ha actualizado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("UPDATE_TEMPLATE"), {
					template: template
				});
			}
		},

		selectTests = {
			"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

				assert.ok(browser._selection, "No se ha creado correctamente");
				assert.ok(browser.actions.SELECT_ROW, "No se ha creado correctamente");
				assert.ok(browser.actions.DESELECT_ROW, "No se ha creado correctamente");
				assert.ok(browser.actions.CLEAR_SELECTION_ROWS, "No se ha creado correctamente");
				assert.ok(browser.actions.SELECT_ALL_ROWS, "No se ha creado correctamente");
			},

			"Should_SelectedRow_When_ActionSelect": function() {

				var instanceRow = getRow('1').instance,
					selectContainerClass = instanceRow.selectContainerClass;

				browser._selectRow(1);

				assert.isTrue(domClass.contains(instanceRow.domNode, selectContainerClass),
					"No se ha cambiado a seleccionado correctamente");
			},

			"Should_DeselectedRow_When_ActionDeselect": function() {

				var instanceRow = getRow('1').instance,
					selectContainerClass = instanceRow.selectContainerClass;

				browser._selectRow(1);
				browser._deselectRow(1);

				assert.isFalse(domClass.contains(instanceRow.domNode, selectContainerClass),
					"No se ha cambiado a seleccionado correctamente");
			}
		},

		initData = function() {

			data = [];

			for (var i = 10; i >= 1; i--) {
				item = {
					id: i,
					name: 'name_' + i,
					name_en: 'name_en_' + i
				};

				data.push(item);
			}
		},

		configBrowser = {
			parentChannel: parentChannel,
			target: target,
			template: template,
			rowConfig: {
				buttonsConfig: {
					listButton: [{
						groupId: "edition",
						icons: [{
							icon: "fa-copy",
							btnId: "copy",
							title: "copy",
							href: "fa-copy"
						}]
					},{
						icon: "fa-info-circle",
						btnId: "details",
						title: "info",
						href: "fa-info-circle"
					}]
				}
			}
		},

		commonProps = {
			beforeEach: function() {

				publishData();
			},

			afterEach: function() {

				Mediator.publish(browser.getChannel("CLEAR"));
			},

			after: function() {

				Mediator.publish(browser.getChannel("DISCONNECT"));
			}
		};

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl])(configBrowser);

			initData();
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("ListImpl tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _Framework, _Select, _ButtonsInRow,
				_NoDataTemplate, _MultiTemplate])(configBrowser);

			initData();
		}
	};

	specificTests = {};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with multiple extensions tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _Select, _Framework])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.bottomListNode, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with framework tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _Select, _ButtonsInRow])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.events.BUTTON_EVENT, "No se ha creado correctamente");
			assert.ok(browser.actions.BUTTON_EVENT, "No se ha creado correctamente");
			assert.ok(browser.actions.CHANGE_ROW_BUTTON_TO_ALT_CLASS, "No se ha creado correctamente");
			assert.ok(browser.actions.CHANGE_ROW_BUTTON_TO_ALT_CLASS, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with buttons in row tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _Select])(configBrowser);

			initData();
		}
	};

	specificTests = {};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with select tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _Select, _NoDataTemplate])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.contentListNoDataClass, "No se ha creado correctamente");
			assert.ok(browser.actions.UPDATE_NO_DATA_TEMPLATE, "No se ha creado correctamente");
			assert.ok(browser.actions.NO_DATA_MSG_CLICKED, "No se ha creado correctamente");
			assert.ok(browser.noDataMessage, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with no data template tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _Select, _MultiTemplate])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.typeGroupProperty, "No se ha creado correctamente");
			assert.ok(browser.actions.ADD_TEMPLATE, "No se ha creado correctamente");
			assert.ok(browser.actions.DELETE_TEMPLATE, "No se ha creado correctamente");
			assert.ok(browser.actions.ADD_TEMPLATE_ROW, "No se ha creado correctamente");
			assert.ok(browser.actions.DELETE_TEMPLATE_ROW, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with multiple template tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([ListImpl, _DragAndDrop])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.events.DRAG_AND_DROP, "No se ha creado correctamente");
			assert.ok(browser.actions.UPDATE_DRAGGABLE_ITEMS, "No se ha creado correctamente");
			assert.ok(browser.actions.DRAG_AND_DROP, "No se ha creado correctamente");
			assert.ok(browser.contentListNode, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with drag and drop tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {
			configBrowser.tableConfig = {
				columns: [{
					property: "name",
					style: "width: 22rem;"
				},{
					property: "name_en",
					style: "width: 20rem;"
				}]
			};

			browser = new declare([ListImpl, _Table])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.headersNode, "No se ha creado correctamente");
			assert.strictEqual(browser._headersData.length, 2, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with table tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			configBrowser.itemByDataList = true;

			configBrowser.formConfig = {
				template: 'src/maintenance/domain/form/Domain',
				modelSchema: '"$schema":"http://json-schema.org/draft-04/schema#","title":"Activity Field DTO","type":"object","properties":{"id":{"type":["integer","null"]},"name":{"type":"string","minLength":1,"maxLength":150},"name_en":{"type":"string","minLength":1,"maxLength":150}},"required":["name","name_en"]}'
			};

			browser = new declare([ListImpl, _EditionTable])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.isUndefined(browser.form, "No se ha creado correctamente");
		},

		"Should_CreateAndShowForm_When_ClickEditRow": function() {

			browser._rows['1'].instance.buttons._groups.edition.buttonNode.click();

			assert.ok(browser.form, "No se ha creado correctamente");
		},

		"Should_RestoreRow_When_DeleteForm": function() {

			browser._rows['1'].instance.buttons._groups.edition.buttonNode.click();

			Mediator.publish(browser.form.getChannel("HIDE"));
		},

		"Should_ChangeFormRow_When_ClickOtherEditRow": function() {

			browser._rows['1'].instance.buttons._groups.edition.buttonNode.onclick();

			var dfd = this.async(timeout),
				instance = browser._rows['2'].instance;
				form = browser.form;

			assert.ok(form, "No se ha cambiado correctamente");

			Mediator.once(form.getChannel('SHOW'), function(obj) {

				assert.strictEqual(obj.data.id, 2, "No se ha cambiado correctamente");
				dfd.resolve();
			});

			instance.buttons._groups.edition.buttonNode.onclick();
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("ListImpl with table edition tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//
});
