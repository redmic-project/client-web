define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/component/filter/Filter'
	, './_FilterItfc'
], function(
	declare
	, lang
	, aspect
	, Filter
	, _FilterItfc
) {

	return declare(_FilterItfc, {
		//	summary:
		//

		constructor: function() {

			this.config = {
				filterEvents: {
					ADD_TO_QUERY: 'addToQuery',
					ADDED_TO_QUERY: 'addedToQuery',
					REFRESH: 'refresh',
					QUERY_CHANNEL_SET: 'queryChannelSet'
				},
				filterActions: {
					ADDED_TO_QUERY: 'addedToQuery',
					SERIALIZED: 'serialized',
					//REQUEST_FILTER: 'requestFilter',
					ADD_TO_QUERY: 'addToQuery',
					REFRESH: 'refresh'
				}
			};

			lang.mixin(this, this.config);

			aspect.before(this, '_mixEventsAndActions', lang.hitch(this, this._mixFilterEventsAndActions));
			aspect.before(this, '_afterSetConfigurations', lang.hitch(this, this._setFilterConfigurations));
			aspect.before(this, '_beforeInitialize', lang.hitch(this, this._initializeFilter));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineFilterSubscriptions));
			aspect.after(this, '_definePublications', lang.hitch(this, this._defineFilterPublications));
		},

		_mixFilterEventsAndActions: function() {

			lang.mixin(this.events, this.filterEvents);
			lang.mixin(this.actions, this.filterActions);

			delete this.filterEvents;
			delete this.filterActions;
		},

		_setFilterConfigurations: function() {

			this.filterConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target
			}, this.filterConfig || {}]);
		},

		_initializeFilter: function() {

			if (!this.queryChannel) {
				this.filter = new Filter(this.filterConfig);
				this.queryChannel = this.filter.getChannel();
			}

			this._setQueryChannelInModules(this.queryChannel);
		},

		_defineFilterSubscriptions: function() {

			this._subscribeToFilter(this.queryChannel);
		},

		_subscribeToFilter: function(queryChannel) {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(queryChannel, this.actions.ADDED_TO_QUERY),
				callback: '_subAddedToQuery'
			},{
				channel: this._buildChannel(queryChannel, this.actions.SERIALIZED),
				callback: '_subFilterSerialized'
			/*},{ // TODO: REQUEST_FILTER parece lo mismo que SERIALIZE, hacer que todo vaya por SERIALIZE
				channel: this._buildChannel(queryChannel, this.actions.REQUEST_FILTER),
				callback: '_subFilterSerialized'*/
			});
		},

		_defineFilterPublications: function() {

			this._setPublicationsToFilter(this.queryChannel);
		},

		_setPublicationsToFilter: function(queryChannel) {

			this.publicationsConfig.push({
				event: 'ADD_TO_QUERY',
				channel: this._buildChannel(queryChannel, this.actions.ADD_TO_QUERY)
			},{
				event: 'ADDED_TO_QUERY',
				channel: this.getChannel('ADDED_TO_QUERY')
			},{
				event: 'REFRESH',
				channel: this._buildChannel(queryChannel, this.actions.REFRESH)
			});
		},

		_subAddedToQuery: function(res) {

			this._emitEvt('ADDED_TO_QUERY', res);
		},

		_subFilterSerialized: function(res) {

			this._handleFilterParams(res.data);
		},

		_onTargetPropSet: function(changeObj) {

			this.inherited(arguments);

			const target = changeObj.newValue;

			this._publish(this._buildChannel(this.queryChannel, 'SET_PROPS'), {target});
		},

		_onQueryChannelPropSet: function(evt) {

			this._disconnectFromFilter(evt.oldValue);
			this._connectToFilter(evt.value);
		},

		_disconnectFromFilter: function(oldQueryChannel) {

			this._removeSubscriptions([
				this._buildChannel(oldQueryChannel, this.actions.ADDED_TO_QUERY),
				this._buildChannel(oldQueryChannel, this.actions.SERIALIZED)
			]);
			this._removePublications([
				this._buildChannel(oldQueryChannel, this.actions.ADD_TO_QUERY),
				this._buildChannel(oldQueryChannel, this.actions.REFRESH)
			]);
		},

		_connectToFilter: function(newQueryChannel) {

			this._subscribeToFilter(newQueryChannel);
			this._setPublicationsToFilter(newQueryChannel);
		}
	});
});
