define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/on'
	, 'src/util/Credentials'
	, 'src/component/form/form/UploadInput'
	, 'src/component/form/input/Input'
	, 'src/util/stringFormats'
	, 'RWidgets/Utilities'
], function(
	declare
	, lang
	, Deferred
	, on
	, Credentials
	, UploadInput
	, Input
	, stringFormats
	, Utilities
){
	return declare(Input, {
		//	summary:
		//		Implementación de input UploadFile.

		constructor: function(args) {

			this.config = {
				ownChannel: 'uploadFile',

				_fileCount: 0,
				_prevFileCount: 0,
				_provisionalValue: 'provisionalValue',
				_defaultValuePath: 'url'
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			var widget = new UploadInput(this._inputProps).placeAt(this.containerInput);

			widget.watch('value', lang.hitch(this, this._onValueChanged));
			widget.on('fileAdded', lang.hitch(this, this._onFileAdded));
			widget.on('fileRemoved', lang.hitch(this, this._onFileRemoved));
			widget.on('statusUpdated', lang.hitch(this, this._onStatusUpdated));
			widget.on('previousFileAdded', lang.hitch(this, this._onPreviousFileAdded));
			widget.on('previousFileRemoved', lang.hitch(this, this._onPreviousFileRemoved));
			widget.on('maxFilesReached', lang.hitch(this, this._onMaxFilesReached));

			return widget;
		},

		_onFileAdded: function(evt) {

			this._fileCount++;
			this._setProvisionalValue();
		},

		_onFileRemoved: function(evt) {

			this._fileCount--;
			this._setProvisionalValue();
		},

		_onStatusUpdated: function(evt) {

			var isValid = evt.isValid;

			this._isValid = !!isValid;

			this._lastObjStatusUpdate = evt;

			this._emitChanged(this._lastEmitSetValue[this.propertyName]);
		},

		_onPreviousFileAdded: function(evt) {

			this._prevFileCount++;
		},

		_onPreviousFileRemoved: function(evt) {

			this._prevFileCount--;
		},

		_onMaxFilesReached: function(evt) {

			// TODO
		},

		_setProvisionalValue: function() {

			var value = this._fileCount ? this._provisionalValue : null;

			this._setValue(value);
		},

		_onValueChanged: function(name, oldValue, value) {

			var valueToSubmit = this._getValueToSubmit(value);

			this._setValue(valueToSubmit);

			this._submitDfd && this._submitDfd.resolve();
		},

		_getValueToSubmit: function(value) {

			if (!value) {
				return null;
			}

			var valuePath = this._inputProps.valuePath;
			if (valuePath === undefined) {
				valuePath = this._defaultValuePath;
			}

			if (!valuePath || !valuePath.length) {
				return value;
			}

			var valueToSubmit;

			if (value instanceof Array) {
				valueToSubmit = value.map(lang.hitch(this, function(item) {

					return Utilities.getDeepProp(item, valuePath);
				}));
			} else {
				valueToSubmit = Utilities.getDeepProp(value, valuePath);
			}

			return valueToSubmit;
		},

		_valueChanged: function(obj) {

			var value = obj[this.propertyName];

			if (!value) {
				this._reset();
			} else {
				if (value !== this._provisionalValue) {
					var validationError = stringFormats.uri(value);

					!validationError && this._setPreviousFiles(value);
				}
			}

			this._emitChanged(value);
		},

		_setPreviousFiles: function(value) {

			var params = '?access_token=' + Credentials.get('accessToken'),
				urls = value instanceof Array ? value : [value];

			this._inputInstance.loadPreviouslySavedFiles(urls, params);
		},

		_submit: function(req) {

			if (!this._fileCount) {

				return this.inherited(arguments);
			}

			if (!this._inputInstance.validate()) {

				var error = this._lastObjStatusUpdate && this._lastObjStatusUpdate.error,
					description = (error && error.err) || null;

				return this._emitSubmitted({
					success: false,
					error: {
						description: description
					}
				});
			}

			this._submitDfd = new Deferred();

			this._submitDfd.then(lang.hitch(this, function() {

				delete this._submitDfd;
				this._fileCount = 0;
				this._prevFileCount = 0;

				this._emitSubmitted({
					success: true
				});
			}));

			this._inputInstance.submit();
		},

		_enable: function() {

			this._inputInstance.enable();
		},

		_disable: function() {

			this._inputInstance.disable();
		},

		_reset: function() {

			this._clear();
		},

		_clear: function() {

			this._fileCount = 0;
			this._prevFileCount = 0;
			this._inputInstance.reset();
			this._enable();
		}
	});
});
