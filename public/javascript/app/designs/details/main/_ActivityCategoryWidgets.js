define([
	'app/designs/details/main/ActivityTrackingMap'
	, 'app/details/views/ActivityAreaMapBase'
	, 'app/details/views/ActivityCitationMapBase'
	, 'app/details/views/ActivityInfrastructureMapBase'
	, 'app/details/views/ActivityLayerMapBase'
	, 'dojo/_base/declare'
], function(
	ActivityTrackingMap
	, ActivityAreaMapBase
	, ActivityCitationMapBase
	, ActivityInfrastructureMapBase
	, ActivityLayerMapBase
	, declare
) {

	return declare(null, {
		//	summary:
		//		Adiciones a vista detalle de Activity, para mostrar datos según su categoría.

		_prepareActivityCategoryCustomWidgets: function() {

			if (!this._activityCategoryCustomWidgets) {
				this._activityCategoryCustomWidgets = [];
			}

			var activityCategory = this._activityData.activityCategory,
				widgetKey;

			if (activityCategory === 'ci') {
				widgetKey = this._prepareCitationActivityWidgets();
			} else if (activityCategory === 'ml') {
				widgetKey = this._prepareMapLayerActivityWidgets();
			} else if (['tr', 'at', 'pt'].indexOf(activityCategory) !== -1) {
				widgetKey = this._prepareTrackingActivityWidgets();
			} else if (activityCategory === 'if') {
				widgetKey = this._prepareInfrastructureActivityWidgets();
			} else if (activityCategory === 'ar') {
				widgetKey = this._prepareAreaActivityWidgets();
			}

			widgetKey && this._activityCategoryCustomWidgets.push(widgetKey);
		},

		_prepareCitationActivityWidgets: function() {

			var key = 'activityCitation';

			var config = {
				width: 6,
				height: 6,
				type: ActivityCitationMapBase,
				props: {
					title: this.i18n.citations,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareMapLayerActivityWidgets: function() {

			var key = 'activityMapLayer';

			var config = {
				width: 6,
				height: 6,
				type: ActivityLayerMapBase,
				props: {
					title: this.i18n.layers,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareTrackingActivityWidgets: function() {

			var key = 'activityTracking';

			var config = {
				width: 6,
				height: 6,
				type: ActivityTrackingMap,
				props: {
					title: this.i18n.tracking,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareInfrastructureActivityWidgets: function() {

			var key = 'activityInfrastructure';

			var config = {
				width: 6,
				height: 6,
				type: ActivityInfrastructureMapBase,
				props: {
					title: this.i18n.infrastructures,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_prepareAreaActivityWidgets: function() {

			var key = 'activityArea';

			var config = {
				width: 6,
				height: 6,
				type: ActivityAreaMapBase,
				props: {
					title: this.i18n.area,
					pathVariableId: this._activityData.id
				}
			};

			this._addWidget(key, config);

			return key;
		},

		_removeActivityCategoryCustomWidgets: function() {

			while (this._activityCategoryCustomWidgets.length) {
				var key = this._activityCategoryCustomWidgets.pop();
				this._destroyWidget(key);
			}
		}
	});
});
