define([
	"app/components/viewCustomization/addGeomSite/views/_BaseGeometryForm"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/map/layer/GeoJsonLayerImpl"
	, "redmic/modules/map/layer/_Editable"
], function (
	_BaseGeometryForm
	, declare
	, lang
	, aspect
	, GeoJsonLayerImpl
	, _Editable
){
	return declare(_BaseGeometryForm, {
		//	summary:
		//		Step de MainData.

		constructor: function (args) {

			this.config = {
				ownChannel: "pointFormDataStep",
				idProperty: "uuid",
				formTemplate: "components/viewCustomization/addGeomSite/views/templates/Point"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_beforeShow", lang.hitch(this, this._beforeShowGeometryForm));
		},

		_initializeGeometryForm: function() {

			this.inherited(arguments);

			var geoJsonLayerDefinition = declare([GeoJsonLayerImpl, _Editable]);
			this.layerImpl = new geoJsonLayerDefinition(this.layerImplConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			var self = this;
			this._publish(this.form.getChannel("SET_METHOD"), {
				"onGetMapLocation": function(obj) {
					self[self._isValidGeometry(obj.point) ? "_onMovePoint" : "_onAddPoint"](obj);
				}
			});
		},

		_beforeShowGeometryForm: function() {

			var objToPublish = {};

			this._publish(this.layerImpl.getChannel("EDITION"), objToPublish);
		},

		_isValidCoordinate: function(value) {

			if (value === null || isNaN(value)) {
				return false;
			}

			return true;
		},

		_isValidGeometry: function(geometry) {

			return geometry && this._isValidCoordinate(geometry[0]) && this._isValidCoordinate(geometry[1]);
		},

		_onAddPoint: function(obj) {

			var req = {
				type: "point"
			};

			req[this.idProperty] = -1;

			this._publish(this.layerImpl.getChannel("DRAW"), req);
		},

		_onMovePoint: function(obj) {

			var req = {};

			req[this.idProperty] = obj.id || -1;

			this._publish(this.layerImpl.getChannel("DRAG"), req);
		},

		_subDrawnOrDragged: function(obj) {

			this._emitEvt('SET_FORM_PROPERTY', {
				propertyName: "geometry/coordinates",
				value: [obj.position.lng, obj.position.lat]
			});
		},

		_subDataToResult: function(res) {

			this.inherited(arguments);

			this._coordinatesChanged(res.data.geometry.coordinates);
		},

		_formChanged: function(change) {

			if (!change) {
				return;
			}

			var prop = change.property.split("/").pop(),
				value = change.value;

			if (prop === "coordinates") {
				this._coordinatesChanged(value);
			}
		},

		_coordinatesChanged: function(value) {

			var channel = this.layerImpl.getChannel("MOVE");

			this._publish(channel, {
				lng: value[0]
			});

			this._publish(channel, {
				lat: value[1]
			});
		}
	});
});
