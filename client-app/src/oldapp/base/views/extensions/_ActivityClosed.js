define([
	'alertify'
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/model/ModelImpl"
	, "RWidgets/Button"
], function(
	alertify
	, redmicConfig
	, declare
	, lang
	, aspect
	, ModelImpl
	, Button
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas que desean poder cerrar actividades.
		//	description:
		//		Añade funcionalidades de cerrar una actividad.

		constructor: function (args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeActivityClosed));
		},

		_initializeActivityClosed: function() {

			this.activityModelInstance = new ModelImpl({
				parentChannel: this.getChannel(),
				target: redmicConfig.services.activity
			});
		},

		postCreate: function() {

			this._getActivity();

			this.inherited(arguments);
		},

		_beforeShow: function() {

			this._getActivity();

			this.inherited(arguments);
		},

		_getActivity: function() {

			if (!this.pathVariableId || (this.lastId && this.lastId === this.pathVariableId)) {
				return;
			}

			this.lastId = this.pathVariableId;

			this._once(this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
				lang.hitch(this, function (response) {

				var data = response.res.data;

				this._activityData = data;

				this._setDataActivityClosed(data);

				this._gotActivity && this._gotActivity(data);
			}), {
				predicate: function(response) {

					var data = response.res.data;

					return data && data.activityType;
				}
			}, this);

			// TODO: elastic trae otro formato de datos, cuando se compatibilice, cambiar de api a elastic
			this._publish(this._buildChannel(this.storeChannel, this.actions.GET), {
				id: this.pathVariableId,
				target: redmicConfig.services.activity,
				requesterId: this.getOwnChannel()
			});
		},

		_addActivityClosedButton: function(node) {

			this.activityClosedButton = new Button({
				iconClass: "fa fa-lock",
				'class': "warning",
				title: this.i18n.closeActivity,
				onClick: lang.hitch(this, this._onClickActivityClosed)
			}).placeAt(node);

			this.isEndDate && this.activityClosedButton.hide();
		},

		_setDataActivityClosed: function(data) {

			if (!data) {
				return;
			}

			this.isEndDate = !!data.endDate;

			this._publish(this.activityModelInstance.getChannel("DESERIALIZE"), {
				data: data
			});

			if (this.activityClosedButton) {
				if (this.isEndDate) {
					this.activityClosedButton.hide();
				} else {
					this.activityClosedButton.show();
				}
			}
		},

		_onClickActivityClosed: function(evt) {

			if (evt.data) {
				this._setDataActivityClosed(evt.data);
			}

			alertify.confirm(this.i18n.closeActivityConfirmationTitle, this.i18n.closeActivityConfirmationMessage,
				lang.hitch(this, this._activityClosedConfirmed),
				lang.hitch(this, this._activityClosedCancelled)).set("labels", {
					ok: this.i18n.ok,
					cancel: this.i18n.cancel
				});
		},

		_activityClosedConfirmed: function() {

			this._publish(this.activityModelInstance.getChannel("SET_PROPERTY_VALUE"), {
				endDate: new Date().toISOString()
			});

			this._once(this.activityModelInstance.getChannel("WAS_VALID"),
				lang.hitch(this, this._wasValidActivityModel));

			this._publish(this.activityModelInstance.getChannel("IS_VALID"));
		},

		_wasValidActivityModel: function(res) {

			this._once(this.activityModelInstance.getChannel('SAVED'), lang.hitch(this, this._afterModelSave));
			this._publish(this.activityModelInstance.getChannel('SAVE'), {});
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

			this._setDataActivityClosed(result && result.body);
		},

		_handleError: function(error) {
			//	summary:
			//		Función que maneja el posible error de la respuesta
			//
			//	tags:
			//		callback private

			var msg = error.description;

			this._emitEvt('COMMUNICATION', {type: "alert", level: "error", description: msg});
		},

		_activityClosedCancelled: function() {

		}
	});
});
