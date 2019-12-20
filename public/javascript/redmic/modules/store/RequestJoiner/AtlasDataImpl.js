define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, './RequestJoiner'
], function(
	redmicConfig
	, declare
	, lang
	, Deferred
	, RequestJoiner
) {

	return declare(RequestJoiner, {
		//	summary:
		//		Implementación de RequestJoiner para agregar la información de atlas, procedente de distintas rutas.

		constructor: function(args) {

			this.config = {
				ownChannel: 'atlasDataRequestJoiner',
				target: [redmicConfig.services.atlasLayer, redmicConfig.services.atlasCategory],
				idProperty: 'id',
				parentProperty: 'parent',
				pathProperty: 'path',
				pathSeparator: '.',
				leavesProperty: 'leaves',
				_categoryLeaves: {}
			};

			lang.mixin(this, this.config, args);
		},

		_onNewRequest: function() {

			this._categoryLeaves = {};
			delete this._categoryLeavesDfd;
		},

		_parseDataByTarget: function(data, target) {

			var targetIndex = this.target.indexOf(target),
				atlasDataDfd = new Deferred();

			this._manageDeferredActions();

			if (targetIndex === 0) {
				this._manageAtlasLayersData(atlasDataDfd, data);
			} else if (targetIndex === 1) {
				this._manageAtlasCategoriesData(atlasDataDfd, data);
			} else {
				console.error('Received data from wrong origin, target "%s" not found', target);
				atlasDataDfd.cancel();
			}

			return atlasDataDfd;
		},

		_manageDeferredActions: function() {

			if (!this._categoryLeavesDfd) {
				this._categoryLeavesDfd = new Deferred();
			}
		},

		_manageAtlasLayersData: function(dfd, data) {

			var parsedData = this._parseAtlasLayers(data);
			dfd.resolve(parsedData);

			this._categoryLeavesDfd.resolve();
		},

		_manageAtlasCategoriesData: function(dfd, data) {

			this._categoryLeavesDfd.then(lang.hitch(this, function(dfd) {

				var parsedData = this._parseAtlasCategories(data);
				dfd.resolve(parsedData);
			}, dfd));
		},

		_parseAtlasLayers: function(layers) {

			return layers && layers.map(lang.hitch(this, function(layer) {

				var category = layer[this.parentProperty],
					categoryId = category[this.idProperty],
					layerId = layer[this.idProperty];

				layer[this.pathProperty] = 'r' + this.pathSeparator + categoryId + this.pathSeparator + layerId;

				if (!this._categoryLeaves[categoryId]) {
					this._categoryLeaves[categoryId] = 1;
				} else {
					this._categoryLeaves[categoryId]++;
				}

				return layer;
			}));
		},

		_parseAtlasCategories: function(categories) {

			return categories && categories.map(lang.hitch(this, function(category) {

				var categoryId = category[this.idProperty],
					categoryLeaves = this._categoryLeaves[categoryId];

				category[this.leavesProperty] = categoryLeaves;
				category[this.pathProperty] = 'r' + this.pathSeparator + categoryId;

				return category;
			}));
		},

		_getRequestQuery: function(target, queryParams) {

			if (queryParams && queryParams.ids) {
				return {
					ids: queryParams.ids
				};
			}

			if (queryParams && queryParams.text) {
				return queryParams;
			}

			return {};
		},

		_expandQueryWithPreviousResponse: function(target, queryParams, prevRes) {

			if (target !== redmicConfig.services.atlasCategory || !prevRes) {
				return queryParams;
			}

			var ids = [];
			for (var i = 0; i < prevRes.length; i++) {
				var layer = prevRes[i],
					categoryId = layer[this.parentProperty][this.idProperty];

				ids.push(categoryId);
			}

			if (!ids.length) {
				return;
			}

			return this._merge([{
				queryParams: {
					ids: ids
				}
			}, queryParams]);
		},

		_getRequestAction: function(target, queryObj) {

			if (queryObj.queryParams && target === redmicConfig.services.atlasCategory) {
				return '_mget';
			}
		},

		_checkRequestsCanBeParallel: function(queryObj) {

			return !Object.keys(queryObj).length;
		},

		_getQueryObjForParallelRequests: function(queryObj) {

			return {};
		}
	});
});
