define([
	"app/designs/base/_Browser"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/search/TextImpl"
], function (
	_Browser
	, _Controller
	, declare
	, lang
	, _Store
	, TextImpl
){
	return declare([_Controller, _Browser, _Store], {
		//	summary:
		//		Controller para vistas que contienen un buscador de texto, por facets y un listado.

		constructor: function(args) {

			this.config = {
				controllerActions: {
					ADD_TO_QUERY: "addToQuery"
				},
				controllerEvents: {
					SEND_DATA: "sendData"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.externalStoreChannel = this._buildChannel(this.getChannel(), "externalStoreChannel");

			this.externalQueryChannel = this._buildChannel(this.getChannel(), "externalQueryChannel");

			this.browserConfig = this._merge([{
				storeChannel: this.externalStoreChannel,
				region: "center"
			}, this.browserConfig || {}]);

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				queryChannel: this.externalQueryChannel,
				_createQuery: function(value) {
					return value;
				}
			}, this.textSearchConfig || {}]);
		},

		_initializeController: function() {

			this.textSearch = new declare([TextImpl])(this.textSearchConfig);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.externalQueryChannel, this.actions.ADD_TO_QUERY),
				callback: "_subNewSearch"
			});
		},

		_defineControllerPublications: function() {

			this.publicationsConfig.push({
				event: 'SEND_DATA',
				channel: this._buildChannel(this.externalStoreChannel, this.actions.AVAILABLE)
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode
			});
		},

		_subNewSearch: function(obj) {

			this._newSearch && this._newSearch(obj.query);
		}
	});
});
