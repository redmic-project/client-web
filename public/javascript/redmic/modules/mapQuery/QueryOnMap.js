define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, './_ContentManagement'
	, './_ResultsBrowser'
], function(
	declare
	, lang
	, _Module
	, _ContentManagement
	, _ResultsBrowser
) {

	return declare([_Module, _ContentManagement, _ResultsBrowser], {
		//	summary:
		//		Módulo para gestionar las consultas sobre el mapa.
		//	description:
		//		Escucha las publicaciones de pulsación sobre el mapa, lanza peticiones de información sobre ese punto
		//		para las capas presentes y recibe los resultados.

		constructor: function(args) {

			this.config = {
				ownChannel: 'queryOnMap',
				events: {
					HIDE_LAYERS_INFO: 'hideLayersInfo',
					ADD_INFO_DATA: 'addInfoData',
					ADD_NEW_TEMPLATES: 'addNewTemplates',
					SHOW_LAYERS_INFO: 'showLayersInfo',
					SET_MAP_QUERYABLE_CURSOR: 'setMapQueryableCursor'
				},
				actions: {
					HIDE_LAYERS_INFO: 'hideLayersInfo',
					ADD_INFO_DATA: 'addInfoData',
					ADD_NEW_TEMPLATES: 'addNewTemplates',
					SHOW_LAYERS_INFO: 'showLayersInfo'
				},

				getMapChannel: null,

				_queryableLayersLoaded: 0,
				_layersWaiting: 0
			};

			lang.mixin(this, this.config, args);

			if (!this.getMapChannel) {
				console.error('Map channel not defined for QueryOnMap "%s"', this.getChannel());
			}
		},

		_defineSubscriptions: function() {

			var options = {
				predicate: lang.hitch(this, this._chkLayerIsQueryable)
			};

			this.subscriptionsConfig.push({
				channel : this.getMapChannel('MAP_CLICKED'),
				callback: '_subMapClickedQueryOnMap'
			},{
				channel: this.getMapChannel('LAYER_ADDED_CONFIRMED'),
				callback: '_subLayerAddedQueryOnMap',
				options: options
			},{
				channel: this.getMapChannel('LAYER_REMOVED_CONFIRMED'),
				callback: '_subLayerRemovedQueryOnMap',
				options: options
			},{
				channel: this.getMapChannel('LAYER_QUERYING'),
				callback: '_subLayerQueryingQueryOnMap'
			},{
				channel: this.getMapChannel('LAYER_INFO'),
				callback: '_subLayerInfoQueryOnMap'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'HIDE_LAYERS_INFO',
				channel: this.getChannel('HIDE_LAYERS_INFO')
			},{
				event: 'ADD_INFO_DATA',
				channel: this.getChannel('ADD_INFO_DATA')
			},{
				event: 'ADD_NEW_TEMPLATES',
				channel: this.getChannel('ADD_NEW_TEMPLATES')
			},{
				event: 'SHOW_LAYERS_INFO',
				channel: this.getChannel('SHOW_LAYERS_INFO')
			},{
				event: 'SET_MAP_QUERYABLE_CURSOR',
				channel: this.getMapChannel('SET_QUERYABLE_CURSOR')
			});
		},

		_setOwnCallbacksForEvents: function() {

			this.on([
				this.events.HIDE,
				this.events.ANCESTOR_HIDE
			], lang.hitch(this, this.emit, this.events.HIDE_LAYERS_INFO));
		},

		_chkLayerIsQueryable: function(res) {

			return !!res.queryable;
		},

		_subMapClickedQueryOnMap: function(response) {

			this._emitEvt('HIDE_LAYERS_INFO');

			if (this._queryableLayersLoaded) {
				this._emitEvt('LOADING', {
					global: true
				});
			}
		},

		_subLayerAddedQueryOnMap: function(res) {

			this._queryableLayersLoaded++;

			this._emitEvt('SET_MAP_QUERYABLE_CURSOR', { enable: true });

			this._emitEvt('ADD_NEW_TEMPLATES', this._getLayerTemplatesDefinition(res.layerId));
		},

		_subLayerRemovedQueryOnMap: function(res) {

			this._queryableLayersLoaded--;

			if (!this._queryableLayersLoaded) {
				this._emitEvt('SET_MAP_QUERYABLE_CURSOR', { enable: false });
			}
		},

		_subLayerQueryingQueryOnMap: function(res) {

			this._layersWaiting++;

			clearTimeout(this._showInfoTimeoutHandler);
		},

		_subLayerInfoQueryOnMap: function(res) {

			this._layersWaiting--;

			this._processLayerInfo(res);

			if (!this._layersWaiting) {
				this._showInfoTimeoutHandler = setTimeout(lang.hitch(this, this._showWhenNoLayersWaiting), 0);
			}
		},

		_showWhenNoLayersWaiting: function() {

			this._emitEvt('LOADED');

			if (this._hadValidInfo) {
				this._emitEvt('SHOW_LAYERS_INFO');
			} else {
				this._emitEvt('COMMUNICATION', {
					description: this.i18n.noLayerInfo
				});
			}

			this._hadValidInfo = false;
		}
	});
});
