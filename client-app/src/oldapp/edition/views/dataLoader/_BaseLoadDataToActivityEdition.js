define([
	"app/edition/views/dataLoader/_BaseDataToActivityEdition"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	_BaseDataToActivityEdition
	, declare
	, lang
	, aspect
){
	return declare([_BaseDataToActivityEdition], {
		//	summary:
		//		Vista de edición para la carga de datos.
		//	description:
		//		Muestra el wizard para la edición de una Actividad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				_taskStatus: {
					REGISTERED: "registered",
					ENQUEUED: "enqueued",
					STARTED: "started",
					RUNNING: "running",
					WAITING_INTERVENTION: "waitingIntervention",
					COMPLETED: "completed",
					FAILED: "failed",
					CANCELLED: "canceled",
					REMOVED: "removed"
				},
				actions: {
					INGEST_DATA_STATUS_UPDATE: "ingestDataStatusUpdate",
					INGEST_DATA_RUN: "ingestDataRun",
					INGEST_DATA_RESUME: "ingestDataResume",
					REMOVE: "remove",
					NEW_STATUS: "newStatus"
				},
				primaryTitleLoad: this.i18n.loadDataToActivity,
				secondaryTitleLoad: "{properties.name}"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setBaseLoadDataConfigurations));
		},

		_setBaseLoadDataConfigurations: function() {

			this.editorConfig = this._merge([{
				checkpoints: {
					loadFile: lang.hitch(this, this.checkpointLoadFile)
				}
			}, this.editorConfig || {}]);

			this.steps = this._merge([{
				loadFile: {
					props: {
						statusChannel: this.getChannel()
					}
				}
			}, this.steps || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._subscribe(this.getChannel('NEW_STATUS'), lang.hitch(this, this._subStepNewStatus));
		},

		_subStepNewStatus: function(res) {

			var step = res.step,
				status = res.status,
				count = Object.keys(this.editor._stepInstances).length;

			if (step !== 'loadFile') {
				return;
			}

			if (count > 1 && !status && this._statusLoadFile !== status) {

				var stepsClear = lang.clone(this._clearStepsByErrorTask);
				stepsClear.shift();

				this._publish(this.editor.getChannel("CLEAR"), {
					steps: stepsClear
				});

				this._publish(this.editor.getChannel('UPDATE_TRACE'), {
					deleteNextsSteps: true
				});
			}

			this._statusLoadFile = status;
		},

		_loadModeConfig: function() {

			this.titleWizard = {
				primary: this.primaryTitleLoad,
				secondary: this.secondaryTitleLoad
			};
		},

		checkpointLoadFile: function(self, dfd, results) {

			if (this._taskId) {
				var loadFile = results.loadFile;

				if (loadFile.fileName === this._lastFileName && this._lastInterventionDescription) {
					dfd.resolve({
						success: true,
						data: this._lastInterventionDescription
					});

					return;
				}

				this._publish(this._buildChannel(this.taskChannel, this.actions.REMOVE), {
					id: this._taskId
				});
			}

			this._taskId = null;

			this._lastFileName = results.loadFile.fileName;

			this._subscriptionTaskStatusCheckPointLoadFile = this._subscribe(this._buildChannel(this.taskChannel,
				this.actions.INGEST_DATA_STATUS_UPDATE), lang.hitch(this, this._subTaskStatusCheckPointLoadFile, dfd));

			this._publish(this._buildChannel(this.taskChannel, this.actions.INGEST_DATA_RUN), {
				message: this._createObjInitializeTask(results),
				service: this.serviceSocket
			});
		},

		_createObjInitializeTask: function(results) {

			return {
				parameters: {}
			};
		},

		_subTaskStatusCheckPointLoadFile: function(dfd, res) {

			if (!this._taskId && res.status === this._taskStatus.REGISTERED) {
				this._taskId = res.id;
			} else if (this._taskId == res.id && res.status === this._taskStatus.WAITING_INTERVENTION) {
				dfd.resolve({
					success: true,
					data: res.interventionDescription
				});

				this._lastInterventionDescription = res.interventionDescription;

				this._unsubscribe(this._subscriptionTaskStatusCheckPointLoadFile);
			}
		},

		_wizardComplete: function(response) {

			this._subscriptionTaskStatusWizardComplete = this._setSubscription({
				channel: this._buildChannel(this.taskChannel, this.actions.INGEST_DATA_STATUS_UPDATE),
				callback: "_subTaskStatusWizardComplete"
			});

			this._publish(this._buildChannel(this.taskChannel, this.actions.INGEST_DATA_RESUME), {
				message: response.data.relationData,
				id: this._taskId,
				service: this.serviceSocket
			});
		},

		_subTaskStatusWizardComplete: function(res) {

			if (this._taskId == res.id) {

				this._taskStatusValue = res.status;

				if (res.status === this._taskStatus.RUNNING) {
					this._statusEnd();
					this._closeWizardWithRunningTask = true;
					this._editionSuccessDfd.resolve();
				} else if (res.status === this._taskStatus.FAILED) {
					this._statusEnd();

					if (res.error && (res.error.exceptionId !== "02")) {
						this._publish(this.editor.getChannel("CLEAR"), {
							steps: this._clearStepsByErrorTask
						});

						this._publish(this.editor.getChannel("GO_TO_STEP"), {
							stepId: "loadFile",
							updateTrace: true
						});
					}
				}
			}
		},

		_statusEnd: function() {

			this._removeSubscription(this._subscriptionTaskStatusWizardComplete);

			this._emitEvt('LOADED');
		},

		_wizardHidden: function(response) {

			if (this._taskId && !this._closeWizardWithRunningTask) {
				this._publish(this._buildChannel(this.taskChannel, this.actions.REMOVE), {
					id: this._taskId
				});
			}

			this._closeWizardWithRunningTask = false;

			this.inherited(arguments);
		}
	});
});
