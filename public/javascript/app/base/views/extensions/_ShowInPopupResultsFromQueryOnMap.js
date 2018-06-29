define([
	"app/designs/primaryAndSecondaryContent/main/HierarchicalLists"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_ShowInPopup"
], function(
	HierarchicalLists
	, declare
	, lang
	, aspect
	, _ShowInPopup
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas con mapa que hacen consultas sobre el mismo y quieren mostrar
		//		el resultado de dicha consulta en un popup.
		//	description:
		//		Escucha los resultados de la consulta y los manda al popup propio para mostrarlos.


		constructor: function(args) {

			this.config = {
				showInPopupResultsFromQueryOnMapEvents: {
					HIDE_LAYERS_INFO_POPUP: "hideLayersInfoPopup",
					ADD_INFO_DATA_POPUP: "addInfoDataPopup",
					ADD_NEW_TEMPLATES_POPUP: "addNewTemplatesPopup",
					SHOW_LAYERS_INFO_POPUP: "showLayersInfoPopup"
				},
				showInPopupResultsFromQueryOnMapActions: {
					HIDE_LAYERS_INFO: "hideLayersInfo",
					ADD_INFO_DATA: "addInfoData",
					ADD_NEW_TEMPLATES: "addNewTemplates",
					SHOW_LAYERS_INFO: "showLayersInfo"
				},
				channelsToListen: []
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this,
				this._mixShowInPopupResultsFromQueryOnMapEventsAndActions));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeShowInPopupResultsFromQueryOnMap));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this,
				this._defineShowInPopupResultsFromQueryOnMapSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this,
				this._defineShowInPopupResultsFromQueryOnMapPublications));
		},

		_mixShowInPopupResultsFromQueryOnMapEventsAndActions: function() {

			lang.mixin(this.events, this.showInPopupResultsFromQueryOnMapEvents);
			lang.mixin(this.actions, this.showInPopupResultsFromQueryOnMapActions);

			delete this.showInPopupResultsFromQueryOnMapEvents;
			delete this.showInPopupResultsFromQueryOnMapActions;
		},

		_initializeShowInPopupResultsFromQueryOnMap: function() {

			this.layersInfo = new declare(HierarchicalLists).extend(_ShowInPopup)({
				parentChannel: this.getChannel(),
				typeGroupProperty: this.typeGroupProperty,
				primaryTitle: this.i18n.presentElements,
				primaryListButtons: this.primaryListButtons,
				secondaryListButtons: this.secondaryListButtons,
				width: 5,
				height: "md"
			});
		},

		_defineShowInPopupResultsFromQueryOnMapSubscriptions: function() {

			this._doSubscriptionsAtChannel(this.getChannel());

			for (var i = 0; i < this.channelsToListen.length; i++) {
				this._doSubscriptionsAtChannel(this.channelsToListen[i]);
			}
		},

		_doSubscriptionsAtChannel: function(channel) {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(channel, this.actions.HIDE_LAYERS_INFO),
				callback: "_subHideLayersInfo"
			},{
				channel : this._buildChannel(channel, this.actions.SHOW_LAYERS_INFO),
				callback: "_subShowLayersInfo"
			},{
				channel : this._buildChannel(channel, this.actions.ADD_INFO_DATA),
				callback: "_subAddInfoData"
			},{
				channel : this._buildChannel(channel, this.actions.ADD_NEW_TEMPLATES),
				callback: "_subAddNewTemplates"
			});
		},

		_defineShowInPopupResultsFromQueryOnMapPublications: function() {

			this.publicationsConfig.push({
				event: 'HIDE_LAYERS_INFO_POPUP',
				channel: this.layersInfo.getChannel("HIDE")
			},{
				event: 'HIDE_LAYERS_INFO_POPUP',
				channel: this.layersInfo.getChannel("CLEAR")
			},{
				event: 'ADD_INFO_DATA_POPUP',
				channel: this.layersInfo.getChannel("NEW_DATA")
			},{
				event: 'ADD_NEW_TEMPLATES_POPUP',
				channel: this.layersInfo.getChannel("ADD_NEW_TEMPLATES")
			},{
				event: 'SHOW_LAYERS_INFO_POPUP',
				channel: this.layersInfo.getChannel("SHOW")
			});
		},

		_subHideLayersInfo: function(response) {

			this._emitEvt('HIDE_LAYERS_INFO_POPUP');
		},

		_subShowLayersInfo: function() {

			this._emitEvt('SHOW_LAYERS_INFO_POPUP');
		},

		_subAddInfoData: function(req) {

			this._emitEvt('ADD_INFO_DATA_POPUP', req);
		},

		_subAddNewTemplates: function(req) {

			this._emitEvt('ADD_NEW_TEMPLATES_POPUP', req);
		}
	});
});
