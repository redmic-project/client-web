define([
	"app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/base/_Main"
	, "app/designs/textSearchList/Controller"
	, "app/designs/textSearchList/layout/BasicAndButtonsAndKeypadTopZone"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/HierarchicalImpl"
	, "templates/ServiceOGCList"
], function(
	_OnShownAndRefresh
	, _Main
	, Controller
	, Layout
	, declare
	, lang
	, HierarchicalImpl
	, templateList
){
	return declare([Layout, Controller, _Main, _OnShownAndRefresh], {
		//	summary:
		//		Vista principal de ServiceOGC bajo este diseño.

		constructor: function(args) {

			this.config = {
				ownChannel: "catalogOGC",
				perms: null,
				title: this.i18n.availableThemes,

				// TODO esto es por un posible fallo de dojox (_startAtWatchHandles is called twice)
				_startAtWatchHandles: function(){}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					selectionIdProperty: "path"
				},
				idProperty: "path"
			}, this.browserConfig || {}]);

			this.browserBase.shift();

			this.browserBase.unshift(HierarchicalImpl);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		}
	});
});
