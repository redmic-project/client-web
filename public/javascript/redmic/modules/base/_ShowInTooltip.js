define([
	"dijit/_WidgetBase"
	, "dijit/popup"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "put-selector/put"
], function(
	_WidgetBase
	, popup
	, lang
	, Deferred
	, all
	, put
){
	return {
		//	summary:
		//		Extensión de módulos para que se muestren en un tooltip.

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._onModuleAncestorHide));
		},

		postCreate: function() {

			if (this.timeClose === undefined) {
				this.timeClose = 600;
			}

			this.inherited(arguments);

			var classTooltip = "dijitMenu tooltipButton ";

			if (this.indicatorLeft) {
				classTooltip += "tooltipButtonLeft ";
			}

			if (this.classTooltip) {
				classTooltip += this.classTooltip;
			}

			this.tooltipNode = new _WidgetBase({
				'class': classTooltip
			});

			if (!this.notIndicator) {
				var nodeIndicator = put(this.tooltipNode.domNode, "i.fa.fa-caret-up.indicatorParent");
			}

			this.nodeModule = put(this.tooltipNode.domNode, "div.containerContent");
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

		_showWrapper: function(req) {

			this.nodeSource = req.node;
			req.node = this.nodeModule;

			this.inherited(arguments);

			this._openTooltip(req.additionalNode);
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

		_openTooltip: function(additionalNode) {

			var obj = {
				popup: this.tooltipNode,
				around: this.nodeSource,
				orient: this.orient
			};

			if (this._ancestorTooltipNode) {
				obj.parent = this._ancestorTooltipNode;
			}

			popup.open(obj);

			if (this.timeClose) {
				this.tooltipNode._popupWrapper.onmouseleave = lang.hitch(this, this._startTimeout);
				this.tooltipNode._popupWrapper.onmouseover = lang.hitch(this, this._stopTimeout);

				this.nodeSource.onmouseleave = lang.hitch(this, this._startTimeout);
				this.nodeSource.onmouseover = lang.hitch(this, this._stopTimeout);

				if (additionalNode) {
					additionalNode.onmouseleave = lang.hitch(this, this._startTimeout);
				}
			}

			this._dfdTooltip.resolve();
		},

		_startTimeout: function() {

			this.timeout = setTimeout(lang.hitch(this, this._publish, this.getChannel("HIDE")), this.timeClose);
		},

		_stopTimeout: function() {

			clearTimeout(this.timeout);
		},

		_onModuleAncestorHide: function() {

			this._publish(this.getChannel("HIDE"));
		},

		_onModuleHide: function() {

			this._stopTimeout();
			this._closeTooltip();

			this.inherited(arguments);
		},

		_closeTooltip: function(evt) {

			popup.close(this.tooltipNode);

			if (this.timeClose) {
				this.tooltipNode._popupWrapper.onmouseover = function(){};
				this.tooltipNode._popupWrapper.onmouseleave = function(){};

				this.nodeSource.onmouseleave = function(){};
				this.nodeSource.onmouseover = function(){};
			}
		},

		_subAncestorGotProps: function(res, c) {

			this._ancestorTooltipNode = res.tooltipNode;
		}
	};
});
