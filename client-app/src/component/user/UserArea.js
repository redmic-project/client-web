define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_ShowInTooltip'
	, 'src/component/base/_ShowOnEvt'
	, 'src/component/base/_Store'
	, 'src/component/layout/listMenu/ListMenu'
	, 'src/component/layout/templateDisplayer/TemplateDisplayer'
	, 'src/util/Credentials'
	, 'templates/UserTopbarImage'
	, 'templates/UserTopbarMenu'
], function(
	redmicConfig
	, declare
	, lang
	, put
	, _Module
	, _Show
	, _ShowInTooltip
	, _ShowOnEvt
	, _Store
	, ListMenu
	, TemplateDisplayer
	, Credentials
	, TemplateTopbarImage
	, TemplateTopbarMenu
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Botón para el menú de usuario, que muestra un listado de opciones mediante tooltip.

		constructor: function(args) {

			this.config = {
				ownChannel: 'userArea',
				actions: {
					USER_LOGOUT: 'userLogout',
					USER_LOGGED_OUT: 'userLoggedOut',
					USER_LOGOUT_ERROR: 'userLogoutError'
				},

				omitLoading: true,
				'class': 'userArea',
				idProperty: 'id',
				target: redmicConfig.services.profile,
				repositoryUrl: 'https://gitlab.com/redmic-project/client/web'
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.authChannel, 'USER_LOGGED_OUT'),
				callback: '_subUserLoggedOut'
			},{
				channel: this._buildChannel(this.authChannel, 'USER_LOGOUT_ERROR'),
				callback: '_subUserLogoutError'
			},{
				channel: this.listMenu.getChannel('EVENT_ITEM'),
				callback: '_subEventItem'
			});
		},

		_initialize: function() {

			put(this.domNode, '[title=$]', this.i18n.user);

			this.listMenuDefinition = declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip);

			this._commonItems = {
				infoItem: {
					icon: 'fa-question-circle-o',
					label: 'whatIsRedmic',
					href: '/inner-what-is-redmic'
				},
				feedbackItem: {
					icon: 'fa-envelope-o',
					label: 'feedback',
					href: '/feedback'
				},
				termConditionItem: {
					icon: 'fa-file-text-o',
					label: 'termCondition',
					href: '/terms-and-conditions'
				},
				versionItem: {
					icon: 'fa-code-fork',
					label: this.i18n.version + ': ' + redmicConfig.getEnvVariableValue('envVersion'),
					href: this.repositoryUrl,
					newPage: true
				}
			};

			if (this._checkUserIsRegistered()) {
				this._initializeRegisteredUserArea();
			} else {
				this._initializeGuestUserArea();
			}

			this._initializeUserImage();
		},

		_initializeRegisteredUserArea: function() {

			this.topbarMenu = new TemplateDisplayer({
				parentChannel: this.getChannel(),
				omitLoading: true,
				template: TemplateTopbarMenu,
				'class': 'tooltipUser',
				target: this.target
			});

			this.listMenu = new this.listMenuDefinition({
				parentChannel: this.getChannel(),
				items: [
					{
						icon: 'fa-eye',
						label: 'myProfile',
						href: '/user'
					},
					this._commonItems.infoItem,
					this._commonItems.feedbackItem,
					this._commonItems.termConditionItem,
					this._commonItems.versionItem,
					{
						icon: 'fa-power-off',
						label: 'logout',
						callback: '_logout'
					}
				]
			});
		},

		_initializeGuestUserArea: function() {

			this.listMenu = new this.listMenuDefinition({
				parentChannel: this.getChannel(),
				items: [
					this._commonItems.infoItem,
					{
						icon: 'fa-user-plus',
						label: 'register',
						href: '/register'
					},
					this._commonItems.feedbackItem,
					this._commonItems.termConditionItem,
					this._commonItems.versionItem,
					{
						icon: 'fa-sign-in',
						label: 'login',
						href: '/login'
					}
				]
			});

			this._prepareMenuToShow();
		},

		_initializeUserImage: function() {

			this.topbarImage = new TemplateDisplayer({
				parentChannel: this.getChannel(),
				omitLoading: true,
				template: TemplateTopbarImage,
				target: this.target
			});

			this._publish(this.topbarImage.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this._checkUserIsRegistered()) {
				this._showAreaForRegisteredUser();
			}
		},

		_showAreaForRegisteredUser: function() {

			this._once(this._buildChannel(this.credentialsChannel, 'GOT_PROPS'),
				lang.hitch(this, this._subDataCredentialsGotProps));

			this._publish(this._buildChannel(this.credentialsChannel, 'GET_PROPS'), {
				dataCredentials: true
			});

			put(this.listMenu.domNode.firstChild, '-', this.topbarMenu.domNode);
		},

		_subDataCredentialsGotProps: function(req) {

			this._emitEvt('INJECT_DATA', {
				data: req.dataCredentials,
				target: this.target
			});
		},

		_prepareMenuToShow: function() {

			this._publish(this.listMenu.getChannel('ADD_EVT'), {
				sourceNode: this.domNode
			});
		},

		_subEventItem: function(response) {

			if (response.callback) {
				this[response.callback](response);
			}
		},

		_checkUserIsRegistered: function() {

			return !Credentials.userIsGuest();
		},

		_startLoading: function() {

			this._emitEvt('LOADING', {
				global: true
			});
		},

		_endLoading: function() {

			this._emitEvt('LOADED');
		},

		_logout: function() {

			this._requestUserLogout();
		},

		_requestUserLogout: function() {

			this._startLoading();

			this._publish(this._buildChannel(this.authChannel, 'USER_LOGOUT'));
		},

		_dataAvailable: function(res) {

			this._prepareMenuToShow();
		},

		_subUserLoggedOut: function(_res) {

			this._startLoading();

			this._emitEvt('TRACK', {
				event: 'logout'
			});
		},

		_subUserLogoutError: function(res) {

			this._emitEvt('TRACK', {
				event: 'logout_error',
				status: res.status
			});
		},

		_beforeHide: function() {

			this._endLoading();
		}
	});
});
