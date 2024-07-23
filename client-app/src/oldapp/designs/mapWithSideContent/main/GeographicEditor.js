define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "app/base/views/extensions/_EditionView"
	, "app/base/views/extensions/_LocalSelectionView"
	, "app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContentAndTopbar"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "src/component/atlas/Atlas"
	, "src/component/base/_Filter"
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_Framework"
	, "src/component/browser/_Select"
	, "src/component/browser/_GeoJsonParser"
	, "src/component/browser/ListImpl"
	, "src/component/browser/bars/Order"
	, "src/component/browser/bars/Total"
	, "src/component/form/FormContainerImpl"
	, "src/component/form/_ListenModelHasChanged"
	, "src/component/form/_PublicateChanges"
	, "src/component/form/_CreateKeypad"
	, "src/component/gateway/MapCenteringGatewayImpl"
	, "src/component/layout/dataDisplayer/DataDisplayer"
	, 'src/component/layout/TabsDisplayer'
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, "src/component/map/layer/GeoJsonLayerImpl"
	, "src/component/map/layer/_Editable"
	, "src/component/map/layer/_RadiusOnSelect"
	, "src/component/map/layer/_Selectable"
	, "src/component/map/layer/_SelectOnClick"
	, "src/component/mapQuery/QueryOnMap"
	, "src/component/search/TextImpl"
	, "templates/CitationPopup"
	, "templates/TaxonList"
], function(
	_CompositeInTooltipFromIconKeypad
	, _EditionView
	, _LocalSelectionView
	, _Main
	, Controller
	, Layout
	, declare
	, lang
	, aspect
	, Utilities
	, Atlas
	, _Filter
	, _ButtonsInRow
	, _Framework
	, _Select
	, _GeoJsonParser
	, ListImpl
	, Order
	, Total
	, FormContainerImpl
	, _ListenModelHasChanged
	, _PublicateChanges
	, _CreateKeypad
	, MapCenteringGatewayImpl
	, DataDisplayer
	, TabsDisplayer
	, GenericWithTopbarDisplayerImpl
	, GeoJsonLayerImpl
	, _Editable
	, _RadiusOnSelect
	, _Selectable
	, _SelectOnClick
	, QueryOnMap
	, TextImpl
	, TemplatePopup
	, TemplateList
) {

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

			this._createBrowser();
			this._createEditor();
			this._createMapLayer();

			this._tabsDisplayer = new TabsDisplayer({
				parentChannel: this.getChannel()
			});

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

		_createBrowser: function() {

			this.searchConfig.queryChannel = this.queryChannel;
			this.textSearch = new TextImpl(this.searchConfig);

			this.browserConfig.queryChannel = this.queryChannel;
			var BrowserDefinition = declare([ListImpl, _Framework, _ButtonsInRow, _Select, _GeoJsonParser]);
			this.browser = new BrowserDefinition(this.browserConfig);

			this._browserWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.browser,
				title: this.i18n.geographicData
			});
		},

		_createEditor: function() {

			var FormDefinition = declare([FormContainerImpl, _ListenModelHasChanged, _CreateKeypad])
				.extend(_PublicateChanges);

			this.editor = new FormDefinition(this.formConfig);

			this._editorWithTopbar = new GenericWithTopbarDisplayerImpl({
				parentChannel: this.getChannel(),
				content: this.editor,
				title: this.i18n.form
			});

			this._once(this.editor.getChannel('SHOWN'), lang.hitch(this, this._onceEditorShown));
		},

		_createMapLayer: function() {

			this.geoJsonLayerConfig.associatedIds = [this.browser.getOwnChannel()];
			this.geoJsonLayerConfig.mapChannel = this.map.getChannel();

			var geoJsonLayerDefinition = declare([GeoJsonLayerImpl, _Editable, _Selectable, _SelectOnClick,
				_RadiusOnSelect]);

			this.geoJsonLayer = new geoJsonLayerDefinition(this.geoJsonLayerConfig);
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

			this.buttonsNode = this._getIconKeypadNode();

			this.inherited(arguments);

			this._publish(this._tabsDisplayer.getChannel('ADD_TAB'), {
				title: this.i18n.geographicData,
				iconClass: 'fa fa-table',
				channel: this._browserWithTopbar.getChannel()
			});

			this._publish(this._tabsDisplayer.getChannel('ADD_TAB'), {
				title: this.i18n.form,
				iconClass: 'fa fa-keyboard-o',
				channel: this._editorWithTopbar.getChannel()
			});

			this._createAtlas();

			this._publish(this._tabsDisplayer.getChannel('SHOW'), {
				node: this.contentNode
			});

			this._emitEvt('ADD_LAYER', {
				layer: this.geoJsonLayer
			});
		},

		_onceEditorShown: function() {

			var self = this;

			this._publish(this.editor.getChannel("SET_METHOD"), {
				"onGetMapLocation": function(obj) {

					self[self._isValidGeometry(obj.point) ? "_onMovePoint" : "_onAddPoint"](obj);
				}
			});
		},

		_beforeShowMain: function() {

			if (!this._setNewTarget()) {
				return;
			}

			this._publish(this.map.getChannel("SET_CENTER_AND_ZOOM"), {
				center: [28.5, -16.0],
				zoom: 7
			});

			this._publish(this._browserWithTopbar.getChannel('ADD_TOPBAR_CONTENT'), {
				content: this.textSearch
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

			this._queryOnMap = new QueryOnMap({
				parentChannel: this.getChannel(),
				getMapChannel: getMapChannel,
				tabsDisplayerChannel: this._tabsDisplayer.getChannel()
			});
		},

		_updateTitle: function(title) {

			this._publish(this.dataDisplayer.getChannel("SHOW"), {
				node: this.topbarNode,
				data: title
			});

			this._publish(this._tabsDisplayer.getChannel('RESIZE'));
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

			return !!(activityId && activityId.length);
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

			this._showBrowserTab();
		},

		_changeTabForForm: function() {

			this._showEditorTab();
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

			var channel = this.geoJsonLayer.getChannel("MOVE");

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

			this._showBrowserTab();
		},

		_showBrowserTab: function() {

			this._publish(this._tabsDisplayer.getChannel('SHOW_TAB'), {
				channel: this._browserWithTopbar.getChannel()
			});
		},

		_showEditorTab: function() {

			this._publish(this._tabsDisplayer.getChannel('SHOW_TAB'), {
				channel: this._editorWithTopbar.getChannel()
			});
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

		_getNodeForForm: function() {

			// TODO acceso a lo bruto, remodelar extensiones de vistas para hacer las cositas bien
			return this._editorWithTopbar._contentNode;
		},

		_getIconKeypadNode: function() {

			// TODO acceso a lo bruto, remodelar extensiones de vistas para hacer las cositas bien
			return this._browserWithTopbar._topbarNode;
		}
	});
});
