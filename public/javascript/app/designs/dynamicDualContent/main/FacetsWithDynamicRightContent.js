define([
	"app/designs/base/_Main"
	, "app/designs/dynamicDualContent/Controller"
	, "app/designs/dynamicDualContent/layout/FacetsInLeftSecondaryContent"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	_Main
	, Controller
	, Layout
	, declare
	, lang
){
	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Main FacetsWithDynamicRightContent.

		constructor: function(args) {

			this.config = {
				ownChannel: "facetsWithDynamicRightContent"
			};

			lang.mixin(this, this.config, args);
		}
	});
});