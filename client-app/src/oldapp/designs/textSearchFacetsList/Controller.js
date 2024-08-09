define([
	"app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/base/_Browser"
	, "app/designs/base/_Controller"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Store"
	, "src/component/browser/bars/Pagination"
	, "src/component/search/FacetsImpl"
	, "src/component/search/TextImpl"
	, 'src/util/Credentials'
	, 'src/util/GuestChecker'
	, "./_AddFilter"
], function (
	_OnShownAndRefresh
	, _Browser
	, _Controller
	, redmicConfig
	, declare
	, lang
	, _Store
	, Pagination
	, FacetsImpl
	, TextImpl
	, Credentials
	, GuestChecker
	, _AddFilter
){
	return declare([_Controller, _Browser, _Store, _AddFilter, _OnShownAndRefresh], {
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
				},
				browserBars: [{
					definition: Pagination,
					config: {
						rowPerPage: 25
					}
				}]
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

			this.textSearch = new TextImpl(this.textSearchConfig);

			this.facets = new FacetsImpl(this.facetsConfig);
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

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					size: 25
				}
			});

			this._publish(this.facets.getChannel("SHOW"), {
				node: this.facetsNode
			});
		},

		_subDownloadFile: function(request) {

			// TODO abstraer para hacerlo implícitamente
			if (Credentials.userIsGuest()) {
				GuestChecker.protectFromGuests();
				return;
			}

			this._emitEvt('DOWNLOAD_FILE', {
				target: this.selectionTarget ? this.selectionTarget : this.target,
				serviceTag: this.reportService,
				format: request.format
			});
		}
	});
});
