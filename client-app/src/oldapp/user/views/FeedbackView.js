define([
	'alertify/alertify.min'
	, 'app/components/ReCaptcha'
	, "app/user/models/FeedbackModel"
	, "app/user/views/_ExternalUserBaseView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/query"
	, "dojo/text!./templates/Feedback.html"
	, "src/utils/Credentials"
	, "src/component/form/FormContainerImpl"
	, "src/component/form/_ListenModelHasChanged"
	, "src/component/model/ModelImpl"
], function(
	alertify
	, ReCaptcha
	, feedbackModelSchema
	, _ExternalUserBaseView
	, redmicConfig
	, declare
	, lang
	, query
	, template
	, Credentials
	, FormContainerImpl
	, _ListenModelHasChanged
	, ModelImpl
) {

	return declare(_ExternalUserBaseView, {
		// summary:
		// 	Vista de feedback
		//
		// description:
		// 	Permite mantener feedback con los usuarios de la aplicación

		constructor: function (args) {

			this.config = {
				templateProps:  {
					templateString: template,
					i18n: this.i18n,
					_verifyReCaptcha: this._onReCaptchaVerified,
					_onSubmitFeedback: lang.hitch(this, this._onSubmitFeedback)
				},
				reCaptcha: null,
				reCaptchaVerify: false,
				formTemplateFeedback: "user/views/templates/forms/Feedback",
				ownChannel: "feedback",
				target: redmicConfig.services.feedback,
				idProperty: "id",
				events: {
					SET_VALUE: "setValue",
					IS_VALID: "isValid",
					RESET: "reset"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.modelInstance = new ModelImpl({
				parentChannel: this.getChannel(),
				schema: feedbackModelSchema,
				target: this.target
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
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
				this.editor = new declare([FormContainerImpl, _ListenModelHasChanged])({
					target: this.target,
					idProperty: this.idProperty,
					parentChannel: this.getChannel(),
					modelChannel: this.modelInstance.getChannel(),
					template: this.formTemplateFeedback,
					formContainerConfig: {
						style:"overflow: hidden",
						region: "center",
						width: "9"
					}
				});
			}

			this._publish(this.editor.getChannel("SHOW"), {
				node: this.template.feedbackForm
			});

			this._createReCaptcha();

			if (Credentials.get("userRole") !== "ROLE_GUEST") {
				if (Credentials.get("userEmail")) {
					this._emitEvt('SET_VALUE', {
						email: Credentials.get("userEmail")
					});
				}

				if (Credentials.get("userName")) {
					this._emitEvt('SET_VALUE', {
						name: Credentials.get("userName")
					});
				}
			}

			if (this.pathVariableId) {
				this.template.titleFeedbackForm.innerHTML = this.i18n.errorReport;
				this._emitEvt('SET_VALUE', {
					subject: this.i18n.errorReport
				});

				this._emitEvt('SET_VALUE', {
					codeError: this.pathVariableId
				});
			}
		},

		_createReCaptcha: function() {

			var reCaptchaNode = query("div.reCaptcha", this.template.feedbackNode)[0],
				reCaptchaCallback = lang.hitch(this, this._onReCaptchaVerified);

			this.reCaptcha = new ReCaptcha({
				node: reCaptchaNode,
				callback: reCaptchaCallback
			});
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

		_resetForm: function() {
			//	summary:
			//		Función que resetea el formulario
			//
			//	tags:
			//		callback private

			this.reCaptcha.reset();
			this._emitEvt('RESET');
		},

		_onSubmitFeedback: function(/*Event*/ evt) {
			//	summary:
			//		Función que se ejecuta al hacer click sobre el botón de enviar feedback.
			//		Se encarga de validar y enviar el feedback
			//
			//	tags:
			//		callback private
			//

			this._once(this.modelInstance.getChannel("WAS_VALID"), lang.hitch(this, this._wasValid));

			this._submitActive = true;

			this._emitEvt('IS_VALID');
		},

		_wasValid: function(res) {

			if (this._submitActive && this.reCaptchaVerify && res.isValid) {
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
			//		Función que maneja la respuesta,
			//		manda a gestionar el error en caso de recibirlo.
			//
			//	tags:
			//		callback private
			//

			alertify.alert(
				this.i18n.success,
				this.i18n.sendFeedback,
				lang.hitch(this, function() {
					this._resetForm();
					window.location.href = "/";
				})
			);
		},

		_handleError: function(error) {
			//	summary:
			//		Función que maneja el posible error de la respuesta
			//
			//	tags:
			//		callback private

			this._resetForm();

			var msg = error.description;
			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {'exDescription': "_onSubmitFeedback " + msg, 'exFatal':false, 'appName':'API'}
			});

			this._emitEvt('COMMUNICATION', {type: "alert", level: "error", description: msg});
		}
	});
});
