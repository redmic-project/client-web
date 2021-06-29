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
				openFacets: false,
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

			this._originalAggregationGroupsDefinition = this.aggs;
			this._groupsOrder = Object.keys(this.aggs);
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

			var newAggs = req && req.aggs;

			if (!newAggs) {
				return;
			}

			this.aggs = newAggs;
			this._selectionByAggregationGroup = {};
			this._getFacets();
		},

		_getFacets: function(aggs) {

			this._emitEvt('LOADING');

			this._setAggs(this.aggs);

			var obj = {
				aggs: this._currentAggregationGroups//,
				//size: 0,
				//requesterId: this.queryChannel
			};

			lang.mixin(obj, this.query || {});

			this._emitEvt('SEARCH', obj);
		},

		_setAggs: function(aggs) {

			this._aggregationGroupsDefinition = aggs;
			this._currentAggregationGroups = [];

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
					this._nestedAggs[field] = nested;
				}

				this._currentAggregationGroups.push(obj);
			}
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
			this._emitEvt('LOADED');
		},

		_setFacets: function(availableAggregationGroups) {

			var cleanAggregationGroups = {};
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
				var groupName = this._groupsOrder[i],
					aggGroup = aggregationGroups[groupName];

				if (!aggGroup) {
					continue;
				}

				if (!aggGroup.buckets) {
					if (aggGroup[groupName]) {
						aggGroup = aggGroup[groupName];
					} else {
						var prefixedAggGroupName = this._getAggregationGroupNameWithPrefix(groupName);
						aggGroup = aggGroup[prefixedAggGroupName];
					}
				}

				this._showFacetsGroup(aggGroup, groupName);
			}
		},

		_cleanChildrenNode: function() {

			for (var aggGroup in this._facetsInstances) {
				this._facetsInstances[aggGroup].destroy();
			}
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

			if (aggGroupDefinition && aggGroupDefinition.terms) {
				return aggGroupDefinition.terms.field || groupName;
			} else {
				return groupName;
			}
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
