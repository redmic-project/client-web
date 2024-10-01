define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/components/Keypad/IconKeypadImpl"
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_Framework"
	, "src/component/browser/ListImpl"
], function (
	declare
	, lang
	, aspect
	, IconKeypadImpl
	, _ButtonsInRow
	, _Framework
	, ListImpl
){
	return declare(null, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				idProperty: "id",
				browserEvents: {
					REFRESH: "refresh",
					UPDATE_TARGET: "updateTarget"
				},
				browserActions: {
					REFRESH: "refresh",
					UPDATE_TARGET: "updateTarget"
				},
				browserExts: [],
				browserBase: [ListImpl, _Framework, _ButtonsInRow],
				browserBars: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setBrowserConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeBrowser));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixBrowserEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineBrowserSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineBrowserPublications));
		},

		_mixBrowserEventsAndActions: function () {

			lang.mixin(this.events, this.browserEvents);
			lang.mixin(this.actions, this.browserActions);

			delete this.browserEvents;
			delete this.browserActions;
		},

		_setBrowserConfigurations: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				target: this._getTarget(),
				selectionTarget: this.selectionTarget
			}, this.browserConfig || {}]);
		},

		_initializeBrowser: function() {

			var exts = this.browserBase.concat(this.browserExts);

			this.browser = new declare(exts)(this.browserConfig);

			this._initializeBrowserBars();

			if (this.buttons) {
				this.iconKeypad = new IconKeypadImpl({
					parentChannel: this.getChannel(),
					items: this.buttons
				});
			}
		},

		_initializeBrowserBars: function() {

			if (!this.browserBars) {
				return;
			}

			for (var key in this.browserBars) {
				var item = this.browserBars[key],
					Definition = item.definition;

				var config = this._merge([{
					parentChannel: this.getChannel(),
					queryChannel: this.browserConfig.queryChannel,
					target: this._getTarget(),
					selectionTarget: this.selectionTarget,
					selectorChannel: this.selectorChannel,
					browserChannel: this.browser.getChannel()
				}, item.config || {}]);

				var instance = new Definition(config);

				this._publish(this.browser.getChannel("ADD_TOOLBAR_IN_FRAMEWORK"), {
					instance: instance
				});
			}
		},

		_defineBrowserSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.browser.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});
		},

		_defineBrowserPublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.browser.getChannel("UPDATE_TARGET")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browser.getChannel("SHOW"), {
				node: this._getListNode()
			});

			if (this.iconKeypad) {
				if (!this.buttonsInTopZone) {
					this._publish(this.browser.getChannel("ADD_TOOLBAR_IN_FRAMEWORK"), {
						instance: this.iconKeypad
					});
				} else if (this.keypadZoneNode) {
					this._publish(this.iconKeypad.getChannel("SHOW"), {
						node: this.keypadZoneNode
					});
				}
			}
		},

		_getListNode: function() {

			return this.listNode;
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_getTarget: function() {

			var target = this.inherited(arguments);

			if (target) {
				return target;
			}

			if (this.baseTarget) {
				return this.baseTarget;
			}

			if (this.target instanceof Array) {
				return this.target[0];
			}

			return this.target;
		}
	});
});
