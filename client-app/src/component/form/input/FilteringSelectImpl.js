define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Store"
	, "src/component/form/input/Input"
	, "RWidgets/FilteringSelect"
], function(
	declare
	, lang
	, _Store
	, Input
	, FilteringSelect
) {

	return declare([Input, _Store], {
		//	summary:
		//		Implementación de input FilteringSelect.

		constructor: function(args) {

			this.config = {
				ownChannel: "filteringSelect",
				_inputProps: {
					'class': "containerTextSearch containerFilteringSelect",
					i18n: this.i18n,
					labelAttr: "name"
				},
				propertyName: "name",
				idProperty: "id",
				sizeDefault: 10,
				target: null,
				omitLoading: true,
				defaultReturnFields: ['id', 'name'],
				setValueAsObject: false
			};

			lang.mixin(this, this.config, args);
		},

		_createInputInstance: function() {

			this._createConfig();

			var widget = new FilteringSelect(this._inputProps).placeAt(this.containerInput);

			widget.watch("value", lang.hitch(this, this._setValue));

			widget.on("requestFilteringData", lang.hitch(this, this._requestData));

			return widget;
		},

		_createConfig: function() {

			this._inputProps.idProperty = this.idProperty;
			this.fields = this._inputProps.fields;
			this.returnFields = this._inputProps.returnFields || this.defaultReturnFields;

			if (this._inputProps.type) {
				this.type = this._inputProps.type;
			}

			this.target = this._inputProps.target;
		},

		_requestData: function(request) {

			if (!request || (request.text && request.text.length === 1)) {
				return;
			}

			var requestObj = this._getRequestObj({
				options: {
					start: request.start ? request.start : 0,
					count: request.count ? request.count : this.sizeDefault
				},
				query: request.text ? {text: request.text} : {}
			});

			this._emitEvt('REQUEST', requestObj);
		},

		_dataAvailable: function(/*Object*/ res, resWrapper) {

			var data = res.data;

			if (!data || resWrapper.requesterId !== this.getOwnChannel()) {
				return;
			}

			this._inputInstance.emit('receivedResults', {
				data: data.data || data,
				total: data.total || res.total
			});
		},

		_getRequestObj: function(request) {

			var obj = {
				target: request.target || this.target,
				requesterId: this.getOwnChannel()
			};

			if (this.type !== 'API') {
				obj.method = "GET";
				obj.type = "getQueryString";
				obj.query = this._getElasticQuery(request.query, request.options);
			} else {
				obj.query = request.query;
				obj.type = this.type;
				obj.options = request.options ? request.options : this.optionsDefault;
			}

			return obj;
		},

		_getElasticQuery: function(/*Object*/ query, /*Object*/ options) {

			var queryResult = {
				from: options.start ? options.start : 0,
				size: options.count ? options.count : this.sizeDefault,
				returnFields: this.returnFields
			};

			if (query && query.text) {
				queryResult.text = query.text;

				if (this.fields) {
					queryResult.fields = this.fields;
				}
			}

			return queryResult;
		},

		_shown: function() {

			this.inherited(arguments);

			this._emitEvt('IS_VALID', {
				propertyName: this.propertyName
			});
		},

		_reset: function() {

			if (!this._inputInstance) {
				return;
			}

			this._inputInstance.emit('reset');
			this._enable();
		},

		_clear: function() {

			if (!this._inputInstance) {
				return;
			}

			this._inputInstance.emit('reset');
			this._enable();
		},

		placeAt: function(node) {

			this._inputInstance.placeAt(node);
		},

		_setValue: function(name, oldValue, value) {

			if (oldValue === value) {
				return;
			}

			var obj = {};

			// TODO quizá hay que detectar aquí si el modelo requiere objeto o entero, probar
			if (value && this.setValueAsObject) {
				obj[this.propertyName] = {};
				obj[this.propertyName][this.idProperty] = value;
				obj[this.propertyName][this._inputProps.labelAttr] = this._inputInstance.label;
			} else {
				obj[this.propertyName] = value;
			}

			this._emitSetValue(obj);
		},

		_valueChanged: function(obj) {

			if (this._isPropertyNameValue(obj)) {
				if (obj[this.propertyName]) {
					this._valueObjPendingToComplete = obj;
					this._getLabelAttr();
				} else {
					this._inputInstance && this._inputInstance.emit('reset');
					this._emitChanged(obj[this.propertyName]);
				}
			} else if (this._isItem(obj)) {
				this._inputInstance && this._inputInstance.emit('setItem', obj);
				this._emitChanged(obj[this.idProperty]);
			} else if (this._isPropertyNameObject(obj)) {
				this._inputInstance && this._inputInstance.emit('setItem', obj[this.propertyName]);
				this._emitChanged(obj[this.propertyName][this.idProperty]);
			}
		},

		_doClear: function() {

			this._clear();

			if (this.modelChannel && this.propertyName && this.propertyName !== this.getChannel()) {
				this._publish(this._buildChannel(this.modelChannel, this.actions.CLEAR), {
					properties: [this.propertyName]
				});
			}
		},

		_isPropertyNameObject: function(obj) {

			if (obj[this.propertyName][this._inputProps.labelAttr] && obj[this.propertyName][this.idProperty]) {
				return true;
			}

			return false;
		},

		_isPropertyNameValue: function(obj) {

			if ((typeof obj[this.propertyName] !== "object" || obj[this.propertyName] === null) && !this._isItem(obj)) {
				return true;
			}

			return false;
		},

		_isItem: function(obj) {

			return obj[this._inputProps.labelAttr] && obj[this.idProperty];
		},

		_chkPropertyIsMine: function(res) {

			return this.inherited(arguments) || this._isItem(res);
		},

		_getLabelAttr: function() {

			this._emitEvt('GET_PROPERTY_VALUE', {
				propertyName: this.propertyName,
				valueProperty: this._inputProps.labelAttr
			});
		},

		_enable: function() {

			this._inputInstance.emit("enabled");
		},

		_disable: function() {

			this._inputInstance.emit("disabled");
		},

		_gotPropertyValue: function(res) {

			var labelPropertyName = this._inputProps.labelAttr,
				obj = {};

			if (res[labelPropertyName]) {
				if (!this._valueObjPendingToComplete) {
					return;
				}

				obj[this.idProperty] = this._valueObjPendingToComplete[this.propertyName];
				obj[labelPropertyName] = res[labelPropertyName];
			} else if (res.hasOwnProperty(labelPropertyName) && !res[labelPropertyName]) {

				var objGet = {
					target: this.target,
					requesterId: this.getOwnChannel(),
					id: this._valueObjPendingToComplete[this.propertyName]
				};

				if (this.type) {
					objGet.type = this.type;
				}

				this._emitEvt('GET', objGet);

				return;
			} else {
				obj[this.propertyName] = res.value;
			}

			this._valueObjPendingToComplete = null;

			this._isValid = res.isValid;
			this._inputInstance.emit('validate');

			this._valueChanged(obj);
		},

		_itemAvailable: function(res) {

			var labelPropertyName = this._inputProps.labelAttr,
				data = res.data,
				obj = {
					propertyName: this.propertyName,
					isValid: true
				};

			if (labelPropertyName.indexOf('{') !== -1 && labelPropertyName.indexOf('}') !== -1) {
				obj[labelPropertyName] = lang.replace(labelPropertyName, data);
			} else {
				obj[labelPropertyName] = data[labelPropertyName];
			}

			this._gotPropertyValue(obj);
		}
	});
});
