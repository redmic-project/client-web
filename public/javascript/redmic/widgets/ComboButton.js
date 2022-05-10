define([
	"./Button"
	, "dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dijit/popup"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
], function(
	Button
	, declare
	, _WidgetBase
	, popup
	, lang
	, Evented
	, put
) {
	return declare([_WidgetBase, Evented, Button], {

		constructor: function(args) {

			this.config = {
				iconClass: null,
				orient: null,
				classDefault: ".comboButton.dijitComboButton",
				dropDown: null,
				widthAuto: true
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.inherited(arguments);

			put(this.buttonNode, ".dijitReset.dijitStretch");

			this.dropDownNode = put(this.domNode, "div.fa.fa-caret-down.dijitRight.dijitButtonNode.dijitArrowButton.dijitDownArrowButton");

			this.dropDownNode.onclick = lang.hitch(this, this._dropDownOnClick);
		},

		_dropDownOnClick: function(evt) {

			if (this.dropDown && !this.openPopup && this.dropDown.domNode.children.length != 0) {

				this.openPopup = true;

				popup.open({
					popup: this.dropDown,
					around: this.domNode,
					orient: this.orient,
					onClose: lang.hitch(this, this._closePopup),
					onCancel: lang.hitch(this, this._closePopup),
					onExecute: lang.hitch(this, this._closePopup)
				});

				if (this.widthAuto) {
					this.dropDown._popupWrapper.style.width = this.buttonNode.offsetWidth + "px";
				}

				this.dropDown._popupWrapper.onclick = lang.hitch(this, this._closePopup);

				this.dropDown._popupWrapper.onmouseover = lang.hitch(this, this._stopTimeOut);
				this.dropDown._popupWrapper.onmouseleave = lang.hitch(this, this._startTimeOut);

				this.dropDownNode.onmouseover = lang.hitch(this, this._stopTimeOut);
				this.dropDownNode.onmouseleave = lang.hitch(this, this._startTimeOut);
			} else if (this.dropDown) {
				this._closePopup();
			}
		},

		_closePopup: function(evt) {

			this.openPopup = false;
			this._stopTimeOut();
			popup.close(this.dropDown);
		},

		_startTimeOut: function() {

			this.timeOut = setTimeout(lang.hitch(this, this._closePopup), 500);
		},

		_stopTimeOut: function() {

			clearTimeout(this.timeOut);
		},

		updateDropDown: function(dropDown) {

			this.dropDown = dropDown;
		},

		_createDropDown: function() {

			this.dropDown = new _WidgetBase({
				'class': "dijitMenu menuPopUpIconEdition"
			});
		},

		insertRowInDropDown: function(item) {

			if (!this.dropDown) {
				this._createDropDown();
			}

			var menuItem = put(this.dropDown.domNode, "a");

			if (item.iconClass) {
				menuItem.setAttribute('class', item.iconClass);
			}

			if (item.title) {
				menuItem.setAttribute('title', item.title);
			}

			if (item.href) {
				menuItem.setAttribute('d-state-url', true);
				menuItem.setAttribute('href', item.href);
			} else {
				menuItem.onclick = item.onClick;
			}
		},

		reset: function() {

			put(this.dropDownNode, "!");

			delete this.dropDown;

			this.inherited(arguments);
		}
	});
});
