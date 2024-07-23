define([
	"dijit/form/Button"
	, "dijit/form/FilteringSelect"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/number"
	, "dojo/store/Memory"
	, "put-selector/put"
	, "RWidgets/Utilities"
	, "src/component/form/input/GeographicCoordinatesComponentImpl"
	, "src/component/form/input/Input"
	, "src/component/form/input/NumberSpinnerImpl"
	, "src/component/model/ModelImpl"
	, "RWidgets/Converter"
], function(
	Button
	, FilteringSelect
	, declare
	, lang
	, number
	, Memory
	, put
	, Utilities
	, GeographicCoordinatesComponentImpl
	, Input
	, NumberSpinnerImpl
	, ModelImpl
	, Converter
) {

	return declare(Input, {
		//	summary:
		//		Implementación de input Point.

		constructor: function(args) {

			this.config = {
				ownChannel: "pointInput",

				classButtonsGroup: "embeddedButton",
				idProperty: "id",
				pathSeparator: "/",
				defaultSr: 4326,
				initialSr: 1,
				spatialReferences: [{
					id: 4326,
					name: this.i18n.wgs84DecimalDegrees,
					crs: "urn:ogc:def:crs:OGC:1.3:CRS84"
				},{
					id: 1,
					name: this.i18n.wgs84SexagesimalDegrees,
					crs: "1"
				},{
					id: 3857,
					name: "WGS84 Web Mercator (Auxiliary Sphere) [EPSG: 3857]",
					crs: "3857"
				},{
					id: 32628,
					name: "WGS84 / UTM 28N [EPSG: 32628]",
					crs: "32628"
				}],
				_inputsNodes: {},
				_inputsInstances: {},
				_gcInputsInstances: {},
				_coordinateProperties: ["x", "y"]
			};

			lang.mixin(this, this.config, args);

			this.filteringSR = this.initialSr;
		},

		_initialize: function() {

			var schema = {
				"$schema": "http://json-schema.org/schema#",
				title: "PointGeometry schema",
				type: "object",
				required : ["x", "y"],
				additionalProperties: false,
				properties: {
					x: {
						"$ref": "#/definitions/coordinatesComponent"
					},
					y: {
						"$ref": "#/definitions/coordinatesComponent"
					}
				},
				definitions: {
					coordinatesComponent: {
						type: "number",
						maximum: 9000000000000000,
						minimum: -9000000000000000
					}
				}
			};

			this._modelInstance = new ModelImpl({
				parentChannel: this.getChannel(),
				schema: schema
			});
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this._modelInstance.getChannel("VALUE_CHANGED"),
				callback: "_subInnerModelValueChanged"
			},{
				channel: this._modelInstance.getChannel("SERIALIZED"),
				callback: "_subInnerModelSerialized"
			},{
				channel: this._buildChannel(this._validationChannel, this.actions.VALUE_CHANGED),
				callback: "_subIdPropertyChanged",
				options: {
					predicate: lang.hitch(this, function(res) {

						return res.uuid !== undefined;
					})
				}
			});
		},

		_subIdPropertyChanged: function(res) {

			this._idPropertyValue = res.uuid;
		},

		_createInputInstance: function() {

			return false;
		},

		_subInnerModelValueChanged: function(res) {

			clearTimeout(this._innerModelValueChangedTimeoutHandler);
			this._innerModelValueChangedTimeoutHandler = setTimeout(lang.hitch(this, this._onInnerModelValueChanged,
				res), 1);
		},

		_onInnerModelValueChanged: function() {

			!this._omitNextInnerModelSerialize && this._publish(this._modelInstance.getChannel("SERIALIZE"));
			this._omitNextInnerModelSerialize = false;
		},

		_subInnerModelSerialized: function(res) {

			var data = res.data,
				newCoordinatesAreValid = Utilities.isValidNumber(data.x) && Utilities.isValidNumber(data.y);

			if (!newCoordinatesAreValid) {
				return;
			}

			var xValueSignificantlyChanged = this._lastCoordinates ? this._valueHasChangedSignificantly(
				this._lastCoordinates.x, data.x, this.filteringSR) : true,

				yValueSignificantlyChanged = this._lastCoordinates ? this._valueHasChangedSignificantly(
					this._lastCoordinates.y, data.y, this.filteringSR) : true;

			if (xValueSignificantlyChanged || yValueSignificantlyChanged) {
				this._propagateValueChangeToOuterModel(data);
			}
		},

		_propagateValueChangeToOuterModel: function(data) {

			this._lastCoordinates = lang.clone(data);

			var convertedCoords = this._convert(data.x, data.y, this.filteringSR, this.defaultSr);
			if (convertedCoords) {
				this._emitEvt('SET_PROPERTY_VALUE', {
					"geometry/coordinates": convertedCoords
				});
				this._emitChanged(convertedCoords);
			}
		},

		_valueChanged: function(res) {

			clearTimeout(this._outerModelValueChangedTimeoutHandler);
			this._outerModelValueChangedTimeoutHandler = setTimeout(lang.hitch(this, this._onOuterModelValueChanged,
				res), 1);
		},

		_onOuterModelValueChanged: function(res) {

			var coordinates = res[this.propertyName],
				convertedCoords = coordinates.length > 1 ? this._convert(coordinates[0], coordinates[1],
					this.defaultSr, this.filteringSR) : null;

			if (!convertedCoords || this._checkCoordinatesHaveChanged(convertedCoords)) {
				return;
			}

			this._omitNextInnerModelSerialize = !!this._lastCoordinates;
			this._deserializeCoordinatesInInnerModel({
				x: convertedCoords[0],
				y: convertedCoords[1]
			});
		},

		_checkCoordinatesHaveChanged: function(convertedCoords) {

			return this._lastCoordinates && convertedCoords[0] === this._lastCoordinates.x && convertedCoords[1] ===
				this._lastCoordinates.y;
		},

		_deserializeCoordinatesInInnerModel: function(coordsObj) {

			this._lastCoordinates = coordsObj;

			this._publish(this._modelInstance.getChannel("DESERIALIZE"), {
				data: coordsObj
			});
		},

		_createInputNodes: function() {

			// Se prepara la estructura
			this.additionalPrevNode = put(this.domNode, "div.fWidth");	// Nodo para elementos antes del nodo principal
			this.mainNode = put(this.domNode, "div.fWidth");	// Nodo principal
			this.additionalNextNode = put(this.domNode, "div.fWidth");	// Nodo para elementos tras el nodo principal

			this._createInputs();	// Crea los widgets de los inputs

			// Creamos el botón de obtener coordenadas
			var locationButtonNode = put(this.buttonNode, "div." + this.classButtonsGroup);
			new Button({
				showLabel: false,
				label: this.i18n.buttonGetMapLocation,
				"class": "danger",
				iconClass: "fa-map-marker",
				onClick: lang.hitch(this, this._onGetMapLocationWrapper)
			}).placeAt(locationButtonNode);

			this._showInputs(this._gcInputsInstances);
		},

		_onGetMapLocationWrapper: function() {

			var objSend = {
				"point": this._lastCoordinates ? [this._lastCoordinates.x, this._lastCoordinates.y] : null,
				"id": this._idPropertyValue
			};

			this.inputProps.onGetMapLocation(objSend);
		},

		_createInputs: function() {
			//	summary:
			//		Se encarga de la configuración y creación de los inputs.
			//	tags:
			//		private

			this._createSpatialReferenceSelector();
			this._createCoordinatesInputs();
		},

		_createSpatialReferenceSelector: function() {

			var controlGroupNode = put(this.additionalPrevNode, "div.inputContainer.fWidth"),
				key = "spatialReference",
				label = this.i18n[key] + '*',
				placeholder = label + "PlaceHolder";

			this.filteringSelect = new FilteringSelect({
				"class": "form-control",
				placeHolder: this.i18n[placeholder in this.i18n ? placeholder : key],
				store: new Memory({
					data: this.spatialReferences
				}),
				value: this.filteringSR,
				onChange: lang.hitch(this, this._onSpatialReferenceChange)
			});

			put(controlGroupNode, 'div.leftContainer label' + '[for="' + this.filteringSelect.id + '"]', label);

			var controlsNode = put(controlGroupNode, "div.rightContainer");
			this.filteringSelect.placeAt(controlsNode);
		},

		_createCoordinatesInputs: function() {

			for (var i = this._coordinateProperties.length - 1; i >= 0; i--) {
				var key = this._coordinateProperties[i],
					label = this.i18n[key] + '*',
					controlGroupNode = put(this.mainNode, "div.inputContainer.fWidth");

				this._inputsInstances[key] = this._createInput(key);
				this._gcInputsInstances[key] = this._createGeographicCoordinatesInput(key);

				put(controlGroupNode, 'div.leftContainer label', label);

				var rightContainer = put(controlGroupNode, "div.rightContainer");

				this._inputsNodes[key] = put(rightContainer, "div.fWidth");
				var buttonNode = put(rightContainer, "div.buttonNode[style='width: 6rem']");

				// Ponemos el botón a la altura de la X
				if (i === 0) {
					this.buttonNode = buttonNode;
				}
			}
		},

		_createInput: function(/*String*/ key) {
			//	summary:
			//		Devuelve la instancia del input según su key.
			//	tags:
			//		private
			//	key
			//		Clave de la propiedad conectada con el input.

			var placeholder = key + "PlaceHolder",
				props = {
					"class": "form-control",
					placeHolder: this.i18n[placeholder in this.i18n ? placeholder : key],
					//intermediateChanges: true,
					notLabel: true,
					constraints: {
						places: '0,20',
						max: 9000000000000000,
						min: -9000000000000000
					},
					trim: true
				};

			return new NumberSpinnerImpl({
				parentChannel: this.getChannel(),
				inputProps: props,
				modelChannel: this._modelInstance.getChannel(),
				propertyName: key
			});
		},

		_createGeographicCoordinatesInput: function(/*String*/ key) {
			//	summary:
			//		Devuelve la instancia del miniInput según su key.
			//	tags:
			//		private
			//	key
			//		Clave de la propiedad conectada con los miniInputs.

			var placeholder = key + "PlaceHolder",
				props = {
					placeHolder: this.i18n[placeholder in this.i18n ? placeholder : key],
					notLabel: true,
					trim: true
				};

			return new GeographicCoordinatesComponentImpl({
				parentChannel: this.getChannel(),
				inputProps: props,
				modelChannel: this._modelInstance.getChannel(),
				propertyName: key
			});
		},

		_onSpatialReferenceChange: function(value) {
			//	summary:
			//		Traduce los valores de inputs y miniInputs cuando cambia el SR.
			//	tags:
			//		private
			//	value:
			//		Nuevo valor de SR.

			var oldSRValue = this.filteringSR,
				toDMS = value === 1 ? true : false;

			this.filteringSR = value;

			if (toDMS) {
				this._hideInputs(this._inputsInstances);
				this._showInputs(this._gcInputsInstances);
			} else if (oldSRValue === 1) {
				this._hideInputs(this._gcInputsInstances);
				this._showInputs(this._inputsInstances);
			}

			if (!this._lastCoordinates) {
				return;
			}

			var convertedCoords = this._convert(this._lastCoordinates.x, this._lastCoordinates.y, oldSRValue, value);

			if (convertedCoords) {
				this._deserializeCoordinatesInInnerModel({
					x: convertedCoords[0],
					y: convertedCoords[1]
				});
			}
		},

		_enable: function() {

			this._publishToInputs("ENABLE");

			this.filteringSelect.set("disabled", false);
		},

		_disable: function() {

			this._publishToInputs("DISABLE");

			this.filteringSelect.set("disabled", true);
		},

		_doReset: function() {

			this._publish(this._modelInstance.getChannel("RESET"));
			this._publishToInputs("RESET");
		},

		_doClear: function() {

			this._publish(this._modelInstance.getChannel("CLEAR"));
			this._publishToInputs("CLEAR");

			this._idPropertyValue = null;
			this._lastCoordinates = null;
		},

		_publishToInputs: function(action) {

			for (var inputKey in this._inputsInstances) {
				this._publish(this._inputsInstances[inputKey].getChannel(action));
			}

			for (var gcInputKey in this._gcInputsInstances) {
				this._publish(this._gcInputsInstances[gcInputKey].getChannel(action));
			}
		},

		_showInputs: function(inputs) {

			for (var key in inputs) {
				this._publish(inputs[key].getChannel("SHOW"), {
					node: this._inputsNodes[key]
				});
			}
		},

		_hideInputs: function(inputs) {

			for (var key in inputs) {
				this._publish(inputs[key].getChannel("HIDE"));
			}
		},

		_convert: function(xValue, yValue, inSr, outSr) {

			inSr = (inSr === 1) ? this.defaultSr : inSr;
			outSr = (outSr === 1) ? this.defaultSr : outSr;

			if (inSr === outSr) {
				return [xValue, yValue];
			}

			var conversion = Converter.convertCoordinates(inSr, outSr, xValue, yValue);

			if (conversion) {
				return [conversion.x, conversion.y];
			} else {
				console.warn(this.i18n.invalidDataGeographicCoordinates, ": [" + xValue + ", " + yValue + "] (" + inSr +
					" -> " + outSr + ")");
			}
		},

		_valueHasChangedSignificantly: function(v1, v2, sr) {

			var v1Int = (v1 !== undefined) ? number.format(v1 ,{places: 0, fractional: false}) : null,
				v1Dec = v1 % 1,
				v2Int = number.format(v2 ,{places: 0, fractional: false}),
				v2Dec = v2 % 1,
				threshold = (sr === 4326 || sr === 1) ? Math.pow(10, -6) : 0.05;

			if (v1Int !== v2Int || isNaN(v1) || isNaN(v2)) {
				return true;
			}

			return Math.abs(v1Dec - v2Dec) > threshold;
		}
	});
});
