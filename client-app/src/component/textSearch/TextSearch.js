define([
	'dojo/_base/declare'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/textSearch/_TextSearchItfc'
], function(
	declare
	, _Module
	, _Show
	, _TextSearchItfc
) {

	return declare([_Module, _Show, _TextSearchItfc], {
		// summary:
		//   Componente para realizar búsquedas por texto en los diferentes servicios.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'textSearch',
				events: {
					SEARCH: 'search'
				},
				actions: {
					SEARCH: 'search',
					RESET: 'reset',
					REFRESH: 'refresh'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel('RESET'),
				callback: '_subReset'
			},{
				channel: this.getChannel('REFRESH'),
				callback: '_subRefresh'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SEARCH',
				channel: this.getChannel('SEARCH')
			});
		},

		_subReset: function() {

			this._reset();
		},

		_subRefresh: function() {

			this._refresh();
		}
	});
});
