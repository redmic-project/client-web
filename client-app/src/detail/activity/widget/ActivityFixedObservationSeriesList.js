define([
	'app/designs/list/Controller'
	, 'app/designs/list/layout/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, 'templates/ObservationRegisterList'
], function(
	ListController
	, ListLayout
	, declare
	, lang
	, _Store
	, redmicConfig
	, TemplateList
) {

	return declare([ListController, ListLayout, _Store], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				targetWithParams: redmicConfig.services.stationObservationSeriesObservations
			};

			lang.mixin(this, this.config, args);
		},

		_afterSetConfigurations: function() {

			this.browserConfig = this._merge([{
				template: TemplateList
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.timeseriesDataChannel,
				callback: '_subObservationStationSet'
			});
		},

		_subObservationStationSet: function(data) {

			var stationId = data.id,
				stationName = data.site && data.site.name;

			var target = lang.replace(this.targetWithParams, {
				id: stationId
			});

			this._setTitle(stationName);

			this._publish(this.browser.getChannel('UPDATE_TARGET'), {
				target: target
			});

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: target,
				action: '_search',
				requesterId: this.browser.getOwnChannel()
			});
		}
	});
});
