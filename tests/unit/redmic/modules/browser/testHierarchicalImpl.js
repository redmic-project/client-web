define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "redmic/base/Mediator"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/browser/_HierarchicalDragAndDrop"
	, "redmic/modules/browser/_HierarchicalLazyLoad"
	, "redmic/modules/browser/_HierarchicalSelect"
	, "redmic/modules/browser/_HierarchicalTable"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/_NoDataTemplate"
	, "redmic/modules/browser/HierarchicalImpl"
	, "templates/DomainList"
], function(
	declare
	, lang
	, domClass
	, Mediator
	, _ButtonsInRow
	, _Framework
	, _GeoJsonParser
	, _HierarchicalDragAndDrop
	, _HierarchicalLazyLoad
	, _HierarchicalSelect
	, _HierarchicalTable
	, _MultiTemplate
	, _NoDataTemplate
	, HierarchicalImpl
	, template
){
	var timeout = 500,
		parentChannel = "containerList",
		target = "/test/domain",
		browser, item, data, specificProps, specificTests,

		registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		publishData = function(objData) {

			Mediator.publish(browser._buildChannel(browser.storeChannel, browser.actions.AVAILABLE), {
				body: {
					data: objData || data,
					target: target
				}
			});
		},

		publishItem = function(data) {

			Mediator.publish(browser._buildChannel(browser.storeChannel, browser.actions.ITEM_AVAILABLE), {
				body: {
					data: data || item,
					target: target
				}
			});
		},

		getMixedRow = function(idProperty) {

			return Object.keys(getRow(idProperty).mixed).length;
		},

		getSelectedRow = function(idProperty) {

			return Object.keys(getRow(idProperty).selected).length;
		},

		getRow = function(idProperty) {

			return browser._getRow(idProperty);
		},

		commonTests = {
			"Should_HaveStructuresAvailable_When_ModuleListIsInitialized": function() {

				assert.ok(browser, "No se ha creado correctamente");
				assert.ok(browser.contentListNode, "No se ha creado correctamente");
				assert.ok(browser.rowsContainerNode, "No se ha creado correctamente");
				assert.ok(browser.template, "No se ha creado correctamente");
			},

			"Should_HaveRowsStructureCreated_When_ReceiveData": function() {

				console.error(browser._rows);

				assert.isOk(getRow('1').instance, "No se ha añadido correctamente");
				assert.strictEqual(getRow('1').children.length, 2, "No se ha añadido correctamente");
				assert.strictEqual(getRow('1').leaves, 2, "No se ha añadido correctamente");
				assert.isTrue(getRow('1').pendingChildren, "No se ha añadido correctamente");

				assert.isNull(getRow('111').instance, "No se ha añadido correctamente");
				assert.strictEqual(getRow('111').children.length, 0, "No se ha añadido correctamente");
				assert.strictEqual(getRow('111').leaves, 0, "No se ha añadido correctamente");

				assert.isNull(getRow('101').instance, "No se ha añadido correctamente");
				assert.strictEqual(getRow('101').children.length, 1, "No se ha añadido correctamente");
				assert.strictEqual(getRow('101').leaves, 1, "No se ha añadido correctamente");

				assert.isNull(getRow('201').instance, "No se ha añadido correctamente");
				assert.strictEqual(getRow('201').children.length, 0, "No se ha añadido correctamente");
				assert.strictEqual(getRow('201').leaves, 0, "No se ha añadido correctamente");
			},

			"Should_AddData_When_ReceiveDataAvailablePublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('REFRESHED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 28, "No se ha añadido correctamente");

					assert.isNull(getRow('101').instance, "No se ha añadido correctamente");
					assert.isNull(getRow('201').instance, "No se ha añadido correctamente");
					dfd.resolve();
				});

				publishData();
			},

			"Should_AddItem_When_ReceiveItemAvailablePublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('DATA_ADDED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 28, "No se ha añadido correctamente");
					dfd.resolve();
				});

				publishItem();
			},

			"Should_UpdateItem_When_ReceiveItemAvailablePublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('DATA_ADDED'), function() {

					assert.strictEqual(getRow('1').data.name, 'hola', "No se ha actualizado correctamente");
					assert.strictEqual(Object.keys(browser._rows).length, 28, "No se ha actualizado correctamente");
					dfd.resolve();
				});

				var data = lang.clone(item);

				data.name = 'hola';

				publishItem(data);
			},

			"Should_RemoveItem_When_ReceiveRemoveItemPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('DATA_REMOVED'), function() {

					assert.strictEqual(Object.keys(browser._rows).length, 24, "No se ha eliminado correctamente");
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

					assert.strictEqual(item.name, req.item.name, "No se ha enviado correctamente");
					assert.strictEqual(item.id, req.item.id, "No se ha enviado correctamente");
					assert.strictEqual(item.path, req.item.path, "No se ha enviado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("GET_ITEM"), {
					idProperty: 1
				});
			},

			"Should_GotRowChannel_When_ReceiveGetRowChannelPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('GOT_ROW_CHANNEL'), function(req) {

					assert.strictEqual(req.channel, getRow('1').instance.getChannel(),
						"No se ha enviado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("GET_ROW_CHANNEL"), {
					idProperty: 1
				});
			},

			"Should_SetTemplate_When_ReceiveUpdateTemplatePublication": function() {

				var templateNew = function() { return 'Hola';},
					dfd = this.async(timeout);

				Mediator.once(browser.getChannel('TEMPLATE_UPDATED'), function() {

					assert.strictEqual(browser.template(), templateNew(), "No se ha actualizado correctamente");

					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("UPDATE_TEMPLATE"), {
					template: templateNew
				});
			},

			"Should_AddChildren_When_ReceiveExpandRowPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {
					assert.isOk(getRow('101').instance, "No se ha expandido correctamente");
					assert.isNull(getRow('201').instance, "No se ha expandido correctamente");

					Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {
						assert.isOk(getRow('201').instance, "No se ha expandido correctamente");
						dfd.resolve();
					});

					Mediator.publish(browser.getChannel("EXPAND_ROW"), {
						idProperty: 101
					});
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			},

			"Should_HiddenChildren_When_ReceiveCollapseRowPublication": function() {

				var dfd = this.async(timeout);

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {
					assert.isOk(getRow('101').instance, "No se ha expandido correctamente");
					assert.isNull(getRow('201').instance, "No se ha expandido correctamente");

					Mediator.once(browser.getChannel('COLLAPSED_ROW'), function() {
						assert.isTrue(domClass.contains(getRow('101').instance.containerChildren, 'hidden'),
							"No se ha collapsado correctamente");

						dfd.resolve();
					});

					Mediator.publish(browser.getChannel("COLLAPSE_ROW"), {
						idProperty: 1
					});
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
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

			"Should_HaveSeletedRowsStructureCreated_When_ReceiveData": function() {

				assert.strictEqual(getSelectedRow('1'), 0, "No se ha añadido correctamente");

				assert.strictEqual(getSelectedRow('111'), 0, "No se ha añadido correctamente");

				assert.strictEqual(getSelectedRow('101'), 0, "No se ha añadido correctamente");

				assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");
			},

			"Should_SelectedParent_When_SelectChildren": function() {

				var instanceRowParent = getRow('2').instance,
					selectContainerClass = instanceRowParent.selectContainerClass;

				browser._selectRow(102);

				assert.strictEqual(getSelectedRow('2'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('102'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('202'), 0, "No se ha añadido correctamente");

				assert.isTrue(domClass.contains(instanceRowParent.domNode, selectContainerClass),
					"No se ha cambiado a seleccionado correctamente");
			},

			"Should_MixedParent_When_SelectChild": function() {

				var instanceRowParent = getRow('1').instance,
					mixedClass = instanceRowParent.mixedSelectionContainerClass;

				browser._selectRow(101);

				assert.strictEqual(getSelectedRow('1'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");

				assert.isTrue(domClass.contains(instanceRowParent.domNode, mixedClass),
					"No se ha cambiado a mixed correctamente");
			},

			"Should_SelectedParent_When_SelectChildrenExpanded": function() {

				var dfd = this.async(timeout),
					instanceRowParent = getRow('2').instance,
					selectContainerClass = instanceRowParent.selectContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {
					browser._selectRow(102);

					assert.strictEqual(getSelectedRow('2'), 1, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('102'), 1, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('202'), 0, "No se ha añadido correctamente");

					assert.isTrue(domClass.contains(instanceRowParent.domNode, selectContainerClass),
						"No se ha cambiado a seleccionado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 2
				});
			},

			"Should_MixedParent_When_SelectChildExpanded": function() {

				var dfd = this.async(timeout),
					instanceRowParent = getRow('1').instance,
					mixedClass = instanceRowParent.mixedSelectionContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					browser._selectRow(101);

					assert.strictEqual(getSelectedRow('1'), 1, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");

					assert.isTrue(domClass.contains(instanceRowParent.domNode, mixedClass),
						"No se ha cambiado a mixed correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			},

			"Should_MixedGrandParentAndSelectParent_When_SelectGrandChildExpanded": function() {

				var dfd = this.async(timeout),
					instanceRowParent = getRow('1').instance,
					selectContainerClass = instanceRowParent.selectContainerClass,
					mixedClass = instanceRowParent.mixedSelectionContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

						browser._selectRow(201);

						assert.strictEqual(getSelectedRow('1'), 1, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");

						assert.isTrue(domClass.contains(getRow('1').instance.domNode, mixedClass),
							"No se ha cambiado a mixed correctamente");

						assert.isTrue(domClass.contains(getRow('101').instance.domNode, selectContainerClass),
							"No se ha cambiado a mixed correctamente");

						assert.isTrue(domClass.contains(getRow('201').instance.domNode, selectContainerClass),
							"No se ha cambiado a mixed correctamente");

						dfd.resolve();
					});

					Mediator.publish(browser.getChannel("EXPAND_ROW"), {
						idProperty: 101
					});
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			},

			"Should_DeselectGrandParentAndParent_When_DeselectGrandChildExpanded": function() {

				var dfd = this.async(timeout),
					instanceRowParent = getRow('1').instance,
					selectContainerClass = instanceRowParent.selectContainerClass,
					mixedClass = instanceRowParent.mixedSelectionContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

						browser._selectRow(201);
						browser._deselectRow(201);

						assert.strictEqual(getSelectedRow('1'), 0, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('101'), 0, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");

						assert.isFalse(domClass.contains(getRow('1').instance.domNode, mixedClass),
							"No se ha cambiado a mixed correctamente");

						assert.isFalse(domClass.contains(getRow('101').instance.domNode, selectContainerClass),
							"No se ha cambiado a mixed correctamente");

						assert.isFalse(domClass.contains(getRow('201').instance.domNode, selectContainerClass),
							"No se ha cambiado a mixed correctamente");

						dfd.resolve();
					});

					Mediator.publish(browser.getChannel("EXPAND_ROW"), {
						idProperty: 101
					});
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			},

			"Should_DeselectedParent_When_DeselectChildren": function() {

				var instanceRowParent = getRow('2').instance,
					selectContainerClass = instanceRowParent.selectContainerClass;

				browser._selectRow(102);
				browser._deselectRow(102);

				assert.strictEqual(getSelectedRow('2'), 0, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('102'), 0, "No se ha añadido correctamente");

				assert.isFalse(domClass.contains(instanceRowParent.domNode, selectContainerClass),
					"No se ha cambiado a deseleccionado correctamente");
			},

			"Should_MixedParent_When_DeselectChild": function() {

				var instanceRowParent = getRow('1').instance,
					mixedClass = instanceRowParent.mixedSelectionContainerClass,
					selectContainerClass = instanceRowParent.selectContainerClass;

				browser._selectRow(101);
				browser._selectRow(111);
				browser._deselectRow(111);

				assert.strictEqual(getSelectedRow('1'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('111'), 0, "No se ha añadido correctamente");

				assert.isTrue(domClass.contains(instanceRowParent.domNode, mixedClass),
					"No se ha cambiado a mixed correctamente");
			},

			"Should_MixedParent_When_MixedChild": function() {

				var instanceRowParent = getRow('1').instance,
					mixedClass = instanceRowParent.mixedSelectionContainerClass,
					selectContainerClass = instanceRowParent.selectContainerClass;

				browser._rows['101'].leaves = 2;

				publishItem({
					id: 211,
					leaves: 0,
					name: "name_211",
					name_en: "name_en_211",
					path: "r.1.101.211"
				});

				browser._selectRow(201);

				assert.strictEqual(getSelectedRow('1'), 0, "No se ha añadido correctamente");
				assert.strictEqual(getMixedRow('1'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");
				assert.strictEqual(getSelectedRow('211'), 0, "No se ha añadido correctamente");

				assert.isTrue(domClass.contains(instanceRowParent.domNode, mixedClass),
					"No se ha cambiado a mixed correctamente");
			},

			"Should_DeselectedParent_When_DeselectChildrenExpanded": function() {

				var dfd = this.async(timeout),
					instanceRowParent = getRow('2').instance,
					selectContainerClass = instanceRowParent.selectContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					browser._selectRow(102);
					browser._deselectRow(102);

					assert.strictEqual(getSelectedRow('2'), 0, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('102'), 0, "No se ha añadido correctamente");

					assert.isFalse(domClass.contains(instanceRowParent.domNode, selectContainerClass),
						"No se ha cambiado a deseleccionado correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 2
				});
			},

			"Should_MixedParent_When_DeselectChildExpanded": function() {

				var dfd = this.async(timeout),
					instanceRowParent = getRow('1').instance,
					mixedClass = instanceRowParent.mixedSelectionContainerClass,
					selectContainerClass = instanceRowParent.selectContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					browser._selectRow(101);
					browser._selectRow(111);
					browser._deselectRow(111);

					assert.strictEqual(getSelectedRow('1'), 1, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('111'), 0, "No se ha añadido correctamente");

					assert.isTrue(domClass.contains(instanceRowParent.domNode, mixedClass),
						"No se ha cambiado a mixed correctamente");
					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			},

			"Should_SelectedChildren_When_SelectParentExpanded": function() {

				var dfd = this.async(timeout),
					selectContainerClass = getRow('1').instance.selectContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					browser._selectRow(1);

					Mediator.once(browser.getChannel('COLLAPSED_ROW'), function() {

						assert.strictEqual(getSelectedRow('1'), 2, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('101'), 1, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('111'), 0, "No se ha añadido correctamente");
						assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");

						assert.isTrue(domClass.contains(getRow('101').instance.domNode, selectContainerClass),
							"No se ha cambiado a seleccionado correctamente");

						assert.isTrue(domClass.contains(getRow('111').instance.domNode, selectContainerClass),
							"No se ha cambiado a seleccionado correctamente");

						assert.isTrue(domClass.contains(getRow('1').instance.domNode, selectContainerClass),
							"No se ha cambiado a seleccionado correctamente");

						dfd.resolve();
					});

					Mediator.publish(browser.getChannel("COLLAPSE_ROW"), {
						idProperty: 1
					});
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			},

			"Should_DeselectedChildren_When_DeselectParentExpanded": function() {

				var dfd = this.async(timeout),
					selectContainerClass = getRow('1').instance.selectContainerClass;

				Mediator.once(browser.getChannel('EXPANDED_ROW'), function() {

					browser._selectRow(1);
					browser._deselectRow(1);

					assert.strictEqual(getSelectedRow('1'), 0, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('101'), 0, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('111'), 0, "No se ha añadido correctamente");
					assert.strictEqual(getSelectedRow('201'), 0, "No se ha añadido correctamente");

					assert.isFalse(domClass.contains(getRow('101').instance.domNode, selectContainerClass),
						"No se ha cambiado a deseleccionado correctamente");

					assert.isFalse(domClass.contains(getRow('111').instance.domNode, selectContainerClass),
						"No se ha cambiado a deseleccionado correctamente");

					assert.isFalse(domClass.contains(getRow('1').instance.domNode, selectContainerClass),
						"No se ha cambiado a seleccionado correctamente");

					dfd.resolve();
				});

				Mediator.publish(browser.getChannel("EXPAND_ROW"), {
					idProperty: 1
				});
			}
		},

		initData = function() {

			data = [];

			for (var i = 1; i <= 10; i++) {
				item = {
					id: i,
					name: 'name_' + i,
					name_en: 'name_en_' + i,
					path: 'r.' + i,
					leaves: 1
				};

				data.push(item);
			}

			for (i = 1; i <= 9; i++) {
				item = {
					id: (i + 100),
					name: 'name_' + (i + 100),
					name_en: 'name_en_' + (i + 100),
					path: 'r.' + (i) + '.' +  (i + 100),
					leaves: 1
				};

				data.push(item);
			}

			for (i = 1; i <= 8; i++) {
				item = {
					id: (i + 200),
					name: 'name_' + (i + 200),
					name_en: 'name_en_' + (i + 200),
					path: 'r.' + (i) + '.' +  (i + 100) + '.' +  (i + 200),
					leaves: 0
				};

				data.push(item);
			}

			data[0].leaves ++;

			data.push({
				id: 111,
				name: 'name_111',
				name_en: 'name_en_111',
				path: 'r.1.111',
				leaves: 0
			});

			item = {
				id: 1,
				name: 'name_1',
				name_en: 'name_en_1',
				path: 'r.1',
				leaves: 1
			};
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

			browser = new declare([HierarchicalImpl])(configBrowser);

			initData();
		}
	};

	lang.mixin(specificProps, commonProps);
	specificProps.tests = commonTests;
	registerSuite("HierarchicalImpl tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _Framework, _HierarchicalSelect,
				_ButtonsInRow, _NoDataTemplate, _MultiTemplate])(configBrowser);

			initData();
		}
	};

	specificTests = {};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with multiple extensions tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _Framework])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.bottomListNode, "No se ha creado correctamente");
		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with framework tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _ButtonsInRow])(configBrowser);

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
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with buttons in row tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _HierarchicalSelect])(configBrowser);

			initData();
		}
	};

	specificTests = {};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with select tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _NoDataTemplate])(configBrowser);

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
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with no data template tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _MultiTemplate])(configBrowser);

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
	lang.mixin(specificTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with multiple template tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			configBrowser.targetChildren = target + '/{id}';
			configBrowser.idProperty = 'id';

			browser = new declare([HierarchicalImpl, _HierarchicalLazyLoad])(configBrowser);

			initData();
		}
	};

	specificTests = {
		"Should_HaveStructuresAvailable_When_ModuleIsInitialized": function() {

			assert.ok(browser.actions.SET_QUERY_DATA_CHILDREN, "No se ha creado correctamente");
			assert.ok(browser.conditionParentProperty, "No se ha creado correctamente");
		}
	};

	specificTests2 = {
		"Should_AddChildren_When_ReceiveExpandRowPublication": function() {

			var dfd = this.async(timeout);

			Mediator.once(browser._buildChannel(browser.storeChannel, browser.actions.REQUEST), function() {
				dfd.resolve();
			});

			Mediator.publish(browser.getChannel("EXPAND_ROW"), {
				idProperty: 1
			});
		},

		"Should_HiddenChildren_When_ReceiveCollapseRowPublication": function() {

		}
	};

	lang.mixin(specificProps, commonProps);
	lang.mixin(specificTests, commonTests, specificTests2);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with lazy load tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _HierarchicalDragAndDrop, _HierarchicalSelect])(configBrowser);

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
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with drag and drop tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//

	specificProps = {
		before: function() {

			browser = new declare([HierarchicalImpl, _HierarchicalTable, _HierarchicalSelect])(configBrowser);

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
	lang.mixin(specificTests, selectTests, commonTests);
	specificProps.tests = specificTests;
	registerSuite("HierarchicalImpl with table tests", specificProps);

	//---------------------------------------------------------------------------------------------------------//
});
