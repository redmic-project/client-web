define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SpeciesList"
	, "src/component/browser/_Select"
	, "src/component/browser/bars/SelectionBox"
	, "src/component/browser/bars/Order"
	, "src/component/browser/bars/Total"
	, "src/component/tree/_HierarchicalFilter"
	, "src/component/tree/_LazyLoad"
	, "src/component/tree/CbtreeImpl"
], function(
	_Main
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, templateList
	, _Select
	, SelectionBox
	, Order
	, Total
	, _HierarchicalFilter
	, _LazyLoad
	, CbtreeImpl
){
	return declare([Layout, Controller, _Main], {
		//	summary:
		//
		//	description:
		//

		constructor: function (args) {

			this.config = {
				browserExts: [_Select],
				title: this.i18n.species,
				layoutAdditionalClasses: 'layoutTextSearchFacetsListDesign speciesMainTextSearchFacetsListDesign'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: redmicConfig.returnFields.species
			}, this.filterConfig || {}]);

			this.browserConfig = this._merge([{
				orderConfig: {
					options: [
						{value: "scientificName"},
						{value: "authorship"},
						{value: "status.name", label: this.i18n.status},
						{value: "commonName"},
						{value: "updated"}
					]
				},
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
						listButton: []
					}
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.species,
				openFacets: false
			}, this.facetsConfig || {}]);
		},

		_initializeMain: function() {

			var tree = declare([CbtreeImpl, _LazyLoad, _HierarchicalFilter]);
			this.tree = new tree({
				parentChannel: this.getChannel(),
				selectorChannel: this.getChannel(),
				queryExternalChannel: this.queryChannel,
				target: redmicConfig.services.taxons,
				idProperty: "path",
				itemLabel: "{rank.name} - {scientificName} ({leaves})",
				createQuery: function(item) {

					var query = {
						returnFields: redmicConfig.returnFields.taxonsTree,
						regexp: [{
							field: "path",
							exp: "root.[0-9]+"
						}]
					};

					if (!item) {
						return query;
					}

					query.regexp[0].exp = item.path + ".[0-9]+";

					return query;
				},
				maxDepthReached: function(item) {

					return item.rank.name === 'Genus';
				}
			});

		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('SHOW', lang.hitch(this, this._onSpeciesMainShown));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.tree.getChannel("SHOW"), {
				node: this.filter2.domNode
			});

			this.filter1.set("title", this.i18n.attributes);
			this.filter2.set("title", this.i18n.taxonTree);
		},

		_onSpeciesMainShown: function() {

			this.filterColumn.resize();
		}
	});
});
