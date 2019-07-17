define([
	"dojo/_base/declare"
	, "dojo/on"
	, "dojo/query"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_Store"
	, "redmic/modules/notification/NotificationSidebar"
	, "redmic/modules/notification/TaskNotification"
	, "put-selector/put"
	, "dojo/NodeList-dom"
	, "dojo/NodeList-traverse"
], function(
	declare
	, on
	, query
	, lang
	, _Module
	, _Show
	, _Store
	, NotificationSidebar
	, TaskNotification
	, put
){
	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Módulo encargado de procesar las notificaciones de los demás.
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				actions: {
					ERROR: "error",
					COMMUNICATION_SEND: "communicationSend",
					TOGGLE_SHOW: "toggleShow",
					NOTIFICATION: "Notification",
					COUNT_NOTIFICATION: "countNotification",
					NOTIFICATION_DELETE: "notificationDelete",
					NOTIFICATION_DELETED: "notificationDeleted"
				},
				events: {
					NOTIFICATION: "Notification",
					NOTIFICATION_DELETED: "notificationDelete",
					SHOW_NOTIFICATION_SIDEBAR: "showNotificationSidebar",
					HIDE_NOTIFICATION_SIDEBAR: "hideNotificationSidebar"
				},
				ownChannel: "notification",
				targetNotificationSidebar: "notificationSidebar",
				_countNotification: 0,
				statusNotificationSidebarShown: false,
				alertWithId: {},
				items: [{
						target: "task",
						icon: "fa-tasks",
						type: TaskNotification,
						channel: this.taskChannel
					}/*, {
						target: "message",
						icon: "fa-envelope-o",
						channel: "",
						listButton: [{
							icon: "fa-trash",
							btnId: "remove",
							title: "remove",
							returnItem: true
						}]
					}*/]
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.notificationSidebar = new NotificationSidebar({
				parentChannel: this.parentChannel,
				items: this.items
			});

			this.notificationSidebarNode = put(this.ownerDocumentBody, "div.containerNotificationSidebar");
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("COMMUNICATION_SEND"),
				callback: "_subNotification"
			}, {
				channel : this.getChannel("COUNT_NOTIFICATION"),
				callback: "_subDecrementCountNotification"
			}, {
				channel : this.getChannel("NOTIFICATION_DELETE"),
				callback: "_subNotificationDelete"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'NOTIFICATION',
				channel: this.getChannel("NOTIFICATION")
			},{
				event: 'NOTIFICATION_DELETED',
				channel: this.getChannel("NOTIFICATION_DELETED")
			},{
				event: 'SHOW_NOTIFICATION_SIDEBAR',
				channel: this._buildChannel(this.notificationSidebar.getChannel(), this.actions.SHOW)
			},{
				event: 'HIDE_NOTIFICATION_SIDEBAR',
				channel: this._buildChannel(this.notificationSidebar.getChannel(), this.actions.HIDE)
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, ".notification");
			this.containerNode = put(this.domNode, "div");
			this.iconNode = put(this.containerNode, "i.fa.fa-bell-o");
			this.spanNode = put(this.containerNode, "span.hidden", 0);

			this.iconNode.addEventListener('animationend', lang.hitch(this, this._removeAnimated));

			this.containerNode.onclick = lang.hitch(this, this._clickNotification);

			this.closeNotificationSidebarHandler = on.pausable(this.ownerDocumentBody, "click",
				lang.hitch(this, this._onCloseNotificationSidebar));
			this.closeNotificationSidebarHandler.pause();
		},

		_onCloseNotificationSidebar: function(evt) {

			var clickedNode = evt.target,
				nodeParents = query(clickedNode).parents(),
				nodeDoesNotBelongToNotificationButton = nodeParents.indexOf(this.domNode) === -1,
				nodeDoesNotBelongToNotificationSidebar = nodeParents.indexOf(this.notificationSidebarNode) === -1;

			if (nodeDoesNotBelongToNotificationButton && nodeDoesNotBelongToNotificationSidebar) {
				this._clickNotification(evt);
			}
		},

		_clickNotification: function(evt) {

			var eventPublication;

			if (this.statusNotificationSidebarShown) {
				this.statusNotificationSidebarShown = false;
				this.closeNotificationSidebarHandler.pause();
				eventPublication = 'HIDE_NOTIFICATION_SIDEBAR';
			} else {
				this.closeNotificationSidebarHandler.resume();
				this.statusNotificationSidebarShown = true;
				eventPublication = 'SHOW_NOTIFICATION_SIDEBAR';

				this._emitEvt('TRACK', {
					type: TRACK.type.event,
					info: {
						category: TRACK.category.button,
						action: TRACK.action.click,
						label: "openNotificationSidebar"
					}
				});
			}

			this._emitEvt(eventPublication, {
				node: this.notificationSidebarNode
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_subNotification: function(/*Object*/ notification) {

			// TODO modificar, esto retrasa la notificacion para que le de tiempo al click de hacer hide cuando haga falta
			if (this.statusNotificationSidebarShown) {
				setTimeout(lang.hitch(this, this._notificationNew, notification), 500);
			} else {
				this._notificationNew(notification);
			}
		},

		_subNotificationDelete: function(/*Object*/ obj) {

			if (this.alertWithId[obj.id]) {
				delete this.alertWithId[obj.id];
				obj.notRead = true;
				this._changeCountNotification();
			}

			this._emitEvt('NOTIFICATION_DELETED', obj);
		},

		_notificationNew: function(notification) {

			var obj = {
				data: notification
			};

			if (notification.type != "alert") {

				if (!notification.notCount && (!notification.id || !this.alertWithId[notification.id])) {
					this.alertWithId[notification.id] = notification.type;
					this._changeCountNotification(true);
					this.iconNode.classList.add("swing");
				} else {
					obj.data.notCount = true;
				}

				obj.target = notification.type;

				this._emitEvt('INJECT_ITEM', obj);
				this._emitEvt('NOTIFICATION', obj);
			}
		},

		_removeAnimated: function() {

			this.iconNode.classList.remove("swing");
		},

		_subDecrementCountNotification: function(obj) {

			for (var key in this.alertWithId) {
				if (obj.types[this.alertWithId[key]]) {
					delete this.alertWithId[key];
				}
			}

			this._changeCountNotification(false, this._countNotification - obj.count);
		},

		_changeCountNotification: function(increment, value) {

			if (value != null) {
				this._countNotification = value;
			} else if (increment) {
				this._countNotification ++;
			} else if (this._countNotification > 0) {
				this._countNotification --;
			}

			this.spanNode.innerHTML = this._countNotification;

			if (this._countNotification == 0) {
				put(this.spanNode, ".hidden");
			} else {
				put(this.spanNode, "!hidden");
			}
		}
	});
});
