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
		//	summary:
		//		Extensión para el tratamiento de communications
		//	description:
		//		Aporta a los módulos la capacidad de lanzar y tratar communications.
		communicationType: {
			"task": true,
			"alert": true
		},

		communicationLevel: {
			"progress": {
				icon: "fa-refresh",
				iconClass: "notice spinningElement"
			},
			"warning": {
				icon: "fa-exclamation-triangle",
				level: "warning",
				iconClass: "warning"
			},
			"message": {
				icon: "fa-envelope-o",
				iconClass: "message"
			},
			"error": {
				icon: "fa-close",
				level: "error",
				iconClass: "error"
			},
			"success": {
				icon: "fa-check-circle",
				level: "success",
				iconClass: "success"
			}
		},

		//	communicationEvents: Object
		//		Estructura para almacenar los nombres de los eventos de la extensión.
		communicationEvents: {
			COMMUNICATION: "communication",
			COMMUNICATION_DELETE: "communicationDelete"
		},

		communicationActions: {
			COMMUNICATION: "communication",
			COMMUNICATION_DELETE: "communicationDelete"
		},


		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixCommunicationEventsAndActions));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineCommunicationPublications));
		},

		_mixCommunicationEventsAndActions: function () {

			lang.mixin(this.events, this.communicationEvents);
			lang.mixin(this.actions, this.communicationActions);

			delete this.communicationActions;
			delete this.communicationEvents;
		},

		_defineCommunicationPublications: function () {

			this.publicationsConfig.push({
				event: 'COMMUNICATION',
				channel: this._buildChannel(this.communicationChannel, this.actions.COMMUNICATION),
				callback: "_pubCommunication",
				alwaysOn: true
			},{
				event: 'COMMUNICATION_DELETE',
				channel: this._buildChannel(this.communicationChannel, this.actions.COMMUNICATION_DELETE),
				alwaysOn: true
			});
		},

		_pubCommunication: function(channel, communication) {

			var obj = lang.clone(this._generateCommunication(communication));

			if (obj)
				this._publish(channel, obj);
		},

		_generateCommunication: function(/*Object*/ obj) {

			var levelObj;

			if (obj.level && obj.level instanceof Object)
				levelObj = obj.level;
			else
				levelObj = this.communicationLevel[obj.level];

			if (this.communicationType[obj.type] && levelObj && obj.description)
				return lang.mixin(obj, levelObj);
			else if (levelObj && obj.description) {
				obj.type = "alert";
				return lang.mixin(obj, levelObj);
			} else if (obj.description) {
				obj.type = "alert";
				obj.level = "message";
				return lang.mixin(obj, this.communicationLevel[obj.level]);
			}
		}

		//TODO disalertify.dismissAll(); and communication sin description
	});
});