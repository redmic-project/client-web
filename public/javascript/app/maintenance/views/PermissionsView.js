define([
	"app/base/views/extensions/_EditionWizardView"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/_Select"
	//, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/Total"
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
				perms: null,

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
				type: "API",
				options: {
					sort: [{ attribute: "id", descending: true }]
				}
			});
		}
	});
});
