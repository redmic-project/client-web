define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "./_LayerCommonsItfc"
], function(
	declare
	, lang
	, aspect
	, Utilities
	, _LayerCommonsItfc
){
	return declare(_LayerCommonsItfc, {
		//	summary:
		//		Base para los módulos de capa (gráficas y ejes) que se añadirán a 'ChartsContainer'.

		constructor: function(args) {

			this.config = {
				layerCommonsEvents: {
					DRAWN: "drawn",
					CLEARED: "cleared",
					SHOWN: "shown",
					HIDDEN: "hidden",
					GOT_INFO: "gotInfo",
					INFO_UPDATED: "infoUpdated",
					COLOR_SET: "colorSet"
				},
				layerCommonsActions: {
					DRAW: "draw",
					DRAWN: "drawn",
					CLEAR: "clear",
					CLEARED: "cleared",
					SET_SIZE: "setSize",
					SET_SCALE: "setScale",
					SHOW: "show",
					HIDE: "hide",
					SHOWN: "shown",
					HIDDEN: "hidden",
					GET_INFO: "getInfo",
					GOT_INFO: "gotInfo",
					INFO_UPDATED: "infoUpdated",
					SET_COLOR: "setColor",
					COLOR_SET: "colorSet"
				},

				color: "steelblue",
				_width: 0,
				_height: 0
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixLayerCommonsEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineLayerCommonsSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineLayerCommonsPublications));
			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setLayerCommonsOwnCallbacksForEvents));
		},

		_mixLayerCommonsEventsAndActions: function() {

			lang.mixin(this.events, this.layerCommonsEvents);
			lang.mixin(this.actions, this.layerCommonsActions);
			delete this.layerCommonsEvents;
			delete this.layerCommonsActions;
		},

		_defineLayerCommonsSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("DRAW"),
				callback: "_subDraw"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel: this.getChannel("SET_SIZE"),
				callback: "_subSetSize"
			},{
				channel: this.getChannel("SET_SCALE"),
				callback: "_subSetScale"
			},{
				channel: this.getChannel("SHOW"),
				callback: "_subShow",
				options: {
					predicate: lang.hitch(this, this._chkShow)
				}
			},{
				channel: this.getChannel("HIDE"),
				callback: "_subHide",
				options: {
					predicate: lang.hitch(this, this._chkHide)
				}
			},{
				channel: this.getChannel("GET_INFO"),
				callback: "_subGetInfo"
			},{
				channel: this.getChannel("SET_COLOR"),
				callback: "_subSetColor",
				options: {
					predicate: lang.hitch(this, this._chkSetColor)
				}
			});
		},

		_defineLayerCommonsPublications: function() {

			this.publicationsConfig.push({
				event: 'DRAWN',
				channel: this.getChannel("DRAWN")
			},{
				event: 'CLEARED',
				channel: this.getChannel("CLEARED")
			},{
				event: 'SHOWN',
				channel: this.getChannel("SHOWN")
			},{
				event: 'HIDDEN',
				channel: this.getChannel("HIDDEN")
			},{
				event: 'GOT_INFO',
				channel: this.getChannel("GOT_INFO")
			},{
				event: 'INFO_UPDATED',
				channel: this.getChannel("INFO_UPDATED")
			},{
				event: 'COLOR_SET',
				channel: this.getChannel("COLOR_SET")
			});
		},

		_setLayerCommonsOwnCallbacksForEvents: function() {

			this._onEvt('PROPS_SET', lang.hitch(this, this._onLayerCommonsPropsSet));
		},

		_subDraw: function(req) {

			var container = req.container;

			if (container) {
				this._container = container;
			}

			var dfd = this._draw(),
				pubObj = this._getIdentification(),
				cbk = lang.hitch(this, this._emitEvt, 'DRAWN', pubObj);

			if (dfd && dfd.then && !dfd.isFulfilled()) {
				dfd.then(cbk, cbk);
			} else {
				cbk();
			}
		},

		_subClear: function() {

			this._container && this._container.remove();

			var dfd = this._clear(),
				pubObj = this._getIdentification();

			if (dfd && dfd.then) {
				dfd.then(lang.hitch(this, this._emitEvt, 'CLEARED', pubObj));
			} else {
				this._emitEvt('CLEARED', pubObj);
			}
		},

		_subSetSize: function(req) {

			var width = req.width,
				height = req.height,
				widthUpdated, heightUpdated;

			if (Utilities.isValidNumber(width)) {
				widthUpdated = this._width !== width;
				this._width = width;
			}

			if (Utilities.isValidNumber(height)) {
				heightUpdated = this._height !== height;
				this._height = height;
			}

			req.updated = widthUpdated || heightUpdated;

			this._setSize(req);
		},

		_subSetScale: function(req) {

			this._setScale(req);
		},

		_chkShow: function(req) {

			return this._isContainerAvailable();
		},

		_isContainerAvailable: function() {

			return !!this._container;
		},

		_subShow: function(req) {

			var dfd = this._show(req),
				pubObj = this._getIdentification();

			lang.mixin(pubObj, req);

			if (dfd && dfd.then) {
				dfd.then(lang.hitch(this, this._emitEvt, 'SHOWN', pubObj));
			} else {
				this._emitEvt('SHOWN', pubObj);
			}
		},

		_chkHide: function(req) {

			return this._isContainerAvailable();
		},

		_subHide: function(req) {

			var dfd = this._hide(req),
				pubObj = this._getIdentification();

			lang.mixin(pubObj, req);

			if (dfd && dfd.then) {
				dfd.then(lang.hitch(this, this._emitEvt, 'HIDDEN', pubObj));
			} else {
				this._emitEvt('HIDDEN', pubObj);
			}
		},

		_subGetInfo: function(req) {

			this._emitEvt("GOT_INFO", this._getLayerInfo(req) || {});
		},

		_chkSetColor: function(req) {

			return !!req.color;
		},

		_subSetColor: function(req) {

			var color = req.color,
				colorIndex = req.colorIndex;

			if (Utilities.isValidNumber(colorIndex)) {
				if (this.color[0] instanceof Array) {
					this.color = this.color[0];
				}
				this.color[colorIndex] = color;
			} else {
				this.color = color;
			}

			this._updateColor();
			this._publishLayerColorSet(req);
		},

		_publishLayerColorSet: function(req) {

			var color = req.color,
				colorIndex = req.colorIndex,
				pubObj = {
					colorSet: {
						color: color,
						colorIndex: colorIndex
					}
				};

			lang.mixin(pubObj, this._getLayerInfo(req));

			this._emitEvt('COLOR_SET', pubObj);
		},

		_changeElementOpacity: function(element, opacity, dfd) {

			element.transition()
				.ease(this.transitionEase)
				.duration(this.transitionDuration)
				.attr("opacity", opacity)
				.on("end", lang.hitch(dfd, dfd.resolve));

			return dfd;
		},

		_onLayerCommonsPropsSet: function(evt) {

			this._emitEvt("INFO_UPDATED", this._getLayerInfo() || {});
		}
	});
});
