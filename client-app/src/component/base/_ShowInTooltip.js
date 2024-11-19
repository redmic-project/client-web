define([
	'dijit/_WidgetBase'
	, 'dijit/popup'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'put-selector'
], function(
	_WidgetBase
	, popup
	, lang
	, Deferred
	, all
	, put
) {

	return {
		//	summary:
		//		Extensión de módulos para que se muestren en un tooltip.

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._onModuleAncestorHide));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._tooltipClass = 'tooltipContainer';
			this._suggestionsClass = 'suggestions';

			var tooltipClass = this._tooltipClass,
				sourceIndicatorClass = 'tooltipSourceIndicator',
				defaultTooltipCloseTimeout = 1000;

			this._tooltipAboveClass = 'tooltipAboveSource';
			this._tooltipBelowClass = 'tooltipBelowSource';
			this._tooltipLeftClass = 'tooltipLeftSource';
			this._tooltipRightClass = 'tooltipRightSource';

			if (this.timeClose === undefined) {
				this.timeClose = defaultTooltipCloseTimeout;
			}

			if (this.classTooltip) {
				tooltipClass += ' ' + this.classTooltip;
			}

			this.tooltipNode = new _WidgetBase({
				'class': tooltipClass
			});

			this._tooltipSourceIndicatorNode = put(this.tooltipNode.domNode, 'i.' + sourceIndicatorClass);

			this._globalClicksHandler = this._listenGlobalClicks(lang.hitch(this, this._evaluateToHideTooltip));
			this._globalClicksHandler.pause();
		},

		_evaluateToHideTooltip: function(evt) {

			if (!this.tooltipNode._popupWrapper) {
				return;
			}

			var nodeBelongsToTooltipContainer = this._checkClickBelongsToNode(evt, this.tooltipNode._popupWrapper),
				nodeBelongsToSourceNode = this._checkClickBelongsToNode(evt, this._tooltipSourceNode),
				nodeBelongsToOtherTooltip = this._checkClickBelongsToNodeWithClass(evt, this._tooltipClass),
				nodeBelongsToSuggestions = this._checkClickBelongsToNodeWithClass(evt, this._suggestionsClass);

			if (!nodeBelongsToTooltipContainer && !nodeBelongsToSourceNode && !nodeBelongsToOtherTooltip &&
				!nodeBelongsToSuggestions) {

				this._hideTooltip();
			}
		},

		_beforeShow: function() {

			this.inherited(arguments);

			// TODO revisar la forma de descubrir si se trata de un tooltip anidado. Pedirles a todos su nodo no es
			// demasiado limpio
			delete this._ancestorTooltipNode;

			var channel = this.getChannel(),
				channelSplitted = channel.split(this.channelSeparator);

			channelSplitted.pop();
			while (channelSplitted.length) {
				channel = channelSplitted.join(this.channelSeparator);

				this._once(this._buildChannel(channel, this.actions.GOT_PROPS),
					lang.hitch(this, this._subAncestorGotProps), {
						predicate: lang.hitch(this, this._chkAncestorTooltipNodeNoExists)
					});

				this._publish(this._buildChannel(channel, this.actions.GET_PROPS), {
					tooltipNode: true
				});

				channelSplitted.pop();
			}
		},

		_chkAncestorTooltipNodeNoExists: function() {

			return !this._ancestorTooltipNode;
		},

		_subAncestorGotProps: function(res) {

			this._ancestorTooltipNode = res.tooltipNode;
		},

		_showWrapper: function(req) {

			this._tooltipSourceNode = req.node;
			req.node = this.tooltipNode.domNode;

			this.inherited(arguments);

			this._openTooltip();
		},

		_afterShow: function(req) {

			this._dfdTooltip = new Deferred();

			var dfdAfterShow = this.inherited(arguments),
				dfdList = [this._dfdTooltip];

			if (dfdAfterShow && dfdAfterShow.then && !this._dfdAfterShow.isFulfilled()) {
				dfdList.push(dfdAfterShow);
			}

			return all(dfdList);
		},

		_openTooltip: function() {

			this._calculateOrientation();

			this._setParentPopup();

			if (this.timeClose) {
				this._prepareTooltipClose();
			}

			this._globalClicksHandler.resume();
			this._dfdTooltip.resolve();
		},

		_calculateOrientation: function() {

			var middleWidth = globalThis.innerWidth / 2,
				middleHeight = globalThis.innerHeight / 2,

				sourceBounding = this._tooltipSourceNode.getBoundingClientRect(),
				sourceMiddleWidth = sourceBounding.left + sourceBounding.width / 2,
				sourceMiddleHeight = sourceBounding.top + sourceBounding.height / 2,

				leftAvailable = sourceMiddleWidth > middleWidth,
				topAvailable = sourceMiddleHeight > middleHeight,
				orientValue, xOrientClass, yOrientClass;

			if (leftAvailable && topAvailable) {
				orientValue = 'above-alt';
				xOrientClass = this._tooltipLeftClass;
				yOrientClass = this._tooltipAboveClass;
			} else if (!leftAvailable && topAvailable) {
				orientValue = 'above';
				xOrientClass = this._tooltipRightClass;
				yOrientClass = this._tooltipAboveClass;
			} else if (leftAvailable && !topAvailable) {
				orientValue = 'below-alt';
				xOrientClass = this._tooltipLeftClass;
				yOrientClass = this._tooltipBelowClass;
			} else {
				orientValue = 'below';
				xOrientClass = this._tooltipRightClass;
				yOrientClass = this._tooltipBelowClass;
			}

			this._tooltipOrientValue = orientValue;
			this._setOrientationClasses(xOrientClass, yOrientClass);
		},

		_setOrientationClasses: function(xOrientClass, yOrientClass) {

			put(this.tooltipNode.domNode, '.' + xOrientClass + '.' + yOrientClass);
		},

		_setParentPopup: function() {

			var obj = {
				popup: this.tooltipNode,
				around: this._tooltipSourceNode,
				orient: [this._tooltipOrientValue]
			};

			if (this._ancestorTooltipNode) {
				obj.parent = this._ancestorTooltipNode;
			}

			popup.open(obj);
		},

		_prepareTooltipClose: function() {

			var popupNode = this.tooltipNode._popupWrapper,
				startCallback = lang.hitch(this, this._startCloseTimeout),
				stopCallback = lang.hitch(this, this._stopCloseTimeout);

			popupNode.onmouseleave = startCallback;
			popupNode.onmouseover = stopCallback;

			this._tooltipSourceNodeOldMouseLeaveCallback = this._tooltipSourceNode.onmouseleave;
			this._tooltipSourceNodeOldMouseOverCallback = this._tooltipSourceNode.onmouseover;
			this._tooltipSourceNode.onmouseleave = startCallback;
			this._tooltipSourceNode.onmouseover = stopCallback;
		},

		_startCloseTimeout: function() {

			this._closeTimeoutHandler = setTimeout(lang.hitch(this, this._hideTooltip), this.timeClose);
		},

		_stopCloseTimeout: function() {

			clearTimeout(this._closeTimeoutHandler);
		},

		_onModuleAncestorHide: function() {

			this._hideTooltip();
		},

		_hideTooltip: function() {

			this._publish(this.getChannel('HIDE'));
		},

		_onModuleHide: function() {

			this._stopCloseTimeout();
			this._removeTooltip();

			this.inherited(arguments);
		},

		_removeTooltip: function(evt) {

			popup.close(this.tooltipNode);

			put('!', this.tooltipNode._popupWrapper);

			var classesToRemove = '!' + this._tooltipAboveClass + '!' + this._tooltipBelowClass +
				'!' + this._tooltipLeftClass + '!' + this._tooltipRightClass;

			put(this.tooltipNode.domNode, classesToRemove);

			this._globalClicksHandler.pause();

			if (this.timeClose) {
				this._tooltipSourceNode.onmouseleave = this._tooltipSourceNodeOldMouseLeaveCallback;
				this._tooltipSourceNode.onmouseover = this._tooltipSourceNodeOldMouseOverCallback;
			}
		}
	};
});
