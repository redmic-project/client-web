define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "src/component/base/_Store"
	, "put-selector/put"
], function(
	declare
	, lang
	, _Module
	, _Show
	, _Store
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
					SHOW: "show",
					HIDE: "hide",
					NOTIFICATION: "Notification",
					NOTIFICATION_DELETE: "notificationDelete",
					NOTIFICATION_DELETED: "notificationDeleted",
					COUNT_NOTIFICATION: "countNotification",
					REFRESH_STATUS: "refreshStatus"
				},
				events: {
					COUNT_NOTIFICATION: "countNotification",
					REFRESH_STATUS: "refreshStatus"
				},
				ownChannel: "notificationSidebar",
				items: [],
				_shownSidebar: false,
				_hideInProgress: false,
				noResetSpanCount: false,
				readNotifications: {
					count: 0,
					types: {}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (this.items) {
				for (var i = 0; i < this.items.length; i++) {
					if (this.items[i].target) {

						if (!this.items[i].props) {
							this.items[i].props = {};
						}

						this.items[i].props.parentChannel = this.getChannel();

						this.items[i].instance = new this.items[i].type(this.items[i].props);
					}
				}
			}
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.notificationChannel, this.actions.NOTIFICATION),
				callback: "_subNotification"
			},{
				channel : this._buildChannel(this.notificationChannel, this.actions.NOTIFICATION_DELETED),
				callback: "_subNotificationDeleted"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'COUNT_NOTIFICATION',
				channel: this._buildChannel(this.notificationChannel, this.actions.COUNT_NOTIFICATION)
			});
		},

		postCreate: function() {

			put(this.domNode, ".notificationSidebar");

			this.buttonsNode = put(this.domNode, "div.buttons");
			this.listNode = put(this.domNode, "div.list");

			if (this.items && this.items.length != 0) {
				this._createItems();
			}

			this._changeSelect(0);

			this.inherited(arguments);
		},

		_createItems: function() {

			for (var i = 0; i < this.items.length; i++) {
				this._createItem(i);
			}
		},

		_createItem: function(pos) {

			var node = put(this.buttonsNode, "div.item");
			put(node, "i.fa." + this.items[pos].icon);
			var spanNode = put(node, "span.hidden", 0);

			if (this.items[pos].spanClass) {
				put(spanNode, "." + this.items[pos].spanClass);
			}

			this.items[pos].newsNotifications = false;

			node.onclick = lang.hitch(this, this._onClickItem, pos);

			this.items[pos].itemNode = node;

			return node;
		},

		_onClickItem: function(pos) {

			this._changeSelect(pos);

			this._readNotificationsOfItem(pos);

			this.emit(this.items[pos].target + this.events.REFRESH_STATUS);
		},

		_changeSelect: function(pos) {

			if (this._posSelect >= 0) {
				this._publish(this._buildChannel(this.items[this._posSelect].instance.getChannel(), this.actions.HIDE));
				put(this.items[this._posSelect].itemNode, "!itemSelect");
			}

			if (pos >= 0) {
				this._posSelect = pos;
				put(this.items[pos].itemNode, ".itemSelect");
				this._publish(this._buildChannel(this.items[pos].instance.getChannel(), this.actions.SHOW), {
					node: this.listNode
				});
			}
		},

		_readNotificationsOfItem: function(pos) {

			if (this.items[pos].newsNotifications) {
				this.items[pos].newsNotifications = false;
				this.readNotifications.count += parseInt(this.items[pos].itemNode.lastChild.innerHTML, 10);
				this.readNotifications.types[this.items[pos].target] = true;
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_onModuleShow: function() {

			this.inherited(arguments);

			this.domNode.removeEventListener('animationend', this._functionListener);

			put(this.domNode, "!retiring");
			put(this.domNode, ".overall");

			this._shownSidebar = true;

			this.emit(this.items[this._posSelect].target + this.events.REFRESH_STATUS);

			this._readNotificationsOfItem(this._posSelect);
		},

		_onModuleHide: function() {

			this.inherited(arguments);

			this._shownSidebar = false;

			this._hideInProgress = false;

			this._resetSpanCount();

			if (this.readNotifications.count > 0) {
				this._emitEvt('COUNT_NOTIFICATION', this.readNotifications);
				this.readNotifications.count = 0;
				this.readNotifications.types = {};
			}
		},

		_resetSpanCount: function() {

			if (!this.noResetSpanCount) {
				for (var i = 0; i < this.items.length; i++) {
					if (!this.items[i].newsNotifications) {
						this._changeCountNotification(this.items[i].itemNode.lastChild, false, 0);
					}
				}
			}

			this.noResetSpanCount = false;
		},

		_hide: function() {

			if (!this._shownSidebar || this._hideInProgress) {
				return;
			}

			this._hideInProgress = true;

			put(this.domNode, "!overall");

			this._functionListener = lang.hitch(this, this.inherited, arguments);

			this.domNode.addEventListener('animationend', this._functionListener);

			put(this.domNode, ".retiring");
		},

		_subNotification: function(item) {

			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].target == item.target) {
					if (!item.data.notCount) {
						if (this._shownSidebar) {
							if (i == this._posSelect) {
								this.readNotifications.count ++;
							} else {
								this.items[i].newsNotifications = true;
							}
						} else {
							this.items[i].newsNotifications = true;
						}

						this._changeCountNotification(this.items[i].itemNode.lastChild, true);
					}

					break;
				}
			}
		},

		_subNotificationDeleted: function(obj) {

			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].target == obj.type) {

					if (obj.notRead) {
						if (this._shownSidebar) {
							if (i == this._posSelect) {
								this.readNotifications.count --;
							}
						}

						this._changeCountNotification(this.items[i].itemNode.lastChild, false);
						if (this.items[i].itemNode.lastChild.innerHTML == 0) {
							this.items[i].newsNotifications = false;
						}
					}
					break;
				}
			}
		},

		_changeCountNotification: function(node, increment, value) {

			if (value != null) {
				node.innerHTML = value;
			} else if (increment) {
				node.innerHTML ++;
			} else if (node.innerHTML > 0) {
				node.innerHTML --;
			}

			if (node.innerHTML == 0 || node.innerHTML == '' || node.innerHTML == '0') {
				put(node, ".hidden");
			} else {
				put(node, "!hidden");
			}
		}
	});
});
