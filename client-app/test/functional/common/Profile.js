define([
	'dojo/_base/lang'
	, 'test/support/Config'
	, 'test/support/pages/Login'
	, 'test/support/Utils'
], function (
	lang
	, Config
	, LoginPage
	, Utils
) {

	var indexPage,

		userImageContainerSelector = 'div.infoContainer div.imageContainerEdit span',
		userImageSelector = 'div' + Config.selector.notLoading + ' div.imageContainer img',

		newImageUrl = Config.env.cwd + '/tests/support/resources/profile.png',
		emptyImageUrl = '/resources/images/noIMG.png',

		goToProfile = function() {

			var profilePageUrl = '/user',
				profileLinkSelector = 'a[href="' + profilePageUrl + '"]';

			return indexPage
				.login()
				.then(Utils.clickElement(Config.selector.userArea))
				.then(Utils.clickElementAndCheckUrl(profileLinkSelector, profilePageUrl))
				.then(Utils.checkLoadingIsGone());
		},

		setNewProfileImage = function() {

			return function() {

				return this.parent
					.then(Utils.clickElement(userImageContainerSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickElement(Config.selector.clearButton))
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(newImageUrl)
						.sleep(Config.timeout.longSleep)
						.end()
					.then(Utils.clickElement(Config.selector.saveButton))
					.then(Utils.checkLoadingIsGone())
					.sleep(Config.timeout.longSleep);
			};
		};

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert,

		tests = {

			'Should_ShowUserMenu_When_ClickOnUserIcon': function() {

				var userMenuSelector = 'div.dijitPopup.tooltipContainerPopup';

				return indexPage
					.login()
					.then(Utils.clickElement(Config.selector.userArea))
					.findByCssSelector(userMenuSelector)
						.getAttribute('style')
						.then(function(style) {

							assert.notInclude(style, 'display: none');
						});
			},

			'Should_GoToUserProfile_When_ClickOnProfileLink': function() {

				return goToProfile();
			},

			'Should_GoToHomePage_When_ClickOnUserLogout': function() {

				var logoutButtonSelector = 'i.fa-power-off';

				return indexPage
					.login()
					.then(Utils.clickElement(Config.selector.userArea))
					.then(Utils.clickElement(logoutButtonSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.checkUrl(Config.url.home));
			},

			'Should_SetImage_When_UploadNewImage': function() {

				var valuesObj = {};

				return goToProfile()
					// recuerda la ruta de la imagen inicial
					.findByCssSelector(userImageSelector)
						.getProperty('src')
						.then(lang.partial(function(values, src) {

							values.oldValue = src;
						}, valuesObj))
						.end()
					// edita la imagen
					.then(setNewProfileImage())
					// comprueba que haya cambiado la ruta de la imagen
					.findByCssSelector(userImageSelector)
						.getProperty('src')
						.then(lang.partial(function(values, src) {

							assert.notStrictEqual(src, values.oldValue, 'La imagen no ha cambiado');
						}, valuesObj))
						.end();
			},

			'Should_ClearImage_When_SaveEmptyImage': function() {

				return goToProfile()
					.then(setNewProfileImage())
					// limpia la imagen
					.then(Utils.clickElement(userImageContainerSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickElement(Config.selector.clearButton))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickElement(Config.selector.saveButton))
					.then(Utils.checkLoadingIsGone())
					.findByCssSelector(userImageSelector)
						.getProperty('src')
						.then(function(src) {

							assert.include(src, emptyImageUrl, 'La imagen no está vacía');
						})
						.end();
			},

			'Should_DisableSubmitButton_When_UploadMoreThanOneImage': function() {

				return goToProfile()
					.sleep(Config.timeout.shortSleep)
					.then(Utils.clickElement(userImageContainerSelector))
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(newImageUrl)
						.sleep(Config.timeout.longSleep)
						.end()
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(newImageUrl)
						.sleep(Config.timeout.longSleep)
						.end()
					.findByCssSelector(Config.selector.saveButton + '.dijitDisabled');
			},

			'Should_UpdateUsername_When_EditUsername': function() {

				var editButtonSelector = 'div.infoContainer :nth-child(2) div.rowsContainer :first-child i.fa-edit',
					textInputSelector = 'div[data-redmic-model="firstName"] div.dijitInputContainer input',
					valuesObj = {
						newValue: Date.now().toString()
					};

				return goToProfile()
					.then(Utils.clickElement(editButtonSelector))
						.findByCssSelector(textInputSelector)
							.getProperty('value')
							.then(lang.partial(function(values, text) {

								values.oldValue = text;
							}, valuesObj))
							.end()
						.then(Utils.setInputValue(textInputSelector, valuesObj.newValue))
						.then(Utils.clickElement(Config.selector.saveButton))
						.end()
					.then(Utils.checkLoadingIsGone())
					// comprueba el nuevo valor
					.then(Utils.clickElement(editButtonSelector))
						.findByCssSelector(textInputSelector)
							.getProperty('value')
							.then(lang.partial(function(values, text) {

								assert.strictEqual(text, values.newValue, 'El valor seteado no es el esperado');
							}, valuesObj))
							// restaura el valor original
							.clearValue()
							.then(lang.partial(function(values) {

								this.type(values.oldValue);
							}, valuesObj))
							.end()
						.then(Utils.clickElement(Config.selector.saveButton))
						.end();
			},

			'Should_UpdateUserSector_When_EditUserSector': function() {

				var _sectorRowSelector = 'div.infoContainer :nth-child(2) div.rowsContainer :nth-child(3) ',
					editButtonSelector = _sectorRowSelector + 'i.fa-edit',
					sectorSpanSelector = _sectorRowSelector + 'span.spanTemplate span.name',
					inputElementSelector = 'div[data-redmic-model="sector"] div.containerFilteringSelect input:nth-child(2)',
					selectInputSelector = 'div[data-redmic-model="sector"] div.buttonSearch',
					selectInputValueSelector = 'span[data-redmic-id="10"]',
					selectInputAltValueSelector = 'span[data-redmic-id="11"]',
					valuesObj = {};

				return goToProfile()
					.then(Utils.clickElement(editButtonSelector))
					.then(Utils.checkLoadingIsGone())
					// obtiene el valor actual
					.findByCssSelector(inputElementSelector)
						.then(lang.partial(function(values) {

							this.getProperty('value')
								.then(lang.partial(function(innerValues, inputValue) {

									innerValues.oldValue = inputValue;
								}, values));
						}, valuesObj))
						.end()
					// cambia el valor a una opción diferente
					.then(Utils.clickElement(selectInputSelector))
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(selectInputValueSelector)
						.getVisibleText()
						.then(lang.partial(function(values, text, setContext) {

							// usa el nuevo valor alternativo si ya estaba en el nuevo valor predefinido
							if (values.oldValue === text) {
								return this.parent
									.end()
									.sleep(Config.timeout.shortSleep)
									.findByCssSelector(selectInputAltValueSelector)
										.getVisibleText()
										.then(lang.partial(function(args, innerText) {

											args.values.newValue = innerText;
										}, {
											values,
											setContext
										}))
										.click()
										.end(2);
							}

							// usa el nuevo valor predefinido
							values.newValue = text;

							return this.parent
								.click();
						}, valuesObj))
						.end()
					.then(Utils.clickElement(Config.selector.saveButton))
					.then(Utils.checkLoadingIsGone())
					// comprueba el nuevo valor
					.findByCssSelector(sectorSpanSelector)
						.getVisibleText()
						.then(lang.partial(function(values, text) {

							assert.strictEqual(text, values.newValue, 'El nuevo valor no coincide con el seleccionado');
						}, valuesObj))
						.end()
					// guarda el valor a vacío y lo comprueba
					.then(Utils.clickElement(editButtonSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.clickElement(Config.selector.clearButton))
					.then(Utils.clickElement(Config.selector.saveButton))
					.then(Utils.findAndCheckVisibleText(sectorSpanSelector, ''));
			},

			'Should_UpdateUserPassword_When_EditUserPassword': function() {

				var _sectorRowSelector = 'div.infoContainer :nth-child(2) div.rowsContainer :nth-child(4) ',
					editButtonSelector = _sectorRowSelector + 'i.fa-edit',
					newPasswordInputSelector = 'div[data-redmic-model="password"] div.dijitInputContainer input',
					oldPasswordInputSelector = 'div[data-redmic-model="oldPassword"] div.dijitInputContainer input',
					confirmPasswordInputSelector = 'div[data-redmic-type="confirm"] div.dijitInputContainer input',
					value = Config.credentials.userPassword;

				return goToProfile()
					.then(Utils.clickElement(editButtonSelector))

					.then(Utils.setInputValue(oldPasswordInputSelector, value))
					.then(Utils.setInputValue(newPasswordInputSelector, value))
					.then(Utils.setInputValue(confirmPasswordInputSelector, value))
					.then(Utils.clickElement(Config.selector.saveButton))
					.findByCssSelector(editButtonSelector);
			}
		};

	if (Config.credentials.userRole === 'guest') {
		tests = {};
	}

	registerSuite('Profile page tests', {
		before: function() {

			indexPage = new LoginPage(this);
		},

		afterEach: function(test) {

			return Utils.inspectAfterTests(test, this.remote);
		},

		tests: tests
	});
});
