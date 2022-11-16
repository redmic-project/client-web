define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_ShowOnEvt'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/layout/listMenu/ListMenu'
	, 'redmic/modules/layout/templateDisplayer/TemplateDisplayer'
	, 'redmic/base/Credentials'
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
		//		Modulo para el menu de usuarios.
		//	description:
		//		Muestra un listado de opciones de usuario en un tooltip.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				ownChannel: 'userArea',

				omitLoading: true,
				'class': 'userArea',
				idProperty: 'id',
				profileTarget: redmicConfig.services.profile,
				_logoutTarget: redmicConfig.services.logout,
				repositoryUrl: 'https://gitlab.com/redmic-project/client/web'
			};

			lang.mixin(this, this.config, args);
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

			this.target = [this.profileTarget];

			if (this._checkUserIsRegistered()) {
				this._initializeRegisteredUserArea();
				this.target.push(this._logoutTarget);
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
				target: this.profileTarget
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

			this._showMenu();
		},

		_initializeUserImage: function() {

			this.topbarImage = new TemplateDisplayer({
				parentChannel: this.getChannel(),
				omitLoading: true,
				template: TemplateTopbarImage,
				target: this.profileTarget
			});

			this._publish(this.topbarImage.getChannel('SHOW'), {
				node: this.domNode
			});
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.listMenu.getChannel('EVENT_ITEM'),
				callback: '_subEventItem'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this._checkUserIsRegistered()) {
				this._showAreaForRegisteredUser();
			}
		},

		_showAreaForRegisteredUser: function() {

			this._once(this._buildChannel(this.credentialsChannel, this.actions.GOT_PROPS),
				lang.hitch(this, this._subDataCredentialsGotProps));

			this._publish(this._buildChannel(this.credentialsChannel, this.actions.GET_PROPS), {
				dataCredentials: true
			});

			put(this.listMenu.domNode.firstChild, '-', this.topbarMenu.container);
		},

		_subDataCredentialsGotProps: function(req) {

			this._emitEvt('INJECT_DATA', {
				data: req.dataCredentials,
				target: this.profileTarget
			});
		},

		_showMenu: function() {

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

			return Credentials.get('userRole') !== 'ROLE_GUEST';
		},

		_startLoading: function() {

			this._emitEvt('LOADING', {
				global: true
			});
		},

		_logout: function () {

			this._startLoading();

			if (!Credentials.get('accessToken')) {
				this._removeUserData();
				return;
			}

			var data = {
				'token': Credentials.get('accessToken')
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._logoutTarget,
				query: data,
				requesterId: this.getOwnChannel()
			});
		},

		_errorAvailable: function(_err, _status, resWrapper) {

			var target = resWrapper.target;

			if (target !== this._logoutTarget) {
				return;
			}

			this._emitEvt('TRACK', {
				type: TRACK.type.exception,
				info: {
					'exDescription': "_onLogout",
					'exFatal': false,
					'appName': 'API'
				}
			});

			this._startLoading();
			this._removeUserData();
		},

		_removeUserData: function() {

			Credentials.set('accessToken', null);
		},

		_dataAvailable: function(response, resWrapper) {

			var target = resWrapper.target;

			if (target === this._logoutTarget) {
				this._startLoading();
				this._removeUserData();
				return;
			}

			var data = response.data;

			if (data instanceof Array) {
				data = data[0];
			}

			this._showMenu();
		},

		_beforeHide: function() {

			this._emitEvt('LOADED');
		}
	});
});
