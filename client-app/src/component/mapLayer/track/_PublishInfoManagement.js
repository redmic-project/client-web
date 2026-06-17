define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		// summary:
		//   Lógica de petición de información para la capa de tracking.

		_requestLayerInfo: function(res) {

			const clickedPoint = res.layerPoint;

			if (!clickedPoint || !this._svg || !this._checkPointIsInsideLayer(clickedPoint)) {
				this._emitLayerInfo();
				return;
			}

			this._getAllClickedPointsIdsGotDfd().then(clickedPoints =>
				this._onGotTrackingLinesClickedPointsIds(clickedPoints));

			this._emitEvt('GET_CLICKED_POINTS_IDS', {
				clickedPoint
			});
		},

		_checkPointIsInsideLayer: function(point) {

			// TODO si hay más transformaciones, puede que no haya que coger el primer item, sino buscar su índice
			const svgTranslateTransform = this._svg.node().transform.baseVal[0]?.matrix;
			if (!svgTranslateTransform) {
				return false;
			}

			const topLeftX = svgTranslateTransform.e,
				topLeftY = svgTranslateTransform.f;

			const width = Number.parseFloat(this._svg.attr('width')),
				height = Number.parseFloat(this._svg.attr('height')),
				bottomRightX = topLeftX + width,
				bottomRightY = topLeftY + height;

			const x = point.x,
				y = point.y;

			return x > topLeftX && x < bottomRightX && y > topLeftY && y < bottomRightY;
		},

		_onGotTrackingLinesClickedPointsIds: function(resolvedPointsIds) {

			const idsToRequest = [];

			for (let key in resolvedPointsIds) {
				const linePointsIds = resolvedPointsIds[key];
				linePointsIds.forEach(linePointId => idsToRequest.push(linePointId));
			}

			if (!idsToRequest.length) {
				this._emitLayerInfo();
				return;
			}

			const target = this.infoTarget ?? this.target;
			// TODO temporal, hasta que se unifiquen servicios
			if (target.includes('/v1/')) {
				this._requestPrivateItems(idsToRequest, target);
			} else {
				this._requestItems(idsToRequest, target);
			}
		},

		_requestItems: function(ids, target) {

			const path = this.infoTargetPathParams ?? {};

			const query = {
				ids
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target,
				action: '_mget',
				params: {path, query},
				requesterId: this.getOwnChannel()
			});
		},

		_requestPrivateItems: function(ids, target) {

			const path = {
				activityid: this.infoTargetPathParams.id,
				id: ids[0]
			};

			this._emitEvt('REQUEST', {
				method: 'GET',
				target,
				params: {path},
				requesterId: this.getOwnChannel()
			});
		},

		_processLayerInfo: function(data) {

			this._emitLayerInfo(data);
		},

		_emitLayerInfo: function(info) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info
			});
		}
	});
});
