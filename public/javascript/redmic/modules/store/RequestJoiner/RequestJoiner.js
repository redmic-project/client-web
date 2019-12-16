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

		_subRequestToTargets: function(queryObj) {

			if (!this._responsePromises) {
				this._responsePromises = {};
			} else {
				console.error('Tried to request new data before resolving a previous request');
				return;
			}

			this._onNewRequest();

			if (this._checkRequestsCanBeParallel(queryObj)) {
				this._requestToTargetsParallelly(this._getQueryObjForParallelRequests(queryObj) || queryObj);
			} else {
				this._requestToTargetsSequentially(this._getQueryObjForSequentialRequests(queryObj) || queryObj);
			}

			all(this._responsePromises).then(
				lang.hitch(this, this._onRequestsDone),
				lang.hitch(this, this._onRequestsFailed));
		},

		_requestToTargetsParallelly: function(queryObj) {

			for (var i = 0; i < this.target.length; i++) {
				var target = this.target[i],
					reqParams = this._getRequestParams(target, queryObj),
					dfd = new Deferred();

				this._responsePromises[target] = dfd;

				this._emitEvt('REQUEST', reqParams);
			}
		},

		_requestToTargetsSequentially: function(queryObj) {

			var dfds = [];

			for (var i = 0; i < this.target.length; i++) {
				var target = this.target[i],
					dfd = new Deferred();

				if (i !== this.target.length - 1) {
					dfds.push(dfd);
				}
				this._responsePromises[target] = dfd;

				if (i > 0) {
					dfds[i - 1].then(lang.hitch(this, function(target, queryObj, prevRes) {

						var expandedQueryObj = this._expandQueryWithPreviousResponse(target, queryObj, prevRes);

						if (!expandedQueryObj) {
							var dfd = this._responsePromises[target];
							dfd.reject();
							return;
						}

						var reqParams = this._getRequestParams(target, expandedQueryObj);
						this._emitEvt('REQUEST', reqParams);
					}, target, queryObj));
				} else {
					var reqParams = this._getRequestParams(target, queryObj);
					this._emitEvt('REQUEST', reqParams);
				}
			}
		},

		_getRequestParams: function(target, queryObj) {

			var queryParams;
			if (queryObj) {
				if (!queryObj.target) {
					queryParams = queryObj.queryParams;
				} else {// if (queryObj.target === target) {
					queryParams = queryObj.queryParams;
				}
			}

			return {
				target: target,
				query: this._getRequestQuery(target, queryParams),
				method: 'POST',
				action: this._getRequestAction(target, queryObj) || '_search',
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
