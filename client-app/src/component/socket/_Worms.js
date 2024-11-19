define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	Summary:
		//		Extensión para el módulo de tareas para gestionar los datos de edición
		//	Description:

		constructor: function(args) {

			this.config = {
				// own actions
				wormsActions: {
					WORMS_RUN: "wormsRun"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setWormsConfigurations));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineWormsSubscriptions));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixWormsEventsAndActions));
		},

		_setWormsConfigurations: function() {

			this.wormsBaseTarget = this.baseTarget + "wormstoredmic/";

			this.socketChannels = this._merge([{
				ingestStatus: {
					baseTarget: this.baseSubscriptionsTarget + this.wormsBaseTarget + '/status',
					callback: lang.hitch(this, this._receiveSocketWormsStatus)
				}
			}, this.socketChannels || {}]);
		},

		_mixWormsEventsAndActions: function () {

			lang.mixin(this.actions, this.wormsActions);

			delete this.wormsActions;
		},

		_defineWormsSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("WORMS_RUN"),
				callback: "_subWormsRun"
			});
		},

		_subWormsRun: function(request) {
			//	summary:
			//		Se ejecuta cuando se manda a actualizar las especies
			//	tags:
			//		private

			this._emitEvt('SEND_SOCKET', {
				target: this.wormsBaseTarget + "run",
				message: {}
			});
		},

		_receiveSocketWormsStatus: function(response) {
			//	summary:
			//		Se ejecuta cuando se recibe la respuesta de la petición mediante el socket
			//	tags:
			//		private

			var result = JSON.parse(response.body);

			if (result.status === this._taskStatus.REMOVED) {
				this._emitEvt('COMMUNICATION_DELETE', {
					id: result.id,
					type: "task"
				});
			} else {
				this._buildAndEventNotification(result);
			}
		},

		/*_wormsBuildDescription: function(obj) {

		},*/

		_ingestRequestByStatus: function(obj) {

			if (obj.status === this._taskStatus.RUNNING) {
				return {
					level: "progress",
					progress: null,
					showAlert: true
				};
			}

			if (obj.status === this._taskStatus.COMPLETED) {
				return {
					level: "success"
				};
			}


			if (obj.status === this._taskStatus.FAILED) {
				return {
					level: "error"
				};
			}

			return {
				notSend: true
			};
		}
	});
});
