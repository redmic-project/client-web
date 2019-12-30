define([
	"app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/base/_Main"
	, "app/designs/base/_ServiceOGC"
	, "app/designs/textSearchList/Controller"
	, "app/designs/textSearchList/layout/BasicAndButtonsAndKeypadTopZone"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/HierarchicalImpl"
	, "templates/ServiceOGCList"
], function(
	_OnShownAndRefresh
	, _Main
	, _ServiceOGC
	, Controller
	, Layout
	, declare
	, lang
	, HierarchicalImpl
	, templateList
){
	return declare([Layout, Controller, _Main, _ServiceOGC, _OnShownAndRefresh], {
		//	summary:
		//		Vista principal de ServiceOGC bajo este diseño.

		constructor: function(args) {

			this.config = {
				ownChannel: "catalogOGC",
				perms: null,
				title: this.i18n.availableThemes
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					selectionIdProperty: this.pathProperty
				},
				idProperty: this.pathProperty,
				pathSeparator: this.pathSeparator,
				target: this._atlasDataTarget
			}, this.browserConfig || {}]);

			this.browserBase.shift();

			this.browserBase.unshift(HierarchicalImpl);
		}
	});
});
