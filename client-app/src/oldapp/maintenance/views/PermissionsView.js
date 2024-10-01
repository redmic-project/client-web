define([
	"app/base/views/extensions/_EditionWizardView"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Store"
	, "src/component/browser/_Select"
	//, "src/component/browser/bars/Pagination"
	, "src/component/browser/bars/Total"
	, "templates/PermissionsList"
], function(
	_EditionWizardView
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _Store
	, _Select
	//, Pagination
	, Total
	, templateList
){
	return declare([Layout, Controller, _Store, _EditionWizardView], {
		// summary:
		// 	Vista de Permisos.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				//addPath: "#/maintenance/permissions-add/{id}",
				//editPath: "#/maintenance/permissions-edit/{id}",
				title: this.i18n.permissions,
				target: redmicConfig.services.users,
				browserExts: [_Select],
				itemLabel: null,

				listButtonsEdition: []
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				bars: [{
					instance: Total
				}/*,{
					instance: Pagination
				}*/],
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-trash-o",
							btnId: "remove",
							title: "remove"
						}]
					}
				}
			}, this.browserConfig || {}]);
		},

		_beforeShow: function() {

			this._emitEvt('REQUEST', {
				target: this.target,
				sort: [{
					attribute: "id",
					descending: true
				}]
			});
		}
	});
});
