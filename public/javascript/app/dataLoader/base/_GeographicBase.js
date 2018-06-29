define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "app/base/views/extensions/_EditionWizardView"
	, "app/base/views/extensions/_GetActivityData"
	, "app/base/views/extensions/_ListenActivityDataAndAccessByActivityCategory"
	, "app/base/views/extensions/_LocalSelectionView"
	, "app/base/views/extensions/_OnShownAndRefresh"
	, "app/designs/mapWithSideContent/layout/MapAndContentAndTopbar"
	, "app/designs/mapWithSideContent/main/Geographic"
	, "app/redmicConfig"
	, "dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/gateway/MapCenteringGatewayImpl"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/layout/dataDisplayer/DataDisplayer"
	, "redmic/modules/map/Atlas"
	, "redmic/modules/map/layer/_Selectable"
	, "redmic/modules/map/layer/_SelectOnClick"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "RWidgets/Utilities"
], function(
	_CompositeInTooltipFromIconKeypad
	, _EditionWizardView
	, _GetActivityData
	, _ListenActivityDataAndAccessByActivityCategory
	, _LocalSelectionView
	, _OnShownAndRefresh
	, MapAndContentAndTopbar
	, Geographic
	, redmicConfig
	, ContentPane
	, TabContainer
	, declare
	, lang
	, aspect
	, MapCenteringGatewayImpl
	, _Select
	, Pagination
	, DataDisplayer
	, Atlas
	, _Selectable
	, _SelectOnClick
	, GeoJsonLayerImpl
	, Utilities
){
	return declare([Geographic, MapAndContentAndTopbar, _EditionWizardView, _CompositeInTooltipFromIconKeypad,
		_LocalSelectionView, _OnShownAndRefresh, _GetActivityData, _ListenActivityDataAndAccessByActivityCategory], {
		//	summary:
		//		Base de vistas de gestión de datos cargados con listado y mapa.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				leftNodeClass: 'noScrolledContainer',
				splitterLeftNode: false,
				idProperty: "uuid",
				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_setConfigurations", lang.hitch(this,
				this._setGeographicBaseConfigurations));

			aspect.before(this, "_initialize", lang.hitch(this, this._initializeGeographicBase));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineGeographicBasePublications));

			aspect.before(this, "_beforeShow", lang.hitch(this, this._beforeShowGeographicBase));

			if (!Utilities.isValidNumber(this.pathVariableId)) {
				this._goTo404();
			}
		},

		_setGeographicBaseConfigurations: function() {

			this._replaceVariablesInTargetAndPaths();

			this.browserConfig = this._merge([{
				bars: [{
					instance: Pagination
				}],
				simpleSelection: true,
				template: this.listTemplate
			}, this.browserConfig || {}]);

			this.geoJsonLayerConfig = this._merge([{
				idProperty: this.idProperty,
				parentChannel: this.getChannel(),
				target: this._getTarget(),
				simpleSelection: true,
				onEachFeature: lang.hitch(this, this._onEachFeature)
			}, this.geoJsonLayerConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);

			this.compositeConfig = this._merge([{
				indicatorLeft: true
			}, this.compositeConfig || {}]);
		},

		_beforeShowGeographicBase: function() {

			if (!this.pathVariableId) {
				return;
			}

			this.dataAddPath = {
				activityId: this.pathVariableId
			};

			this.dataAddPath[this.idProperty] = 'new';
		},

		_createAtlas: function() {

			this.atlas = new Atlas({
				parentChannel: this.getChannel(),
				perms: this.perms,
				getMapChannel: lang.hitch(this.map, this.map.getChannel)
			});

			var cp = new ContentPane({
				title: this.i18n.themes,
				region:"center"
			});

			this._publish(this.atlas.getChannel("SHOW"), {
				node: cp.domNode
			});

			return cp;
		},

		_replaceVariablesInTargetAndPaths: function() {

			this.addPath = this._replaceVariablesInStringWithItem(this.addPath);
			this.editPath = this._replaceVariablesInStringWithItem(this.editPath);
			this.loadPath = this._replaceVariablesInStringWithItem(this.loadPath);
		},

		_initializeGeographicBase: function() {

			this.geoJsonLayerConfig.associatedIds = [this.browser.getOwnChannel()];
			this.geoJsonLayerConfig.mapChannel = this.map.getChannel();

			var geoJsonLayerDefinition = declare([
				GeoJsonLayerImpl,
				_Selectable,
				_SelectOnClick
			]);

			this.geoJsonLayer = new geoJsonLayerDefinition(this.geoJsonLayerConfig);

			this.mapCenteringGateway = new MapCenteringGatewayImpl({
				parentChannel: this.getChannel(),
				channelsDefinition: [{
					input: this.browser.getChannel("BUTTON_EVENT"),
					output: this.map.getChannel("SET_CENTER"),
					subMethod: "setCenter"
				},{
					input: this.browser.getChannel("BUTTON_EVENT"),
					output: this.geoJsonLayer.getChannel("ANIMATE_MARKER"),
					subMethod: "animateMarker"
				}]
			});

			this.dataDisplayer = new DataDisplayer({
				parentChannel: this.getChannel()
			});
		},

		_defineGeographicBasePublications: function () {

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.geoJsonLayer.getChannel("UPDATE_TARGET")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this.tabs = new TabContainer({
				tabPosition: "top",
				splitter: true,
				region: "left",
				'class': "col-xs-6 col-sm-6 col-md-6 col-lg-5 col-xl-4 mediumTexturedContainer sideTabContainer borderRadiusTabContainer"
			});

			this.tabs.addChild(this.leftNode);
			this.tabs.addChild(this._createAtlas());

			this.contentNode.addChild(this.tabs);

			this._emitEvt('ADD_LAYER', {layer: this.geoJsonLayer});
		},

		_replaceVariablesInStringWithItem: function(str) {

			return lang.replace(str, {
				activityid: "{activityId}",
				id: "{" + this.idProperty+ "}"
			});
		},

		_onEachFeature: function(feature, layer) {

			layer.bindPopup(this.popupTemplate({
				feature: feature,
				i18n: this.i18n
			}));
		},

		_removeCallback: function(evt) {

			var item = evt.item;

			this._emitEvt('REMOVE', item.uuid);
		},

		_getIconKeypadNode: function() {

			return this.textSearchNode.domNode;
		},

		_gotActivityData: function(data) {

			this._updateTitle(data.name + ' (' + data.code + ')');
		},

		_updateTitle: function(title) {

			this._publish(this.dataDisplayer.getChannel("SHOW"), {
				node: this.topbarNode.domNode,
				data: title
			});
		}
	});
});
