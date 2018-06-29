define([
	"app/designs/base/_Main"
	, "app/designs/textSearchFacetsList/Controller"
	, "app/designs/textSearchFacetsList/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SpeciesList"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/SelectionBox"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/tree/_HierarchicalFilter"
	, "redmic/modules/tree/_LazyLoad"
	, "redmic/modules/tree/CbtreeImpl"
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
				title: this.i18n.species
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.filterConfig = this._merge([{
				returnFields: ['aphia', 'authorship', 'commonName', 'groupIcon', 'id',
					'peculiarity.popularNames', 'scientificName', 'status']
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
				aggs: {
					"status": {
						'open': true,
						"terms": {
							"field": "status.name"
						}
					},
					"origin": {
						"terms": {
							"field": "peculiarity.origin.name"
						}
					},
					"endemicity": {
						"terms": {
							"field": "peculiarity.endemicity.name"
						}
					},
					"permanence": {
						"terms": {
							"field": "peculiarity.permanence.name"
						}
					},
					"ecology": {
						"terms": {
							"field": "peculiarity.ecology.name"
						}
					},
					"trophicRegime": {
						"terms": {
							"field": "peculiarity.trophicRegime.name"
						}
					},
					"interest": {
						"terms": {
							"field": "peculiarity.interest.name"
						}
					},
					"canaryProtection": {
						"terms": {
							"field": "peculiarity.canaryProtection.name"
						}
					},
					"spainProtection": {
						"terms": {
							"field": "peculiarity.spainProtection.name"
						}
					},
					"euProtection": {
						"terms": {
							"field": "peculiarity.euProtection.name"
						}
					}
				}
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
						"returnFields" : ["scientificName", "rank", "path", "leaves"],
						"regexp": [{"field": "path", "exp": "root.[0-9]+"}]
					};

					if (!item)
						return query;

					query.regexp[0].exp = item.path + ".[0-9]+";

					return query;
				},
				maxDepthReached: function(item) {
					if (item.rank.name === "Genus")
						return true;
					return false;
				}
			});

		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.tree.getChannel("SHOW"), {
				node: this.filter2.domNode
			});

			this.filter1.set("title", this.i18n.attributes);
			this.filter2.set("title", this.i18n.taxonTree);
		}
	});
});
