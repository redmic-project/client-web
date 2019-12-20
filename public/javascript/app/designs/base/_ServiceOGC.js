define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/store/RequestJoiner/AtlasDataImpl"
], function(
	declare
	, lang
	, AtlasDataImpl
) {

	return declare(null, {
		//	summary:
		//		Base de vistas principales de ServiceOGC (varios diseños).

		constructor: function(args) {

			this.config = {
				pathProperty: "path",
				pathSeparator: ".",
				_atlasDataTarget: 'atlasData'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('REFRESH', lang.hitch(this, this._requestAtlasDataOnRefresh));
		},

		_setMainConfigurations: function() {

			var atlasHighlightFields = ['title.suggest', 'alias.suggest'],
				atlasSearchFields = ['title.suggest', 'alias.suggest', 'keywords.suggest'],
				atlasSuggestFields = ['title', 'alias', 'keywords'];

			this.textSearchConfig = this._merge([{
				highlightField: atlasHighlightFields,
				suggestFields: atlasSuggestFields,
				searchFields: atlasSearchFields,
				legacyMode: false
			}, this.textSearchConfig || {}]);

			this.filterConfig = this._merge([{
				serializeOnQueryUpdate: false
			}, this.filterConfig || {}]);
		},

		_initializeMain: function() {

			this._atlasData = new AtlasDataImpl({
				parentChannel: this.getChannel(),
				outputTarget: this._atlasDataTarget,
				pathProperty: this.pathProperty,
				pathSeparator: this.pathSeparator
			});
		},

		_requestAtlasDataOnRefresh: function() {

			this._requestAtlasData();
		},

		_requestAtlasData: function(queryObj) {

			this._publish(this._atlasData.getChannel('REQUEST_TO_TARGETS'), queryObj || {});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		},

		_handleFilterParams: function(filterParams) {

			if (filterParams.suggest) {
				return;
			}

			this._requestAtlasData({
				target: this.target,
				queryParams: filterParams
			});
		}
	});
});
