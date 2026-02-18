define([
	'dojo/_base/declare'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
], function(
	declare
	, _Module
	, _Show
	, _Store
) {

	return declare(_Store, {
		// summary:
		//   Extensión de buscador por texto para realizar peticiones de datos directamente.

		postMixInProperties: function() {

			const defaultConfig = {
				searchFields: null
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('SEARCH', obj => this._onSearchEvent(obj));
		},

		_onSearchEvent: function(/*Object*/ searchObj) {

			this.inherited(arguments);

			this._emitEvt('REQUEST', {
				target: this._getTarget(),
				params: this._createSearchRequestParams(searchObj)
			});
		},

		_createSearchRequestParams: function(searchObj) {

			this.inherited(arguments);

			const path = {
				id: this.id
			};

			const query = {
				text: searchObj.value,
				searchFields: this.searchFields
			};

			return {path, query};
		},

		_shouldOmitTargetLoading: function() {

			return true;
		}
	});
});
