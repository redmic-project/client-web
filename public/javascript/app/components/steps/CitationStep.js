define([
	"app/designs/mapWithSideContent/main/Geographic"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SpeciesDistributionPopup"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/layer/_Selectable"
	, "redmic/modules/map/layer/_SelectOnClick"
], function (
	Geographic
	, redmicConfig
	, declare
	, lang
	, TemplatePopup
	, _Store
	, _Select
	, GeoJsonLayerImpl
	, _Selectable
	, _SelectOnClick
){
	return declare([Geographic, _Store], {
		//	summary:
		//		Step de

		constructor: function (args) {

			this.config = {
				_results: [],
				_totalSelected: 0,
				idProperty: "uuid",
				notTextSearch: true,
				templatePopup: TemplatePopup,
				target: redmicConfig.services.citationAll,
				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: "fa-map-marker",
							title: "map centering",
							btnId: "mapCentering",
							returnItem: true
						}]
					}
				}
			}, this.browserConfig || {}]);

			this.geoJsonLayerConfig = this._merge([{
				parentChannel: this.getChannel(),
				selectorChannel: this.getChannel(),
				target: this._getTarget(),
				idProperty: this.idProperty,
				onEachFeature: lang.hitch(this, this.onEachFeature)
			}, this.geoJsonLayerConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					accessibilityIds: null,
					from: null,
					size: null
				}
			}, this.filterConfig || {}]);
		},

		_initialize: function() {

			this.geoJsonLayerConfig.associatedIds = [this.browser.getOwnChannel()];
			this.geoJsonLayerConfig.mapChannel = this.map.getChannel();

			var geoJsonLayerDefinition = declare([GeoJsonLayerImpl, _Selectable, _SelectOnClick]);
			this.geoJsonLayer = new geoJsonLayerDefinition(this.geoJsonLayerConfig);

			this._mapCenteringGatewayAddChannels();
		},

		_mapCenteringGatewayAddChannels: function(layer) {

			this._publish(this.mapCenteringGateway.getChannel("ADD_CHANNELS_DEFINITION"), {
				channelsDefinition: [{
					input: this.browser.getChannel("BUTTON_EVENT"),
					output: this.geoJsonLayer.getChannel("SET_CENTER"),
					subMethod: "setCenter"
				},{
					input: this.browser.getChannel("BUTTON_EVENT"),
					output: this.geoJsonLayer.getChannel("ANIMATE_MARKER"),
					subMethod: "animateMarker"
				}]
			});
		},

		_beforeShowMapWithSideContent: function() {

			this._publish(this.map.getChannel("SET_CENTER_AND_ZOOM"), {
				center: [28.5, -16.0],
				zoom: 7
			});

			this._updateCompletedStatus();
		},

		_definePublications: function () {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.geoJsonLayer.getChannel("UPDATE_TARGET")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('ADD_LAYER', {layer: this.geoJsonLayer});
		},

		_onNewResults: function(response) {

			if (this._wizardResults && this._wizardResults[0]) {
				if ((!this.oldResultDependency) || (this.oldResultDependency.taxon !== this._wizardResults[0].taxon) ||
					(JSON.stringify(this.oldResultDependency.documents) !==
					JSON.stringify(this._wizardResults[0].documents))) {

					this._reset();
					this._updateDataStep();
				}
			}

			if (this._wizardResults && this._wizardResults[0]) {
				this.oldResultDependency = lang.clone(this._wizardResults[0]);
			}
		},

		_updateDataStep: function() {

			if (this._wizardResults[0] && this._wizardResults[0].documents.length > 0 &&
				this._wizardResults[0].taxon) {

				this._emitEvt('ADD_TO_QUERY', {
					query: {
						terms: {
							documents: this._wizardResults[0].documents,
							taxon: this._wizardResults[0].taxon
						}
					}
				});
			}
		},

		_dataAvailable: function(response) {

			var data = response.data;

			// Injecta las citas a browser y mapa
			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this._getTarget(),
				total: response.total,
				requesterId: this.browser.getOwnChannel()
			});

			if (this._wizardResults[0].deleteDocument) {
				delete this._wizardResults[0].deleteDocument;
				this._processSelected(data);
			}
		},

		_localSelected: function(item) {

			var ids = item.ids instanceof Array ? item.ids : [item.ids],
				changeResults = false;

			for (var i = 0; i < ids.length; i++) {
				var id = ids[i];

				if (this._results.indexOf(id) < 0) {
					changeResults = true;
					this._results.push(id);
					this._totalSelected ++;
				}
			}

			changeResults && this._emitChangeResults();

			this._updateCompletedStatus();
		},

		_localDeselected: function(item) {

			var ids = item.ids instanceof Array ? item.ids : [item.ids],
				changeResults = false;

			for (var i = 0; i < ids.length; i++) {
				var id = ids[i],
					posArrayItem = this._results.indexOf(id);

				if (posArrayItem > -1) {
					changeResults = true;
					this._results.splice(posArrayItem, 1);
					this._totalSelected --;
				}
			}

			changeResults && this._emitChangeResults();

			this._updateCompletedStatus();
		},

		_updateCompletedStatus: function() {

			this._isCompleted = !!this._totalSelected;
			this._emitEvt('REFRESH_STATUS');
		},

		_emitChangeResults: function() {

			if (this.propertyName) {
				var obj = {};
				obj[this.propertyName] = this._results;

				this._emitEvt('SET_PROPERTY_VALUE', obj);

				this._publish(this._buildChannel(this.modelChannel, this.actions.IS_VALID));
			}
		},

		_clearStep: function() {

			this.oldResultDependency = null;
			this._emitEvt('CLEAR_SELECTION');

			this._results = [];
			this._totalSelected = this.config._totalSelected;
		},

		_resetStep: function() {

			this.oldResultDependency = null;
			this._emitEvt('CLEAR_SELECTION');

			this._results = [];
			this._totalSelected = this.config._totalSelected;

			this._instanceDataToResult(this._defaultData);
		},

		_instanceDataToResult: function(data) {

			this._defaultData = data;
			this._selectedCitation = data.citations;

			this._selectCitation();
		},

		onEachFeature: function(feature, layer) {

			layer.bindPopup(this.templatePopup({
				feature: feature,
				i18n: this.i18n
			}));
		},

		_processSelected: function(/*Object[]*/ data) {

			this._createAuxiliaryStructure(data);

			var lastPosition = this._selectedCitation.length - 1,
				deselected = [],
				idProperty;

			for (var i = lastPosition; i >= 0; i--) {
				idProperty = this._selectedCitation[i];

				if (!this._auxData[idProperty]) {
					deselected.push(idProperty);
					this._selectedCitation.splice(i, 1);
				}
			}

			this._publish(this.getChannel("DESELECTED"), {
				"success": true,
				"body": {
					"ids": deselected,
					"selectionTarget": this._getTarget(),
					"total": 1
				}
			});
		},

		_createAuxiliaryStructure: function(/*Object[]*/ data) {

			if (this._auxData) {
				delete this._auxData;
			}

			this._auxData = {};

			var features = data.features;

			for (var i = 0; i < features.length; i++) {
				this._auxData[features[i][this.idProperty]] = true;
			}
		},

		_selectCitation: function(/*Object[]*/ data) {

			this._selectedCitation && this._publish(this.getChannel("SELECTED"), {
				"success": true,
				"body": {
					"ids": this._selectedCitation,
					"selectionTarget": this._getTarget(),
					"total": 1
				}
			});
		}
	});
});
