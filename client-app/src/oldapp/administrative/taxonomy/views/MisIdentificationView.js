define([
	"app/base/views/extensions/_EditionWizardView"
	, "app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/base/_Main"
	, "app/designs/textSearchList/Controller"
	, "app/designs/textSearchList/layout/BasicAndButtonsTopZone"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/browser/_Select"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/browser/bars/Pagination"
	, "src/component/browser/bars/Total"
	, "templates/MisidentificationList"
], function(
	_EditionWizardView
	, _OnShownAndRefresh
	, _Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _Select
	, SelectionBox
	, Pagination
	, Total
	, templateList
){
	return declare([Layout, Controller, _Main, _OnShownAndRefresh, _EditionWizardView], {
		// summary:
		// 		Vista para la correción de citas erroneas.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.misidentificationAdd,
				title: this.i18n.misidentification,
				target: redmicConfig.services.misidentification,
				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.misidentificationEdit
							}]
						}]
					}
				},
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Pagination
				}]
			}, this.browserConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		}
	});
});
