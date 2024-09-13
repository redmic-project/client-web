define([
	"app/designs/base/_Browser"
	, "app/designs/base/_Controller"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/browser/bars/Pagination"
	, "src/component/search/TextImpl"
	, "./_AddFilter"
], function (
	_Browser
	, _Controller
	, redmicConfig
	, declare
	, lang
	, Pagination
	, TextImpl
	, _AddFilter
){
	return declare([_Controller, _Browser, _AddFilter], {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto y un listado.

		constructor: function(args) {

			this.config = {
				viewPaths: redmicConfig.viewPaths,
				browserBars: {
					pagination: {
						definition: Pagination,
						config: {
							rowPerPage: 25
						}
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.textSearchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target
			}, this.textSearchConfig || {}]);
		},

		_initializeController: function() {

			this.textSearch = new TextImpl(this.textSearchConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					size: this.browserBars.pagination.config.rowPerPage
				}
			});

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode
			});
		}
	});
});
