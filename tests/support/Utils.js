define([
	'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/node!fs'
	, 'dojo/promise/all'
	, 'require'
	, 'RWidgets/Utilities'
	, './Config'
], function (
	lang
	, Deferred
	, fs
	, all
	, require
	, Utilities
	, Config
) {

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	return {
		getTestPageUrl: function(testPath) {
			//	summary:
			//		Devuelve la URL a la página aislada de testeo, acompañada de la ruta hasta el script específico
			//		para el test actual.

			var pagePath = 'tests/support/pages/test.html',
				scriptPath = '/' + testPath.substring(0, testPath.length - 3) + Config.env.scriptSuffix + '.js',
				urlParams = '?script=' + scriptPath;

			return require.toUrl(pagePath) + urlParams;
		},

		inspectAfterTests: function(test, remote) {
			//	summary:
			//		Reune las acciones de mostrar errores y limpiar almacenamiento remotos.

			this.getBrowserLogs(test, remote);

			this.takeScreenshot(test, remote);

			return this.clearStorage(remote);
		},

		getBrowserLogs: function(test, remote) {
			//	summary:
			//		En caso de error del test, obtiene los mensajes de log del navegador donde se ha ejecutado y los
			//		muestra en consola.

			if (!test || test.hasPassed) {
				return remote;
			}

			return remote.getAvailableLogTypes()
				.then(function(logTypes) {

					var desiredLogType = 'browser';

					if (logTypes.indexOf(desiredLogType) === -1) {
						return this.parent;
					}

					return this.parent.getLogsFor(desiredLogType)
						.then(function(logs) {

							console.log('\nBrowser log messages:\n', logs, '\n');
						});
				});
		},

		takeScreenshot: function(test, remote) {
			//	summary:
			//		En caso de error del test, realiza una captura de la pantalla del navegador en el momento del fallo.

			if (!test || test.hasPassed) {
				return remote;
			}

			var suiteName = test.parent.name,
				testName = test.name,
				name = suiteName + ' - ' + testName,
				filePath = Config.env.reportersOutputPath + '/screenshots/';

			return remote
				.takeScreenshot()
				.then(function(buffer) {

					if (!fs.existsSync(filePath)) {
						fs.mkdirSync(filePath);
					}

					fs.writeFileSync(filePath + name + '.png', buffer);
				});
		},

		clearStorage: function(remote) {
			//	summary:
			//		Limpia el contenido de localStorage del navegador donde se ha ejecutado el test.

			return remote._session.clearLocalStorage();
		},

		clickElement: function(elementSelector) {
			//	summary:
			//		Busca el elemento correspondiente al selector especificado y clickea sobre él.

			return function() {

				return this.parent
					.findByCssSelector(elementSelector)
						.click();
			};
		},

		clickDisplayedElement: function(elementSelector) {
			//	summary:
			//		Busca el elemento mostrado correspondiente al selector especificado y clickea sobre él.

			return function() {

				return this.parent
					.findDisplayedByCssSelector(elementSelector)
						.click();
			};
		},

		clickInToTab: function(index, selector) {

			var iconMenuTableListSelector = 'div.dijitTabController > :first-child',
				tabTableListSelector = 'div.dijitPopup table.dijitMenuTable tbody';

			if (!selector) {
				selector = 'div[role="tablist"]';
			}

			selector = selector + ' > :nth-child(' + index + ')';

			return lang.partial(function(self) {

				return this.parent
					.sleep(Config.timeout.shortSleep)
					.then(self.checkLoadingIsGone())
					.then(self.clickDisplayedElementWithControlError(selector))
					.then(function(success) {

						if (!success) {
							return this.parent
								.then(self.clickElement(iconMenuTableListSelector))
								.then(self.clickElement(tabTableListSelector + ' > :nth-child(' + index + ')'));
						}

						return this.parent;
					});
			}, this);
		},

		clickDisplayedElementWithControlError: function(selector) {

			return function() {

				return this.parent
					.findDisplayedByCssSelector(selector)
						.then(
							function(element) {
								element.click();

								return true;
							},
							function() {
								return false;
							}
						);
			};
		},

		clickElementTakingIntoAccountAlertify: function(selector) {

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickDisplayedElementWithControlError('div.alertify-notifier > div.ajs-visible'))
					.then(function(success) {

						if (!success) {
							return this.parent
								.then(self.clickDisplayedElement(selector));
						}

						return this.parent
							.then(self.clickElementTakingIntoAccountAlertify(selector));
					});
			}, this);
		},

		/*clickElementTakingIntoAccountAlertify: function(selector) {

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickDisplayedElementWithControlError(selector))
					.then(function(success) {

						if (!success) {
							return this.parent
								.then(self.clickDisplayedElement('div.alertify-notifier > div.ajs-visible'))
								.then(self.clickElementTakingIntoAccountAlertify(selector));
						}

						return this.parent;
					});
			}, this);
		},*/

		checkUrl: function(urlExpr) {
			//	summary:
			//		Comprueba si la url actual coincide con la expresión deseada.

			return lang.partial(function(self) {

				var urlRegex = new RegExp('.*' + urlExpr + '$');

				return this.parent
					.getCurrentUrl()
					.then(function(currUrl) {

						assert.match(currUrl, urlRegex, 'La URL actual no coincide con la esperada');
					});
			}, this);
		},

		clickElementAndCheckUrl: function(elementSelector, urlExpr) {
			//	summary:
			//		Busca el elemento correspondiente al selector especificado, clickea sobre él y comprueba si la
			//		url actual coincide con la expresión deseada.

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickElement(elementSelector))
					.then(self.checkUrl(urlExpr));
			}, this);
		},

		clickDisplayedElementAndCheckUrl: function(elementSelector, urlExpr) {
			//	summary:
			//		Busca el elemento mostrado correspondiente al selector especificado, clickea sobre él y comprueba
			//		si la url actual coincide con la expresión deseada.

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickDisplayedElement(elementSelector))
					.then(self.checkUrl(urlExpr));
			}, this);
		},

		clickSidebarSecondaryCategoryAndCheckUrl: function(primaryClassName, secondaryUrl) {
			//	summary:
			//		Despliega Sidebar en la categoría primaria especificada y pulsa la categoría secundaria deseada,
			//		comprobando que se haya actualizado la ruta actual.

			return lang.partial(function(self) {

				var primarySelector = 'li.' + primaryClassName,
					secondarySelector = 'nav.secondary li a[href="' + secondaryUrl + '"]';

				return this.parent
					.then(self.clickElement(primarySelector))
					.sleep(Config.timeout.shortSleep)
					.then(self.clickDisplayedElementAndCheckUrl(secondarySelector, secondaryUrl));
			}, this);
		},

		clickSidebarPrimaryCategoryAndCheckUrl: function(primaryUrl) {
			//	summary:
			//		Pulsa la categoría primaria deseada, comprobando que se haya actualizado la ruta actual.

			return lang.partial(function(self) {

				var primarySelector = 'nav.primary li a[href="' + primaryUrl + '"]';

				return this.parent
					.then(self.clickDisplayedElementAndCheckUrl(primarySelector, primaryUrl));
			}, this);
		},

		clickDashboardButtonAndCheckUrl: function(buttonUrl) {
			//	summary:
			//		Pulsa el botón deseado y comprueba que se haya actualizado la ruta actual.

			return lang.partial(function(self) {

				var buttonSelector = 'a[href="' + buttonUrl + '"]';

				return this.parent
					.sleep(Config.timeout.shortSleep)
					.then(self.clickDisplayedElementAndCheckUrl(buttonSelector, buttonUrl));
			}, this);
		},

		acceptCookies: function() {
			//	summary:
			//		Acepta (si no están ya aceptadas) las cookies clickeando sobre el aviso de las mismas.

			var cookiesNoticeSelector = Config.selector.cookiesNotice,
				cookiesAcceptedKey = 'REDMIC_cookiesAccepted';

			return lang.partial(function(self) {

				var values = {};

				this.parent._session
					.getLocalStorageItem(cookiesAcceptedKey)
					.then(lang.partial(function(values, cookiesAccepted) {

						values.cookiesAccepted = cookiesAccepted;
					}, values));

				if (values.cookiesAccepted) {
					return;
				}

				return this.parent
					.sleep(Config.timeout.longSleep)
					.then(self.clickElement(cookiesNoticeSelector));
			}, this);
		},

		getNotificationCount: function() {
			//	summary:
			//		Abre la bandeja de notificaciones y devuelve cuantas notificaciones hay actualmente.

			// TODO refactorizar todos los métodos relativos a notificaciones
			var notificationListSelector = 'div.containerNotificationSidebar div.notificationList',
				notificationRowsSelector = notificationListSelector + ' div.rowsContainer > div.containerRow',
				values = {};

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickElement(Config.selector.notificationArea))
					.findAllByCssSelector(notificationRowsSelector)
						.then(lang.partial(function(values, notifications) {

							values.count = notifications.length;

							return this.parent;
						}, values))
						.end()
					.then(self.clickElement(Config.selector.notificationArea))
					.sleep(Config.timeout.veryShortSleep)
					.then(lang.partial(function(notifications) {

						return values.count;
					}, values));
			}, this);
		},

		getLatestNotificationId: function() {
			//	summary:
			//		Abre la bandeja de notificaciones y devuelve el id de la notificación más reciente.

			// TODO refactorizar todos los métodos relativos a notificaciones
			var notificationListSelector = 'div.containerNotificationSidebar div.notificationList',
				notificationRowsSelector = notificationListSelector + ' div.rowsContainer > div.containerRow',
				notificationLabelSelector = 'span.rowList',
				values = {};

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickElement(Config.selector.notificationArea))
					.findByCssSelector(notificationRowsSelector)
						.findByCssSelector(notificationLabelSelector)
							.getAttribute('data-redmic-id')
							.then(lang.partial(function(values, id) {

								values.id = id;

								return this.parent;
							}, values))
							.end()
						.end()
					.then(self.clickElement(Config.selector.notificationArea))
					.sleep(Config.timeout.veryShortSleep)
					.then(lang.partial(function(notifications) {

						return values.id;
					}, values));
			}, this);
		},

		setInputValue: function(inputSelector, value) {
			//	summary:
			//		Busca el elemento input especificado y escribe en él el valor deseado.

			// TODO se realiza el type con espacio y borrador de este para corregir un fallo, si no se hace esto
			// el input no reacciona al cambio.

			return function() {

				return this.parent
					.findByCssSelector(inputSelector)
						.clearValue()
						.type(value);
			};
		},

		getInputValue: function(inputSelector) {
			//	summary:
			//		Busca el elemento input especificado y recupera su valor actual.

			return function() {

				return this.parent
					.findByCssSelector(inputSelector)
						.getProperty('value');
			};
		},

		getFormValue: function() {
			//	summary:
			//		Busca los inputs de un form y devuelve una promesa de array que contendrá sus valores.

			var inputContainerSelector = 'div.rightContainer ',

				textInputSelector = inputContainerSelector +
					'div.dijitReset.dijitInputField.dijitInputContainer > input',

				textAreaSelector = inputContainerSelector + 'textarea',
				filteringSelectSelector = inputContainerSelector + 'div.textSearch > input.inputSearch',

				inputsSelectors = [
					textInputSelector
					, textAreaSelector
					, filteringSelectSelector
				];

			return function() {

				return this.parent
					.findAllByCssSelector(inputsSelectors.join(','))
						.getProperty('value');
			};
		},

		getFormFieldsProperties: function(filter) {
			//	summary:
			//		Busca las propiedades de los inputs de un form, y devuelve una promesa que se
			//		resolverá con un array de objetos con las propiedades: tipo, nombre y requirido).

			return lang.partial(function(self) {

				return this.parent
					.then(lang.hitch(self, self._getFormFieldsProperties)())
					.then(function(fields) {

						var fieldsValid = [],
							field;

						if (filter) {
							for (var i = 0; i < fields.length; i++) {

								field = fields[i];

								if (field.children) {
									fieldsValid.push(field);
								}

							}
						} else {
							fieldsValid = fields;
						}

						return fieldsValid;
					});
			}, this);
		},

		_getFormFieldsProperties: function() {
			//	summary:
			//		Busca las propiedades de los inputs de un form, y devuelve una promesa que se
			//		resolverá con un array de objetos con las propiedades: tipo, nombre y requirido).

			return lang.partial(function(self) {

				var findRequiredField = function(args, required) {

					var dfd = args.dfd,
						properties = args.properties;

					if (required === 'true') {
						properties.required = true;
					}

					dfd.resolve(properties);
				};

				return this.parent
					.findAllByCssSelector(Config.selector.form + ' div[data-redmic-model]')
						.then(lang.partial(function(self, fields) {

							var dfds = [];

							for (var i = 0; i < fields.length; i++) {
								var field = fields[i],
									dfd = new Deferred(),
									args = {
										dfd: dfd,
										properties: {}
									};

								dfds.push(dfd);

								field.getAttribute('data-redmic-model')
									.then(lang.partial(function(args, fieldName) {

										args.properties.name = fieldName;
									}, args));

								field.getAttribute('data-redmic-type')
									.then(lang.partial(function(args, type) {

										args.properties.type = type;
									}, args));

								field.getProperty('children')
									.then(lang.partial(function(args, children) {

										args.properties.children = children.length;
									}, args));

								field.getAttribute('required')
									.then(lang.partial(findRequiredField, args));
							}

							return all(dfds);
						}, self));
			}, this);
		},

		checkFormIsEmpty: function(selectorForm) {
			//	summary:
			//		Busca un form y comprueba que sus inputs están vacíos.

			return lang.partial(function(self) {

				if (!selectorForm) {
					selectorForm = Config.selector.form;
				}

				return this.parent
					.findByCssSelector(selectorForm)
						.then(self.getFormValue())
						.then(function(values) {

							var uniqueValues = Utilities.uniq(values);

							assert.lengthOf(uniqueValues, 1,
								'Se han encontrado valores distintos en un formulario vacío');

							assert.strictEqual(uniqueValues[0], '', 'Se ha encontrado un valor en un formulario vacío');
						});
			}, this);
		},

		checkFormIsFilled: function() {
			//	summary:
			//		Busca un form y comprueba no tiene inputs requeridos vacíos.

			return lang.partial(function(self) {

				var obj = {};

				return this.parent
					.findByCssSelector(Config.selector.form)
						.then(self.getFormFieldsProperties())
						.then(lang.partial(function(obj, fieldsProperties) {

							obj.fieldsProperties = fieldsProperties;
						}, obj))

						.then(self.getFormValue())
						.then(lang.partial(function(obj, values) {

							var fieldsProperties = obj.fieldsProperties;

							assert.strictEqual(values.length, fieldsProperties.length,
								'No coincide el número de elementos encontrados de campos y valores');

							for (var i = 0; i < values.length; i++) {
								if (fieldsProperties[i].required) {
									assert.notStrictEqual(values[i], 'Se ha encontrado un valor requerido vacío');
								}
							}
						}, obj));
			}, this);
		},

		clickFirstOptionInFilteringSelect: function(cssSelector) {
			//	summary:
			//		Pulsa la primera opción del filtering select.

			return lang.partial(function(self) {

				return this.parent
					.setFindTimeout(Config.timeout.longFindElement)
					.sleep(Config.timeout.shortSleep)
					.then(self.clickElement(cssSelector + ' div.containerFilteringSelect div.buttonSearch'))
					.then(self.checkLoadingIsGone())
					.findByCssSelector('div.filteringResult > :first-child')
						.getVisibleText()
						.then(function(text) {
							assert.notStrictEqual(text, '');
						})
						.click()
					.setFindTimeout(Config.timeout.findElement);
			}, this);
		},

		setInputValueInFilteringSelect: function(cssSelector, value) {
			//	summary:
			//		Pulsa la primera opción del filtering select.

			return lang.partial(function(self) {

				return this.parent
					.then(self.setInputValue(cssSelector + ' input.inputSearch', value))
					.then(self.checkLoadingIsGone())
					.then(self.clickElement(cssSelector + ' div.containerFilteringSelect div.buttonSearch'));
			}, this);
		},

		clickOptionInSelect: function(cssSelector, value) {
			//	summary:
			//		Pulsa opción del select.

			return lang.partial(function(self) {

				var selectItem = 'div.dijitPopup.dijitMenuPopup table[tabindex="-1"] tr[aria-label="' + value + ' "]';

				return this.parent
					.then(self.clickElement(cssSelector + ' td.dijitButtonNode'))
					.then(self.checkLoadingIsGone())
					.then(self.clickElement(selectItem));
			}, this);
		},

		clickFirstOptionInSelect: function(cssSelector, value) {
			//	summary:
			//		Pulsa opción del select.

			return lang.partial(function(self) {

				var selectItem = 'div.dijitPopup.dijitMenuPopup table[tabindex="-1"] tr[tabindex="-1"]';

				return this.parent
					.then(self.clickElement(cssSelector + ' td.dijitButtonNode'))
					.then(self.checkLoadingIsGone())
					.then(self.clickElement(selectItem));
			}, this);
		},

		clickInDateTooltip: function(cssSelector) {
			//	summary:
			//		Expande el calendario y realiza un click en un valor.

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickElement(cssSelector + ' div.additionalOptionInput div.contentClick'))
					.sleep(Config.timeout.shortSleep)
					.then(self.clickElement('tbody tr:last-child td:last-child span.dijitCalendarDateLabel'))
					.then(self.clickElement(cssSelector + ' div.additionalOptionInput div.contentClick'));
			}, this);
		},

		registerTests: function(config) {
			//	summary:
			//		Registra los test definidos en config.

			var definition = config.definition,
				properties = config.properties,
				suiteName = config.suiteName,

				testsDefinition = new definition(properties),
				suiteDefinition = testsDefinition.getSuiteDefinition();

			registerSuite(suiteName, suiteDefinition);
		},

		getProperties: function(suiteContext, /*string?*/ propName) {
			//	summary:
			//		Permite obtener desde una suite de tests concreta la/s propiedad/es recibidas desde el exterior.
			//		Se puede llamar desde un 'setup' con contexto 'this' o desde un método de test con contexto
			//		'this.parent'. Es decir, siempre hay que pasarle el contexto de la suite de tests.

			var config = suiteContext.externalContext.config;

			return propName ? config[propName] : config;
		},

		_notSameOrderedMembers: function(a, b, msg) {
			// TODO esto debería estar con el mismo nombre como método de 'assert' (chai 4.1). Cuando internjs se
			// actualice, hacer uso de ese y borrar este

			if (a.length !== b.length) {
				return true;
			}

			for (var i = 0; i < a.length; i++) {
				var aItem = a[i],
					bItem = b[i];

				if (aItem !== bItem) {
					return true;
				}
			}

			return false;
		},

		notSameOrderedMembers: function(a, b, msg) {
			// TODO esto debería estar con el mismo nombre como método de 'assert' (chai 4.1). Cuando internjs se
			// actualice, hacer uso de ese y borrar este

			assert(this._notSameOrderedMembers(a, b), msg);
		},

		sameOrderedMembers: function(a, b, msg) {
			// TODO esto debería estar con el mismo nombre como método de 'assert' (chai 4.1). Cuando internjs se
			// actualice, hacer uso de ese y borrar este

			assert(!this._notSameOrderedMembers(a, b), msg);
		},

		findUpdatedNotificationById: function(id) {
			//	summary:
			//		Espera a que se actualice la notificación más reciente.

			// TODO refactorizar todos los métodos relativos a notificaciones
			var notificationListSelector = 'div.containerNotificationSidebar div.notificationList',
				notificationRowsSelector = notificationListSelector + ' div.rowsContainer > div.containerRow',
				updatedNotificationLabelSelector = 'span.rowList[data-redmic-id="' + id + '"]',
				successfullyUpdatedSelector = updatedNotificationLabelSelector + ' span.success';

			return lang.partial(function(self) {

				return this.parent
					.then(self.clickElement(Config.selector.notificationArea))
					.sleep(Config.timeout.veryShortSleep)
					.findByCssSelector(notificationRowsSelector)
						.setFindTimeout(Config.timeout.veryLongFindElement)
						// TODO buscar tambien, con or, fallidos y cancelados
						.findByCssSelector(successfullyUpdatedSelector)
							.end()
						.setFindTimeout(Config.timeout.findElement)
						.end()
					.then(self.clickElement(Config.selector.notificationArea))
					.sleep(Config.timeout.veryShortSleep);
			}, this);
		},

		checkLoadingIsGone: function() {
			//	summary:
			//		Comprueba que no exista ningún cargando en la aplicación.
			//		Si encuentra alguno, espera hasta que se elimine.
			//		Si supera el limite de carga devuelve un error.

			function onLoadingItemFound(args, elements) {

				args.loadingItemsFound++;

				return this
					.then(lang.hitch(this, seekLoadingItems, args));
			}

			function seekLoadingItems(args) {

				if (args.loadingItemsFound >= Config.counter.findLoading) {

					this.setFindTimeout(Config.timeout.findElement);
					throw new Error('Limite de tiempo de carga superado');
				}

				return this
					.sleep(Config.timeout.veryShortSleep)
					.findByCssSelector('*' + Config.selector.loading)
					.then(lang.hitch(this, onLoadingItemFound, args), function() {});
			}

			return function() {

				return this.parent
					.setFindTimeout(Config.timeout.shortFindElement)
					.then(lang.hitch(this.parent, seekLoadingItems, {
						loadingItemsFound: 0
					}))
					.setFindTimeout(Config.timeout.findElement);
			};
		},

		findAndCheckVisibleText: function(cssSelector, value) {
			//	summary:
			//		Pasado un css selector y un valor, busca el nodo y compara el valor visible

			return function() {

				return this.parent
					.findByCssSelector(cssSelector)
						.getVisibleText()
						.then(function(text) {

							assert.strictEqual(text, value);
						});
			};
		},

		childrenInNode: function(cssSelector, value) {
			//	summary:
			//		Pasado un css selector y un valor, cuenta sus hijos y compara

			return function() {

				return this.parent
					.findByCssSelector(cssSelector)
						.getProperty('children')
						.then(function(children) {

							assert.strictEqual(children.length, value);
						});
			};
		}
	};
});
