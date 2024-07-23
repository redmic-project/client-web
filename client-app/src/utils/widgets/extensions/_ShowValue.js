define([
	"dojo/_base/lang"
	, "put-selector/put"
	, 'moment/moment.min'
], function(
	lang
	, put
	, moment
){
	return {

		_initialize: function() {

			this.on(this.events.HIDE_VALUE, lang.hitch(this, this._hideValue));
			this.on(this.events.SHOW_VALUE, lang.hitch(this, this._showValue));

			this.inherited(arguments);

			this.containerLimit = put(this.containerBarNode, "div.containerLimit");

			this.minSpanNode = put(this.containerLimit, "div span", this.minSlider);

			this.maxSpanNode = put(this.containerLimit, "div span", this.maxSlider);

			if (this.showValue)
				this.containerValue = put(this.domNode, "div.containerValue");
		},

		_hideValue: function() {

			this.desactiveValue = true;

			this._openPopup();

			put(this.containerLimit, ".hidden");
		},

		_showValue: function() {

			this.desactiveValue = false;

			put(this.containerLimit, "!hidden");
		},

		_setMax: function(value) {

			this.inherited(arguments);

			this.maxSpanNode.innerHTML = this._parseValueWhenIsDate(value);
		},

		_setMin: function(value) {

			this.inherited(arguments);

			this.minSpanNode.innerHTML = this._parseValueWhenIsDate(value);
		},

		_createPopupPlay: function() {

			this.popupPlayCreate = true;
			this.popupPlayNode = put(document.body, "div.popupCreate.popupProgressBarPlay");
			this.spanPopupPlayNode = put(this.popupPlayNode, "span");
		},

		_openPopupPlay: function() {

			if (!this.popupPlayCreate)
				this._createPopupPlay();

			var obj = this.slider.sliderHandle.getBoundingClientRect();

			this.spanPopupPlayNode.innerHTML = this._parseValueToShow();

			var offsetLeft = (this.popupPlayNode.getBoundingClientRect().width ) / 8;

			if (offsetLeft >= 2)
				offsetLeft = -offsetLeft * 1.8;
			else
				offsetLeft = 1;

			this.popupPlayNode.style.top = obj.top - 21 + "px";

			this.popupPlayNode.style.left = obj.left + offsetLeft + "px";
		},

		_closePopupPlay: function() {

			put("!", this.popupPlayNode);

			this.popupPlayCreate = false;
		},

		_play: function() {

			this.inherited(arguments);
		},

		_resetPlayButton: function() {

			if (this.valueInTooltip)
				this._closePopupPlay();

			this.inherited(arguments);
		},

		_nextPlay: function() {

			if (this.valueInTooltip)
				this._openPopupPlay();

			this.inherited(arguments);
		},

		_parseValueToShow: function() {

			return this.dateMode ? moment(this.slider.get('value')).format(this.formatDate) : (this.slider.get('value'));
		},

		_changeValue: function(value) {

			if (this.showValue)
				this.containerValue.innerHTML = this._parseValueToShow();

			this.inherited(arguments);
		}
	};
});