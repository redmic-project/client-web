define([
	'alertify/alertify.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/query"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_Store"
	, "redmic/modules/components/Keypad/IconKeypadImpl"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Total"
	, "put-selector/put"
	, "templates/NotificationList"
	, "dijit/ProgressBar"
], function(
	alertify
	, declare
	, lang
	, query
	, _Module
	, _Show
	, _Store
	, IconKeypadImpl
	, _ButtonsInRow
	, _Framework
	, ListImpl
	, Total
	, put
	, TemplateList
	, ProgressBar
){
	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Módulo encargado de procesar las notificaciones de los demás.
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		'class': 'flexContainer notificationList',

		constructor: function(args) {

			this.config = {
				actions: {
					NOTIFICATION: "Notification",
					NOTIFICATION_DELETED: "notificationDeleted",
					BUTTON_EVENT: "btnEvent",
					REMOVE: 'remove'
				},
				target: "task",
				events: {
					BUTTON_EVENT: "btnEvent",
					REMOVE_TASK: "removeTask"
				},
				ownChannel: "taskNotification",
				idProperty: "id"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				idProperty: this.idProperty,
				parentChannel: this.getChannel(),
				target: this._getTarget(),
				template: TemplateList,
				insertInFront: true,
				noDataMessage: null,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-trash",
							btnId: "remove",
							title: "remove",
							returnItem: true
						}]
					}
				},
				bars: [{
					instance: Total
				}]
			}, this.browserConfig || {}]);
		},

		_initialize: function() {

			this.browser = new declare([ListImpl, _Framework, _ButtonsInRow])(this.browserConfig);

			this.iconKeypad = new IconKeypadImpl({
				parentChannel: this.getChannel(),
				items: {
					"removeAllNotification": {
						className: "fa-trash",
						title: this.i18n.removeAllNotification
					}
				}
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.notificationChannel, this.actions.NOTIFICATION),
				callback: "_subNotification"
			},{
				channel : this._buildChannel(this.notificationChannel, this.actions.NOTIFICATION_DELETED),
				callback: "_subNotificationDeleted"
			});

			this.subscriptionsConfig.push({
				channel: this.browser.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel: this.iconKeypad.getChannel("KEYPAD_INPUT"),
				callback: "_subKeypadInput"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'BUTTON_EVENT',
				channel: this._buildChannel(this.taskChannel, this.actions.BUTTON_EVENT)
			},{
				event: 'REMOVE_TASK',
				channel: this._buildChannel(this.taskChannel, this.actions.REMOVE)
			});
		},

		_subListBtnEvent: function(evt) {

			this._emitEvt('BUTTON_EVENT', evt);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.domNode
			});

			this._publish(this.browser.getChannel("ADD_TOOLBAR_IN_FRAMEWORK"), {
				instance: this.iconKeypad
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_subNotification: function(item) {

			if (this._getTarget() === item.target) {

				if (item.data.level === "running" && item.data.progress != null) {
					var nodeSpanList = query("span[data-redmic-id='" + item.data.id + "']",
						this.browser._moduleOwnNode);

					if (nodeSpanList.length > 0) {
						nodeSpanList = nodeSpanList[0];
						put(nodeSpanList, ".notificationProgressBar");
						var nodeProgressBar = query(" div[data-redmic-id='progressBar']", nodeSpanList);
						if (nodeProgressBar.length > 0) {
							nodeProgressBar = nodeProgressBar[0];
							new ProgressBar({
								value: item.data.progress
							}).placeAt(nodeProgressBar).startup();
						}
					}
				}
			}
		},

		_subNotificationDeleted: function(obj) {

			if (this._getTarget() === obj.type) {
				this._publish(this.browser.getChannel("REMOVE_ITEM"), {
					idProperty: obj[this.idProperty]
				});
			}
		},

		_subKeypadInput: function(res) {

			if (res.inputKey === "removeAllNotification") {
				this.removeAllNotificationConfirmation();
			}
		},

		removeAllNotificationConfirmation: function() {

			alertify.confirm(
				this.i18n.removeAllNotificationConfirmationTitle, this.i18n.removeAllNotificationConfirmationMessage,
				lang.hitch(this, this._removeAllNotification),
				lang.hitch(this, function() {})).set("labels", {
					ok: this.i18n.ok,
					cancel: this.i18n.cancel
				});
		},

		_removeAllNotification: function() {

			this._once(this.browser.getChannel('GOT_DATA'), lang.hitch(this, this._subGotDataRemoveAllNotification));

			this._publish(this.browser.getChannel('GET_DATA'));
		},

		_subGotDataRemoveAllNotification: function(res) {

			var data = res.data;

			this._publish(this.browser.getChannel('CLEAR'));

			for (var i = 0; i < data.length; i++) {
				this._emitEvt('REMOVE_TASK', {
					id: data[i].id
				});
			}
		}
	});
});
