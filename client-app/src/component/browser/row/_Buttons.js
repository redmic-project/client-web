define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/browser/buttons/Buttons"
	, "src/component/browser/buttons/_GroupButtons"
], function(
	declare
	, lang
	, aspect
	, Buttons
	, _GroupButtons
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				buttonsEvents: {
					BUTTON_EVENT: "btnEvent"
				},
				buttonsActions: {
					BUTTON_EVENT: "btnEvent",
					BUTTON_EVENT_ROW: "btnEventRow"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setButtonsConfigurations));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixButtonsEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineButtonsSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineButtonsPublications));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeButtons));

			aspect.before(this, "_updateData", lang.hitch(this, this._updateButtonsData));
		},

		_mixButtonsEventsAndActions: function () {

			lang.mixin(this.events, this.buttonsEvents);
			lang.mixin(this.actions, this.buttonsActions);

			delete this.buttonsEvents;
			delete this.buttonsActions;
		},

		_defineButtonsSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("BUTTON_EVENT"),
				callback: "_subBtnEvent"
			});
		},

		_defineButtonsPublications: function() {

			this.publicationsConfig.push({
				event: 'BUTTON_EVENT',
				channel: this.getParentChannel('BUTTON_EVENT_ROW')
			});
		},

		_setButtonsConfigurations: function() {

			this.buttonsConfig = this._merge([{
				parentChannel: this.getChannel(),
				browserChannel: this.getParentChannel(),
				idProperty: this.idProperty
			}, this.buttonsConfig || {}]);
		},

		_initializeButtons: function() {

			this.buttons = new declare([Buttons, _GroupButtons])(this.buttonsConfig);
		},

		_subBtnEvent: function(req) {

			if (req.iconNode || this.nodeInBtnEvent) {
				req.node = this.domNode;
			}

			this._emitEvt('BUTTON_EVENT', req);
		},

		_updateButtonsData: function(item) {

			this._publish(this.buttons.getChannel('SHOW'), {
				data: item,
				node: this.rowTopNode
			});
		}
	});
});
