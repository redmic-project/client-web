define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/base/Credentials"
	, "redmic/modules/base/_ShowInTooltip"
	, "redmic/modules/base/_ShowOnEvt"
	, "redmic/modules/components/Keypad/IconKeypadImpl"
	, "redmic/modules/search/CompositeImpl"
	, "redmic/modules/search/_HideFormByAction"
], function(
	declare
	, lang
	, aspect
	, put
	, Credentials
	, _ShowInTooltip
	, _ShowOnEvt
	, IconKeypadImpl
	, CompositeImpl
	, _HideFormByAction
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				buttonsComposite: {
					"filters": {
						className: "fa-filter",
						title: this.i18n.filterTitle
					}
				},
				compositeActions: {
					KEYPAD_INPUT: "keypadInput"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixCompositeEventsAndActions));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._constructorComposite));
		},

		_constructorComposite: function(args) {

			if (this.blockCompositeToUser && Credentials.get("userRole") !== 'ROLE_ADMINISTRATOR')
				return;

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setCompositeConfigurations));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeBeforeCompositeView));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._initializeAfterCompositeView));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineCompositeSubcriptions));
			aspect.after(this, "postCreate", lang.hitch(this, this._postCompositeCreate));
		},

		_mixCompositeEventsAndActions: function () {

			lang.mixin(this.actions, this.compositeActions);

			delete this.compositeActions;
		},

		_setCompositeConfigurations: function() {

			this.compositeConfig = this._merge([{
				parentChannel: this.getChannel(),
				timeClose: null,
				'class': 'compositeSearchInTooltip'
			}, this.compositeConfig || {}]);
		},

		_defineCompositeSubcriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.iconKeypadChannel, this.actions.KEYPAD_INPUT),
				callback: "_subKeypadInputComposite"
			});
		},

		_initializeBeforeCompositeView: function() {

			this.compositeConfig.filterChannel = this.queryChannel;

			this.composite = new declare([CompositeImpl, _HideFormByAction, _ShowOnEvt])
				.extend(_ShowInTooltip)(this.compositeConfig);
		},

		_initializeAfterCompositeView: function() {

			if (!this.iconKeypadChannel) {
				this.iconKeypadComposite = new IconKeypadImpl({
					parentChannel: this.getChannel(),
					items: this.buttonsComposite
				});

				this.iconKeypadChannel = this.iconKeypadComposite.getChannel();
			}
		},

		_postCompositeCreate: function() {

			if (this.iconKeypadComposite) {

				this.keypadZoneNode = put(this._getIconKeypadNode(), "div.keypadZone");

				this._publish(this.iconKeypadComposite.getChannel("SHOW"), {
					node: this.keypadZoneNode
				});
			}
		},

		_subKeypadInputComposite: function(res) {

			if (res.inputKey === "filters") {
				if (!this._initFilters) {
					this._publish(this.composite.getChannel("ADD_EVT"), {
						sourceNode: res.node.firstChild,
						initAction: 'hide'
					});

					this._publish(this.composite.getChannel("SHOW"), {
						node: res.node.firstChild
					});

					this._initFilters = true;
				}
			}
		},

		_getIconKeypadNode: function() {

			if (this.getIconKeypadNode)
				return this.getIconKeypadNode();

			return this.topNode;
		}
	});
});