define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'RWidgets/Facet'
	, 'src/component/base/_Store'
	, './Search'
], function(
	declare
	, lang
	, aspect
	, Facet
	, _Store
	, Search
) {

	return declare([Search, _Store], {
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
				openFacets: true,
				maxInitialEntries: 5,
				aggs: null,
				aggGroupNamePrefix: 'sterms',
				aggGroupNameSeparator: '#',
				nestedAggNameSuffix: '$',
				_nestedAggs: {},
				_facetsInstances: {},
				_selectionByAggregationGroup: {},
				_facetsOpened: {},
				_facetsExpanded: {},
				query: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_defineSubscriptions', lang.hitch(this, this._defineFacetsSubscriptions));
		},

		_mixEventsAndActions: function() {

			lang.mixin(this.events, this.facetsEvents);
			lang.mixin(this.actions, this.facetsActions);

			delete this.facetsEvents;
			delete this.facetsActions;
		},

		_initialize: function() {

			this._updateAgreggationGroupsDefinitions(this.aggs);
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

		_beforeShow: function() {

			this._getFacets();
		},

		_subUpdateFacets: function(req) {

			const availableAggregationGroups = req?.aggs || {};

			this._setFacets(availableAggregationGroups);
		},

		_updateAgreggationGroupsDefinitions: function(aggs) {

			if (!this._originalAggregationGroupsDefinition) {
				this._originalAggregationGroupsDefinition = aggs;
			}

			this._aggregationGroupsDefinition = aggs;
			this._selectionByAggregationGroup = {};

			this._groupsOrder = this._getAggregationGroupsOrderedKeys(aggs);
		},

		_getAggregationGroupsOrderedKeys: function(aggs) {

			if (Array.isArray(aggs)) {
				return aggs.map(agg => agg.name);
			} else {
				return Object.keys(aggs);
			}
		},

		_getFacets: function() {

			const aggsGroups = this._parseAggregationsForFacets();

			var obj = {
				aggs: aggsGroups
			};

			lang.mixin(obj, this.query || {});

			this._emitEvt('SEARCH', obj);
		},

		_parseAggregationsForFacets: function() {

			const aggsGroups = [];

			for (const [key, value] of Object.entries(this._aggregationGroupsDefinition)) {
				const field = value.field,
					nested = value.nested,
					aggObj = {
						term: key,
						field: field,
						size: value.size || 100,
						minCount: value.minCount || 0
					};

				if (nested) {
					aggObj.nested = nested;
					this._nestedAggs[field] = nested;
				}

				aggsGroups.push(aggObj);
			}

			return aggsGroups;
		},

		_onNewSearch: function(query) {

			var result = {};

			for (var item in query) {
				var aggGroup = query[item];

				if (typeof aggGroup !== 'object' || this._groupsOrder.indexOf(item) === -1) {
					continue;
				}

				for (var field in aggGroup) {
					var value = aggGroup[field];

					if (this._nestedAggs[field]) {
						result[this._getNestedField(field)] = value;
					} else {
						result[field] = value;
					}
				}
			}

			this._newSearch(result);
		},

		_getNestedField: function(field) {

			var nestedAggName = this._nestedAggs[field];

			return field.replace(nestedAggName, nestedAggName + this.nestedAggNameSuffix);
		},

		_subAvailableFacets: function(availableAggregationGroups) {

			this._setFacets(availableAggregationGroups);
		},

		_dataAvailable: function(res) {

			this.inherited(arguments);

			const availableAggregationGroups = res.data?.aggregations;

			availableAggregationGroups && this._setFacets(availableAggregationGroups);
		},

		_setFacets: function(availableAggregationGroups) {

			if (Array.isArray(availableAggregationGroups)) {
				this._showFacetsGroups(availableAggregationGroups);
				return;
			}

			const cleanAggregationGroups = {};
			for (var key in availableAggregationGroups) {
				var cleanAggGroupName = this._getAggregationGroupNameWithoutPrefix(key);
				cleanAggregationGroups[cleanAggGroupName] = availableAggregationGroups[key];
			}
			this._showFacetsGroups(cleanAggregationGroups);
		},

		_getAggregationGroupNameWithoutPrefix: function(aggGroupName) {

			return aggGroupName.split(this.aggGroupNameSeparator).pop();
		},

		_reset: function() {

			this._selectionByAggregationGroup = {};
		},

		_showFacetsGroups: function(aggregationGroups) {

			this._cleanChildrenNode();

			for (var i = 0; i < this._groupsOrder.length; i++) {
				const aggGroupName = this._groupsOrder[i];

				let aggGroup = this._getAggregationGroupByName(aggregationGroups, aggGroupName);

				if (!aggGroup) {
					continue;
				}

				if (!aggGroup.buckets) {
					if (aggGroup[aggGroupName]) {
						aggGroup = aggGroup[aggGroupName];
					} else {
						var prefixedAggGroupName = this._getAggregationGroupNameWithPrefix(aggGroupName);
						aggGroup = aggGroup[prefixedAggGroupName];
					}
				}

				this._showFacetsGroup(aggGroup, aggGroupName);
			}
		},

		_cleanChildrenNode: function() {

			for (var aggGroup in this._facetsInstances) {
				this._facetsInstances[aggGroup].destroy();
			}
		},

		_getAggregationGroupByName: function(aggregationGroups, aggGroupName) {

			let aggGroupIndex;

			if (!Array.isArray(aggregationGroups)) {
				aggGroupIndex = aggGroupName;
			} else {
				aggGroupIndex = aggregationGroups.findIndex((aggGroup) => aggGroup.name === aggGroupName);
			}

			return aggregationGroups[aggGroupIndex];
		},

		_getAggregationGroupNameWithPrefix: function(cleanAggGroupName) {

			if (cleanAggGroupName.indexOf(this.aggGroupNameSeparator) !== -1) {
				return cleanAggGroupName;
			}

			return this.aggGroupNamePrefix + this.aggGroupNameSeparator + cleanAggGroupName;
		},

		_showFacetsGroup: function(aggregationGroup, groupName) {

			var prevSelection = this._getAggregationGroupPreviousSelection(groupName),
				propertyPath = this._getAggregationGroupPropertyPath(groupName),
				openStatus = this._getAggregationGroupOpenStatus(groupName);

			var widget = new Facet({
				termSelection: prevSelection,
				label: groupName,
				termsFieldFacet: propertyPath,
				title: this.i18n[groupName] || groupName,
				i18n: this.i18n,
				open: openStatus,
				expanded: this._facetsExpanded[groupName] || false,
				config: aggregationGroup,
				maxInitialEntries: this.maxInitialEntries
			}).placeAt(this.domNode);

			this._facetsInstances[groupName] = widget;

			widget.on('updateQuery', lang.hitch(this, this._onFacetChangeEvent));
			widget.on('showMore', lang.hitch(this, this._onFacetShowMoreEvent));
			widget.on('showLess', lang.hitch(this, this._onFacetShowLessEvent));
			widget.on('open', lang.hitch(this, this._onFacetOpenEvent));
			widget.on('close', lang.hitch(this, this._onFacetCloseEvent));
		},

		_getAggregationGroupPreviousSelection: function(groupName) {

			return this._selectionByAggregationGroup[groupName] || [];
		},

		_getAggregationGroupPropertyPath: function(groupName) {

			var aggGroupDefinition = this._aggregationGroupsDefinition[groupName];

			return aggGroupDefinition?.field || groupName;
		},

		_getAggregationGroupOpenStatus: function(groupName) {

			var aggGroupDefinition = this._aggregationGroupsDefinition[groupName],
				defaultStatus = (aggGroupDefinition && aggGroupDefinition.open !== undefined) ?
					aggGroupDefinition.open : this.openFacets,

				currentStatus = this._facetsOpened[groupName];

			return currentStatus !== undefined ? currentStatus : defaultStatus;
		},

		_onFacetChangeEvent: function(queryTerm, title) {

			var propertyPath = this._getAggregationGroupPropertyPath(title);

			if (queryTerm) {
				this._addFacetToQuery(title, queryTerm);
				this._selectionByAggregationGroup[title] = queryTerm[propertyPath];
			} else {
				this._removeFacetFromQuery(title);
				this._selectionByAggregationGroup[title] = [];
			}

			this._onNewSearch(this.query);
		},

		_addFacetToQuery: function(title, queryTerm) {

			this.query[title] = queryTerm;
		},

		_removeFacetFromQuery: function(title) {

			delete this.query[title];
		},

		_onFacetShowMoreEvent: function(facetsGroupTitle) {

			this._facetsExpanded[facetsGroupTitle] = true;
		},

		_onFacetShowLessEvent: function(facetsGroupTitle) {

			delete this._facetsExpanded[facetsGroupTitle];
		},

		_onFacetOpenEvent: function(facetsGroupTitle) {

			this._facetsOpened[facetsGroupTitle] = true;
		},

		_onFacetCloseEvent: function(facetsGroupTitle) {

			this._facetsOpened[facetsGroupTitle] = false;
		}
	});
});
