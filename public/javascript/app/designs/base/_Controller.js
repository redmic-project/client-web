define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "./_ControllerItfc"
], function (
	declare
	, lang
	, aspect
	, put
	, _Module
	, _Show
	, _ControllerItfc
){
	return declare([_Module, _Show, _ControllerItfc], {
		//	summary:
		//		Base para los controller.

		constructor: function(args) {

			this.config = {
				controllerBaseEvents: {
					TITLE_CLASS_SELECTOR_SET: "titleClassSelectorSet",
					TITLE_SET: "titleSet"
				},
				controllerEvents: {},
				controllerActions: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setControllerConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeController));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixControllerEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineControllerSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineControllerPublications));
			aspect.before(this, "_doEvtFacade", lang.hitch(this, this._doControllerEvtFacade));
			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setControllerBaseOwnCallbacksForEvents));

			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setControllerOwnCallbacksForEvents));

			aspect.after(this, '_show', lang.hitch(this, this._resizeControllerAfterShow));
			aspect.before(this, "_afterShow", lang.hitch(this, this._afterControllerShow));
		},

		_mixControllerEventsAndActions: function () {

			lang.mixin(this.controllerEvents, this.controllerBaseEvents);
			lang.mixin(this.events, this.controllerEvents);
			lang.mixin(this.actions, this.controllerActions);

			delete this.controllerBaseEvents;
			delete this.controllerEvents;
			delete this.controllerActions;
		},

		_setControllerBaseOwnCallbacksForEvents: function() {

			this._onEvt("TITLE_CLASS_SELECTOR_SET", lang.hitch(this, this._updateTitleClassSelector));
			this._onEvt("TITLE_SET", lang.hitch(this, this._updateTitle));
			this._onEvt("SHOW", lang.hitch(this, this._onControllerShown));
		},

		_updateTitleClassSelector: function() {

			var node = this._getTitleNode();
			node && put(node, this.titleClassSelector);
		},

		_updateTitle: function(title) {

			var titleNode = this._getTitleNode(),
				titleValue = title || this.title;

			if (!titleNode) {
				return;
			}

			put(titleNode, '[title=$]', titleValue);
			titleNode.innerHTML = titleValue;
		},

		_setTitle: function(title) {

			if (this.titleSpanNode) {
				put(this.titleSpanNode, "!");
			}

			this.titleSpanNode = put(this._titleNode, "span[title=$].titleRedmic", title, title);
		},

		_getTitleNode: function() {

			return this.titleSpanNode;
		},

		_resizeControllerAfterShow: function() {

			this.resize && this.resize();
		}
	});
});
