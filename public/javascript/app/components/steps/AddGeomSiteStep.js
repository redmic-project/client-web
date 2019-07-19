define([
	"app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContent"
	, "dijit/layout/ContentPane"
	, "dijit/layout/StackContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/map/OpenLayers"
	, "redmic/modules/map/_LeafletDraw"
	, "redmic/modules/map/layer/WmsLayerImpl"
], function(
	Controller
	, Layout
	, ContentPane
	, StackContainer
	, declare
	, lang
	, aspect
	, OpenLayers
	, _LeafletDraw
	, WmsLayerImpl
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista base para añadir geometría.
		//	description:
		//		Permite mostrar y editar datos geográficos.

		constructor: function (args) {

			this.config = {
				label: this.i18n.addGeomSite,
				mapExts: [_LeafletDraw]
			};

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setMainConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeMain));
			aspect.before(this, "_beforeShow", lang.hitch(this, this._beforeShowStep));

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.batimetriasLayerConfig = this._merge([{
				parentChannel: this.getChannel(),
				layer: OpenLayers.build({
					type: "wms",
					url: "https://atlas.redmic.es/geoserver/el/wms",
					props: {
						layers: ["batimetriaGlobal"],
						format: "image/png",
						transparent: true,
						tiled: true
					}
				})
			}, this.batimetriasLayerConfig || {}]);
		},

		_initializeMain: function() {

			this.batimetriasLayerConfig.mapChannel = this.map.getChannel();

			this.batimetriasLayer = new WmsLayerImpl(this.batimetriasLayerConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.map.getChannel("ADD_LAYER"), {
				layer: this.batimetriasLayer,
				layerId: "batimetrias",
				layerLabel: this.i18n.bathymetry,
				optional: true
			});

			this.leftContainer = new ContentPane({
				'class': 'rightZone',
				region: "center"
			});

			this.leftNode = new declare(StackContainer)({
				region: "left",
				'class': "hardTexturedContainer sideStackContainer"
			});

			this.addChild(this.leftNode);

			this.leftNode.addChild(this.leftContainer);

			this._loadForm();
		},

		_beforeShowStep: function() {

			this._publish(this.map.getChannel("SET_CENTER_AND_ZOOM"), {
				center: [28.5, -16.0],
				zoom: 7
			});
		},

		_instanceDataToResult: function(data) {

			this._publish(this.viewForm.getChannel("DATA_TO_RESULT"), {
				data: data
			});
		},

		_getNodeToShow: function() {

			return this.containerNode;
		},

		_doFlush: function() {

			this._publish(this.viewForm.getChannel("SUBMIT"));
		},

		_subSubmitted: function(res) {

			var obj = {
				step: this.stepId,
				results: null,
				status: true
			};

			if (res.data) {
				this._results = res.data;
				obj.results = this.getStepResults().geometry;
			} else if (res.error) {
				obj.status = false;
				obj.error = res.error;
			}

			this._emitEvt('FLUSH', obj);
		},

		_loadForm: function() {

			if (!this.type) {
				return;
			}

			this._emitEvt("LOADING", {
				global: true
			});

			this._createForm(this.type);

			this._once(this.viewForm.getChannel("SHOWN"), lang.hitch(this, this._onceFormShown));

			this._publish(this.viewForm.getChannel("SHOW"), {
				node: this.leftContainer
			});
		},

		_onceFormShown: function() {

			this._emitEvt("LOADED");
		},

		_createForm: function(type) {

			this._deleteForm();

			this.viewForm = new type({
				parentChannel: this.getChannel(),
				mapChannel: this.map.getChannel(),
				modelChannel: this.modelChannel
			});

			this._formSubscriptions = this._setSubscriptions([{
				channel: this.viewForm.getChannel("FORM_STATUS"),
				callback: "_subFormStatus"
			},{
				channel: this.viewForm.getChannel("SUBMITTED"),
				callback: "_subSubmitted"
			}]);
		},

		_deleteForm: function() {

			if (!this.viewForm) {
				return;
			}

			this._publish(this.viewForm.getChannel("HIDE"));

			this._removeSubscriptions(this._formSubscriptions);

			delete this.viewForm;
		},

		_subFormStatus: function(res) {

			this._isCompleted = res._isCompleted;

			this._results = true;

			this._emitEvt('REFRESH_STATUS');
		},

		_clearStep: function() {

			this._publish(this.viewForm.getChannel("CLEAR"));
		},

		_resetStep: function() {

			this._publish(this.viewForm.getChannel("RESET"));
		}
	});
});
