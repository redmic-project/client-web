define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, lang
	, aspect
	, redmicConfig
	, Credentials
){
	return declare(null, {
		//	Summary:
		//		Extensión para el módulo de tareas para gestionar los datos de edición
		//	Description:

		constructor: function(args) {

			if (!Credentials.userIsEditor()) {
				return;
			}

			this.config = {
				// own actions
				ingestDataActions: {
					INGEST_DATA_RUN: "ingestDataRun",
					INGEST_DATA_RESUME: "ingestDataResume",
					INGEST_DATA_STOP: "ingestDataStop",
					INGEST_DATA_STATUS_UPDATE: "ingestDataStatusUpdate"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setIngestDataConfigurations));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineIngestDataSubscriptions));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixIngestDataEventsAndActions));
		},

		_setIngestDataConfigurations: function() {

			this.ingestBaseTarget = this.baseTarget + "ingest/";

			this.socketChannels = this._merge([{
				ingestStatus: {
					baseTarget: this.baseSubscriptionsTarget + this.ingestBaseTarget + 'status',
					callback: lang.hitch(this, this._receiveSocketIngestDataStatus)
				}
			}, this.socketChannels || {}]);
		},

		_mixIngestDataEventsAndActions: function () {

			lang.mixin(this.actions, this.ingestDataActions);

			delete this.ingestDataActions;
		},

		_defineIngestDataSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("INGEST_DATA_RUN"),
				callback: "_subIngestDataRun"
			},{
				channel : this.getChannel("INGEST_DATA_RESUME"),
				callback: "_subIngestDataResume"
			},{
				channel : this.getChannel("INGEST_DATA_STOP"),
				callback: "_subIngestDataStop"
			});
		},

		_subIngestDataRun: function(request) {
			//	summary:
			//		Se ejecuta cuando se manda a guardar o editar datos
			//	tags:
			//		private

			this._emitEvt('SEND_SOCKET', {
				target: this.ingestBaseTarget + request.service + "/run",
				message: request.message
			});
		},

		_subIngestDataResume: function(request) {
			//	summary:
			//		Se ejecuta cuando se manda a guardar o editar datos
			//	tags:
			//		private

			this._emitEvt('SEND_SOCKET', {
				target: this.ingestBaseTarget + request.service + "/resume/" + request.id,
				message: request.message
			});
		},

		_subIngestDataStop: function(request) {
			//	summary:
			//		Se ejecuta cuando se manda a guardar o editar datos
			//	tags:
			//		private

			this._emitEvt('SEND_SOCKET', {
				target: this.ingestBaseTarget + request.service + "/stop/" + request.id,
				message: {}
			});
		},

		_receiveSocketIngestDataStatus: function(response) {
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

			this._publish(this.getChannel("INGEST_DATA_STATUS_UPDATE"), result);
		},

		_ingestBuildDescription: function(obj) {

			if (obj.status === this._taskStatus.FAILED) {

				var description = this.i18n.failedIngestTask1 + this._processTaskName(obj) + this.i18n.failedIngestTask2,
					parameters = obj.parameters,
					url;

				if (parameters && parameters.activityId) {
					url = lang.replace(redmicConfig.viewPaths.activityGeoDataLoad, {
						activityid: parameters.activityId,
						id: parameters.surveyId || parameters.elementUuid
					});
				} else if (obj.taskName === "ingest-data-document") {
					url = redmicConfig.viewPaths.documentLoad;
				}

				if (url) {
					description += '<a href="' + url + '" d-state-url=true"> ' + this.i18n.here + '</a>';
				}

				description += this.i18n.failedIngestTask3;

				return description;
			}
		},

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


			if (obj.status === this._taskStatus.FAILED && obj.error && obj.error.exceptionId !== "02") {
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
