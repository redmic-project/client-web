define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/dom-class"
	, 'moment'
	, 'put-selector'
], function(
	declare
	, lang
	, aspect
	, domClass
	, moment
	, put
) {
	return declare(null, {
		//	summary:
		//		Extensión para controlar la navegación entre dominios anteriores y posteriores
		//		usados por el usuario, así como mostrar el dominio inicial para los datos actuales.

		constructor: function(args) {

			this.config = {
				resetZoomButtonClass: 'icon.fa.fa-home',
				previousZoomButtonClass: 'icon.fa.fa-caret-left',
				nextZoomButtonClass: 'icon.fa.fa-caret-right',
				disabledNavigationButtonClass: 'disabled',

				_originalDomain: {},
				_domainRecords: [],
				_domainRecordIndex: -1
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_createElements', lang.hitch(this, this._createDomainHistoryNavigationElements));
		},

		_createDomainHistoryNavigationElements: function() {

			this._resetZoomButton = put('i.' + this.resetZoomButtonClass);
			this._prevZoomButton = put('i.' + this.previousZoomButtonClass);
			this._nextZoomButton = put('i.' + this.nextZoomButtonClass);

			this._resetZoomButtonCallback = lang.hitch(this, this._restoreToOriginalZoom);
			this._prevZoomButtonCallback = lang.hitch(this, this._backToPreviousZoom);
			this._nextZoomButtonCallback = lang.hitch(this, this._goToNextZoom);

			this._evaluateButtonsState();
			this._prepareDomainHistoryNavigationButtonsInsertion();
		},

		_evaluateButtonsState: function() {

			this._evaluateResetZoomButtonState();
			this._evaluatePrevZoomButtonState();
			this._evaluateNextZoomButtonState();
		},

		_evaluateResetZoomButtonState: function() {

			var currentDomain = this._domainRecords[this._domainRecordIndex],
				currentDomainIsAtOrigin;

			if (currentDomain) {
				var currentMin = currentDomain.min,
					currentMax = currentDomain.max;

				currentDomainIsAtOrigin = this._checkDomainIsAtOrigin(currentMin, currentMax);
			}

			if (currentDomainIsAtOrigin || this._domainRecordIndex < 1) {
				domClass.add(this._resetZoomButton, this.disabledNavigationButtonClass);
				this._resetZoomButton.onclick = null;
			} else {
				domClass.remove(this._resetZoomButton, this.disabledNavigationButtonClass);
				this._resetZoomButton.onclick = this._resetZoomButtonCallback;
			}
		},

		_evaluatePrevZoomButtonState: function() {

			if (this._domainRecordIndex < 1) {
				domClass.add(this._prevZoomButton, this.disabledNavigationButtonClass);
				this._prevZoomButton.onclick = null;
			} else {
				domClass.remove(this._prevZoomButton, this.disabledNavigationButtonClass);
				this._prevZoomButton.onclick = this._prevZoomButtonCallback;
			}
		},

		_evaluateNextZoomButtonState: function() {

			var lastIndex = this._domainRecords.length - 1;

			if (this._domainRecordIndex === lastIndex) {
				domClass.add(this._nextZoomButton, this.disabledNavigationButtonClass);
				this._nextZoomButton.onclick = null;
			} else {
				domClass.remove(this._nextZoomButton, this.disabledNavigationButtonClass);
				this._nextZoomButton.onclick = this._nextZoomButtonCallback;
			}
		},

		_prepareDomainHistoryNavigationButtonsInsertion: function() {

			this._buttons = {
				reset: this._resetZoomButton,
				prev: this._prevZoomButton,
				next: this._nextZoomButton
			};

			if (this.buttonsContainer) {
				this._insertDomainHistoryNavigationButtons();
			} else {
				this._onEvt('BUTTONS_CONTAINER_SET', lang.hitch(this, this._insertDomainHistoryNavigationButtons));
			}
		},

		_insertDomainHistoryNavigationButtons: function(changeObj) {

			for (var key in this._buttons) {
				put(this.buttonsContainer, this._buttons[key]);
			}
		},

		_restoreToOriginalZoom: function() {

			var min = this._originalDomain.min,
				max = this._originalDomain.max;

			if (min && max) {
				this._changeDomain(min, max);
				this._evaluateButtonsState();
			}
		},

		_backToPreviousZoom: function() {

			if (this._domainRecordIndex) {
				this._domainRecordIndex--;
				this._applyRecordedZoom();
			}
		},

		_goToNextZoom: function() {

			var lastIndex = this._domainRecords.length - 1;

			if (this._domainRecordIndex < lastIndex) {
				this._domainRecordIndex++;
				this._applyRecordedZoom();
			}
		},

		_applyRecordedZoom: function() {

			var domain = this._domainRecords[this._domainRecordIndex];

			if (domain) {
				this._changeDomain(domain.min, domain.max, true);
				this._evaluateButtonsState();
			}
		},

		_updateOriginalDomain: function() {

			var originalMin = this._originalDomain.min,
				originalMax = this._originalDomain.max,
				limitsFound = this._findDataHorizontalDomainLimits(),
				newMin = limitsFound.min,
				newMax = limitsFound.max,
				originalDomainIsOutdated = !moment(newMin).isSame(originalMin) || !moment(newMax).isSame(originalMax);

			if (originalDomainIsOutdated) {
				this._originalDomain.min = newMin;
				this._originalDomain.max = newMax;

				this._domainRecords = [{
					min: newMin,
					max: newMax
				}];
				this._domainRecordIndex = 0;

				this._evaluateButtonsState();
			}
		},

		_findDataHorizontalDomainLimits: function() {

			var currentMin = Number.POSITIVE_INFINITY,
				currentMax = Number.NEGATIVE_INFINITY;

			for (var key in this._layersLimits) {
				if (this._hiddenLayers[key]) {
					continue;
				}

				var currentMinMoment = moment(currentMin),
					currentMaxMoment = moment(currentMax),
					layerLimits = this._layersLimits[key],
					layerMin = layerLimits.xMin,
					layerMax = layerLimits.xMax;

				if (layerMin && (!currentMinMoment.isValid() || currentMinMoment.isAfter(layerMin))) {
					currentMin = layerMin;
				}

				if (layerMax && (!currentMaxMoment.isValid() || currentMaxMoment.isBefore(layerMax))) {
					currentMax = layerMax;
				}
			}

			return {
				min: currentMin,
				max: currentMax
			};
		},

		_recordDomain: function(min, max) {

			this._cleanInvalidRecords();
			this._applyRecordDomain(min, max);
			this._evaluateButtonsState();
		},

		_cleanInvalidRecords: function() {

			var lastIndex = this._domainRecords.length - 1;

			if (this._domainRecordIndex < lastIndex) {
				this._domainRecords.splice(this._domainRecordIndex + 1);
			}
		},

		_applyRecordDomain: function(min, max) {

			if (!this._domainRecordIndex && this._checkDomainIsAtOrigin(min, max)) {
				return;
			}

			this._domainRecords.push({
				min: min,
				max: max
			});

			this._domainRecordIndex++;
		},

		_checkDomainIsAtOrigin: function(min, max) {

			var originalMin = this._originalDomain.min,
				originalMax = this._originalDomain.max;

			return moment(originalMin).isSame(min) && moment(originalMax).isSame(max);
		},

		_checkTimeDomainIsRepresentable: function(min, max) {

			var momentMin = moment(min),
				momentMax = moment(max),
				diffInMinutes = momentMax.diff(momentMin, 'minutes');

			return diffInMinutes >= 5;
		}
	});
});
