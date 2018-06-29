define([
	'dojo/_base/lang'
	, 'module'
	, 'tests/support/Config'
	, 'tests/support/Utils'
], function(
	lang
	, module
	, Config
	, Utils
){
	var indexPageUrl,
		timeout = Config.timeout.findElement,
		fileUrl = Config.env.cwd + '/tests/support/resources/profile.png',
		altFileUrl = Config.env.cwd + '/tests/support/resources/profile.png',
		wrongFileUrl = Config.env.cwd + '/tests/support/resources/DomainModel.js',

		uploadBoxSelector = '.dropzone.dz-clickable.dz-started',
		uploadPreviewSelector = uploadBoxSelector + ' > .dz-preview',
		errorPreviewSelector = '.dz-error',
		removeThumbnailSelector = ' > a.dz-remove';

	function removeThumbnail(removeButtonSelector) {

		return function() {

			return this.parent
				.sleep(Config.timeout.shortSleep)
				.then(Utils.clickElement(removeButtonSelector))
				.sleep(Config.timeout.longSleep)
				.then(Utils.clickElement(Config.selector.okAlertify))
				.sleep(Config.timeout.shortSleep);
		};
	}

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('UploadFileImpl tests', {
		before: function() {

			this.remote.setFindTimeout(timeout);
			indexPageUrl = Utils.getTestPageUrl(module.id);
		},

		beforeEach: function(test) {

			return this.remote.get(indexPageUrl);
		},

		afterEach: function(test) {

			return Utils.getBrowserLogs(test, this.remote);
		},

		tests: {

			Should_AddFileThumbnail_When_AddNewFile: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.findAllByCssSelector(uploadPreviewSelector)
					.then(function(previews) {

						assert.lengthOf(previews, 1, 'No se han encontrado las previsualizaciones esperadas');
					});
			},

			Should_RemoveFileThumbnail_When_RemoveAddedFile: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.then(removeThumbnail(uploadPreviewSelector + removeThumbnailSelector))
					.setFindTimeout(1)
					.findAllByCssSelector(uploadPreviewSelector)
						.then(function(previews) {

							assert.lengthOf(previews, 0, 'No se han encontrado las previsualizaciones esperadas');
						})
						.end()
					.setFindTimeout(timeout);
			},

			Should_KeepFileThumbnail_When_CancelFileRemoving: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.then(Utils.clickElement(uploadPreviewSelector + removeThumbnailSelector))
					.sleep(Config.timeout.longSleep)
					.then(Utils.clickElement(Config.selector.cancelAlertify))
					.findAllByCssSelector(uploadPreviewSelector)
						.then(function(previews) {

							assert.lengthOf(previews, 1, 'No se han encontrado las previsualizaciones esperadas');
						});
			},

			Should_AddErrorThumbnail_When_AddTooManyFiles: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.sleep(Config.timeout.shortSleep)
					.findAllByCssSelector(uploadPreviewSelector)
						.then(function(previews) {

							assert.lengthOf(previews, 2, 'No se han encontrado las previsualizaciones esperadas');
						})
						.end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(uploadPreviewSelector + errorPreviewSelector);
			},

			Should_AddErrorThumbnail_When_AddForbiddenFile: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(wrongFileUrl)
						.end()
					.sleep(Config.timeout.shortSleep)
					.findByCssSelector(uploadPreviewSelector + errorPreviewSelector);
			},

			Should_RemoveOnlyOneThumbnailAndKeepTheOtherOne_When_AddTwoFilesAndRemoveOne: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(altFileUrl)
						.end()
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.then(removeThumbnail(uploadPreviewSelector + removeThumbnailSelector))
					.findAllByCssSelector(uploadPreviewSelector)
						.then(function(previews) {

							assert.lengthOf(previews, 1, 'No se han encontrado las previsualizaciones esperadas');
						});
			},

			Should_RemoveMaxExceededErrorFromRemainingThumbnail_When_RemoveAnotherValidFile: function() {

				return this.remote
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(altFileUrl)
						.end()
					.findByCssSelector(Config.selector.fileUploadInput)
						.type(fileUrl)
						.end()
					.then(removeThumbnail(uploadPreviewSelector + removeThumbnailSelector))
					.findAllByCssSelector(uploadPreviewSelector)
						.then(function(previews) {

							assert.lengthOf(previews, 1, 'No se han encontrado las previsualizaciones esperadas');
						})
						.end()
					.setFindTimeout(1)
					.findAllByCssSelector(uploadPreviewSelector + errorPreviewSelector)
						.then(function(errorPreviews) {

							assert.lengthOf(errorPreviews, 0, 'No se han encontrado las previsualizaciones esperadas');
						})
						.end()
					.setFindTimeout(timeout);
			}
		}
	});
});
