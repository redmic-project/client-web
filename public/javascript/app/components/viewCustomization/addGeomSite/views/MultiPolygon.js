define([
	"app/components/viewCustomization/addGeomSite/views/_BaseGeometryForm"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/map/layer/DrawingLayerImpl"
], function (
	_BaseGeometryForm
	, declare
	, lang
	, DrawingLayerImpl
){
	return declare(_BaseGeometryForm, {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {

				ownChannel: "lineFormDataStep",
				formTemplate: "components/viewCustomization/addGeomSite/views/templates/Line"
			};

			lang.mixin(this, this.config, args);
		},

		_setGeometryFormConfigurations: function() {

			this.inherited(arguments);

			this.layerImplConfig = this._merge([{
				simpleLayer: true,
				drawOption: {
					draw: {
						polygon: {
							shapeOptions: {
								color: 'red',
								opacity: 0.7,
								weight: 3
							}
						},
						rectangle: false,
						circle: false,
						circlemarker: false,
						marker: false,
						polyline: false
					}
				}
			}, this.layerImplConfig || {}]);
		},

		_initializeGeometryForm: function() {

			this.inherited(arguments);

			this.layerImpl = new DrawingLayerImpl(this.layerImplConfig);
		},

		_defineGeometryFormSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.layerImpl.getChannel("REMOVED"),
				callback: "_subRemoved"
			});
		},

		_subDrawnOrDragged: function(obj) {

			this._changedInModel = true;

			this._emitEvt('SET_FORM_PROPERTY', {
				propertyName: "geometry/coordinates",
				value: obj.position
			});
		},

		_subRemoved: function(obj) {

			this._changedInModel = true;

			this._emitEvt('SET_FORM_PROPERTY', {
				propertyName: "geometry/coordinates",
				value: []
			});
		},

		_formChanged: function(change) {

			if (this._changedInModel) {
				this._changedInModel = false;
				return;
			}

			if (typeof change.value === "string")
				change.value = change.value ? JSON.parse(change.value) : "";

			this._publish(this.layerImpl.getChannel("ADD_LAYER"), {
				geometry: change.value,
				type: "polygon"
			});
		}/*,

		_subDataToResult: function(res) {

			this._formChanged({
				property: "geometry/coordinates",
				value: res.data.geometry.coordinates
			});
		}*/
	});
});