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
		// _queryModels: Object
		//   Contiene las instancias de los modelos con esquema de paŕametros de consulta, indexados por target.

		postMixInProperties: function() {

			const defaultConfig = {
				_requestParams: {},
				_queryModels: {}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_manageRequestParams: function(req, requesterChannel) {

			const target = req.target,
				sharedParams = !!req.params?.sharedParams;

			const reqParams = {
				path: {...req.params?.path},
				query: {...req.params?.query ?? req.query /*TODO temporal, recupera antiguo formato de query*/}
			};

			if (sharedParams) {
				const sharedChannel = this._getSharedChannel(requesterChannel);
				this._mixinRequestParams(target, reqParams, sharedChannel);
			} else {
				this._mixinRequestParams(target, reqParams, requesterChannel);
			}

			this._emitRequestParamsChanged(target, requesterChannel, reqParams);
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

		_mixinRequestParams: function(target, reqParams, requesterChannel) {

			const prevParams = this._getRequestParams(target, requesterChannel),
				nextParams = this._merge([prevParams, reqParams]);

			this._setRequestParams(target, requesterChannel, nextParams);
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

		_emitRequestParamsChanged: function(target, requesterChannel, addedParams) {

			const params = this._getMergedRequestParams(target, requesterChannel);

			this._emitEvt('REQUEST_PARAMS_CHANGED', {target, addedParams, params});
		},

		_getMergedRequestParams: function(target, requesterChannel) {

			const requesterRequestParams = this._getRequestParams(target, requesterChannel),
				sharedRequestParams = this._getRequestParams(target, this._getSharedChannel(requesterChannel));

			const path = this._merge([sharedRequestParams.path, requesterRequestParams.path]),
				query = this._merge([sharedRequestParams.query, requesterRequestParams.query]);

			return {path, query};
		},

		_getTargetWithPathParamsReplaced: function(target, requesterChannel) {

			const apiUrl = this.apiUrl,
				mergedRequestPathParams = this._getMergedRequestParams(target, requesterChannel).path,
				pathParams = this._merge([{apiUrl}, mergedRequestPathParams]);

			return lang.replace(target, pathParams);
		},

		_getQueryDataFromQueryParams: function(target, requesterChannel) {

			const mergedRequestQueryParams = this._getMergedRequestParams(target, requesterChannel).query,
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

		_getQueryModel: function(target, data) {

			const modelInstance = this._queryModels[target] ?? this._createQueryModel(target);

			this._publish(modelInstance.getChannel('DESERIALIZE'), {data});

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

			this._queryModels[target] = new ModelImpl(this.modelConfig);

			return this._queryModels[target];
		}
	});
});
