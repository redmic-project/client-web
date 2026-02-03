define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/component/model/ModelImpl'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, Deferred
	, ModelImpl
	, redmicConfig
) {

	return declare(null, {
		// summary:
		//   Lógica de manejo de parámetros de URL (ruta y consulta) del componente RestManager.

		// _requestParams: Object
		//   Contiene los parámetros recibidos para las URLs de consulta, indexados por channel y target.
		// _queryModelsByTarget: Object
		//   Contiene las instancias de los modelos con esquema de paŕametros de consulta, indexados por target.

		postMixInProperties: function() {

			const defaultConfig = {
				_requestParams: {},
				_queryModelsByTarget: {}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_manageRequestParams: function(req, requesterChannel) {

			const target = req.target,
				reqParams = req.params ?? {},
				sharedParams = reqParams.sharedParams;

			delete reqParams.sharedParams;

			// TODO temporal, convierte antiguo formato de query en el primer nivel al nuevo de params anidado
			if (req.query && !reqParams.query) {
				reqParams.query = req.query;
				delete req.query;
			}

			if (sharedParams) {
				const sharedChannel = this._getSharedChannel(requesterChannel),
					sharedAddedRequestParams = this._mixinRequestParams(target, reqParams, sharedChannel);

				return sharedAddedRequestParams;
			}

			const requesterAddedRequestParams = this._mixinRequestParams(target, reqParams, requesterChannel);
			return requesterAddedRequestParams;
		},

		_mixinRequestParams: function(target, reqParams, requesterChannel) {

			const prevParams = this._getRequestParams(target, requesterChannel),
				nextParams = this._merge([prevParams, reqParams]);

			this._setRequestParams(target, requesterChannel, nextParams);

			return nextParams;
		},

		_getRequestParams: function(target, requesterChannel) {

			return this._requestParams[requesterChannel]?.[target] ?? {
				path: {},
				query: {}
			};
		},

		_setRequestParams: function(target, requesterChannel, params) {

			this._requestParams[requesterChannel] = this._requestParams[requesterChannel] ?? {};

			this._requestParams[requesterChannel][target] = params;
		},

		_getSharedChannel: function(requesterChannel) {

			if (!requesterChannel) {
				return;
			}

			const splitter = this.channelSeparator,
				viewChannelLength = 3,
				sharedSuffix = '/sharedParams';

			const viewChannel = requesterChannel.split(splitter).slice(0, viewChannelLength).join(splitter);

			return `${viewChannel}${sharedSuffix}`;
		},

		_getTargetWithPathParamsReplaced: function(target, requesterChannel) {

			const requesterRequestPathParams = this._getRequestParams(target, requesterChannel).path;

			const sharedChannel = this._getSharedChannel(requesterChannel),
				sharedRequestPathParams = this._getRequestParams(target, sharedChannel).path;

			const apiUrl = this.apiUrl;

			const pathParams = this._merge([{apiUrl}, sharedRequestPathParams, requesterRequestPathParams]);

			return lang.replace(target, pathParams);
		},

		_getQueryDataWithQueryParamsReplaced: function(target, requesterChannel) {

			const requesterRequestQueryParams = this._getRequestParams(target, requesterChannel).query;

			const sharedChannel = this._getSharedChannel(requesterChannel),
				sharedRequestQueryParams = this._getRequestParams(target, sharedChannel).query;

			const mergedRequestQueryParams = this._merge([sharedRequestQueryParams, requesterRequestQueryParams]),
				queryDfd = new Deferred();

			if (!this._targetHasSchema(target)) {
				return queryDfd.resolve(mergedRequestQueryParams);
			}

			const modelInstance = this._getQueryModel(target, mergedRequestQueryParams);

			this._once(modelInstance.getChannel('SERIALIZED'), res => queryDfd.resolve(res.data));
			this._publish(modelInstance.getChannel('SERIALIZE'));

			return queryDfd;
		},

		_targetHasSchema: function(target) {

			return !!redmicConfig.schemas[target];
		},

		_getQueryModel: function(target, queryParams) {

			const modelInstance = this._queryModelsByTarget[target] ?? this._createQueryModel(target);

			this._publish(modelInstance.getChannel('DESERIALIZE'), {
				data: queryParams
			});

			return modelInstance;
		},

		_createQueryModel: function(target) {

			this.modelConfig = {
				parentChannel: this.getChannel(),
				target,
				props: {
					serializeAdditionalProperties: true
				}
			};

			return this._queryModelsByTarget[target] = new ModelImpl(this.modelConfig);
		}
	});
});
