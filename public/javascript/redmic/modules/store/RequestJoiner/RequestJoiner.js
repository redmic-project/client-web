define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Store'
	, './_RequestJoinerItfc'
], function(
	declare
	, lang
	, Deferred
	, all
	, _Module
	, _Store
	, _RequestJoinerItfc
) {

	return declare([_Module, _Store, _RequestJoinerItfc], {
		//	summary:
		//		Solicita y recibe datos de diferente procedencia, permitiendo procesar los datos recibidos (mediante
		//		implementaciones) antes de devolverlos.

		constructor: function(args) {

			this.config = {
				ownChannel: 'requestJoiner',
				actions: {
					REQUEST_TO_TARGETS: 'requestToTargets'
				},

				target: [],
				outputTarget: null
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('REQUEST_TO_TARGETS'),
				callback: "_subRequestToTargets"
			});
		},

		_subRequestToTargets: function() {

			if (!this._responsePromises) {
				this._responsePromises = {};
			} else {
				console.error('Tried to request new data before resolving a previous request');
				return;
			}

			this._onNewRequest();

			for (var i = 0; i < this.target.length; i++) {
				var target = this.target[i],
					reqParams = this._getRequestParams(target),
					dfd = new Deferred();

				this._responsePromises[target] = dfd;

				this._emitEvt('REQUEST', reqParams);
			}

			all(this._responsePromises).then(
				lang.hitch(this, this._onRequestsDone),
				lang.hitch(this, this._onRequestsFailed));
		},

		_getRequestParams: function(target) {

			return {
				target: target,
				method: 'POST',
				action: '_search',
				requesterId: this.getOwnChannel()
			};
		},

		_dataAvailable: function(res, resWrapper) {

			if (!this._responsePromises) {
				return;
			}

			var target = resWrapper.target,
				data = res.data.data,
				parsedDataDfd = this._parseDataByTarget(data, target);

			parsedDataDfd.then(lang.hitch(this, function(target, parsedData) {

				var dfd = this._responsePromises[target];
				if (dfd) {
					dfd.resolve(parsedData);
				} else {
					console.error('Received unexpected data from "%s"', target);
				}
			}, target));
		},

		_onRequestsDone: function(parsedRequestResponses) {

			delete this._responsePromises;

			var joinedData = this._joinRequestedData(parsedRequestResponses);

			this._emitEvt('INJECT_DATA', {
				data: joinedData,
				target: this.outputTarget
			});
		},

		_joinRequestedData: function(parsedRequestResponses) {

			var joinedData = [];

			for (var target in parsedRequestResponses) {
				var dataByTarget = parsedRequestResponses[target];
				joinedData = joinedData.concat(dataByTarget);
			}

			return joinedData;
		},

		_onRequestsFailed: function() {

			delete this._responsePromises;
		}
	});
});
