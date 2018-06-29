define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function(
	declare
	, lang
	, put
){
	return declare(null, {
		//	summary:
		//		Extensión para manipular las capas de tipo overlay.
		//	description:
		//		Gestiona la adición, eliminación y ordenación de dichas capas.

		constructor: function(args) {

			this.config = {
				_overlayLayerIdentifiableParams: ['service', 'layers', 'srs', 'format', 'styles', 'version'],
				_overlayLayersZIndexById: {}
			};

			lang.mixin(this, this.config, args);
		},

		_onOverlayLayerAddedToPane: function(node) {

			var src = node.src,
				overlayId = this._getOverlayLayerId(src),
				zIndex = this._overlayLayersZIndexById[overlayId];

			this._setNodeZIndex(node, zIndex);
		},

		_getOverlayLayerId: function(uri) {

			var uriParser = put('a');

			uriParser.href = uri;

			var searchParams = this._getOverlayIdentifiableSearchParams(uriParser.search),
				overlayId = uriParser.pathname + searchParams;

			put('!', uriParser);

			return overlayId;
		},

		_getOverlayIdentifiableSearchParams: function(searchParams) {

			var cleanSearchParams = searchParams.slice(1),
				splittedSearchParams = cleanSearchParams.split('&'),
				params = [];

			for (var i = 0; i < splittedSearchParams.length; i++) {
				var searchParam = splittedSearchParams[i];
				if (this._isIdentifiableSearchParam(searchParam)) {
					params.push(searchParam);
				}
			}

			return '?' + params.join('&');
		},

		_isIdentifiableSearchParam: function(searchParam) {

			var splittedSearchParam = searchParam.split('='),
				paramName = splittedSearchParam[0];

			return this._overlayLayerIdentifiableParams.indexOf(paramName) !== -1;
		},

		_setOverlayLayerZIndex: function(layerInstance, zIndex) {

			var currentUrl = layerInstance._currentUrl,
				currentOverlay = layerInstance._currentOverlay,
				overlayId = this._getOverlayLayerId(currentUrl);

			this._overlayLayersZIndexById[overlayId] = zIndex;

			currentOverlay && this._setNodeZIndex(currentOverlay._image, zIndex);
		},

		_setNodeZIndex: function(node, value) {

			if (node && value) {
				node.style.zIndex = value;
			}
		}
	});
});
