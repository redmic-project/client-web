define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'dojo/store/Memory'
	, 'src/app/component/view/_View'
	, 'src/component/base/_Module'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, Deferred
	, all
	, Memory
	, _View
	, _Module
	, redmicConfig
) {

	return declare(_Module, {
		//	summary:
		//		Módulo encargado de almacenar los módulos de la aplicación.
		//	description:
		//		Contiene un MemoryStore que almacena todos los módulos (instancia y metadatos).
		//		Permite obtenerlos de forma transparente, él se encarga de crearlos si aun
		//		no existe su instancia.
		//		Mantiene varios módulos precargados y va limpiando los más antiguos al
		//		alcanzar el límite máximo de instancias.

		//	maxInstances: Integer
		//		Número máximo de módulos de vistas instanciados, para destruir los más antiguos cuando se alcance el
		//		límite establecido.
		//	moduleStore: Object
		//		Almacén con los módulos en los que el usuario tiene permisos
		//	parameterRegExp: RegExp
		//		Expresión regular para obtener los parámetros pasados en la url
		//	parameterDelimiter: String
		//		Delimitador de parámetros en la url que indica donde vendrán los parámetros

		constructor: function(args) {

			this.config = {
				moduleStore: new Memory(),
				actions: {
					AVAILABLE_ALLOWED_MODULES: 'availableAllowedModules',
					HAS_USER_EDITION_CAPABILITIES: 'hasUserEditionCapabilities',
					USER_HAS_EDITION_CAPABILITIES: 'userHasEditionCapabilities',
					GET_MODULE: 'getModule',
					AVAILABLE_MODULE: 'availableModule',
					CLEAR_MODULE: 'clearModule'
				},
				events: {
					GET_MODULE: 'getModule'
				},
				// mediator params
				ownChannel: 'moduleStore',

				maxInstances: 10,

				viewSeparator: '/',

				parameterRegExp: '([\-a-zA-Z0-9_\+=]+)',
				parameterDelimiter: '{id}'
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.credentialsChannel, 'AVAILABLE_ALLOWED_MODULES'),
				callback: '_subAllowedModules',
				options: {
					predicate: lang.hitch(this, this._chkPublicationIsForMe)
				}
			},{
				channel : this.getChannel('GET_MODULE'),
				callback: '_subGetModule'
			},{
				channel : this.getChannel('CLEAR_MODULE'),
				callback: '_subClearModule'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET_MODULE',
				channel: this.getChannel('AVAILABLE_MODULE')
			});
		},

		_subAllowedModules: function(/*Object*/ res) {
			//	summary:
			//		Recibe nuevos módulos disponibles, por lo que limpia el module store
			//		y vuelve a rellenarlo con los nuevos
			//	tags:
			//		private
			//	modules:
			//		Nuevos módulos disponibles para el usuario

			var cbk = lang.hitch(this, this._createModules, res.data);

			this._clearModuleStore().then(cbk, cbk);
		},

		_subGetModule: function(/*Object*/ req) {
			//	summary:
			//		Recibe la petición de un módulo, por lo que obtiene la instancia y lo envía
			//		por mediator
			//	tags:
			//		private
			//	req:
			//		Parámetros del módulo

			if (!req || !req.key) {
				return;
			}

			var moduleDfd = this._getModuleInstance(req.key);

			if (!moduleDfd) {
				this._emitEvt('GET_MODULE');
				return;
			}

			moduleDfd.then(lang.hitch(this, function(item) {

				this._emitEvt('GET_MODULE', item);
			}));
		},

		_createModules: function(/*Object*/ categories) {
			//	summary:
			//		Inicializamos moduleStore con las definiciones de los módulos permitidos al usuario.
			//	tags:
			//		private
			//	categories:
			//		Categorías a las que tiene acceso el usuario

			if (!categories) {
				return;
			}

			// Recorremos las categorías y sus módulos para generar nuestro store de módulos
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];

				if (category.modules) {
					for (var j = 0; j < category.modules.length; j++) {
						var moduleItem = category.modules[j];
						if (moduleItem.enable) {
							this._addModule(category.name + '/' + moduleItem.name, moduleItem.name,
								moduleItem.internPath);
						}
					}
				}

				if (category.enable) {
					this._addModule(category.name, category.name, category.internPath);
				}
			}
		},

		_addModule: function(/*String*/ id, /*String*/ name, /*String*/ internPath) {
			//	summary:
			//		Añade el item con la información básica al store
			//	tags:
			//		private
			//	id:
			//		identificador del módulo
			//	name:
			//		nombre o path parcial del módulo
			//	internPath:
			//		ubicación del js de la vista

			if (this._moduleExists(id)) {
				return;
			}

			this.moduleStore.put({
				id: id,
				name: name,
				internPath: internPath,
				instance: null,
				timeStamp: null
			});
		},

		_instanceExists: function(/*String*/ key) {
			//	summary:
			//		Comprueba si un módulo está instanciado.
			//	tags:
			//		private
			//	key:
			//		Clave del módulo a comprobar
			//	returns:
			//		Existencia del módulo

			return (this.moduleStore.get(key) && this.moduleStore.get(key).instance) ? true : false;
		},

		_moduleExists: function(/*String*/ key) {
			//	summary:
			//		Comprueba si un módulo existe en el store.
			//	tags:
			//		private
			//	key:
			//		Clave del módulo a comprobar
			//	returns:
			//		Existencia del módulo

			return !!this.moduleStore.get(key);
		},

		_findModuleByPath: function(/*String*/ path) {
			//	summary:
			//		Busca dentro del modulestore la ruta pasada obteniendo los parámetros
			//		en caso de tenerlos
			//	tags:
			//		private

			return this.moduleStore.query(lang.hitch(this, function(item) {

				var copyPath = item.id,
					regex = /(\/?[\w\-]+\/)*(\{(\w+)\})*/g,
					results = {},
					arrayAux = regex.exec(item.id);

				while (arrayAux[3] !== undefined) {
					copyPath = copyPath.replace('{' + arrayAux[3] + '}', this.parameterRegExp);
					results[arrayAux[3]] = true;

					arrayAux = regex.exec(item.id);
				}

				var reg = new RegExp('^' + copyPath + '$');

				if (reg.test(path)) {
					var i = 1;
					for (var key in results) {
						results[key] = path.replace(reg, '$' + i).replace('\/','');
						this.pathVariableId = results[key];
						i++;
					}

					var lengthResults = Object.keys(results).length;

					if (lengthResults > 1) {
						this.pathVariableId = results;
					} else if (lengthResults === 0) {
						this.pathVariableId = null;
					}

					return item;
				}
			}));
		},

		_getModuleInstance: function(/*String*/ key) {
			//	summary:
			//		Devuelve la instancia de un módulo, y si aun no existe la crea antes.
			//	tags:
			//		private
			//	key:
			//		Clave del módulo buscado
			//	returns:
			//		Promesa de la instancia del módulo

			var moduleList = this._findModuleByPath(key);

			if (!moduleList.length) {
				return;
			}

			var moduleItem = moduleList[0];

			// Si aun no se ha creado la vista
			if (!moduleItem.instance) {
				return this._createModule(moduleItem);	// return Object
			}

			// Si ya se creó la vista anteriormente
			moduleItem.timeStamp = new Date().getTime();
			this.moduleStore.put(moduleItem);

			this._publish(moduleItem.instance.getChannel('CONNECT'));

			this._publish(moduleItem.instance.getChannel('SET_PROPS'), {
				pathVariableId: this.pathVariableId !== '$1' ? this.pathVariableId : null
			});

			var dfd = new Deferred();
			dfd.resolve(moduleItem.instance);

			return dfd; // return Object
		},

		_createModule: function(/*Object*/ moduleStoreItem) {
			//	summary:
			//		Crea la instancia de un módulo de la aplicación.
			//	tags:
			//		private
			//	moduleStoreItem:
			//		Elemento de configuración del módulo a crear
			//	returns:
			//		Promesa de la instancia del módulo

			var instanceDfd = new Deferred(),
				viewDefinitionPath = moduleStoreItem.internPath;

			// TODO parche para compatibilidad con antiguas rutas parciales, las nuevas ya han de empezar con 'src/' e
			// incluir la terminación 'View' para ser totalmente explícitos
			if (viewDefinitionPath.indexOf('src/') !== 0) {
				viewDefinitionPath = 'app' + viewDefinitionPath + 'View';
			}

			var channelToSubscribe = this._buildChannel(this.credentialsChannel, 'USER_HAS_EDITION_CAPABILITIES');
			this._once(channelToSubscribe, lang.hitch(this, this._requireViewDefinition, {
				moduleStoreItem: moduleStoreItem,
				viewDefinitionPath: viewDefinitionPath,
				instanceDfd: instanceDfd,
				viewBaseDefinition: _View
			}));

			var channelToPublish = this._buildChannel(this.credentialsChannel, 'HAS_USER_EDITION_CAPABILITIES');
			this._publish(channelToPublish);

			return instanceDfd; // return Object
		},

		_requireViewDefinition: function(/*Object*/ args, /*Object*/ res) {

			var viewDefinitionPath = args.viewDefinitionPath,
				pathsToRequire = [viewDefinitionPath];

			if (res.editionCapabilities) {
				var viewDefinitionPathSplitted = viewDefinitionPath.split(this.viewSeparator),
					viewDefinitionParentPath = viewDefinitionPathSplitted.slice(0, -1);

				viewDefinitionParentPath.push('_Edition');
				var viewEditionDefinitionPath = viewDefinitionParentPath.join(this.viewSeparator);
				pathsToRequire.push(viewEditionDefinitionPath);
			}

			require(pathsToRequire, lang.hitch(this, this._onViewDefinitionRequired, {
				moduleStoreItem: args.moduleStoreItem,
				instanceDfd: args.instanceDfd,
				viewBaseDefinition: args.viewBaseDefinition
			}));
		},

		_onViewDefinitionRequired: function(
			/*Object*/ args,
			/*Object*/ ViewDefinition,
			/*Object?*/ EditionDefinition
		) {

			var moduleStoreItem = args.moduleStoreItem,
				instanceDfd = args.instanceDfd,
				viewBaseDefinition = args.viewBaseDefinition,
				isOuterView = redmicConfig.isOuterPath(moduleStoreItem.id),
				pathsToDeclare = [ViewDefinition];

			// Si existe y fue posible obtener la extensión de edición para la vista, se añade
			if (EditionDefinition && EditionDefinition !== 'not-a-module' && typeof EditionDefinition !== 'number') {
				pathsToDeclare.push(EditionDefinition);
			}
			pathsToDeclare.push(viewBaseDefinition);

			// Creamos el módulo
			var viewInstance = new declare(pathsToDeclare)({
				parentChannel: isOuterView ? this.outerAppChannel : this.innerAppChannel,
				ownChannel: this.viewSeparator + moduleStoreItem.id,
				pathVariableId: this.pathVariableId !== '$1' ? this.pathVariableId : null
			});

			// Añadimos al store la instancia del módulo
			moduleStoreItem.instance = viewInstance;
			moduleStoreItem.timeStamp = new Date().getTime();
			this.moduleStore.put(moduleStoreItem);

			// Resolvemos para devolver la instancia creada
			instanceDfd.resolve(viewInstance);

			// Limpiamos las instancias antiguas
			this._clearOldInstances();
		},

		_subClearModule: function(/*Object*/ req) {

			var moduleKey = req.key,
				moduleList = this._findModuleByPath(moduleKey);

			if (!moduleList.length) {
				return;
			}

			var moduleItem = moduleList[0];
			this._updateClearedModuleInStore(moduleItem);
		},

		_clearOldInstances: function() {
			//	summary:
			//		Elimina la instancia del módulo que hace más tiempo que no se usa.
			//	tags:
			//		private

			var instantiatedModules = this.moduleStore.query(function(item) {

				return item.instance !== null;
			}, {
				sort: [{
					attribute: 'timeStamp'
				}]
			});

			// Si no hemos llegado al límite, no limpiamos
			if (instantiatedModules.length <= this.maxInstances) {
				return;
			}

			// Eliminamos el que más tiempo hace que no se accede
			this._clearModule(instantiatedModules[0]).then(lang.hitch(this, this._updateClearedModuleInStore));
		},

		_clearModule: function(/*String*/ moduleItem) {
			//	summary:
			//		Elimina la instancia de la vista especificada.
			//	tags:
			//		private
			//	moduleItem:
			//		Contenedor de la vista a eliminar.
			//	returns:
			//		Devuelve deferred de vista destruida.

			var dfd = new Deferred();

			if (!moduleItem || !moduleItem.instance) {
				dfd.reject(moduleItem);
				return dfd;
			}

			this._once(moduleItem.instance.getChannel('DESTROYED'), lang.hitch(dfd, dfd.resolve, moduleItem));

			this._publish(moduleItem.instance.getChannel('DESTROY'));

			return dfd;
		},

		_updateClearedModuleInStore: function(moduleItem) {

			moduleItem.instance = null;
			moduleItem.timeStamp = null;

			this.moduleStore.put(moduleItem);
		},

		_clearModuleStore: function() {
			//	summary:
			//		Elimina y limpia del store las instancias de vistas internas
			//	tags:
			//		private
			//	returns:
			//		Devuelve deferred de todas las vistas destruidas.

			var moduleItems = this.moduleStore.query({}),
				cbk = lang.hitch(this, this._removeClearedModuleFromStore),
				dfds = [];

			moduleItems.forEach(lang.hitch(this, function(moduleItem) {

				if (moduleItem && !redmicConfig.isOuterPath(moduleItem.id)) {
					var dfd = this._clearModule(moduleItem);

					dfd.then(cbk, cbk);
					dfds.push(dfd);
				}
			}));

			return all(dfds);
		},

		_removeClearedModuleFromStore: function(moduleItem) {

			this.moduleStore.remove(moduleItem.id);
		}
	});
});
