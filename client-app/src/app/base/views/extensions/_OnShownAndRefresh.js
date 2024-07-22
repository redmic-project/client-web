define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, Utilities
){
	return declare(null, {
		//	summary:
		//		Extensión que genera callback para emitir refresh apartir de la primera vez mostrado.

		_setControllerOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onControllerMeOrAncestorHidden));
		},

		_onControllerMeOrAncestorHidden: function() {

			this._getPreviouslyShown() && !this._existCallbackMeOrAncestorShown && this._onEvt('ME_OR_ANCESTOR_SHOWN',
				lang.hitch(this, this._onControllerMeOrAncestorShown));

			if (this.pathVariableId) {
				this.oldPathVariableId = this.pathVariableId;
			}

			this._existCallbackMeOrAncestorShown = true;
		},

		_onControllerMeOrAncestorShown: function() {

			var needToRefresh = this._getPreviouslyShown();

			if (this.pathVariableId && this.oldPathVariableId &&
				Utilities.isEqual(this.pathVariableId, this.oldPathVariableId)) {
				needToRefresh = false;
			}

			if (needToRefresh) {
				var obj = {
					initData: !!this.initDataRefresh
				};

				this._emitEvt('REFRESH', obj);
			}
		}
	});
});
