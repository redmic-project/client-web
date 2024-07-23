define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/notification/Notification"
	, "src/utils/Mediator"
], function(
	declare
	, lang
	, Notification
	, Mediator
){
	var notification;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("notification tests", {
		before: function() {

			notification = new declare(Notification)({
				ownChannel: "app:notification",
				items: [{
					target: "notificationSidebar",
					icon: "fa-tasks"
				}, {
					target: "browser2",
					icon: "fa-flag-o",
					spanClass: "alert"
				}, {
					target: "browser3",
					icon: "fa-envelope-o"
				}]
			});
		},

		tests: {
			"creations modules": function() {

				assert.ok(notification.notificationSidebar);
				assert.ok(notification);

				assert.isNotNull(notification.notificationSidebarNode);
				assert.isNotNull(notification.ownerDocumentBody);
			},

			"creations list notificationSidebar": function() {

				for (var i = 0; i < notification.notificationSidebar.items.length; i++) {
					assert.ok(notification.notificationSidebar.items[i].browser);
				}
			},

			"Construccion correcta del la estructura de notification": function() {

				assert.strictEqual(notification.domNode.className, 'notification');
				assert.strictEqual(notification.domNode.children.length, 1);
				assert.strictEqual(notification.domNode.children[0].nodeName, 'DIV');
				assert.strictEqual(notification.domNode.children[0].children.length, 2);
				assert.strictEqual(notification.domNode.children[0].children[0].nodeName, 'I');
				assert.strictEqual(notification.domNode.children[0].children[0].className, 'fa fa-bell-o');
				assert.strictEqual(notification.domNode.children[0].children[1].nodeName, 'SPAN');
				assert.strictEqual(notification.domNode.children[0].children[1].className, 'hidden');
			},

			"Construccion correcta del la estructura de notificationSidebar": function() {

				assert.strictEqual(notification.notificationSidebar.domNode.className, 'notificationSidebar retiring');
				assert.strictEqual(notification.notificationSidebar.domNode.children.length, 2);
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].nodeName, 'DIV');
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].className, 'buttons');
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children.length, 3);
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[0].className, 'item itemSelect');

				assert.strictEqual(notification.notificationSidebar.domNode.children[1].nodeName, 'DIV');
				assert.strictEqual(notification.notificationSidebar.domNode.children[1].className, 'list');
				assert.strictEqual(notification.notificationSidebar.domNode.children[1].children.length, 1);
			},

			"changeSelect": function() {

				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children.length, 3);
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[0].className, 'item itemSelect');
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[1].className, 'item');

				assert.strictEqual(notification.notificationSidebar.posSelect, 0);

				notification.notificationSidebar._changeSelect(1);

				assert.strictEqual(notification.notificationSidebar.posSelect, 1);

				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children.length, 3);
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[0].className, 'item');
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[1].className, 'item itemSelect');
			},

			"_onClickItem": function() {

				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children.length, 3);
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[0].className, 'item');
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[1].className, 'item itemSelect');

				assert.strictEqual(notification.notificationSidebar.posSelect, 1);


				notification.notificationSidebar._onClickItem(0);

				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children.length, 3);
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[0].className, 'item itemSelect');
				assert.strictEqual(notification.notificationSidebar.domNode.children[0].children[1].className, 'item');

				assert.strictEqual(notification.notificationSidebar.posSelect, 0);
			},

			"show sidebar": function() {

				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.notificationSidebar.shownSidebar, false);

				notification.notificationSidebarChannel = notification.notificationSidebar.getChannel();

				notification._clickNotification();

				assert.strictEqual(notification.statusNotificationSidebarShown, true);
				assert.strictEqual(notification.notificationSidebar.shownSidebar, true);

				assert.strictEqual(notification.notificationSidebar.domNode.className, 'notificationSidebar overall');
			},

			"hide sidebar": function() {

				assert.strictEqual(notification.statusNotificationSidebarShown, true);
				assert.strictEqual(notification.notificationSidebar.shownSidebar, true);

				notification._clickNotification();

				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.notificationSidebar.shownSidebar, false);
				assert.strictEqual(notification.notificationSidebar.domNode.className, 'notificationSidebar retiring');
			},

			"_changeCountNotification sidebar element ++": function() {

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
				notification.notificationSidebar._changeCountNotification(notification.notificationSidebar.items[0].itemNode.lastChild, true);

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');
			},

			"_changeCountNotification sidebar element --": function() {

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification.notificationSidebar._changeCountNotification(notification.notificationSidebar.items[0].itemNode.lastChild, false);

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
			},

			"_resetSpanCount sidebar element": function() {

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
				notification.notificationSidebar._changeCountNotification(notification.notificationSidebar.items[0].itemNode.lastChild, true);
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification.notificationSidebar._resetSpanCount();

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
			},

			"not _resetSpanCount sidebar element": function() {

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
				notification.notificationSidebar._changeCountNotification(notification.notificationSidebar.items[0].itemNode.lastChild, true);
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification.notificationSidebar.noResetSpanCount = true;
				notification.notificationSidebar._resetSpanCount();

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				assert.strictEqual(notification.notificationSidebar.noResetSpanCount, false);
			},

			"hide sidebar and _resetSpanCount method init": function() {

				assert.strictEqual(notification.notificationSidebar.noResetSpanCount, false);

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification._clickNotification();

				assert.strictEqual(notification.statusNotificationSidebarShown, true);
				assert.strictEqual(notification.notificationSidebar.shownSidebar, true);

				notification._clickNotification();

				assert.strictEqual(notification.statusNotificationSidebarShown, false);

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
			},

			"hide sidebar and _resetSpanCount method init check": function() {

				notification._clickNotification();
				notification.notificationSidebar._resetSpanCount();

				assert.strictEqual(notification.statusNotificationSidebarShown, true);
				assert.strictEqual(notification.notificationSidebar.shownSidebar, true);

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
				notification.notificationSidebar._changeCountNotification(notification.notificationSidebar.items[0].itemNode.lastChild, true);
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification.notificationSidebar.noResetSpanCount = true;

				notification._clickNotification();

				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');
			},

			"count notification ++ and hide sidebar": function() {

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.spanNode.innerHTML, '0');
				notification._changeCountNotification(true);

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
			},

			"count notification -- and hide sidebar": function() {

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				notification._changeCountNotification(false);

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.spanNode.innerHTML, '0');
			},

			"show sidebar and not clear count notification": function() {

				notification._changeCountNotification(true);

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
			},

			"hide sidebar and clear count notification with _subDecrementCountNotification": function() {

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');

				notification._subDecrementCountNotification(1);

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.spanNode.innerHTML, '0');
			},

			"insert new notification": function() {

				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				var obj = {
					level: "notification",
					target: "notificationSidebar",
					data: {
						description: "prueba",
						icon: "fa-exclamation-triangle",
						iconClass: "warning"
					}
				};

				notification._subNotification(obj);

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');
			},

			"show sidebar after new notification": function() {

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.statusNotificationSidebarShown, true);
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');
			},

			"hide sidebar after new notification": function() {

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.statusNotificationSidebarShown, true);
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.spanNode.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');
			},

			"show sidebar and new notification": function() {

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.spanNode.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				notification._clickNotification();

				var obj = {
					level: "notification",
					target: "notificationSidebar",
					data: {
						description: "prueba",
						icon: "fa-exclamation-triangle",
						iconClass: "warning"
					}
				};

				notification._notificationNew(obj);

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, '');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '1');
			},

			"show sidebar and new notification in browser not select": function() {

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.statusNotificationSidebarShown, false);
				assert.strictEqual(notification.spanNode.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.className, 'alert hidden');
				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.innerHTML, '0');

				notification._clickNotification();

				var obj = {
					level: "notification",
					target: "browser2",
					data: {
						description: "prueba",
						icon: "fa-exclamation-triangle",
						iconClass: "warning"
					}
				};

				notification._notificationNew(obj);

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.className, 'alert');
				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.innerHTML, '1');
			},

			"hide sidebar with no read notification in browser not select": function() {

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.className, 'alert');
				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.innerHTML, '1');
			},

			"show sidebar and change select browser, read notification and hide sidebar": function() {

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, '');
				assert.strictEqual(notification.spanNode.innerHTML, '1');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.className, 'alert');
				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.innerHTML, '1');

				assert.strictEqual(notification.notificationSidebar.readNotifications, 0);

				assert.strictEqual(notification.notificationSidebar.items[1].newsNotifications, true);

				assert.strictEqual(notification.notificationSidebar.posSelect, 0);

				notification.notificationSidebar._onClickItem(1);

				assert.strictEqual(notification.notificationSidebar.posSelect, 1);

				assert.strictEqual(notification.notificationSidebar.readNotifications, 1);

				assert.strictEqual(notification.notificationSidebar.items[1].newsNotifications, false);

				notification._clickNotification();

				assert.strictEqual(notification.spanNode.className, 'hidden');
				assert.strictEqual(notification.spanNode.innerHTML, '0');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.className, 'hidden');
				assert.strictEqual(notification.notificationSidebar.items[0].itemNode.lastChild.innerHTML, '0');

				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.className, 'alert hidden');
				assert.strictEqual(notification.notificationSidebar.items[1].itemNode.lastChild.innerHTML, '0');
			}
		}
	});
});
