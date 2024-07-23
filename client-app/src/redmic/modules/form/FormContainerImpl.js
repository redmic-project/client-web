define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "redmic/modules/form/form/FormContainer"
	, "./Form"
], function(
	declare
	, lang
	, aspect
	, Deferred
	, all
	, FormContainer
	, Form
){
	return declare(Form, {
		//	summary:
		//		Todo lo necesario para trabajar con Form.
		//	description:
		//		Proporciona métodos y contenedor para el formulario.

		constructor: function(args) {

			this.config = {
				target: null,
				template: null,
				title: this.i18n.form,
				'class': 'formContainer',
				_inputsInfo: {},
				_inputsChannelsByPropertyName: {},
				status: false,
				validCompleteModel: true
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setFormContainerImplConfigurations));
		},

		_setFormContainerImplConfigurations: function() {

			this.formContainerConfig = this._merge([{
				region: "center",
				template: this.template,
				dataTemplate: this.dataTemplate,
				instance: this.instance,
				i18n: this.i18n,
				parentChannel: this.getChannel(),
				loadInputs: lang.hitch(this, this._receiveInputs),
				modelChannel: this.modelChannel,
				inputsProps: {}
			}, this.formContainerConfig || {}]);
		},

		_beforeShow: function(req) {

			if (!this._showDfd) {
				this._showDfd = new Deferred();
				this._showDfd.then(lang.hitch(this, this._render, req));
			}

			if (!this.form) {
				this.form = new FormContainer(this.formContainerConfig);
				this.form.placeAt(this._getNodeToShow());

				this.form.startup();

			} else {
				this._render(req);
			}
		},

		_render: function(/*Object*/ item) {

			if (item.data) {
				this._setData(item.data, item.toInitValues, item.keepAllData);
			}
		},

		_wasValid: function(res) {

			if (!this.validCompleteModel && res.propertyName === undefined && res.errors) {
				this._validationErrorsChanged(res.errors);
			}

			if (!this.validCompleteModel) {
				return;
			}

			this._modelIsValid = res.isValid;

			this._checkIsValidStatus();
		},

		_validationErrorsChanged: function(errors) {

			if (this.validCompleteModel) {
				return;
			}

			var valid = true,
				inputKeys = Object.keys(this._inputsInfo);

			if (!inputKeys.length) {
				valid = !Object.keys(errors).length;
			} else {
				for (var i = 0; i < inputKeys.length; i++) {
					var inputKey = inputKeys[i];

					if (errors[inputKey]) {
						valid = false;
						break;
					}
				}
			}

			this._modelIsValid = valid;

			this._checkIsValidStatus();
		},

		_receiveInputs: function(inputs) {

			this._inputsInfo = inputs;
			this._inputsInfoDefault = lang.clone(inputs);
			this._showAndListenInputs();
		},

		_showAndListenInputs: function() {

			var dfdList = {};

			for (var key in this._inputsInfo) {

				var inputInfo = this._inputsInfo[key],
					channel = inputInfo.channel,
					propertyNameDependence = inputInfo.propertyNameDependence,
					parent = inputInfo.parent,
					node = inputInfo.node;

				if (!this._inputsChannelsByPropertyName[channel]) {
					this._inputsChannelsByPropertyName[channel] = key;
				}

				var dfd = new Deferred();
				dfdList[key] = dfd;

				this._listenInputDisconnected(channel, key, dfd);

				this._listenInputValueChanges(channel);

				if (propertyNameDependence) {
					var relatedInputInfo = this._inputsInfo[propertyNameDependence];
					this._listenRelatedInputValueChanges(relatedInputInfo.channel, channel);
				}

				if (parent) {
					var parentInputInfo = this._inputsInfo[parent];
					this._insertInputInParent(parentInputInfo.channel, node);
				}

				this._once(this._buildChannel(channel, this.actions.SHOWN), dfd.resolve);

				this._publish(this._buildChannel(channel, this.actions.SHOW), {
					node: node
				});
			}

			all(dfdList).then(this._showDfd.resolve);

			this._checkIsValidStatus();
		},

		_listenInputDisconnected: function(channel, inputName, dfd) {

			this._subscribe(this._buildChannel(channel, this.actions.DISCONNECTED), lang.hitch(this,
				this._subInputDisconnected, inputName, dfd));
		},

		_listenInputValueChanges: function(channel) {

			this._subscribe(this._buildChannel(channel, this.actions.VALUE_CHANGED), lang.hitch(this,
				this._subValueChanged, channel));
		},

		_listenRelatedInputValueChanges: function(relatedChannel, channel) {

			this._subscribe(this._buildChannel(relatedChannel, this.actions.VALUE_CHANGED), lang.hitch(this,
				function(channel, obj) {

				this._publish(this._buildChannel(channel, this.actions.DEPENDENCE_VALUE_CHANGED), obj);
			}, channel));
		},

		_insertInputInParent: function(parentChannel, node) {

			this._publish(this._buildChannel(parentChannel, this.actions.EMBED_ELEMENT), {
				node: node
			});
		},

		_subInputDisconnected: function(inputName, dfd, res) {

			if (dfd && !dfd.isFulfilled()) {
				dfd.resolve();
			}

			delete this._inputsInfo[inputName];
		},

		_subValueChanged: function(channel, res) {

			this.valueChanged(res);

			var name = this._inputsChannelsByPropertyName[channel],
				isValid = res.isValid,
				inputInfo = this._inputsInfo[name];

			if (isValid !== undefined && inputInfo) {
				this._inputsInfo[name].isValid = isValid;
				this._checkIsValidStatus();
			}
		},

		_checkIsValidStatus: function() {

			if (this._modelIsValid === undefined) {
				this._emitEvt('GET_IS_VALID_STATUS');
				return;
			}

			var isValid = this._modelIsValid;

			if (isValid) {
				for (var key in this._inputsInfo) {
					if (!this._inputsInfo[key].isValid) {
						isValid = false;
						break;
					}
				}
			}

			this._emitEvt('GOT_IS_VALID_STATUS', {
				"isValid": isValid
			});

			this.status = isValid;
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_submit: function() {

			if (this.status) {
				this._emitEvt('DISABLE_BUTTONS');
				this._emitEvt('LOADING');

				this._doSubmitInInputs();
			} else {
				this._emitEvt('ENABLE_BUTTONS');
				this._emitEvt('SUBMITTED', {
					error: {
						description: this._descriptionError()
					}
				});
			}
		},

		_descriptionError: function(inputName) {

			if (!inputName) {
				for (var key in this._inputsInfo) {
					if (!this._inputsInfo[key].isValid) {
						inputName = key;
						break;
					}
				}
			}

			return this._generateDescriptionError(inputName);
		},

		_generateDescriptionError: function(inputName) {

			if (inputName) {
				return this.i18n.textDescriptionErrorForm + (this.i18n[inputName] ? this.i18n[inputName] : inputName);
			} else {
				return this.i18n.textDescriptionErrorDefaultForm;
			}
		},

		_doSubmitInInputs: function() {

			var dfdList = {};

			for (var key in this._inputsInfo) {
				this._doSubmitInInput(key, dfdList);
			}

			all(dfdList).then(
				lang.hitch(this, this._onInputsSubmitted),
				lang.hitch(this, this._onInputsError)
			);
		},

		_doSubmitInInput: function(key, dfdList) {

			var dfd = new Deferred(),
				inputChannel = this._inputsInfo[key].channel;

			dfdList[key] = dfd;

			this._once(this._buildChannel(inputChannel, this.actions.SUBMITTED), lang.hitch(this,
				this._onInputSubmitted, {
					dfd: dfd,
					key: key,
					channel: inputChannel
				}));

			this._publish(this._buildChannel(inputChannel, this.actions.SUBMIT));
		},

		_onInputSubmitted: function(inputInfo, res) {

			var dfd = inputInfo.dfd;
			if (!res || !dfd || dfd.isFulfilled()) {
				return;
			}

			if (res.success) {
				dfd.resolve();
			} else if (res.error) {
				res.error.propertyName = res.propertyName;
				dfd.reject(res.error);
			} else if (res.cancel) {
				dfd.cancel(res.cancel);
			} else {
				var inputKey = inputInfo.key,
					inputChannel = inputInfo.channel;

				console.error("Failed to submit at input '%s' with channel '%s' without any reason", inputKey,
					inputChannel);
			}
		},

		_onInputsError: function(res) {

			this._emitEvt('LOADED');
			this._emitEvt('ENABLE_BUTTONS');

			var description = this._descriptionError(res.propertyName);

			if (res.description) {
				description += '. ' + res.description + '.';
			}

			this._emitEvt('SUBMITTED', {
				error: {
					description: description
				}
			});
		},

		_onInputsSubmitted: function(res) {

			this._emitEvt('LOADED');

			this._submitDfd = new Deferred();

			this._submitDfd.then(lang.hitch(this, this._emitSubmitted));

			this._serialize();
		},

		_emitSubmitted: function(res) {

			delete this._submitDfd;
			this._emitEvt('ENABLE_BUTTONS');
			this._emitEvt('SUBMITTED', {
				data: res.data
			});
		},

		_cancel: function() {

			this.cancel();
		},

		cancel: function() {

			this._clear();
			this._hide();
			this._emitEvt('CANCELLED');
		},

		_afterShow: function(req) {

			return this._showDfd;
		},

		_shown: function(evt) {

			this._emitEvt("GET_IS_VALID_STATUS");
		},

		_disconnect: function(evt) {

			for (var key in this._inputsInfo) {
				this._publish(this._buildChannel(this._inputsInfo[key].channel, this.actions.DISCONNECT));
			}
		},

		_connect: function(evt) {

			if (this._inputsInfoDefault) {
				this._inputsInfo = lang.clone(this._inputsInfoDefault);
				for (var key in this._inputsInfo) {
					this._publish(this._buildChannel(this._inputsInfo[key].channel, this.actions.CONNECT));
					this._publish(this._buildChannel(this._inputsInfo[key].channel, this.actions.SHOW));
				}
			}
		},

		_ancestorResized: function(evt) {

			this.form && this.form.resize();
		},

		_setMethod: function(/*Object*/ methods) {

			for (var key in methods) {
				this.form[key] = methods[key];
			}
		},

		_reset: function() {

			if (this.validCompleteModel) {
				this._emitEvt('RESET');
			}

			this._emitEvt('RESETTED');

			for (var key in this._inputsInfo) {
				this._publish(this._buildChannel(this._inputsInfo[key].channel, this.actions.RESET));
			}

			this._checkIsValidStatus();
		},

		_clear: function() {

			if (this.validCompleteModel) {
				this._emitEvt('CLEAR');
			}

			this._emitEvt('CLEARED');

			for (var key in this._inputsInfo) {
				this._publish(this._buildChannel(this._inputsInfo[key].channel, this.actions.CLEAR));
			}

			this._checkIsValidStatus();
		},

		_setPropertyValue: function(/*String*/ propertyName, value) {

			if (!this.form) {
				console.error("Tried to set form property '%s' before it was built at '%s'", propertyName,
					this.getChannel());

				return;
			}

			var obj = {};
			obj[propertyName] = value;

			this._emitEvt('SET_PROPERTY_VALUE', obj);
		},

		_setData: function(/*Object*/ data,/*Boolean?*/ toInitValues,/*Boolean?*/ keepAllData) {

			if (data[this.idProperty]) {
				this._activateEditionMode();
			}

			this._emitEvt('DESERIALIZE', {
				data: data,
				toInitValues: toInitValues,
				keepAllData: keepAllData
			});
		},

		_activateEditionMode: function() {

			for (var key in this._inputsInfo) {
				var inputInfo = this._inputsInfo[key];
				this._publish(this._buildChannel(inputInfo.channel, this.actions.ENABLE_EDITION_MODE));
			}
		},

		_serialize: function() {

			this._emitEvt('SERIALIZE');
		},

		_disableProperty: function(/*String*/ propertyName) {

			var inputInfo = this._inputsInfo[propertyName];
			inputInfo && this._publish(this._buildChannel(inputInfo.channel, this.actions.DISABLE));
		},

		_enableProperty: function(/*String*/ propertyName) {

			var inputInfo = this._inputsInfo[propertyName];
			inputInfo && this._publish(this._buildChannel(inputInfo.channel, this.actions.ENABLE));
		}
	});
});
