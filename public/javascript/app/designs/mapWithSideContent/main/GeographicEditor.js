define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "app/base/views/extensions/_EditionView"
	, "app/base/views/extensions/_LocalSelectionView"
	, "app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContentAndTopbar"
	, "dijit/layout/LayoutContainer"
	, "dijit/layout/ContentPane"
	, "dijit/layout/StackContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/_ListenModelHasChanged"
	, "redmic/modules/form/_PublicateChanges"
	, "redmic/modules/form/_CreateKeypad"
	, "redmic/modules/gateway/MapCenteringGatewayImpl"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Order"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/dataDisplayer/DataDisplayer"
	, 'redmic/modules/layout/TabsDisplayer'
	, "redmic/modules/atlas/Atlas"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/layer/_Editable"
	, "redmic/modules/map/layer/_RadiusOnSelect"
	, "redmic/modules/map/layer/_Selectable"
	, "redmic/modules/map/layer/_SelectOnClick"
	, "redmic/modules/mapQuery/QueryOnMap"
	, "redmic/modules/search/TextImpl"
	, "redmic/view/effects/Animation"
	, "templates/CitationPopup"
	, "templates/TaxonList"
], function(
	_CompositeInTooltipFromIconKeypad
	, _EditionView
	, _LocalSelectionView
	, _Main
	, Controller
	, Layout
	, LayoutContainer
	, ContentPane
	, StackContainer
	, declare
	, lang
	, aspect
	, Utilities
	, _Filter
	, FormContainerImpl
	, _ListenModelHasChanged
	, _PublicateChanges
	, _CreateKeypad
	, MapCenteringGatewayImpl
	, _ButtonsInRow
	, _Framework
	, _Select
	, _GeoJsonParser
	, ListImpl
	, Order
	, Total
	, DataDisplayer
	, TabsDisplayer
	, Atlas
	, _ShowInPopup
	, GeoJsonLayerImpl
	, _Editable
	, _RadiusOnSelect
	, _Selectable
	, _SelectOnClick
	, QueryOnMap
	, TextImpl
	, Animation
	, TemplatePopup
	, TemplateList
){
	return declare([Layout, Controller, _Main, _Filter, _CompositeInTooltipFromIconKeypad, _EditionView, _LocalSelectionView], {
		//	summary:
		//		Vista base para todas las vistas de edición geográfica.
		//	description:
		//		Permite editar datos geográficos.

		constructor: function (args) {

			this.config = {
				events: {
					SET_FORM_PROPERTY: "setFormProperty",
					UPDATE_TARGET: "updateTarget",
					CLEAR: "clear"
				},

				actions: {
					CLEAR: "clear"
				}
			};

			aspect.after(this, "_beforeShow", lang.hitch(this, this._beforeShowMain));

			lang.mixin(this, this.config, args);

			// TODO puede que este tenga que importar 'app/components/viewCustomization/addGeomSite/views/Point', que
			// lleva elementos copiados de este pero esta pensado para una funcionalidad más específica
		},

		_setMainConfigurations: function() {

			this.searchConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				highlightField: ['properties.collect.taxon.scientificName', "properties.collect.taxon.scientificName.suggest"],
				suggestFields: ["properties.collect.taxon.scientificName"],
				searchFields: ["properties.collect.taxon.scientificName", "properties.collect.taxon.scientificName.suggest"],
				itemLabel: null
			}, this.searchConfig || {}]);

			this.formConfig = this._merge([{
				target: this.target,
				idProperty: this.idProperty,
				i18n: this.i18n,
				title: this.i18n.modelTitle,
				parentChannel: this.getChannel(),
				propertiesToListen: ["geometry/coordinates", "properties/radius"],
				width: "9"
			}, this.formConfig || {}]);

			this.browserConfig = this._merge([{
				idProperty: this.idProperty,
				parentChannel: this.getChannel(),
				target: this.target,
				template: TemplateList,
				simpleSelection: true,
				bars: [{
					instance: Total
				},{
					instance: Order,
					config: 'orderConfig'
				}]
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.geoJsonLayerConfig = this._merge([{
				idProperty: this.idProperty,
				parentChannel: this.getChannel(),
				simpleSelection: true,
				target: this.target,
				onEachFeature: lang.hitch(this, this.onEachFeature)
			}, this.geoJsonLayerConfig || {}]);
		},

		_initializeMain: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new declare([TextImpl])(this.searchConfig);

			var FormDefinition = declare([FormContainerImpl, _ListenModelHasChanged, _CreateKeypad])
				.extend(_PublicateChanges);

			this.editor = new FormDefinition(this.formConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			this.browser = new declare([ListImpl, _Framework, _ButtonsInRow, _Select,
				_GeoJsonParser])(this.browserConfig);

			this.geoJsonLayerConfig.associatedIds = [this.browser.getOwnChannel()];
			this.geoJsonLayerConfig.mapChannel = this.map.getChannel();

			var geoJsonLayerDefinition = declare([GeoJsonLayerImpl, _Editable, _Selectable, _SelectOnClick,
				_RadiusOnSelect]);

			this.geoJsonLayer = new geoJsonLayerDefinition(this.geoJsonLayerConfig);

			this.dataDisplayer = new DataDisplayer({
				parentChannel: this.getChannel()
			});

			this.mapCenteringGateway = new MapCenteringGatewayImpl({
				parentChannel: this.getChannel(),
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

		_setMainOwnCallbacksForEvents: function () {

			this._onEvt('HIDE', lang.hitch(this, this._onHide));
		},

		_defineMainSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.editor.getChannel("SHOW"),
				callback: "_subShownForm"
			},{
				channel : this.editor.getChannel("HIDDEN"),
				callback: "_subFormHidden"
			},{
				channel : this.editor.getChannel("VALUE_CHANGED"),
				callback: "_subFormChanged"
			},{
				channel : this.geoJsonLayer.getChannel("DRAGGED"),
				callback: "_subDrawnOrDragged"
			},{
				channel : this.geoJsonLayer.getChannel("DRAWN"),
				callback: "_subDrawnOrDragged"
			},{
				channel : this.editor.getChannel("RESETTED"),
				callback: "_subEditorResetted"
			},{
				channel : this.editor.getChannel("CLEARED"),
				callback: "_subEditorCleared"
			},{
				channel : this.browser.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			});
		},

		_defineMainPublications: function () {

			this.publicationsConfig.push({
				event: 'SET_FORM_PROPERTY',
				channel: this.editor.getChannel("SET_PROPERTY_VALUE")
			},{
				event: 'UPDATE_TARGET',
				channel: this.browser.getChannel("UPDATE_TARGET")
			},{
				event: 'UPDATE_TARGET',
				channel: this.geoJsonLayer.getChannel("UPDATE_TARGET")
			},{
				event: 'UPDATE_TARGET',
				channel: this.textSearch.getChannel("UPDATE_TARGET")
			},{
				event: 'CLEAR',
				channel: this.textSearch.getChannel("RESET")
			});
		},

		postCreate: function() {

			this._createBrowserAndEditorContainers();

			this._createTextSearchNode();

			this.inherited(arguments);

			this._createBrowserNode();

			this._createEditorNode();

			this._emitEvt('ADD_LAYER', {layer: this.geoJsonLayer});

			this._createTabContainers();
			this._createAtlas();

			this._emitEvt('REFRESH');
		},

		_createBrowserAndEditorContainers: function() {

			this.browserAndEditorNode = new declare([StackContainer, Animation])({
				'class': "marginedContainer noScrolledContainer",
				title: this.i18n.list,
				region:"center"
			});

			this.browserAndSearchContainer = new LayoutContainer({
				'class': "noScrolledContainer"
			});

			this.browserAndEditorNode.addChild(this.browserAndSearchContainer);
		},

		_createTabContainers: function() {

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

			// TODO acceso a lo bruto, hasta que se simplifique la estructura de contenedores
			this.tabs = this._tabsDisplayer._container;

			this.tabs.addChild(this.browserAndEditorNode);

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});
		},

		_createTextSearchNode: function() {

			this.textSearchNode = new ContentPane({
				'class': "topZone topZoneCitation",
				region: "top"
			});

			this._publish(this.textSearch.getChannel("SHOW"), {
				node: this.textSearchNode.domNode
			});

			this.buttonsNode = this.textSearchNode;

			this.browserAndSearchContainer.addChild(this.textSearchNode);
		},

		_createBrowserNode: function() {

			this.gridNode = new ContentPane({
				'class': 'stretchZone',
				region: "center"
			});

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.gridNode.domNode
			});

			this.browserAndSearchContainer.addChild(this.gridNode);
		},

		_createEditorNode: function() {

			this.editorNode = new ContentPane({
				'class': "scrollWrapper"
			});

			this._once(this.editor.getChannel('SHOWN'), lang.hitch(this, function() {
				var self = this;
				this._publish(this.editor.getChannel("SET_METHOD"), {
					"onGetMapLocation": function(obj) {
						self[self._isValidGeometry(obj.point) ? "_onMovePoint" : "_onAddPoint"](obj);
					}
				});
			}));

			this.browserAndEditorNode.addChild(this.editorNode);
		},

		_beforeShowMain: function() {

			if (!this._setNewTarget()) {
				return;
			}

			this._publish(this.map.getChannel("SET_CENTER_AND_ZOOM"), {
				center: [28.5, -16.0],
				zoom: 7
			});

			this._emitEvt('REFRESH');
		},

		_setNewTarget: function() {

			if (!this.pathVariableId) {
				return;
			}

			var newTarget = lang.replace(this.templateTarget, {
				id: this.pathVariableId
			});

			if (this.target === newTarget) {
				return;
			}

			this.target = newTarget;

			this._emitEvt('UPDATE_TARGET', {
				target: this.target
			});

			return newTarget;
		},

		_createAtlas: function() {

			var getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				perms: this.perms,
				getMapChannel: getMapChannel,
				addTabChannel: this._tabsDisplayer.getChannel('ADD_TAB')
			});

			var QueryOnMapPopup = declare(QueryOnMap).extend(_ShowInPopup);
			this._queryOnMap = new QueryOnMapPopup({
				parentChannel: this.getChannel(),
				getMapChannel: getMapChannel,
				title: this.i18n.layersQueryResults,
				width: 5,
				height: "md"
			});
		},

		_updateTitle: function(title) {

			this._publish(this.dataDisplayer.getChannel("SHOW"), {
				node: this.topbarNode,
				data: title
			});
		},

		_isValidCoordinate: function(value) {

			return Utilities.isValidNumber(value);
		},

		_isValidGeometry: function(coordinates) {

			return coordinates && this._isValidCoordinate(coordinates[0]) && this._isValidCoordinate(coordinates[1]);
		},

		_onAddPoint: function(obj) {

			var req = {
				type: "point"
			};

			req[this.idProperty] = -1;

			this._publish(this.geoJsonLayer.getChannel("DRAW"), req);
		},

		_onMovePoint: function(obj) {

			var req = {};

			req[this.idProperty] = obj.id || -1;

			this._publish(this.geoJsonLayer.getChannel("DRAG"), req);
		},

		_subDrawnOrDragged: function(obj) {

			this._emitEvt('SET_FORM_PROPERTY', {
				propertyName: "geometry/coordinates",
				value: [obj.position.lng, obj.position.lat]
			});

			this._publish(this.editor.getChannel("ENABLE_BUTTON"), {
				key: "clear"
			});
		},

		_subShownForm: function(request) {

			if (!this._chkActivity()) {
				this._actionWhenNoActivity();

				return;
			}

			this._shownForm(request);
		},

		_shownForm: function(request) {

			this._changeTabForForm();

			this._publish(this.geoJsonLayer.getChannel("DISCONNECT"), {
				actions: ["REQUEST"/*, "SELECT"*/]
			});

			this._publish(this.geoJsonLayer.getChannel("EDITION"), this._objToPublishForGeoJsonLayer(request));

			this._currentData = request.data || null;
		},

		_objToPublishForGeoJsonLayer: function(request) {

			var data = request.data,
				objToPublish = {};

			if (data) {
				if (data[this.idProperty] !== undefined) {
					objToPublish[this.idProperty] = data[this.idProperty];
				} else {
					objToPublish.data = data;
				}
			}

			return objToPublish;
		},

		_actionWhenNoActivity: function() {

			this._emitEvt('COMMUNICATION', {
				description: this.i18n.noActivity
			});

			this._publish(this.editor.getChannel("HIDE"));
		},

		_chkActivity: function() {

			var activityId = this.pathVariableId;

			if (!(activityId && activityId.length)) {
				return false;
			}

			return true;
		},

		_subFormHidden: function() {

			this._publish(this.geoJsonLayer.getChannel("CONNECT"), {
				actions: ["REQUEST", "SELECT"]
			});

			this._publish(this.geoJsonLayer.getChannel("EDITION_DONE"));

			this._currentData = null;

			this._changeTabForList();
		},

		_changeTabForList: function() {

			this._changeTab(this.browserAndSearchContainer, this.i18n.list);
		},

		_changeTabForForm: function() {

			this._changeTab(this.editorNode, this.i18n.form);
		},

		_changeTab: function(container, title) {

			this.browserAndEditorNode.set('title', title);

			this.browserAndEditorNode.selectChild(container);
		},

		_subFormChanged: function(change) {

			var prop = change.property.split("/").pop(),
				value = change.value;

			if (prop === "coordinates") {
				this._coordinatesChanged(value);
			} else if (prop === "radius") {
				this._radiusChanged(value);
			}
		},

		_coordinatesChanged: function(value) {

			channel = this.geoJsonLayer.getChannel("MOVE");

			this._publish(channel, {
				lng: value[0]
			});

			this._publish(channel, {
				lat: value[1]
			});
		},

		_radiusChanged: function(value) {

			this._publish(this.geoJsonLayer.getChannel("CHANGE_PRECISION"), {
				radius: value
			});
		},

		_onHide: function() {

			this.browserAndEditorNode.selectChild(this.browserAndSearchContainer);
		},

		_getNodeForForm: function () {

			return this.editorNode.domNode;
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_subClear: function() {

			this._emitEvt('CLEAR');
		},

		_localClearSelection: function(channel) {

			this._publish(channel, {
				selectionTarget: this.target
			});
		},

		onEachFeature: function(feature, layer) {

			if (feature && feature.properties) {
				feature.properties.activity = this._activityData;
			}

			layer.bindPopup(TemplatePopup({
				feature: feature,
				i18n: this.i18n
			}));
		},

		_subEditorResetted: function() {

			this._restartEditionLayer(this._currentData);
		},

		_subEditorCleared: function() {

			this._restartEditionLayer(this._currentData);
		},

		_restartEditionLayer: function(data) {

			this._publish(this.geoJsonLayer.getChannel("EDITION_DONE"));
			this._publish(this.geoJsonLayer.getChannel("EDITION"), data || {});
		},

		_getSavedObjToPublish: function(results) {

			results.hide = true;

			return results;
		},

		_getIconKeypadNode: function() {

			return this.textSearchNode.domNode;
		}
	});
});
