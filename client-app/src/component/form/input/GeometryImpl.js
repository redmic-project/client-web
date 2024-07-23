define([
	'src/redmicConfig'
	, 'dijit/form/Textarea'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'src/component/form/form/UploadInput'
	, 'src/component/form/input/Input'
], function(
	redmicConfig
	, Textarea
	, declare
	, lang
	, put
	, UploadInput
	, Input
){
	return declare(Input, {
		//	summary:
		//		Implementación de input Geometry.

		constructor: function(args) {

			this.config = {
				propertyName: 'geometry/coordinates',
				ownChannel: 'geometry',

				maxFileSize: 1,
				url: redmicConfig.services.convertShapefileToGeoJSON,
				acceptedFiles: 'application/shapefile,.shp'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._uploadInput = new UploadInput({
				maxFiles: 1,
				maxFilesize: this.maxFileSize,
				url: this.url,
				acceptedFiles: this.acceptedFiles,
				autoProcessQueue: true
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._uploadInput.watch('value', lang.hitch(this, this._onUploadInputValueChanged));
		},

		_createInputInstance: function() {

			var widget = new Textarea(this._inputProps).placeAt(this.containerInput);

			return widget;
		},

		_afterShow: function() {

			if (!this.containerFormAditional) {
				var container = this._getFormNode();
				this._showUploadInput(container);
			}

			if (this._penddingValueAfterShow) {
				this._valueChanged(this._penddingValueAfterShow);
				delete this._penddingValueAfterShow;
			}
		},

		_getFormNode: function() {

			var container = this.domNode;

			while (true) {
				container = container.parentNode;
				if (!container || container.nodeName === 'FORM') {
					return container;
				}
			}
		},

		_showUploadInput: function(container) {

			this.containerFormAditional = put(container, 'fieldset');

			put(this.containerFormAditional, 'legend', this.i18n.loadFile);
			put(this.containerFormAditional, this._uploadInput.domNode);
		},

		_onUploadInputValueChanged: function(name, oldValue, value) {

			if (!value || value.error) {
				return;
			}

			var features = value.features;

			if (features && features.length) {
				var obj = {};
				obj[this.propertyName] = features[0].geometry.coordinates;

				this._emitSetValue(obj);
			}
		},

		_setValue: function(value) {

			if (this._valueSetFromModel) {
				delete this._valueSetFromModel;
				return;
			}

			var parsedValue = value ? JSON.parse(value) : null;

			this.inherited(arguments, [parsedValue]);
		},

		_valueChanged: function(res) {

			if (!this.statusFlags.shown) {
				this._penddingValueAfterShow = res;
			}

			var propertyValue = res[this.propertyName],
				stringifiedValue = propertyValue ? JSON.stringify(propertyValue) : '',
				modifiedResponse = {};

			modifiedResponse[this.propertyName] = stringifiedValue;

			if (propertyValue && propertyValue.length) {
				this._valueSetFromModel = true;
			}

			this.inherited(arguments, [modifiedResponse]);
		}
	});
});
