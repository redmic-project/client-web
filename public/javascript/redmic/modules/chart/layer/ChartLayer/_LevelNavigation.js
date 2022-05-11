define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/chart/layer/ChartLayer/_PutButtonInHole"
], function(
	declare
	, lang
	, aspect
	, _PutButtonInHole
){
	return declare(_PutButtonInHole, {
		//	summary:
		//		Extensión para permitir navegar entre niveles de una gráfica donut multinivel. Se entra a un nivel
		//		haciendo click sobre una categoría, y se sale al nivel previo pulsando el botón colocado en el agujero.

		constructor: function(args) {

			this.config = {
				levelNavigationEvents: {
					ZOOMING: "zooming",
					ZOOMED: "zoomed"
				},
				levelNavigationActions: {
					ZOOMING: "zooming",
					ZOOMED: "zoomed"
				},

				chartHoleButtonIcon: '\uf010',

				_currentZoom: 0,
				_previousZoom: 0,
				_zooming: false,
				_colorByZoom: []
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_applyChartSourceAndSourceHelper", lang.hitch(this,
				this._applyChartSourceAndSourceHelperLevelNavigation));

			if (this.hole) {
				aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixLevelNavigationEventsAndActions));
				aspect.after(this, "_definePublications", lang.hitch(this, this._defineLevelNavigationPublications));
				aspect.after(this, "_createChartSections", lang.hitch(this, this._createChartSectionsLevelNavigation));
				aspect.before(this, "_clear", lang.hitch(this, this._clearLevelNavigation));
			}
		},

		_mixLevelNavigationEventsAndActions: function() {

			lang.mixin(this.events, this.levelNavigationEvents);
			lang.mixin(this.actions, this.levelNavigationActions);
			delete this.levelNavigationEvents;
			delete this.levelNavigationActions;
		},

		_defineLevelNavigationPublications: function() {

			this.publicationsConfig.push({
				event: 'ZOOMING',
				channel: this.getChannel("ZOOMING")
			},{
				event: 'ZOOMED',
				channel: this.getChannel("ZOOMED")
			});
		},

		_createChartSectionsLevelNavigation: function() {

			this._manageSubscriptionsToCategories(lang.hitch(this, this._subscribeToCategoriesLevelNavigation));
		},

		_subscribeToCategoriesLevelNavigation: function(categories) {

			categories.on("mouseup.levelNavigation", lang.hitch(this, this._onCategoryMouseUp));
		},

		_applyChartSourceAndSourceHelperLevelNavigation: function(dfd) {

			this._zooming = true;

			var cbk = lang.hitch(this, this._onUpdateDataDfdFulfilled);
			dfd.then(cbk, cbk);
		},

		_onUpdateDataDfdFulfilled: function() {

			this._zooming = false;
		},

		_onCategoryMouseUp: function(_e, dataWrapper) {

			var d = dataWrapper.data;

			if (this._zooming || this._checkCategoryIsHidden(d)) {
				return;
			}

			this._zoomIn(d);
		},

		_onButtonIconMouseUp: function(_e, ancestorsData) {

			if (this._zooming) {
				return;
			}

			var prevD = ancestorsData.pop();
			if (prevD && prevD.parent) {
				this._zoomOut(prevD);
			}
		},

		_zoomIn: function(d) {

			var depth = d ? d.depth : 1;

			if (depth > 1) {
				d = this._findAncestorAtFirstLevel(d);
			}

			if (d && d.children) {
				this._manageColorsOnZoomIn(d);
				this._rememberPreviousData(d);
				this._currentZoom++;
				this._zoom(d, true);
				this._updateColor();
			}
		},

		_findAncestorAtFirstLevel: function(d) {

			while (d.depth > 1) {
				d = d.parent;
			}

			return d;
		},

		_manageColorsOnZoomIn: function(d) {

			this._colorByZoom.push(lang.clone(this.color));

			var nextColorIndex = d.data[this._childrenColorIndexName],
				nextColorLimit = nextColorIndex + d.children.length,
				nextColor = this.color[d.depth].slice(nextColorIndex, nextColorLimit);

			this.color = nextColor;
		},

		_rememberPreviousData: function(d) {

			if (!this._buttonIcon) {
				return;
			}

			var ancestorsData = this._buttonIcon.datum();

			if (!ancestorsData) {
				ancestorsData = [];
				this._buttonIcon.datum(ancestorsData);
			}

			ancestorsData.push(d);
		},

		_zoomOut: function(d) {

			this._currentZoom--;
			this._zoom(d.parent, false);
			this._manageColorsOnZoomOut();
		},

		_manageColorsOnZoomOut: function() {

			this.color = this._colorByZoom.pop();

			for (var i = 0; i < this.color.length; i++) {
				this._applyChartColor(i);
			}
		},

		_zoom: function(newRoot, /*Boolean*/ zoomIn) {

			var newRootData = newRoot.data;

			this._emitEvt("ZOOMING", this._getZoomPublicationObject(newRoot, zoomIn));
			this._clearCategories();

			var onZoomDone = lang.hitch(this, this._onZoomDone, newRootData, zoomIn);
			this._addData(newRootData).then(onZoomDone, onZoomDone);
		},

		_getZoomPublicationObject: function(newRoot, /*Boolean*/ zoomIn) {

			return {
				newRoot: newRoot,
				currentLevel: this._previousZoom,
				nextLevel: this._currentZoom,
				direction: (zoomIn ? "in" : "out")
			};
		},

		_onZoomDone: function(currentRoot, zoomedIn) {

			this._previousZoom = this._currentZoom;

			!this._currentZoom && this._showChartHoleButton(false);
			this._emitEvt("ZOOMED", this._getZoomPublicationObject(currentRoot, zoomedIn));
		},

		_canButtonBeShown: function(mustShow) {

			return this._currentZoom > 0 || this._zooming;
		},

		_getAngleXStartPosition: function(clockwise) {

			var invertDirection = this._previousZoom > this._currentZoom;

			return this.inherited(arguments, [invertDirection ? !clockwise : clockwise]);
		},

		_getObjectToPublishCategoryData: function(d) {

			var originalPubObj = this.inherited(arguments),
				pubObj = {
					childrenColorIndexName: this._childrenColorIndexName
				};

			lang.mixin(pubObj, originalPubObj);
			return pubObj;
		},

		_clearLevelNavigation: function() {

			this._manageSubscriptionsToCategories(lang.hitch(this, this._unsubscribeFromCategoriesLevelNavigation));
		},

		_unsubscribeFromCategoriesLevelNavigation: function(categories) {

			categories.on("mouseup.levelNavigation", null);
		}

	});
});
