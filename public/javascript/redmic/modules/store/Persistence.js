define([
	'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/request"
	, "dojo/json"
	, "redmic/modules/base/_Module"
], function(
	redmicConfig
	, declare
	, lang
	, request
	, JSON
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Todo lo necesario para hacer persistente objetos
		//	description:
		//		Proporciona métodos manejar añadir, editar o eliminar elementos del servicio indicado

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					SAVE: "save",
					REMOVE: "remove"
				},
				// own actions
				actions: {
					SAVE: "save",
					SAVED: "saved",
					REMOVE: "remove",
					REMOVED: "removed"
				},

				headers: {
					"Content-Type": "application/json",
					"Accept": "application/javascript, application/json"
				},

				notificationSuccess: true,

				handleAs: "json",
				timeout: 45000,
				// mediator params
				ownChannel: "persistence"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SAVE"),
				callback: "_subSave",
				options: {
					predicate: lang.hitch(this, this._chkValidSaveRequest)
				}
			},{
				channel : this.getChannel("REMOVE"),
				callback: "_subRemove",
				options: {
					predicate: lang.hitch(this, this._chkValidRemoveRequest)
				}
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SAVE',
				channel: this.getChannel("SAVED")
			},{
				event: 'REMOVE',
				channel: this.getChannel("REMOVED")
			});
		},

		_chkValidSaveRequest: function(req) {

			var condition = req && req.target && req.data;

			if (!condition) {
				console.error('Invalid save request at module "%s": %O', this.getChannel(), req);
			}

			return condition;
		},

		_subSave: function(/*Object*/ req) {

			this._save(req);
		},

		_save: function(/*Object*/ req) {

			var envDfd = window.env;
			if (!envDfd) {
				return;
			}

			envDfd.then(lang.hitch(this, function(req, envData) {

				var data = req.data,
					id = data[req.idProperty],
					idInTarget = req.idInTarget,
					target = redmicConfig.getServiceUrl(req.target, envData) + "/";

				request(id ? target + id : target, {
					handleAs: this.handleAs,
					method: (id || idInTarget) ? "PUT" : "POST",
					data: JSON.stringify(data),
					headers: this.headers,
					timeout: this.timeout
				}).then(
					lang.hitch(this, this._emitResult, req.target, 'SAVE'),
					lang.hitch(this, this._emitError, req.target, 'SAVE')
				);
			}, req));
		},

		_chkValidRemoveRequest: function(req) {

			var condition = req && req.target && req.id;

			if (!condition) {
				console.error('Invalid remove request at module "%s": %O', this.getChannel(), req);
			}

			return condition;
		},

		_subRemove: function(/*Object*/ req) {

			this._remove(req);
		},

		_remove: function(/*Object*/ req) {

			var id = req.id;

			var envDfd = window.env;
			if (!envDfd) {
				return;
			}

			envDfd.then(lang.hitch(this, function(req, envData) {

				var target = redmicConfig.getServiceUrl(req.target, envData);

				request(target + "/" + id, {
					method: "DELETE",
					headers: this.headers,
					handleAs: this.handleAs,
					timeout: this.timeout
				}).then(
					lang.hitch(this, this._emitResult, req.target, 'REMOVE'),
					lang.hitch(this, this._emitError, req.target, 'REMOVE')
				);
			}, req));
		},

		_emitResult: function(target, event, data) {

			if (data.success) {
				data.body ? (data.body.target = target) : data.target = target;
				this._emitEvt(event, data);
				this._emitNotificationSuccess({type: "alert", level: "success", description: this.i18n.success});
			} else {
				this._emitEvt(event, {
					success: false,
					error: {
						description: data.error,
						target: target
					}
				});

				var description = data.error.description;

				if (data.error.code) {
					description += '<a href="/feedback/' + data.error.code +
						'" target="_blank"> ' + this.i18n.contact + '</a>';
				}

				this._emitEvt('COMMUNICATION', {
					type: "alert",
					level: "error",
					description: description,
					timeout: 0
				});
			}
		},

		_emitError: function(target, event, result) {

			var response = result.response,
				data = response.data,
				description, error;

			if (data) {
				error = data.error;

				description = error.description;

				if (error && error.code) {
					description += '<a href="/feedback/' + error.code + '" target="_blank"> ' +
						this.i18n.contact + '</a>';
				}
			} else {
				description = "Error";

				if (response.status) {
					description += ': ' + response.status;
				} else if (result.message) {
					description += ': ' + result.message;
				}
			}

			this._emitEvt(event, {
				success: false,
				error: {
					description: description,
					target: target
				}
			});

			this._emitEvt('COMMUNICATION', {
				type: "alert",
				level: "error",
				description: description,
				timeout: 0
			});
		},

		_emitNotificationSuccess: function(msg) {

			if (!!this.notificationSuccess) {
				this._emitEvt('COMMUNICATION', msg);
			}
		}
	});
});
