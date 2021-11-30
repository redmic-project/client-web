define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "app/base/views/extensions/_EditionView"
	, "app/base/views/extensions/_FormInDialogView"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SpeciesList"
	, "redmic/modules/base/_Persistence"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
], function(
	_Main
	, Controller
	, Layout
	, _EditionView
	, _FormInDialogView
	, redmicConfig
	, declare
	, lang
	, templateList
	, _Persistence
	, _Select
	, SelectionBox
	, Order
	, Total
){
	return declare([Layout, Controller, _Main, _Persistence, _EditionView, _FormInDialogView], {
		//	summary:
		//
		//	description:
		//

		constructor: function (args) {

			this.config = {
				browserExts: [_Select],
				services: redmicConfig.services,
				noAddButton: true
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.formConfig = this._merge([{
				template: "administrative/taxonomy/views/templates/forms/Taxon"
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				template: templateList,
				bars: [{
					instance: Total
				},{
					instance: SelectionBox
				},{
					instance: Order,
					config: 'orderConfig'
				}],
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								option: "default",
								title: "edit"
							},{
								icon: "fa-refresh",
								btnId: "update",
								condition: "aphia",
								title: "update"
							}]
						}]
					}
				},
				orderConfig: {
					options: [
						{value: "scientificName"},
						{value: "authorship"},
						{value: "status"},
						{value: "commonName"},
						{value: "updated"}
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.taxons
			}, this.facetsConfig || {}]);
		},

		_addListButtonsEdition: function() {

			delete this.listButtonsEdition;
		},

		_updateCallback: function(evt) {

			var obj = {
				target: redmicConfig.services.wormsUpdate,
				data: {}
			};

			obj.data[this.idProperty] = evt[this.idProperty];

			this._emitEvt('SAVE', obj);
		}
	});
});
