define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Extensión de MapLayer para que sea capaz de resaltar el marcador.
		//	description:
		//		Permite publicar y escuchar.

		constructor: function(args) {

			this.config = {
				highlightableEvents: {
					HIGHLIGHTED_MARKER: "highlightedMarker",
					DELETE_HIGHLIGHTED_MARKER: "deleteHighlightedMarker"
				},
				highlightableActions: {
					DELETE_HIGHLIGHTED_MARKER: "deleteHighlightedMarker",
					HIGHLIGHTED_MARKER: "highlightedMarker",
					DELETE_HIGHLIGHT_MARKER: "deleteHighlightMarker",
					HIGHLIGHT_MARKER: "highlightMarker"
				},
				_highlighted: {},
				zIndexTop: 1000,
				zIndexBottom: 0
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setHighlightableOwnCallbacksForEvents));

			aspect.before(this, "_mixEventsAndActions",
				lang.hitch(this, this._mixHighlightableEventsAndActions));

			aspect.after(this, "_defineSubscriptions",
				lang.hitch(this, this._defineHighlightableSubscriptions));

			aspect.after(this, "_definePublications",
				lang.hitch(this, this._defineHighlightablePublications));
		},

		_setHighlightableOwnCallbacksForEvents: function() {

			this._onEvt('CLICK', lang.hitch(this, this._highlightableMarkerOnClick));
		},

		_mixHighlightableEventsAndActions: function() {

			lang.mixin(this.events, this.highlightableEvents);
			lang.mixin(this.actions, this.highlightableActions);

			delete this.highlightableEvents;
			delete this.highlightableActions;
		},

		_defineHighlightableSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("HIGHLIGHT_MARKER"),
				callback: "_subHighlightMarker"
			},{
				channel : this.getChannel("DELETE_HIGHLIGHT_MARKER"),
				callback: "_subDeleteHighlightMarker"
			});
		},

		_defineHighlightablePublications: function() {

			this.publicationsConfig.push({
				event: 'HIGHLIGHTED_MARKER',
				channel: this.getChannel("HIGHLIGHTED_MARKER")
			},{
				event: 'DELETE_HIGHLIGHTED_MARKER',
				channel: this.getChannel("DELETE_HIGHLIGHTED_MARKER")
			});
		},

		_subHighlightMarker: function(res) {

			var marker = this._getMarker(res.id);

			if (!this._highlighted[res.id]) {
				this._addHighlightMarker(marker, res.id);
			}
		},

		_subDeleteHighlightMarker: function(res) {

			var marker = this._getMarker(res.id);

			if (this._highlighted[res.id]) {
				this._deleteHighlightMarker(marker, res.id);
			}
		},

		_highlightableMarkerOnClick: function(evt) {

			var marker = evt.layer,
				feature = marker.feature || evt.data.feature,
				id = feature[this.idProperty];

			if (!this._highlighted[id]) {
				this._addHighlightMarker(marker, id);
			} else {
				this._deleteHighlightMarker(marker, id);
			}
		},

		_getHighlightIcon: function() {

			return this._getAwesomeIcon({
				icon: 'star',
				markerColor: 'red',
				prefix: 'fa',
				spin: true
			});
		},

		_addHighlightMarker: function(marker, id) {

			this._highlighted[id] = true;

			this._setMarkerIcon(marker, this._getHighlightIcon());
			marker.setZIndexOffset(this.zIndexTop);
		},

		_deleteHighlightMarker: function(marker, id) {

			delete this._highlighted[id];

			var icon = this._getDefaultIcon(marker);

			if (this._selection && this._selection[id]) {
				icon = this._getSelectedIcon();
			}

			this._setMarkerIcon(marker, icon);
			marker.setZIndexOffset(this.zIndexBottom);

			var popup = marker.getPopup();

			// TODO se hace por que setIcon produce el fallo añadiendo un offset diferente al popup
			if (popup) {
				popup.options.offset = L.point(0, 7);
			}

			if (popup && popup.isOpen()) {
				marker.closePopup();
			}
		},

		_setMarkerIcon: function(marker, icon) {

			marker.setIcon(icon);
		}
	});
});
