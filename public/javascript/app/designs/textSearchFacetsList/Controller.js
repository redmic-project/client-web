define([
	"app/base/views/_View"
	, "app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/base/_Browser"
	, "app/designs/base/_Controller"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/search/FacetsImpl"
	, "redmic/modules/search/TextImpl"
	, "./_AddFilter"
], function (
	_View
	, _OnShownAndRefresh
	, _Browser
	, _Controller
	, redmicConfig
	, declare
	, lang
	, _Store
	, FacetsImpl
	, TextImpl
	, _AddFilter
){
	return declare([_View, _Controller, _Browser, _Store, _AddFilter, _OnShownAndRefresh], {
		//	summary:
		//		Controlador para vistas que contienen un buscador de texto, por facets y un listado.

		constructor: function(args) {

			this.config = {
				viewPaths: redmicConfig.viewPaths,
				controllerEvents: {
					DOWNLOAD_FILE: "downloadFile"
				},
				controllerActions: {
					DOWNLOAD_FILE: "downloadFile",
					GET_REPORT: "getReport"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this._getTarget()
			}, this.textSearchConfig || {}]);

			this.facetsConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.facetsConfig || {}]);
		},

		_initializeController: function() {

			this.textSearch = new declare([TextImpl])(this.textSearchConfig);

			this.facets = new declare([FacetsImpl])(this.facetsConfig);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.managerChannel, this.actions.DOWNLOAD_FILE),
				callback: "_subDownloadFile"
			});
		},

		_defineControllerPublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.textSearch.getChannel("UPDATE_TARGET")
			},{
				event: 'DOWNLOAD_FILE',
				channel: this._buildChannel(this.taskChannel, this.actions.GET_REPORT)
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode
			});

			this._publish(this.facets.getChannel("SHOW"), {
				node: this.facetsNode
			});
		},

		_subDownloadFile: function(request) {

			this._emitEvt('DOWNLOAD_FILE', {
				target: this.selectionTarget ? this.selectionTarget : this.target,
				serviceTag: this.reportService,
				format: request.format
			});
		}
	});
});
