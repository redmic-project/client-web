define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "RWidgets/ContainerFacets"
	, "./Search"
], function(
	declare
	, lang
	, aspect
	, put
	, ContainerFacets
	, Search
){
	return declare(Search, {
		//	summary:
		//		Todo lo necesario para trabajar con FacetsSearch.
		//	description:
		//		Proporciona métodos y contenedor para la búsqueda de tipo facets.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				// own actions
				facetsActions: {
					AVAILABLE_FACETS: "availableFacets",
					UPDATE_FACETS: "updateFacets"
				},
				propertyName: 'postFilter',
				aggs: null,
				_aggs: {},
				openFacets: false,
				ownChannel: "facetsSearch"
			};

			lang.mixin(this, this.config, args);
			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setFacetsConfigurations));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixFacetsEventsAndActions));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineFacetsSubscriptions));
		},

		_mixFacetsEventsAndActions: function () {

			lang.mixin(this.actions, this.facetsActions);

			delete this.facetsActions;
		},

		_setFacetsConfigurations: function() {

			this.facetsConfig = this._merge([{
				i18n: this.i18n,
				openFacets: this.openFacets
			}, this.facetsConfig || {}]);
		},

		_defineFacetsSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.queryChannel, this.actions.AVAILABLE_FACETS),
				callback: "_subAvailableFacets"
			},{
				channel: this.getChannel("UPDATE_FACETS"),
				callback: "_subUpdateFacets"
			});
		},

		_initialize: function() {

			this.facets = new ContainerFacets(this.facetsConfig);

			this.facets.on("updateConsult", lang.hitch(this, this._onNewSearch));
		},

		_beforeShow: function(/*Object*/ obj) {

			this._getFacets({
				aggs: this.aggs,
				prefixFieldFacet: this.prefixFieldFacet,
				suffixFieldFacet: this.suffixFieldFacet,
				fieldFacet: this.fieldFacet
			});
		},

		_getNodeToShow: function() {

			return this.facets.domNode;
		},

		_subUpdateFacets: function(evt) {

			this._getFacets(evt);
		},

		_getFacets: function(/*object*/ evt) {

			this._emitEvt('LOADING');

			this.facets.setAggs(evt.aggs);
			this._setAggs(lang.clone(evt.aggs));

			if (!this._facetsCreate) {
				this._emitEvt('SEARCH', {
					aggs: this.aggs,
					size: 0,
					requesterId: this.queryChannel
				});
			}

			this._facetsCreate = true;
		},

		_setAggs: function(/*json*/ aggs) {

			this.aggs = [];

			for (var item in aggs) {

				var terms = aggs[item].terms,
					field = terms.field,
					nested = terms.nested,
					obj = {
						size: terms.size || null,
						field: field,
						term: item,
						minCount: 0
					};

				if (nested) {
					obj.nested = nested;
					this._aggs[field] = nested;
				}

				this.aggs.push(obj);
			}
		},

		_onNewSearch: function(evt) {

			// TODO: quitar las claves más externas desde el widget no aquí
			var result = {};
			for (var item in evt) {
				for (var field in evt[item]) {
					var value = evt[item][field];
					if (this._aggs[field]) {
						result[this._processNested(field, value)] = value;
					} else {
						result[field] = value;
					}
				}
			}

			this._newSearch(result);
		},

		_processNested: function(field, value) {

			var nestedTerm = this._aggs[field];

			return field.replace(nestedTerm + ".", nestedTerm + "$.");
		},

		_subAvailableFacets: function(/*Object*/ response) {

			this._setFacets(response);
			this._emitEvt('LOADED');
		},

		_setFacets: function(/*object*/ facets) {

			this.facets.setConfig({"aggregations": facets});
		},

		_reset: function() {

			this.facets.setI18n(this.i18n);
		}
	});
});
