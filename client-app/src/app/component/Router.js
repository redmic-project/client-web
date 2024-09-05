define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom-attr'
	, 'dojo/io-query'
	, 'dojo/mouse'
	, 'src/component/base/_Module'
	, 'src/component/base/_Store'
], function(
	declare
	, lang
	, domAttr
	, ioQuery
	, mouse
	, _Module
	, _Store
) {

	return declare(_Module, {
		//	summary:
		//		Módulo encargado de controlar el acceso a la aplicación.
		//	description:
		//		Escucha las rutas accedidas por el usuario, diferenciando si son de navegación interna a la app o si se
		//		deben cargar en el navegador. También coordina la obtención de parámetros recibidos en URL.

		//	paths: Object
		//		Constantes de rutas base
		//	_userFound: Boolean
		//		Indica si hay presente algún token de usuario.

		constructor: function(args) {

			this.config = {
				ownChannel: 'router',
				events: {
					GET_QUERY_PARAMS: 'getQueryParams'
				},
				actions: {
					CHANGE_MODULE: 'changeModule',
					EVALUATE_ROUTE: 'evaluateRoot',
					GO_TO_ROOT_ROUTE: 'goToRootRoute',
					GO_TO_ERROR_ROUTE: 'goToErrorRoute',
					GET_QUERY_PARAMS: 'getQueryParams',
					GOT_QUERY_PARAMS: 'gotQueryParams'
				},

				paths: {
					ERROR: '/404',
					ROOT: '/',
					HOME: 'home',
					LOGIN: 'login'
				}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._setRouterListeners();
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('EVALUATE_ROUTE'),
				callback: '_subEvaluateRoute'
			},{
				channel : this.getChannel('GO_TO_ROOT_ROUTE'),
				callback: '_subGoToRootRoute'
			},{
				channel : this.getChannel('GO_TO_ERROR_ROUTE'),
				callback: '_subGoToErrorRoute'
			},{
				channel : this.getChannel('GET_QUERY_PARAMS'),
				callback: '_subGetQueryParams'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET_QUERY_PARAMS',
				channel: this.getChannel('GOT_QUERY_PARAMS')
			});
		},

		_setRouterListeners: function() {
			//	summary:
			//		Prepara la escucha en toda la aplicación de los eventos requeridos para controlar la navegación en
			//		una sola página
			//	tags:
			//		private

			globalThis.addEventListener.call(globalThis, 'click', lang.hitch(this, this._evaluateClickEvt));
			globalThis.addEventListener.call(globalThis, 'popstate', lang.hitch(this, this._evaluatePopStateEvt));
		},

		_evaluateClickEvt: function(event) {
			//	summary:
			//		Recibe eventos de click y, en caso de detectar un enlace de navegación interno, lo captura
			//	tags:
			//		private

			var targets = this._getClickTargets(event);

			for (var i = 0; i < targets.length; i++) {
				var target = targets[i],
					targetIsNotAppHref = !target || target.nodeName !== 'A' || !domAttr.get(target, 'd-state-url');

				if (targetIsNotAppHref) {
					continue;
				}

				this._handleAppHref(event, target);
				break;
			}
		},

		_handleAppHref: function(event, target) {

			var url = target.pathname + target.search + target.hash;

			if (mouse.isMiddle(event)) {
				var newPageUrl = target.protocol + '//' + target.hostname + url;
				globalThis.open(newPageUrl, '_blank');
			} else {
				this._addHistory(url);
				this._onRouteChange();
			}

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		},

		_addHistory: function(value) {

			globalThis.history.pushState(null, null, value);
		},

		_onRouteChange: function() {

			var locationObj = globalThis.location,
				locationPath = locationObj.pathname,
				route = locationPath.substr(1),
				routeIsEmpty = !route || route === '' || route === this.paths.ROOT,
				loginWasSuccessful = route === this.paths.LOGIN && this._userFound;

			if (routeIsEmpty || loginWasSuccessful) {
				route = this.paths.HOME;
				this._addHistory(route);
			}

			var locationQuery = locationObj.search;

			this._handleQueryParameters(locationQuery.substr(1));

			this._publish(this.getParentChannel('CHANGE_MODULE'), {
				route: route,
				locationQuery: locationQuery
			});
		},

		_evaluatePopStateEvt: function(evt) {
			//	summary:
			//		Recibe eventos de popstate para navegar por la aplicación usando los botones de retroceder/avanzar
			//	tags:
			//		private

			this._onRouteChange();
		},

		_subEvaluateRoute: function(req) {

			this._userFound = req.userFound;

			this._onRouteChange();
		},

		_subGoToRootRoute: function(req) {

			if (req.userGone) {
				delete this._userFound;
			}

			this._goToRootPage();
		},

		_subGoToErrorRoute: function() {

			this._goToErrorPage();
		},

		_subGetQueryParams: function(req) {

			this._emitEvt('GET_QUERY_PARAMS', {
				requesterId: req.requesterId,
				queryParams: this._currentQueryParams || {}
			});
		},

		_goToRootPage: function() {

			globalThis.location.href = this.paths.ROOT;
		},

		_goToErrorPage: function() {

			globalThis.location.href = this.paths.ERROR;
		},

		_handleQueryParameters: function(queryString) {

			this._currentQueryParams = this._getQueryParameters(queryString);

			this._removeQueryParametersFromHref();
		},

		_getQueryParameters: function(queryString) {

			return ioQuery.queryToObject(queryString);
		},

		_removeQueryParametersFromHref: function() {

			var locationObj = globalThis.location,
				href = locationObj.origin + locationObj.pathname + locationObj.hash;

			globalThis.history.replaceState(null, null, href);
		}
	});
});
