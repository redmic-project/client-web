define([
	'dojo/_base/lang'
	, 'tests/support/Config'
	, 'tests/support/pages/Login'
	, 'tests/support/Utils'
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

				var userMenuSelector = 'div.dijitPopup.dijitMenuPopup';

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

			'Should_GoToLoginPage_When_ClickOnUserLogout': function() {

				var logoutButtonSelector = 'i.fa-power-off';

				return indexPage
					.login()
					.then(Utils.clickElement(Config.selector.userArea))
					.then(Utils.clickElement(logoutButtonSelector))
					.then(Utils.checkLoadingIsGone())
					.then(Utils.checkUrl(Config.url.login));
			},

			'Should_SetImage_When_UploadNewImage': function() {

				var values = {};

				return goToProfile()
					// recuerda la ruta de la imagen inicial
					.findByCssSelector(userImageSelector)
						.getProperty('src')
						.then(lang.partial(function(values, src) {

							values.oldValue = src;
						}, values))
						.end()
					// edita la imagen
					.then(setNewProfileImage())
					// comprueba que haya cambiado la ruta de la imagen
					.findByCssSelector(userImageSelector)
						.getProperty('src')
						.then(lang.partial(function(values, src) {

							assert.notStrictEqual(src, values.oldValue, 'La imagen no ha cambiado');
						}, values))
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
					values = {
						newValue: 'Benancio'
					};

				return goToProfile()
					.then(Utils.clickElement(editButtonSelector))
						.findByCssSelector(textInputSelector)
							.getProperty('value')
							.then(lang.partial(function(values, text) {

								values.oldValue = text;
							}, values))
							.end()
						.then(Utils.setInputValue(textInputSelector, values.newValue))
						.then(Utils.clickElement(Config.selector.saveButton))
						.end()
					.then(Utils.checkLoadingIsGone())
					// comprueba el nuevo valor
					.then(Utils.clickElement(editButtonSelector))
						.findByCssSelector(textInputSelector)
							.getProperty('value')
							.then(lang.partial(function(values, text) {

								assert.strictEqual(text, values.newValue, 'El valor seteado no es el esperado');
							}, values))
							// restaura el valor original
							.clearValue()
							.then(lang.partial(function(values) {

								this.type(values.oldValue);
							}, values))
							.end()
						.then(Utils.clickElement(Config.selector.saveButton))
						.end();
			},

			'Should_UpdateUserSector_When_EditUserSector': function() {

				var _sectorRowSelector = 'div.infoContainer :nth-child(2) div.rowsContainer :nth-child(3) ',
					editButtonSelector = _sectorRowSelector + 'i.fa-edit',
					sectorSpanSelector = _sectorRowSelector + 'span.spanTemplate span.name',
					selectInputSelector = 'div[data-redmic-model="sector"] div.buttonSearch',
					selectInputValueSelector = 'span[data-redmic-id="10"]',
					values = {};

				return goToProfile()
					.then(Utils.clickElement(editButtonSelector))
					.then(Utils.clickElement(selectInputSelector))
					.findByCssSelector(selectInputValueSelector)
						.getVisibleText()
						.then(lang.partial(function(values, text) {

							values.newValue = text;
						}, values))
						.click()
						.end()
					.then(Utils.clickElement(Config.selector.saveButton))
					.then(Utils.checkLoadingIsGone())
					// comprueba el nuevo valor
					.findByCssSelector(sectorSpanSelector)
						.getVisibleText()
						.then(lang.partial(function(values, text) {

							assert.strictEqual(text, values.newValue, 'El nuevo valor no coincide con el seleccionado');
						}, values))
						.end()
					// restaura el valor original
					.then(Utils.clickElement(editButtonSelector))
					.then(Utils.clickElement(Config.selector.clearButton))
					.then(Utils.clickElement(Config.selector.saveButton))
					.then(Utils.findAndCheckVisibleText(sectorSpanSelector, ''));
			},

			'Should_UpdateUserPassword_When_EditUserPassword': function() {

				// TODO falla en chrome salvo en modo headless (parece problema del driver, navegador o leadfoot)
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
