define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'RWidgets/Facet'
	, './Search'
], function(
	declare
	, lang
	, aspect
	, Facet
	, Search
) {

	return declare(Search, {
		//	summary:
		//		Implementación de búsqueda a nivel de agregaciones, seleccionando los grupos deseados.
		//	description:
		//		Proporciona los medios para realizar búsquedas de tipo facets.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				facetsEvents: {
				},
				facetsActions: {
					AVAILABLE_FACETS: 'availableFacets',
					UPDATE_FACETS: 'updateFacets'
				},
				ownChannel: 'facetsSearch',
				'class': 'containerFacets',
				propertyName: 'postFilter',
				aggs: null,
				_aggs: {},
				openFacets: false,
				maxInitialEntries: 5,
				order: null,
				instance: {},
				query: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_setConfigurations', lang.hitch(this, this._setFacetsConfigurations));
			aspect.before(this, '_mixEventsAndActions', lang.hitch(this, this._mixFacetsEventsAndActions));
			aspect.before(this, '_defineSubscriptions', lang.hitch(this, this._defineFacetsSubscriptions));
		},

		_mixFacetsEventsAndActions: function() {

			lang.mixin(this.events, this.facetsEvents);
			lang.mixin(this.actions, this.facetsActions);

			delete this.facetsEvents;
			delete this.facetsActions;
		},

		_setFacetsConfigurations: function() {

			this.facetsConfig = this._merge([{
				i18n: this.i18n,
				openFacets: this.openFacets
			}, this.facetsConfig || {}]);
		},

		_defineFacetsSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.queryChannel, this.actions.AVAILABLE_FACETS),
				callback: '_subAvailableFacets'
			},{
				channel: this.getChannel('UPDATE_FACETS'),
				callback: '_subUpdateFacets'
			});
		},

		_initialize: function() {

		},

		_beforeShow: function(/*Object*/ obj) {

			this._getFacets({
				aggs: this.aggs,
				prefixFieldFacet: this.prefixFieldFacet,
				suffixFieldFacet: this.suffixFieldFacet,
				fieldFacet: this.fieldFacet
			});
		},

		_subUpdateFacets: function(evt) {

			this._getFacets(evt);
		},

		_getFacets: function(/*object*/ evt) {

			this._emitEvt('LOADING');

			this._setAggs(lang.clone(evt.aggs));

			if (!this._facetsCreate) {
				var obj = {
					aggs: this.aggs//,
					//size: 0,
					//requesterId: this.queryChannel
				};

				lang.mixin(obj, this.query || {});

				this._emitEvt('SEARCH', obj);
			}

			this._facetsCreate = true;
		},

		_setAggs: function(/*json*/ aggs) {

			this.aggs2 = aggs;
			this.order = Object.keys(aggs);

			this.aggs = [];

			for (var item in aggs) {

				var terms = aggs[item].terms,
					field = terms.field,
					nested = terms.nested,
					obj = {
						size: terms.size || 100,
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

			var result = {};
			for (var item in evt) {
				if (typeof evt[item] !== 'object' || this.order.indexOf(item) === -1) {
					continue;
				}
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

			return field.replace(nestedTerm + '.', nestedTerm + '$.');
		},

		_subAvailableFacets: function(/*Object*/ response) {

			this._setFacets(response);
			this._emitEvt('LOADED');
		},

		_setFacets: function(/*object*/ facets) {

			var cleanFacets = {};
			for (var key in facets) {
				var keySplitted = key.split('#');
				cleanFacets[keySplitted.pop()] = facets[key];
			}

			this._showFacetsGroups({
				aggregations: cleanFacets
			});
		},

		_reset: function() {

		},

		_showFacetsGroups: function(config) {

			if (Object.keys(this.instance).length !== 0) {
				for (var item in this.instance) {
					this.instance[item].termSelection = this.instance[item].widget.termSelection;
				}
			}

			this._cleanChildrenNode();

			for (var i = 0; i < this.order.length; i++) {
				this._showFacetsGroup(config, this.order[i]);
			}
		},

		_cleanChildrenNode: function() {

			while (this.domNode.firstChild) {
				this.domNode.removeChild(this.domNode.firstChild);
			}
		},

		_showFacetsGroup: function(config, item) {

			var facetsPrefix = 'sterms#',
				content = config.aggregations[item],
				open;

			if (!content) {
				return;
			}

			if (!content.buckets) {
				content = content[item] || content[facetsPrefix + item];
			}

			if (this.instance && this.instance[item] && (this.instance[item].termSelection.length != 0)) {
				open = true;
			} else if (this.aggs2 && this.aggs2[item] && this.aggs2[item].open) {
				open = this.aggs2[item].open;
			} else {
				open = this.openFacets;
			}

			var widget = new Facet({
				termSelection: (this.instance && this.instance[item]) ? this.instance[item].termSelection : [],
				label: item,
				termsFieldFacet: (this.aggs2 && this.aggs2[item]) ? this.aggs2[item].terms.field : item,
				title: (this.i18n && this.i18n[item]) ? this.i18n[item] : item,
				i18n: this.i18n,
				open: open,
				config: content,
				maxInitialEntries: this.maxInitialEntries
			}).placeAt(this.domNode);

			this.instance[item] = {
				widget: widget,
				termSelection: []
			};

			if (widget.termSelection.length != 0) {
				widget.emit(widget.events.TERMS_CHANGED);
			}

			widget.on('updateQuery', lang.hitch(this, this._onFacetChangeEvent));
		},

		_onFacetChangeEvent: function(queryTerm, title) {

			queryTerm ? this._addFacetToQuery(title, queryTerm) : this._removeFacetFromQuery(title);

			this._onNewSearch(this.query);
		},

		_addFacetToQuery: function(title, queryTerm) {

			this.query[title] = queryTerm;
		},

		_removeFacetFromQuery: function(title) {

			delete this.query[title];
		}
	});
});
