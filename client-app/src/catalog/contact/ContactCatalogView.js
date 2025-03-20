define([
	'app/designs/base/_Main'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/_Select'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/SelectionBox'
	, 'src/component/browser/bars/Total'
	, 'templates/ContactList'
], function(
	_Main
	, TextSearchFacetsListController
	, TextSearchFacetsListLayout
	, redmicConfig
	, declare
	, lang
	, _Select
	, Order
	, SelectionBox
	, Total
	, ContactListTemplate
) {

	return declare([TextSearchFacetsListLayout, TextSearchFacetsListController, _Main], {
		// summary:
		//		Vista de catálogo de contactos.

		constructor: function(args) {

			this.config = {
				title: this.i18n.contacts,
				ownChannel: 'contactCatalog',
				target: redmicConfig.services.contact,

				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				template: ContactListTemplate,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.contactDetails
						}]
					}
				},
				orderConfig: {
					options: [
						{value: 'id'},
						{value: 'firstName'},
						{value: 'surname'},
						{value: 'updated'}
					]
				},
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Order,
					config: 'orderConfig'
				}]
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.contact
			}, this.facetsConfig || {}]);
		}
	});
});
