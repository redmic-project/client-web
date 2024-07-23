define([
	'alertify/alertify.min'
	, 'app/components/ReCaptcha'
	, "app/user/models/RegisterModel"
	, "app/user/views/_ExternalUserBaseView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/query"
	, "dojo/text!./templates/Register.html"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/_ListenModelHasChanged"
	, "redmic/modules/form/_PublicateChanges"
	, "redmic/modules/model/ModelImpl"
], function(
	alertify
	, ReCaptcha
	, registerModelSchema
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, query
	, template

	, FormContainerImpl
	, _ListenModelHasChanged
	, _PublicateChanges
	, ModelImpl
){
	return declare(_ExternalUserBaseView, {
		// summary:
		// 	Vista de register
		//
		// description:
		// 	Permite registrarse en la aplicación

		constructor: function (args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_onClickRegister: this._onClickRegister,
					_onRegister: this._onRegister,
					_verifyReCaptcha: this._onReCaptchaVerified,
					_onCloseRegister: lang.hitch(this, this._onCloseRegister),
					_onSubmitRegister: lang.hitch(this, this._onSubmitRegister)
				},
				actions: {
					COOKIES_STATE: "cookiesState",
					COOKIES_ACCEPTED: "cookiesAccepted"
				},
				events: {
					COOKIES_STATE: "cookiesState",
					SET_VALUE: "setValue",
					IS_VALID: "isValid",
					RESET: "reset"
				},
				reCaptcha: null,
				reCaptchaVerify: false,
				formTemplateRegister: "user/views/templates/forms/Register",
				ownChannel: "register",
				target: redmicConfig.services.register,
				_acceptTermsAndConditions: false
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.modelInstance = new ModelImpl({
				parentChannel: this.getChannel(),
				schema: registerModelSchema,
				target: this.target
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.credentialsChannel, this.actions.COOKIES_ACCEPTED),
				callback: "_subCookiesAccepted"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'COOKIES_STATE',
				channel: this._buildChannel(this.credentialsChannel, this.actions.COOKIES_STATE)
			},{
				event: 'SET_VALUE',
				channel: this.modelInstance.getChannel("SET_PROPERTY_VALUE")
			},{
				event: 'IS_VALID',
				channel: this.modelInstance.getChannel("IS_VALID")
			},{
				event: 'RESET',
				channel: this.modelInstance.getChannel("RESET")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (!this.editor) {
				this.editor = new declare([FormContainerImpl, _ListenModelHasChanged]).extend(_PublicateChanges)({
					target: this.target,
					idProperty: this.idProperty,
					parentChannel: this.getChannel(),
					modelChannel: this.modelInstance.getChannel(),
					template: this.formTemplateRegister,
					formContainerConfig: {
						style:"overflow: hidden",
						region: "center",
						width: "9",
						_onShowTermsAndConditions: lang.hitch(this, this._onShowTermsAndConditions)
					}
				});
			}

			this._publish(this.editor.getChannel("SHOW"), {
				node: this.template.registerForm
			});

			this._subscribe(this.editor.getChannel("VALUE_CHANGED"),
				lang.hitch(this, this._subFormChanged));

			this._emitEvt('COOKIES_STATE');
		},

		_subCookiesAccepted: function() {

			this._createReCaptcha();
		},

		_createReCaptcha: function() {

			var reCaptchaNode = query("div.reCaptcha", this.template.registerNode)[0],
				reCaptchaCallback = lang.hitch(this, this._onReCaptchaVerified);

			this.reCaptcha = new ReCaptcha({
				node: reCaptchaNode,
				callback: reCaptchaCallback
			});
		},

		_subFormChanged: function(res) {

			if (res && res.property == 'accept') {
				this._acceptTermsAndConditions = res.value;
			}
		},

		_onReCaptchaVerified: function(){
			//	summary:
			//		Callback de recaptcha donde se setea el token recibido por recaptcha para
			//		enviarlo a la api y desde allí enviar la confirmación.
			//	tags:
			//		private
			//

			this.reCaptchaVerify = true;
			this._emitEvt('SET_VALUE', {
				reCaptcha: this.reCaptcha.getResponse()
			});
		},

		_onCloseRegister: function() {
			// summary:
			//		Función que se ejecuta al hacer click sobre el botón de cancelar el registro.
			//		Se limpia el recaptcha, el formulario y se cambia la vista
			//
			//	tags:
			//		callback private
			//

			this._resetForm();
			window.location.href = "/";
		},

		_resetForm: function() {
			//	summary:
			//		Función que resetea el formulario
			//
			//	tags:
			//		callback private

			this.reCaptcha.reset();
			this._emitEvt('RESET');
			this._acceptTermsAndConditions = false;
		},

		_onSubmitRegister: function(/*Event*/ evt) {
			//	summary:
			//		Función que se ejecuta al hacer click sobre el botón de aceptar el registro.
			//		Se encarga de validar y enviar la petición del registro
			//
			//	tags:
			//		callback private
			//
			this._once(this.modelInstance.getChannel("WAS_VALID"), lang.hitch(this, this._wasValid));

			this._submitActive = true;

			this._emitEvt('IS_VALID');
		},

		_wasValid: function(res) {

			if (this._submitActive && this.reCaptchaVerify && res.isValid && this._acceptTermsAndConditions) {
				this._once(this.modelInstance.getChannel('SAVED'), lang.hitch(this, this._afterModelSave));
				this._publish(this.modelInstance.getChannel('SAVE'), {});
			}

			this._submitActive = false;
		},

		_afterModelSave: function(res) {

			if (res.success) {
				this._handleResponse(res.data);
			} else {
				this._handleError(res.data);
			}
		},

		_handleResponse: function(result) {
			//	summary:
			//		Función que maneja la respuesta del registro,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			alertify.alert(this.i18n.success, this.i18n.activateAccount, lang.hitch(this, function() {

				this._resetForm();
				window.location.href = "/";
			}));
		},

		_handleError: function(error) {
			//	summary:
			//		Función que maneja el posible error de la respuesta de registro
			//
			//	tags:
			//		callback private

			this._resetForm();

			var msg = error.description;
			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {'exDescription': "_onSubmitRegister " + msg, 'exFatal':false, 'appName':'API'}
			});

			this._emitEvt('COMMUNICATION', {type: "alert", level: "error", description: msg});
		},

		_onShowTermsAndConditions: function(/*event*/ evt) {
			//	summary:
			//		Función que redirige a los términos y condiciones de redmic.
			//
			//	tags:
			//		callback private
			//

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "showTermsAndConditions"
				}
			});

			window.location.href = "terms-and-conditions";
		}
	});
});
