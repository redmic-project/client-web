define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
], function(
	declare
	, lang
	, aspect
	, _Filter
	, _Store
){
	return declare([_Filter, _Store], {

		constructor: function(args) {

			this.config = {
				createQuery: null
			};

			lang.mixin(this, this.config, args);

			aspect.around(this, "_getConfig", lang.hitch(this, this._aroundGetConfig));
			aspect.after(this, "_doTreeEvtFacade", lang.hitch(this, this._doLazyLoadTreeEvtFacade));
		},

		_doLazyLoadTreeEvtFacade: function() {

			this.tree.on("open", lang.hitch(this, this._loadData));
		},

		postCreate: function() {

			this.inherited(arguments);

			if (!this.createQuery) {
				console.warn("Error. El árbol no tiene definido createQuery");
			}

			this._emitEvt('ADD_TO_QUERY', {
				query: this.createQuery()
			});
		},

		_shouldAbortRequest: function(params) {

			var item = params[0],
				node = params[1];

			if (item && this._allChildrenLoaded(item))
				return true;
			return false;
		},

		_dataAvailable: function(response) {

			if (response.data && response.data.data)
				this._insertDataIntoStore(response.data.data);
			else if (response.data)
				this._insertDataIntoStore(response.data);
			else
				console.warn("Datos en formato inesperado");
		},

		_aroundGetConfig: function(_getConfig) {

			return function() {
				var lazyConfig = {
					mayHaveChildren: lang.hitch(this, this._mayHaveChildren)
				};

				var config = lang.hitch(this, _getConfig).apply();
				lang.mixin(config, lazyConfig);

				return config;
			};
		},

		// TODO: ya no se traen los children por lo que hay que buscar otra forma de averiguar
		// si los datos están cargados. Ahora se cargan siempre.
		_allChildrenLoaded: function(parent) {

			/*var children = parent[this.childrenProperty] || [];

			for (var i = 0; i < children.length; i++) {
				var childId = parent[this.idProperty] + this.pathSeparator + children[i];

				if (!this.getItem(childId))*/
					return false;
			/*}

			return true;*/
		},

		_loadData: function() {

			var args = this._getEventArgsGroup(arguments);

			if(!this._shouldAbortRequest || this._shouldAbortRequest(args))
				return;

			this._emitEvt('ADD_TO_QUERY', {
				query: this.createQuery(args[0])
			});
		},

		_mayHaveChildren: function (/*Object*/ item) {
			//	summary:
			//		Tells if an item has or may have children. Implementing logic here
			//		avoids showing +/- expando icon for nodes that we know don't have
			//		children.
			//	item:
			//		Object.
			//	returns:
			//		Boolean
			//	tags:
			//		private

			if (item[this.childrenProperty] && item[this.childrenProperty] > 0) {
				if (this.maxDepthReached && this.maxDepthReached(item))
					return false;
				return true;
			}

			return false;
		}

	});

});
