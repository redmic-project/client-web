define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/json'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_ShowOnEvt'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/layout/listMenu/ListMenu'
	, 'redmic/modules/layout/templateDisplayer/TemplateDisplayer'
	, 'redmic/base/Credentials'
	, 'templates/UserTopbarMenu'
], function(
	redmicConfig
	, declare
	, lang
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
				repositoryUrl: 'https://gitlab.com/redmic-project/client/web'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			put(this.domNode, '[title=$]', this.i18n.user);
			this.iconNode = put(this.domNode, 'i.fa.fa-user');

			var envDfd = window.env;
			if (!envDfd) {
				return;
			}

			envDfd.then(lang.hitch(this, function(envData) {

				var infoItem = {
					icon: 'fa-question-circle-o',
					label: 'whatIsRedmic',
					href: '/inner-what-is-redmic'
				};

				var versionItem = {
					icon: 'fa-code-fork',
					label: this.i18n.version + ': ' + envData.version,
					href: this.repositoryUrl,
					newPage: true
				};

				this.target = [this.profileTarget];

				if (this._checkUserIsRegistered()) {
					this._initializeRegisteredUserArea(infoItem, versionItem);

					this._logoutTarget = redmicConfig.getServiceUrl(redmicConfig.services.logout, envData);
					this.target.push(this._logoutTarget);
					// TODO se reemplaza la terminación de la ruta al servidor porque las imágenes de los usuarios ya
					// la contienen. Cuando se corrija esta circunstancia, eliminar el reemplazo
					this._userImageBaseTarget = envData.apiUrl.replace('/api', '');
				} else {
					this._initializeGuestUserArea(infoItem, versionItem);
				}
			}));
		},

		_initializeRegisteredUserArea: function(infoItem, versionItem) {

			this.topbarMenu = new TemplateDisplayer({
				parentChannel: this.getChannel(),
				omitLoading: true,
				template: TemplateTopbarMenu,
				'class': 'tooltipUser',
				target: this.profileTarget
			});

			this.listMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)({
				parentChannel: this.getChannel(),
				items: [
					{
						icon: 'fa-eye',
						label: 'myProfile',
						href: '/user'
					},
					infoItem,
					{
						icon: 'fa-file-text-o',
						label: 'termCondition',
						href: '/inner-terms-and-conditions'
					},
					versionItem,
					{
						icon: 'fa-power-off',
						label: 'logout',
						callback: '_logout'
					}
				]
			});
		},

		_initializeGuestUserArea: function(infoItem, versionItem) {

			this.listMenu = new declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip)({
				parentChannel: this.getChannel(),
				items: [
					infoItem,
					{
						icon: 'fa-user-plus',
						label: 'register',
						href: '/register'
					},
					versionItem,
					{
						icon: 'fa-sign-in',
						label: 'login',
						href: '/login'
					}
				]
			});

			this._showMenu();
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

			var userImagePath = req.dataCredentials.image;

			if (userImagePath) {
				req.dataCredentials.image = this._userImageBaseTarget + userImagePath;
			}

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

		_logout: function () {

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

		_errorAvailable: function(err, status, resWrapper) {

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

			this._removeUserData();
		},

		_removeUserData: function() {

			Credentials.set('accessToken', null);
		},

		_dataAvailable: function(response, resWrapper) {

			var target = resWrapper.target;

			if (target === this._logoutTarget) {
				this._removeUserData();
				return;
			}

			var data = response.data;

			if (data instanceof Array) {
				data = data[0];
			}

			// TODO impide a instancias antiguas romper la ejecución, revisar
			if (!this.domNode) {
				return;
			}

			this._updateUserAreaButton(data);
			this._showMenu();
		},

		_updateUserAreaButton: function(data) {

			put('!', this.iconNode);

			if (data.image) {
				var tokenParam = '?access_token=' + Credentials.get('accessToken'),
					imageUrl = data.image + tokenParam;

				this.iconNode = put(this.domNode, 'img[src=' + imageUrl + ']');
			} else {
				this.iconNode = put(this.domNode, 'i.fa.fa-user');
			}
		}
	});
});
