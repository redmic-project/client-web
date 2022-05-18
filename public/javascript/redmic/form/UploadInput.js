define([
	'alertify/alertify.min'
	, 'app/redmicConfig'
	, 'dijit/_TemplatedMixin'
	, 'dijit/_WidgetBase'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/Evented'
	, 'dojo/i18n!./nls/UploadInput'
	, 'dojo/text!./templates/UploadInput.html'
	, 'put-selector/put'
	, 'redmic/base/Credentials'

	, 'dropzone/dropzone-amd-module.min'
], function(
	alertify
	, redmicConfig
	, _TemplatedMixin
	, _WidgetBase
	, declare
	, lang
	, Deferred
	, Evented
	, i18n
	, template
	, put
	, Credentials
) {

	return declare([_WidgetBase, _TemplatedMixin, Evented], {
		//	summary:
		//		Widget de subida de ficheros.
		//	description:
		//		Permite adjuntar ficheros a los formularios.

		constructor: function(args) {

			this.config = {
				templateString: template,
				minFiles: 0,
				_updateStatusTimeout: 100,
				_ignoreStatusName: 'ignore',
				_dropzoneDfd: new Deferred(),

				url: null,
				paramName: 'file',
				maxFiles: 1,
				maxFilesize: 5,
				acceptedFiles: null,
				uploadMultiple: false,
				addRemoveLinks: true,
				autoProcessQueue: false,
				headers: { 'Authorization': 'Bearer ' + Credentials.get('accessToken') },
				thumbnailHeight: 120,
				thumbnailWidth: null,
				timeout: 60000,

				dictDefaultMessage: i18n.dictDefaultMessage,
				dictFallbackMessage: i18n.dictFallbackMessage,
				dictFallbackText: i18n.dictFallbackText,
				dictFileTooBig: i18n.dictFileTooBig,
				dictInvalidFileType: i18n.dictInvalidFileType,
				dictResponseError: i18n.dictResponseError,
				dictCancelUpload: i18n.dictCancelUpload,
				dictCancelUploadConfirmation: i18n.dictCancelUploadConfirmation,
				dictRemoveFile: i18n.dictRemoveFile,
				dictRemoveFileConfirmation: i18n.dictRemoveFileConfirmation,
				dictMaxFilesExceeded: i18n.dictMaxFilesExceeded
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			var envDfd = window.env;

			if (!this.url || !envDfd) {
				console.error('URL not specified for file upload input');
				return;
			}

			this._setPreviousProperties();

			envDfd.then(lang.hitch(this, function(envData) {

				this.url = redmicConfig.getServiceUrl(this.url, envData);

				this._dropzone = this._getNewInstance();
				this._listenInstanceEvents(this._dropzone);
				this._dropzoneDfd.resolve(this._dropzone);
			}));
		},

		_setPreviousProperties: function() {

			Dropzone.autoDiscover = false;
			Dropzone.confirm = lang.hitch(this, this._dropzoneConfirm);

			this._initializeOwnStructures();
		},

		_initializeOwnStructures: function() {

			this._actualMaxFiles = this.maxFiles;
			this._previousFiles = [];
			this._successfullyUploadedFiles = [];
			this._failedFiles = [];
		},

		_getNewInstance: function() {

			var instance = new Dropzone(this.domNode, this._getDropzoneProps());

			this._addVisualElements(instance);

			return instance;
		},

		_getDropzoneProps: function() {

			return {
				addRemoveLinks: this.addRemoveLinks,
				autoProcessQueue: this.autoProcessQueue,
				paramName: this.paramName,
				maxFilesize: this.maxFilesize,
				maxFiles: this._actualMaxFiles,
				parallelUploads: this.maxFiles,
				acceptedFiles: this.acceptedFiles,
				url: this.url,
				headers: this.headers,
				uploadMultiple: this.uploadMultiple,
				thumbnailHeight: this.thumbnailHeight,
				thumbnailWidth: this.thumbnailWidth,
				timeout: this.timeout,

				dictDefaultMessage: this.dictDefaultMessage,
				dictFallbackMessage: this.dictFallbackMessage,
				dictFallbackText: this.dictFallbackText,
				dictFileTooBig: this.dictFileTooBig,
				dictInvalidFileType: this.dictInvalidFileType,
				dictResponseError: this.dictResponseError,
				dictCancelUpload: this.dictCancelUpload,
				dictCancelUploadConfirmation: this.dictCancelUploadConfirmation,
				dictRemoveFile: this.dictRemoveFile,
				dictRemoveFileConfirmation: this.dictRemoveFileConfirmation,
				dictMaxFilesExceeded: this.dictMaxFilesExceeded
			};
		},

		_addVisualElements: function(instance) {

			var node = instance.element,
				childNode = node && node.children[0];

			childNode && put(childNode, 'div.fa.fa-upload.uploadIcon');
		},

		_listenInstanceEvents: function(instance) {

			if (this.uploadMultiple) {
				instance.on('successmultiple', lang.hitch(this, this._onDropzoneSuccessMultiple));
			} else {
				instance.on('success', lang.hitch(this, this._onDropzoneSuccess));
			}

			instance.on('error', lang.hitch(this, this._onDropzoneError));
			instance.on('addedfile', lang.hitch(this, this._onDropzoneAddedFile));
			instance.on('removedfile', lang.hitch(this, this._onDropzoneRemovedFile));
			instance.on('maxfilesreached', lang.hitch(this, this._onDropzoneMaxFilesReached));
		},

		_addFile: function(file) {

			this._dropzoneDfd.then(lang.hitch(this, function(fileParam, instance) {

				instance.addFile(fileParam);
			}, file));
		},

		_removeFile: function(file) {

			this._dropzoneDfd.then(lang.hitch(this, function(fileParam, instance) {

				instance.removeFile(fileParam);
			}, file));
		},

		_dropzoneConfirm: function(question, accepted, rejected) {

			alertify.confirm(question, function(e) {

				if (e) {
					accepted();
				} else if (rejected) {
					rejected();
				}
			});
		},

		_onDropzoneMaxFilesReached: function(files) {

			this.emit('maxFilesReached', files);
		},

		_onDropzoneSuccess: function(file, res) {

			var body = res.body;

			this._registerSuccessfulUpload(file, body);
			this.set('value', body);
		},

		_onDropzoneSuccessMultiple: function(files, res) {

			var body = res.body;

			for (var i = 0; i < files.length; i++) {
				this._registerSuccessfulUpload(files[i], body[i]);
			}

			this.set('value', body);
		},

		_registerSuccessfulUpload: function(file, data) {

			this._successfullyUploadedFiles.push({
				file: file,
				response: data
			});
		},

		_onDropzoneError: function(file, err, req) {

			if (err === this.dictMaxFilesExceeded) {
				this._failedFiles.push(file);
			}

			this._emitStatusUpdate({
				isValid: false,
				error: {
					file: file,
					err: err,
					req: req
				}
			});
		},

		_emitStatusUpdate: function(obj) {

			this._lastStatusUpdate = obj.isValid;

			this.emit('statusUpdated', obj);
		},

		_onDropzoneAddedFile: function(file) {

			if (file.status) {
				this.emit('fileAdded', file);
			} else {
				this.emit('previousFileAdded', file);
			}

			this._prepareStatusUpdate();
		},

		_onDropzoneRemovedFile: function(file) {

			if (file.status === this._ignoreStatusName || file.status === 'success') {
				return;
			}

			if (!file.status) {
				this._updatePropsOnRemovedPreviouslySavedFile(file);
				this.emit('previousFileRemoved', file);
			} else {
				this.emit('fileRemoved', file);
			}

			if (file.status !== 'error') {
				this._retryToAddPreviouslyFailedFile();
			}

			if (!this._getTotalFileCount()) {
				this.set('value', null);
			}

			this._prepareStatusUpdate();
		},

		_prepareStatusUpdate: function() {

			clearTimeout(this._updateStatusTimeoutHandler);

			this._updateStatusTimeoutHandler = setTimeout(lang.hitch(this, this._updateStatus),
				this._updateStatusTimeout);
		},

		_updateStatus: function() {

			var files = this._dropzone.files,
				errorFound;

			for (var i = 0; i < files.length; i++) {
				var file = files[i];

				if (file.status === 'error') {
					errorFound = true;
					break;
				}
			}

			if (!errorFound) {
				this._emitStatusUpdate({
					isValid: true
				});
			}
		},

		_retryToAddPreviouslyFailedFile: function() {

			if (this._failedFiles.length) {
				var failedFile = this._failedFiles.pop(),
					fileOldStatus = failedFile.status;

				failedFile.status = this._ignoreStatusName;
				this._dropzone.removeFile(failedFile);
				failedFile.status = fileOldStatus;

				this._dropzone.addFile(failedFile);
			}
		},

		_getTotalFileCount: function() {

			var currentFiles = this._dropzone.files;

			return this._previousFiles.length + currentFiles.length;
		},

		_updatePropsOnRemovedPreviouslySavedFile: function(removedFile) {

			if (!this._previousFiles.length) {
				return;
			}

			for (var i = 0; i < this._previousFiles.length; i++) {
				var previousFile = this._previousFiles[i];

				if (previousFile.name === removedFile.name) {
					this._actualMaxFiles++;
					this._previousFiles.splice(i, 1);
					i--;
				}
			}

			this._updateMaxFilesProp(this._actualMaxFiles);
		},

		loadPreviouslySavedFiles: function(urls, urlParams) {

			if (!urls || !urls.length) {
				return;
			}

			this.reset();

			for (var i = 0; i < urls.length; i++) {
				var url = urls[i],
					urlString = url.url || url;

				this._loadPreviouslySavedFile(urlString, urlParams);
			}

			this._updatePropsAfterPreviousFilesLoaded();
		},

		_loadPreviouslySavedFile: function(url, urlParams) {

			var file = this._getFileMockup(url),
				actualUrl = url + urlParams;

			this._previousFiles.push(file);
			this._showFilePreview(file, actualUrl);
		},

		_getFileMockup: function(url) {

			var urlSplitted = url.split('/'),
				fileNameWithExtension = urlSplitted.pop();

			return {
				name: fileNameWithExtension
			};
		},

		_showFilePreview: function(file, url) {

			this._dropzone.emit('addedfile', file);
			this._dropzone.emit('thumbnail', file, url);
		},

		_clearThumbnails: function() {

			var childrenNodes = this.domNode.children;
			for (var i = 1; i < childrenNodes.length; i++) {
				put('!', childrenNodes[i]);
			}
		},

		_updatePropsAfterPreviousFilesLoaded: function() {

			this._actualMaxFiles -= this._previousFiles.length;
			this._updateMaxFilesProp(this._actualMaxFiles);
		},

		_updateMaxFilesProp: function(maxFiles) {

			this._dropzone.options.maxFiles = maxFiles;
		},

		submit: function() {

			this._successfullyUploadedFiles = [];

			return this._dropzone.processQueue();
		},

		reset: function() {

			this._initializeOwnStructures();
			this._updateMaxFilesProp(this._actualMaxFiles);
			this._dropzone.removeAllFiles();
			this._clearThumbnails();
		},

		disable: function() {

			this._dropzone.disable();
		},

		enable: function() {

			this._dropzone.enable();
		},

		validate: function() {

			return this._getTotalFileCount() >= this.minFiles && this._lastStatusUpdate;
		}

	});
});
