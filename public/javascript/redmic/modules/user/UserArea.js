define([
	'alertify/alertify.min'
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/request"
	, "dojo/json"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/base/_Store"
	, "redmic/modules/layout/listMenu/ListMenu"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "redmic/base/Credentials"
	, "templates/UserTopbarMenu"
], function(
	alertify
	, redmicConfig
	, declare
	, lang
	, xhr
	, JSON
	, put
	, _Module
	, _Show
	, _ShowInTooltip
	, _ShowOnEvt
	, _Store
	, ListMenu
	, TemplateDisplayer
	, Credentials
	, TemplateTopbarMenu
){
	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Modulo para el menu de usuarios.
		//	description:
		//		Muestra un listado de opciones de usuario en un tooltip.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				omitLoading: true,
				// mediator params
				ownChannel: "userArea",
				idProperty: "id",
				actions: {
					REQUEST: "request"
				},
				target: redmicConfig.services.profile
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.listMenuConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: [{
					icon: "fa-eye",
					label: 'myProfile',
					href: "/user"
				},{
					icon: "fa-question-circle-o",
					label: 'whatIsRedmic',
					href: "/inner-what-is-redmic"
				},{
					icon: "fa-file-text-o",
					label: 'termCondition',
					href: "/inner-terms-and-conditions"
				},{
					icon: "fa-power-off",
					label: 'logout',
					callback: "_logout"
				}]
			}, this.listMenuConfig || {}]);

			this.topbarMenuConfig = this._merge([{
				omitLoading: true,
				parentChannel: this.getChannel(),
				template: TemplateTopbarMenu,
				"class": "tooltipUser",
				target: this.target
			}, this.topbarMenuConfig || {}]);
		},

		_initialize: function() {

			if (this._conditionShownItemUser()) {
				this._initializeUserArea();
			} else {
				this._initializeGuestArea();
			}
		},

		_initializeUserArea: function() {

			this.topbarMenu = new TemplateDisplayer(this.topbarMenuConfig);

			put(this.domNode, ".userArea");
			this.containerNode = put(this.domNode, "div[title=$]", this.i18n.user);

			this.iconNode = put(this.containerNode, "i.fa.fa-user");

			this.listMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)(this.listMenuConfig);
		},

		_initializeGuestArea: function() {

			put(this.domNode, '.userAreaGuest');

			this.whatIsRedmicNode = put(this.domNode, 'a[href="/inner-what-is-redmic"][d-state-url="true"]',
				this.i18n.whatIsRedmic);

			this.registerNode = put(this.domNode, 'a[href="/register"][d-state-url="true"]', this.i18n.register);

			this.loginNode = put(this.domNode, 'a[href="/login"][d-state-url="true"]', this.i18n.login);
		},

		_defineSubscriptions: function () {

			if (this._conditionShownItemUser()) {
				this.subscriptionsConfig.push({
					channel : this.listMenu.getChannel("EVENT_ITEM"),
					callback: "_subEventItem"
				});
			}
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this._conditionShownItemUser()) {
				this._showMenu();

				this._once(this._buildChannel(this.credentialsChannel, this.actions.GOT_PROPS),
					lang.hitch(this, this._subDataCredentialsGotProps));

				this._publish(this._buildChannel(this.credentialsChannel, this.actions.GET_PROPS), {
					dataCredentials: true
				});

				/*this._publish(this._buildChannel(this.storeChannel, this.actions.REQUEST), {
					target: this.target,
					type: "API"
				});*/

				put(this.listMenu.domNode.firstChild, '-', this.topbarMenu.container);
			}
		},

		_subDataCredentialsGotProps: function(req) {

			this._emitEvt("INJECT_DATA", {
				data: req.dataCredentials,
				target: this.target
			});
		},

		_showMenu: function() {

			this._publish(this.listMenu.getChannel("ADD_EVT"), {
				sourceNode: this.iconNode
			});
		},

		_subEventItem: function(response) {

			if (response.callback) {
				this[response.callback](response);
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_conditionShownItemGuest: function() {

			return !this._conditionShownItemUser();
		},

		_conditionShownItemUser: function() {

			if (Credentials.get("userRole") != "ROLE_GUEST") {
				return true;
			}

			return false;
		},

		_logout: function () {

			if (Credentials.get("accessToken")) {

				var headers = {
						"Content-Type": "application/json",
						"Accept": "application/javascript, application/json"
					},
					data = {
						"token": Credentials.get("accessToken")
					};

				xhr(redmicConfig.services.logout, {
					method: "POST",
					handleAs: "json",
					headers: headers,
					data: JSON.stringify(data)
				});
			}

			Credentials.set("accessToken", null);
			Credentials.set("selectIds", {});
		},

		_dataAvailable: function(response) {

			var data = response.data;

			if (data instanceof Array) {
				data = data[0];
			}

			if (!this.containerNode) {
				return;
			}

			this.containerNode.firstChild && put(this.containerNode.firstChild, "!");

			if (data.image) {
				this.iconNode = put(this.containerNode, "img[src=" + data.image +
					'?access_token=' + Credentials.get("accessToken") + "]");
			} else {
				this.iconNode = put(this.containerNode, "i.fa.fa-user");
			}

			this._showMenu();
		}
	});
});
