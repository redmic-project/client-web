define([
	'dojo/_base/declare'
	, 'put-selector'
], function(
	declare
	, put
) {

	return declare(null, {
		// summary:
		//   Extensión de buscador por texto para permitir la expansión de filtros de búsqueda.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					EXPAND_SEARCH: 'expandSearch',
					CLOSE_EXPAND_SEARCH: 'closeExpandSearch'
				},
				actions: {
					EXPAND_SEARCH: 'expandSearch',
					CLOSE_EXPAND_SEARCH: 'closeExpandSearch'
				},
				expandSearchButtonClass: 'expandSearchButton'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_definePublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'EXPAND_SEARCH',
				channel: this.getChannel('EXPAND_SEARCH')
			},{
				event: 'CLOSE_EXPAND_SEARCH',
				channel: this.getChannel('CLOSE_EXPAND_SEARCH')
			});
		},

		_populateOuterButtons: function(outerButtonsContainer) {

			this.inherited(arguments);

			const expandSearchDefinition = `i.${this.expandSearchButtonClass}[title=${this.i18n.advancedSearch}]`;
			this._expandSearchNode = put(outerButtonsContainer, expandSearchDefinition);
			this._expandSearchNode.onclick = () => this._onExpandSearchClick();
		},

		_onExpandSearchClick: function() {

			this._emitEvt('EXPAND_SEARCH', {
				node: this._expandSearchNode
			});
		},

		_onSearchClick: function() {

			this.inherited(arguments);

			this._closeExpansionContainer();
		},

		_reset: function() {

			this.inherited(arguments);

			this._closeExpansionContainer();
		},

		_closeExpansionContainer: function() {

			this._publish(this.getChannel('CLOSE_EXPAND_SEARCH'), {
				node: this._expandSearchNode
			});
		}
	});
});
