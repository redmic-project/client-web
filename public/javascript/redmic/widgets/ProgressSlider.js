define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/dom-attr"
	, "dojo/Evented"
	, "dojo/query"
	, "dijit/form/HorizontalSlider"
	, "dijit/form/HorizontalRule"
	, "put-selector/put"
	, "./Button"
	, "dojo/dom-geometry"
	, 'moment/moment.min'
], function(
	declare
	, _WidgetBase
	, lang
	, domAttr
	, Evented
	, query
	, HorizontalSlider
	, Rule
	, put
	, RButton
	, domGeometry
	, moment
) {
	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		'class': "progressSlider",

		constructor: function(args) {

			this.config = {
				maxSlider: 0,
				minSlider: 0,
				value: 0,
				timeoutValue: 500,
				dateMode: false,
				formatDate: "YYYY-MM-DD HH:mm:ss",
				iconPlay: "fa fa-play",
				iconPause: "fa fa-pause",
				playExecute: false,
				delta: 1,
				events: {
					SET_VALUE: "setValue",
					SET_MIN: "setMin",
					SET_MAX: "setMax",
					SET_TIMEOUT: "setTimeout",
					CHANGE_VALUE: "changeValue",
					SET_DISCRETE_VALUE: "discreteValue",
					NEXT: "next",
					LAST: "last",
					PREV: "prev",
					PAUSE: "pause",
					PLAY: "play",
					STOP: "stop",
					HIDE_VALUE: "hideValue",
					SHOW_VALUE: "showValue",
					SET_DELTA: "setDelta"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.NEXT, lang.hitch(this, this._next));
			this.on(this.events.LAST, lang.hitch(this, this._last));
			this.on(this.events.PREV, lang.hitch(this, this._prev));
			this.on(this.events.PLAY, lang.hitch(this, this._play));
			this.on(this.events.STOP, lang.hitch(this, this._stop));
			this.on(this.events.PAUSE, lang.hitch(this, this._pause));

			this.on(this.events.SET_TIMEOUT, lang.hitch(this, this._setTimeout));
			this.on(this.events.SET_VALUE, lang.hitch(this, this._setValue));
			this.on(this.events.SET_DISCRETE_VALUE, lang.hitch(this, this._setDiscreteValues));
			this.on(this.events.SET_MIN, lang.hitch(this, this._setMin));
			this.on(this.events.SET_MAX, lang.hitch(this, this._setMax));
			this.on(this.events.SET_DELTA, lang.hitch(this, this._setDelta));
		},

		postCreate: function() {

			this.domNode.removeAttribute('widgetId');

			this.inherited(arguments);

			this._initialize();
		},

		_initialize: function() {

			this.prevButton = new RButton({
				iconClass: "fa fa-step-backward",
				'class': "",
				title: "",
				onClick: lang.hitch(this, this._prev),
				disable: true
			}).placeAt(this.domNode);

			this.playButton = new RButton({
				iconClass: this.iconPlay,
				'class': "",
				title: "",
				onClick: lang.hitch(this, this._play)
			}).placeAt(this.domNode);

			this.stopButton = new RButton({
				iconClass: "fa fa-stop",
				'class': "",
				title: "",
				disable: true,
				onClick: lang.hitch(this, this._stop)
			}).placeAt(this.domNode);

			this.nextButton = new RButton({
				iconClass: "fa fa-step-forward",
				'class': "",
				title: "",
				onClick: lang.hitch(this, this._next)
			}).placeAt(this.domNode);

			this.lastButton = new RButton({
				iconClass: "fa fa-fast-forward",
				'class': "",
				title: "",
				onClick: lang.hitch(this, this._last)
			}).placeAt(this.domNode);

			this.containerBarNode = put(this.domNode, "div.containerBar");

			this.slider = new HorizontalSlider({
				minimum: this.minSlider,
				maximum: this.maxSlider,
				value: this.value,
				discreteValues: this.maxSlider + 1,
				intermediateChanges: true,
				showButtons: false,
				onChange: lang.hitch(this, this._changeValue),
				onClick: lang.hitch(this, this._clickSlider)
			}).placeAt(this.containerBarNode);

			this.slider.domNode.removeAttribute('widgetId');

			this.slider.sliderHandle.onmousedown = lang.hitch(this, this._onMouseDownSlider);
			this.slider.progressBar.onmousedown = lang.hitch(this, this._onMouseDownSlider);
			this.slider.remainingBar.onmousedown = lang.hitch(this, this._onMouseDownSlider);

			this.slider.progressBar.onmouseover = lang.hitch(this, this._enterOrMoveInProgressBar);
			this.slider.remainingBar.onmouseover = lang.hitch(this, this._enterOrMoveInProgressBar);

			this.slider.progressBar.onmousemove = lang.hitch(this, this._enterOrMoveInProgressBar);
			this.slider.remainingBar.onmousemove = lang.hitch(this, this._enterOrMoveInProgressBar);

			this.slider.progressBar.onmouseout = lang.hitch(this, this._closePopupIntermediateValue);
			this.slider.remainingBar.onmouseout = lang.hitch(this, this._closePopupIntermediateValue);

			this._setTimeout(this.timeoutValue);
			this._evaluateButtonStatus();
		},

		_createPopupIntermediateValue: function() {

			this.popupNode = put(document.body, "div.popupCreate.popupProgressIntermediateValue");
			this.spanPopupNode = put(this.popupNode, "span");
			this._popupIntermediateValue = true;
		},

		_enterOrMoveInProgressBar: function(e){

			var abspos = domGeometry.position(this.slider.sliderBarContainer, true);
			var pixelValue = e[this.slider._mousePixelCoord] - abspos[this.slider._startingPixelCoord];
				pixelValue = this.slider._isReversed() ? (abspos[this.slider._pixelCount] - pixelValue) : pixelValue;

			var maxPixels = abspos[this.slider._pixelCount],
				count = this.slider.discreteValues;
			if (count <= 1 || count == Infinity)
				count = maxPixels;
			count--;

			var pixelsPerValue = maxPixels / count;
			var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
			var valuePoint = Math.max(Math.min((this.slider.maximum - this.slider.minimum) * wholeIncrements / count + this.slider.minimum, this.slider.maximum), this.slider.minimum);

			if (!this._popupIntermediateValue)
				this._createPopupIntermediateValue();

			this.spanPopupNode.innerHTML = this.dateMode ? moment(valuePoint).format(this.formatDate) : (valuePoint);

			this._openPopupIntermediateValue(e);
		},

		_openPopupIntermediateValue: function(evt) {

			this.popupNode.style.top = evt.clientY + 20 + "px"

			this.popupNode.style.left = evt.clientX - 10 + "px";
		},

		_closePopupIntermediateValue: function() {

			put("!", this.popupNode);
			this._popupIntermediateValue = false;
		},

		_changeValue: function(value) {

			this.emit(this.events.CHANGE_VALUE, {
				value: value
			});

			if (!this.playExecute)
				this._evaluateButtonStatus();
		},

		_evaluateButtonStatus: function() {

			var value = this.slider.get("value");

			if (value == this.slider.get('minimum')) {
				this.prevButton.emit(this.prevButton.events.DISABLE);
				this.stopButton.emit(this.stopButton.events.DISABLE);
			} else {
				this.prevButton.emit(this.prevButton.events.ENABLE);
				this.stopButton.emit(this.stopButton.events.ENABLE);
			}

			if (value == this.slider.get('maximum')) {
				this.nextButton.emit(this.nextButton.events.DISABLE);
				this.lastButton.emit(this.nextButton.events.DISABLE);
			} else {
				this.nextButton.emit(this.nextButton.events.ENABLE);
				this.lastButton.emit(this.nextButton.events.ENABLE);
			}

			if (this.slider.get('minimum') == this.slider.get('maximum'))
				this.playButton.emit(this.playButton.events.DISABLE);
			else
				this.playButton.emit(this.playButton.events.ENABLE);
		},

		_setValue: function(value) {

			this._isDate(value);

			this._resetPlayButton();
			this._stopTimeout();
			this._setValueSlider(value);
		},

		_setDelta: function(value) {

			this.delta = value;
		},

		_setMax: function(value) {

			this._isDate(value);

			this.slider.set('maximum', value);
			this._setDiscreteValues();

			var currentValue = this.slider.get("value");
			if (currentValue > value) {
				currentValue = value;
			}
			this.slider.set("value", currentValue);
			this._changeValue(currentValue);
		},

		_setMin: function(value, reset) {

			this._isDate(value);

			this.slider.set('minimum', value);
			this._setDiscreteValues();

			var currentValue = this.slider.get("value");
			if (reset || currentValue < value) {
				currentValue = value;
			}
			this.slider.set("value", currentValue);
			this._changeValue(currentValue);
		},

		_isDate: function(value) {

			if (value instanceof Object && value._isAMomentObject) {
				this.dateMode = true;
			}
			else
				this.dateMode = false;
		},

		_parseValueWhenIsDate: function(value) {

			if (this.dateMode)
				return value.format(this.formatDate);
			return value;
		},

		_setDiscreteValues: function() {

			this.slider.set('discreteValues',
				((this.slider.get('maximum') + this.slider.get('minimum')) + 1));
		},

		_setTimeout: function(value) {

			this.timeoutValue = value;
		},

		_play: function() {

			if (this.slider.get('value') == this.slider.get('maximum')) {
				this._stop();
				this._startTimeout(10);
			} else
				this._nextPlay();

			this._preparePlay();

			this.playButton.updateIcon(this.iconPause);
			this.playButton.updateOnClick(lang.hitch(this, this._pause));
		},

		_preparePlay: function() {

			this.playExecute = true;

			//this.slider.set("readOnly", true);
			this.nextButton.emit(this.nextButton.events.DISABLE);
			this.lastButton.emit(this.prevButton.events.DISABLE);
			this.prevButton.emit(this.prevButton.events.DISABLE);
			this.stopButton.emit(this.stopButton.events.ENABLE);
		},

		_addTransition: function() {

			this._selectNodeTransition();

			domAttr.set(this.nodeTransition, "style", "transition: width "
				+ ((this.timeoutValue / 1000)) + "s cubic-bezier(0.0, 0.0, 1, 1) 0s");
		},

		_cleanTransition: function() {

			this._selectNodeTransition();

			domAttr.set(this.nodeTransition, "style", "transition: width 0s ease 0s");
		},

		_selectNodeTransition: function() {

			if (!this.nodeTransition)
				this.nodeTransition = query("div.dijitSliderBar.dijitSliderBarH.dijitSliderProgressBar.dijitSliderProgressBarH"
				, this.slider.domNode)[0];
		},

		_setValueSlider: function(value) {

			if (value <= this.slider.get('maximum') && value >= this.slider.get('minimum'))
				this.slider.set('value', value);
		},

		_resetPlayButton: function() {

			this.playButton.updateIcon(this.iconPlay);
			this.playButton.updateOnClick(lang.hitch(this, this._play));

			this.playExecute = false;
			this._evaluateButtonStatus();
			this.slider.set("readOnly", false);
		},

		_stop: function() {

			//this._cleanTransition();

			this._stopTimeout();
			this._setValueSlider(this.slider.get('minimum'));
			this._resetPlayButton();
		},

		_onMouseDownSlider: function() {

			var playExecute = this.playExecute;
			this._pause();
			this.playExecute = playExecute;

			document.body.onmouseup = lang.hitch(this, this._eventOnMouseUpDocument);
		},

		_eventOnMouseUpDocument: function() {

			document.body.onmouseup = null;
			if (this.playExecute)
				this._play();
		},

		_clickSlider: function() {

			var playExecute = this.playExecute;
			this._pause();
			this.playExecute = playExecute;

			if (this.playExecute)
				this._play();
		},

		_pause: function() {

			this._stopTimeout();
			this._resetPlayButton();
		},

		_next: function() {

			//this._addTransition();

			this._pause();
			this._setValueSlider(this.slider.get('value') + this.delta);
		},

		_last: function() {

			this._pause();
			this._setValueSlider(this.slider.get('maximum'));
		},

		_prev: function() {

			//this._addTransition();

			this._pause();
			this._setValueSlider(this.slider.get('value') - this.delta);
		},

		_nextPlay: function() {

			//this._addTransition();

			clearTimeout(this.timeout);

			if (this.slider.get('value') + this.delta < this.slider.get('maximum')) {
				this._setValueSlider(this.slider.get('value') + this.delta);
				this._startTimeout();
			} else	{
				this._setValueSlider(this.slider.get('maximum'));
				this._stopTimeout();
				setTimeout(lang.hitch(this, this._resetPlayButton), this.timeoutValue);
			}
		},

		_startTimeout: function(time) {

			this.timeout = setTimeout(lang.hitch(this, this._nextPlay), time ? time : this.timeoutValue);
		},

		_stopTimeout: function() {

			clearTimeout(this.timeout);
		}
	});
});
