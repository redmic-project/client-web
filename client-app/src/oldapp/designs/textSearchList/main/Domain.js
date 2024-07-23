define([
	'app/base/views/extensions/_EditionView'
	, 'app/base/views/extensions/_OnShownAndRefresh'
	, 'app/base/views/extensions/_FormInDialogView'
	, 'app/designs/base/_Main'
	, 'app/designs/textSearchList/Controller'
	, 'app/designs/textSearchList/layout/BasicAndButtonsTopZone'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, "src/component/browser/bars/Order"
	, "src/component/browser/bars/Pagination"
	, "src/component/browser/bars/Total"
	, 'templates/DomainList'
], function(
	_EditionView
	, _OnShownAndRefresh
	, _FormInDialogView
	, _Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, Order
	, Pagination
	, Total
	, templateList
){
	return declare([Layout, Controller, _Main, _OnShownAndRefresh, _EditionView, _FormInDialogView], {
		//	summary:
		//		Extensión para establecer la configuración de las vistas de dominios.

		constructor: function(args) {

			this.config = {
				services: redmicConfig.services
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.browserConfig = this._merge([{
				template: templateList,
				bars: [{
					instance: Total
				},{
					instance: Order,
					config: 'orderConfig'
				},{
					instance: Pagination
				}],
				rowConfig: {
					buttonsConfig: {
						listButton: []
					}
				},
				orderConfig: {
					options: [
						{value: 'name'},
						{value: 'name_en'}
					]
				}
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.formConfig = this._merge([{
				template: 'maintenance/domains/templates/forms/Domain'
			}, this.formConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		}
	});
});
