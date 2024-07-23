define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, put
) {
	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		'class': 'switch',

		constructor: function(args) {

			this.config = {
				leftLabel: 'ON',
				rightLabel: 'OFF',
				activeDefault: false,
				_disabled: false,
				i18n: null,
				iconClass: null,
				events: {
					ACTIVE: "active",
					DISABLE: "disable"
				}
			};

			lang.mixin(this, this.config, args);

		},

		postCreate: function() {

			this.inherited(arguments);

			this.leftContainerNode = put(this.domNode, "div.leftContainerSwitch");
			put(this.leftContainerNode, 'span', this.leftLabel);

			this.rightContainerNode = put(this.domNode, "div.rightContainerSwitch");
			put(this.rightContainerNode, 'span', this.rightLabel);

			this.primaryContainerNode = put(this.domNode, 'div.primaryContainer' + (this.activeDefault ? '.primaryContainerLeft' : '.primaryContainerRight'));

			if (this.iconClass) {
				put(this.primaryContainerNode, 'i.fa.' + this.iconClass);
			}

			this.leftContainerNode.onclick = lang.hitch(this, this.changeMode, true, true);

			this.rightContainerNode.onclick = lang.hitch(this, this.changeMode, false, true);

			if (this.activeDefault) {
				this.primaryContainerNode.onclick = lang.hitch(this, this._emit, this.events.ACTIVE);
			}
		},

		changeMode: function(active, emit) {

			if (this._lastActive === active || this._disabled) {
				return;
			}

			if (active) {
				this._lastActive = active;
				put(this.primaryContainerNode, "!primaryContainerRight");
				put(this.primaryContainerNode, ".primaryContainerLeft");
				emit && this._emit(this.events.ACTIVE);
				this.primaryContainerNode.onclick = lang.hitch(this, this._emit, this.events.ACTIVE);
			} else {
				this.primaryContainerNode.onclick = null;
				this._lastActive = active;
				put(this.primaryContainerNode, ".primaryContainerRight");
				put(this.primaryContainerNode, "!primaryContainerLeft");
				emit && this._emit(this.events.DISABLE);
			}
		},

		_emit: function(evt) {

			if (!this._disabled) {
				this.emit(evt);
			}
		},

		disable: function(value) {

			this._disabled = true;

			put(this.domNode, ".disable");
		},

		enable: function(value) {

			this._disabled = false;

			put(this.domNode, "!disable");
		}
	});
});
