define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_AuthFirewall"
	, "src/component/base/_Module"
	, "src/component/base/_Store"
	, "src/component/base/_Selection"
	, "src/util/Credentials"
], function(
	declare
	, lang
	, _AuthFirewall
	, _Module
	, _Store
	, _Selection
	, Credentials
){
	return declare([_Module, _AuthFirewall, _Store, _Selection], {
		//	Summary:
		//		Módulo para gestionar la ejecución de tareas en segundo plano via sockets

		constructor: function(args) {

			this.config = {
				actions: {
					REFRESH_STATUS: "refreshStatus",
					ALL_TASK: "allTask",
					SOCKET_CONNECT: "socketConnect",
					GENERATE_NEW_SUBSCRIPTIONS: "generateNewSubscriptions",
					BUTTON_EVENT: "btnEvent",
					SEND: "send",
					REMOVE: "remove"
				},
				events: {
					SEND_SOCKET: "sendSocket",
					GENERATE_NEW_SUBSCRIPTIONS: "generateNewSubscriptions"
				},
				ownChannel: "task",

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

				baseTarget: "/socket/tasks/"
			};

			lang.mixin(this, this.config, args);

			this.baseSubscriptionsTarget = '/user/' + Credentials.get("userId");
		},

		_setConfigurations: function() {

			this.socketChannels = this._merge([{
				getTasks: {
					baseTarget: this.baseSubscriptionsTarget + this.baseTarget + 'status',
					callback: lang.hitch(this, this._receiveSocketTasksStatus)
				}
			}, this.socketChannels || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("REFRESH_STATUS"),
				callback: "_subRefreshStatus"
			},{
				channel: this.getChannel("SOCKET_CONNECT"),
				callback: "_subSocketConnect"
			},{
				channel : this.getChannel("BUTTON_EVENT"),
				callback: "_subButtonEvent"
			},{
				channel : this.getChannel("REMOVE"),
				callback: "_subRemove"
			},{
				channel : this.getChannel("ALL_TASK"),
				callback: "_subAllTask"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SEND_SOCKET',
				channel: this._buildChannel(this.socketChannel, this.actions.SEND)
			},{
				event: 'GENERATE_NEW_SUBSCRIPTIONS',
				channel: this._buildChannel(this.socketChannel, this.actions.GENERATE_NEW_SUBSCRIPTIONS)
			});
		},

		_subRefreshStatus: function() {

			this._allTaskSocket({
				"status": this._taskStatus.RUNNING
			});
		},

		_subSocketConnect: function() {

			this._emitEvt('GENERATE_NEW_SUBSCRIPTIONS', this.socketChannels);

			this._allTaskSocket({});
		},

		_subAllTask: function(obj) {

			this._allTaskSocket(obj || {});
		},

		_allTaskSocket: function(obj) {

			this._emitEvt('SEND_SOCKET', {
				target: this.baseTarget + "status",
				message: obj
			});
		},

		_subButtonEvent: function(res) {

			var callback = "_" + res.btnId + "Callback";
			this[callback] && this[callback](res.id);
		},

		_cancelCallback: function(id) {

			//console.log("cancel con id = ", id);
		},

		_subRemove: function(res) {

			res.id && this._removeCallback(res.id);
		},

		_removeCallback: function(id) {

			this._emitEvt('SEND_SOCKET', {
				target: this.baseTarget + "remove/" + id,
				message: {}
			});
		},

		_receiveSocketTasksStatus: function(res) {

			var obj = JSON.parse(res.body),
				data = obj.data;

			if (data && data instanceof Array) {
				for (var key in data) {
					data[key].notCount = true;

					// TODO esto es provisional hasta implementar correctamente las tareas
					if (data[key].status === this._taskStatus.WAITING_INTERVENTION) {
						this._removeCallback(data[key].id);
					} else {
						this._buildAndEventNotification(data[key], true);
					}
				}
			} else if (obj.status === this._taskStatus.REMOVED) {
				this._emitEvt('COMMUNICATION_DELETE', {
					id: obj.id,
					type: "task"
				});
			}
		},

		_getTarget: function() {

			return this.selectorTarget;
		},

		_buildAndEventNotification: function(obj, taskStatus) {

			var callbackBuildDescription = "_" + obj.taskType + "BuildDescription",
				callbackRequestByStatus = "_" + obj.taskType + "RequestByStatus",
				description = null,
				requestByStatus = null;
				request = {
					type: "task",
					id: obj.id,
					notCount: obj.notCount,
					data: lang.clone(obj)
				};

			if (this[callbackRequestByStatus]) {
				requestByStatus = this[callbackRequestByStatus](obj);
			}

			if (!requestByStatus) {
				requestByStatus = this._requestByStatus(obj);
			}

			lang.mixin(request, requestByStatus);

			if (taskStatus) {
				request.showAlert = false;
			}

			if (this[callbackBuildDescription]) {
				description = this[callbackBuildDescription](obj);
			}

			if (!description) {
				description = this._buildDescription(obj);
			}

			request.description = description;

			if (!request.notSend) {
				this._emitEvt('COMMUNICATION', request);
			}
		},

		_buildDescription: function(obj) {

			if (obj.status === this._taskStatus.REGISTERED) {
				return this.i18n.registeredTask1 + this._processTaskName(obj) + this.i18n.registeredTask2;
			}

			if (obj.status === this._taskStatus.ENQUEUED) {
				return this.i18n.enquedenTask1 + this._processTaskName(obj) + this.i18n.enqueuedTask2;
			}

			if (obj.status === this._taskStatus.STARTED) {
				return this.i18n.startedTask1 + this._processTaskName(obj) + this.i18n.startedTask2;
			}

			if (obj.status === this._taskStatus.RUNNING) {
				return this.i18n.runningTask1 + this._processTaskName(obj) + this.i18n.runningTask2;
			}

			if (obj.status === this._taskStatus.WAITING_INTERVENTION) {
				return this.i18n.waitingInterventionTask1 + this._processTaskName(obj) +
					this.i18n.waitingInterventionTask2;
			}

			if (obj.status === this._taskStatus.COMPLETED) {
				return this.i18n.completedTask1 + this._processTaskName(obj) +
					this.i18n.completedTask2;
			}

			if (obj.status === this._taskStatus.FAILED) {
				if (obj.error) {
					var description = obj.error.description;

					if (obj.error.code) {
						description += '<a href="/feedback/' + obj.error.code +
							'" target="_blank"> ' + this.i18n.contact + '</a>';
					}

					return description;
				} else {
					return this.i18n.failedTask1 + this._processTaskName(obj) + this.i18n.failedTask2;
				}
			}

			if (obj.status === this._taskStatus.CANCELLED) {
				return this.i18n.cancelledTask1 + this._processTaskName(obj) + this.i18n.cancelledTask2;
			}
		},

		_requestByStatus: function(obj) {

			if (obj.status === this._taskStatus.REGISTERED) {
				return {
					level: {
						icon: "fa-registered",
						iconClass: "notice"
					},
					notCount: true,
					showAlert: true
				};
			}

			if (obj.status === this._taskStatus.ENQUEUED) {
				return {
					level: {
						icon: "fa-hand-paper-o",
						iconClass: "notice"
					}
				};
			}

			if (obj.status === this._taskStatus.STARTED) {
				return {
					level: "progress"
				};
			}

			if (obj.status === this._taskStatus.RUNNING) {
				return {
					level: "progress",
					progress: null, //obj.progress;
					notCount: true
				};
			}

			if (obj.status === this._taskStatus.WAITING_INTERVENTION) {
				return {
					level: "warning",
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

			if (obj.status === this._taskStatus.CANCELLED) {
				return {
					level: "error"
				};
			}
		},

		_processTaskName: function(obj) {

			return this.i18n[obj.taskName] ? this.i18n[obj.taskName].toLowerCase() : obj.taskName;
		}
	});
});
