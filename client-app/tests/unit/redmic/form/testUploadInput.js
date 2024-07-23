define([
	'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/on'
	, 'redmic/modules/form/form/UploadInput'
], function(
	lang
	, Deferred
	, on
	, UploadInput
){
	var timeout = 100,
		saveUrl = '{apiUrl}/save',
		fileUrlParams = '?token=1234',
		files, prevFileUrl, input;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('UploadInput tests', {
		before: function() {

			env = new Deferred();
			env.resolve({
				apiUrl: '/api'
			});

			input = new UploadInput({
				url: saveUrl,
				maxFiles: 1,
				acceptedFiles: 'image/*'
			});

			files = [{
				name: 'file.jpg',
				type: 'image/jpeg'
			},{
				name: 'alternative_file.png',
				type: 'image/png'
			},{
				name: 'wrong_file.pdf',
				type: 'application/pdf'
			}];

			prevFileUrl = '/api/oldFile.jpg';
		},

		afterEach: function(test) {

			var dfd = this.async(timeout);

			setTimeout(dfd.callback(function() {}), timeout - 1);

			input.reset();
		},

		tests: {
			Should_EmitFileAdded_When_AddFile: function() {

				var dfd = this.async(timeout),
					file = lang.clone(files[0]);

				on.once(input, 'fileAdded', function(evt) {

					assert.strictEqual(evt.name, file.name, 'No coincide el nombre del fichero recibido');

					dfd.resolve();
				});

				input._addFile(file);
			},

			Should_EmitFileRemoved_When_RemoveFile: function() {

				var dfd = this.async(timeout),
					file = lang.clone(files[0]);

				on.once(input, 'fileRemoved', function(evt) {

					assert.strictEqual(evt.name, file.name, 'No coincide el nombre del fichero recibido');

					dfd.resolve();
				});

				input._addFile(file);
				input._removeFile(file);
			},

			Should_EmitStatusUpdatedWithError_When_AddTooManyFiles: function() {

				var dfd = this.async(timeout),
					file = lang.clone(files[0]),
					altFile = lang.clone(files[1]);

				on.once(input, 'statusUpdated', function(evt) {

					assert.isFalse(evt.isValid, 'El estado es válido tras provocar un error');
					assert.isDefined(evt.error, 'No se ha encontrado el error en la emisión');
					assert.isDefined(evt.error.file, 'No se ha encontrado el fichero erróneo en la emisión');
					assert.strictEqual(evt.error.file, altFile, 'No coincide el fichero erróneo emitido con el añadido');

					dfd.resolve();
				});

				input._addFile(file);
				input._addFile(altFile);
			},

			Should_EmitStatusUpdatedWithoutError_When_AddTooManyFilesAndThenRemoveRemainingFiles: function() {

				var dfd = this.async(timeout),
					file = lang.clone(files[0]),
					altFile = lang.clone(files[1]);

				input._addFile(file);
				input._addFile(altFile);

				on.once(input, 'statusUpdated', function(evt) {

					assert.isTrue(evt.isValid, 'El estado no es válido tras corregir un error');
					assert.isUndefined(evt.error, 'Se ha encontrado un campo de error en la emisión');

					dfd.resolve();
				});

				input._removeFile(altFile);
			},

			Should_EmitMaxFilesReached_When_AddEnoughFilesToReachMaxFiles: function() {

				var dfd = this.async(timeout),
					file = lang.clone(files[0]);

				on.once(input, 'maxFilesReached', function(evt) {

					assert.lengthOf(evt, 1, 'No se ha devuelto un array con el número de ficheros esperado');
					assert.strictEqual(evt[0], file, 'No coincide el fichero erróneo emitido con el añadido');

					dfd.resolve();
				});

				input._addFile(file);
			},

			Should_EmitPreviousFileAddedAndLoadPreviousFile_When_LoadPreviouslySavedFile: function() {

				var dfd = this.async(timeout);

				on.once(input, 'previousFileAdded', function(evt) {

					assert.lengthOf(input._previousFiles, 1, 'No se ha encontrado el número de ficheros previos esperado');

					dfd.resolve();
				});

				input.loadPreviouslySavedFiles([prevFileUrl], fileUrlParams);
			},

			Should_EmitPreviousFileRemovedAndUnloadPreviousFile_When_RemovePreviouslySavedFile: function() {

				var dfd = this.async(timeout),
					prevFile;

				on.once(input, 'previousFileRemoved', function(evt) {

					assert.strictEqual(evt, prevFile, 'No coincide el fichero previo emitido con el eliminado');
					assert.lengthOf(input._previousFiles, 0, 'No se ha encontrado el número de ficheros previos esperado');

					dfd.resolve();
				});

				on.once(input, 'previousFileAdded', function(evt) {

					prevFile = evt;
					input._removeFile(prevFile);
				});

				input.loadPreviouslySavedFiles([prevFileUrl], fileUrlParams);
			},

			Should_EmitStatusUpdatedAndLoadPreviousFile_When_LoadPreviouslySavedFile: function() {

				var dfd = this.async(timeout);

				on.once(input, 'statusUpdated', function(evt) {

					assert.isTrue(evt.isValid, 'El estado no es válido tras añadir un fichero previo');
					assert.lengthOf(input._previousFiles, 1, 'No se ha encontrado el número de ficheros previos esperado');

					dfd.resolve();
				});

				input.loadPreviouslySavedFiles([prevFileUrl], fileUrlParams);
			},

			Should_EmitStatusUpdatedWithError_When_AddFileWithForbiddenType: function() {

				var dfd = this.async(timeout),
					wrongFile = lang.clone(files[2]);

				on.once(input, 'statusUpdated', function(evt) {

					assert.isFalse(evt.isValid, 'El estado es válido tras provocar un error');
					assert.isDefined(evt.error, 'No se ha encontrado el error en la emisión');
					assert.strictEqual(evt.error.file, wrongFile, 'No coincide el fichero erróneo emitido con el añadido');

					dfd.resolve();
				});

				input._addFile(wrongFile);
			}
		}
	});
});
