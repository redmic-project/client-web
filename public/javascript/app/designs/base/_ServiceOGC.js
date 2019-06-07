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

		_initializeMain: function() {

			this._atlasData = new AtlasDataImpl({
				parentChannel: this.getChannel(),
				outputTarget: this._atlasDataTarget,
				pathProperty: this.pathProperty,
				pathSeparator: this.pathSeparator
			});
		},

		_requestAtlasDataOnRefresh: function() {

			this._publish(this._atlasData.getChannel('REQUEST_TO_TARGETS'));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('REFRESH');
		}
	});
});
