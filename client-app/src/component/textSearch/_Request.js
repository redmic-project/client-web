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
				getRequestPathParams: null,
				getRequestQueryParams: null
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('SEARCH', obj => this._onSearchEvent(obj.value));
		},

		_onSearchEvent: function(/*String*/ value) {

			this.inherited(arguments);

			this._emitEvt('REQUEST', {
				target: this._getTarget(),
				params: this._createSearchRequestParams(value)
			});
		},

		_createSearchRequestParams: function(value) {

			this.inherited(arguments);

			const path = this.getRequestPathParams?.(value) ?? {};
			const query = this.getRequestQueryParams?.(value) ?? {text: value};

			return {path, query};
		},

		_shouldOmitTargetLoading: function() {

			return true;
		}
	});
});
