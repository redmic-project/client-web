define([
	'alertify/alertify.min'
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/base/Credentials"
], function(
	alertify
	, redmicConfig
	, declare
	, lang
	, aspect
	, Credentials
){
	return declare(null, {
		//	Summary:
		//		Extensión para el módulo de tareas para gestionar la descarga de reports
		//	Description:
		//		Recibe una petición con el target del servicio y el formato del fichero en el
		//		que desea recibir los reports, obtiene los seleccionados y manda un post al servicio,
		//		cuando el servicio responde con la url del fichero, este lo devuelve mediante una alerta

		constructor: function(args) {

			this.config = {
				// own actions
				reportActions: {
					GET_REPORT: "getReport"
				}
			};

			lang.mixin(this, this.config, args);

			this.reportBaseTarget = this.baseTarget + "report/";

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setReportConfigurations));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineReportSubscriptions));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixReportEventsAndActions));
		},

		_setReportConfigurations: function() {

			this.socketChannels = this._merge([{
				reportStatus: {
					baseTarget: this.baseSubscriptionsTarget + this.reportBaseTarget + 'status',
					services: ["activity", "program", "project", "species", "document"],
					callback: lang.hitch(this, this._receiveSocketReportStatus)
				}
			}, this.socketChannels || {}]);
		},

		_mixReportEventsAndActions: function () {

			lang.mixin(this.actions, this.reportActions);

			delete this.reportActions;
		},

		_defineReportSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("GET_REPORT"),
				callback: "_subGetReport"
			});
		},

		_receiveSocketReportStatus: function(response) {
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

		_subGetReport: function(request) {
			//	summary:
			//		Se ejecuta cuando algún módulo pide obtener el fichero de descarga
			//	tags:
			//		private

			this.serviceTag = request.serviceTag;
			delete request.format;

			this.selectorTarget = request.target;

			request.requesterId = this.getOwnChannel();

			request.id ? this._emitRunTaskReport(request.id) : this._emitEvt('TOTAL');

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "downloadReport" + this.serviceTag
				}
			});
		},

		_totalAvailable: function(request) {
			//	summary:
			//		Se ejecuta cuando selector devuelve los seleccionados
			//	tags:
			//		private

			if (request.total >= 1) {
				var selectId = Credentials.get("selectIds")[request.target];
				if (request.total > 1) {
					alertify.prompt(null,
						null,
						lang.hitch(this, function(evt, value) {
							this._emitRunTaskReport(selectId, value);
						})).setHeader(this.i18n.chooseReportTitle);
				} else {
					this._emitRunTaskReport(selectId);
				}

			} else {
				this._emitEvt('COMMUNICATION', {type: "alert", level:"success", description: this.i18n.noItem});
			}
		},

		_emitRunTaskReport: function(selectId, title) {
			//	summary:
			//		Se ejecuta cuando se envía una petición de generación
			//		de report
			//	tags:
			//		private

			var query = {
				id: new Date().getTime(),
				selectId: selectId
			};

			if (title) {
				query.titleDefinedByUser = title;
			}

			this._emitEvt('SEND_SOCKET', {
				target: this.reportBaseTarget + this.serviceTag + "/run",
				message: query
			});
		},

		_reportBuildDescription: function(obj) {

			if (obj.status === this._taskStatus.REGISTERED) {
				return this.i18n.registeredReport1 + this._processTaskName(obj) + this.i18n.registeredReport2;
			}

			if (obj.status === this._taskStatus.ENQUEUED) {
				return this.i18n.enquedenReport1 + this._processTaskName(obj) + this.i18n.enqueuedReport2;
			}

			if (obj.status === this._taskStatus.STARTED) {
				return this.i18n.startedReport1 + this._processTaskName(obj) + this.i18n.startedReport2;
			}

			if (obj.status === this._taskStatus.RUNNING) {
				return this.i18n.runningReport1 + this._processTaskName(obj) + this.i18n.runningReport2;
			}

			if (obj.status === this._taskStatus.COMPLETED) {
				var resultUrl = obj.taskResult.replace('/api', redmicConfig.apiUrlVariable),
					downloadPath = redmicConfig.getServiceUrl(resultUrl),
					downloadUrl = downloadPath + '?access_token=' + Credentials.get("accessToken");

				return this.i18n.completedReport1 + this._processTaskName(obj) +
					this.i18n.completedReport2 + '<a href="' + downloadUrl + '" target="_blank">' +
					'<i class="fa iconList fa-download iconDownloadReport" title="' + this.i18n.download + '"></i></a>';
			}

			if (obj.status === this._taskStatus.FAILED) {
				return this.i18n.failedReport1 + this._processTaskName(obj) + this.i18n.failedReport2;
			}

			if (obj.status === this._taskStatus.CANCELLED) {
				return this.i18n.cancelledReport1 + this._processTaskName(obj) + this.i18n.cancelledReport2;
			}
		},

		_reportRequestByStatus: function(obj) {

			if (obj.status === this._taskStatus.REGISTERED) {
				return {
					level: {
						icon: "fa-registered",
						iconClass: "notice"
					},
					notCount: true
				};
			}

			if (obj.status === this._taskStatus.COMPLETED) {
				return {
					level: "success",
					showAlert: true
				};
			}
		}
	});
});
