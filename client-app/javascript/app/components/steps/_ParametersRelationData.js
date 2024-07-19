define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "templates/RelationDataParameterForm"
], function (
	declare
	, lang
	, Utilities
	, ParameterForm
){
	return declare(null, {
		//	summary:
		//		Extensión para la relación de datos de parametros.

		constructor: function (args) {

			this.config = {
				_parameterPropertyName: "parameter",
				_parametersPropertyName: "parameters",
				_parametersPath: "parameters/matching"
			};

			lang.mixin(this, this.config, args);
		},

		_updateFormData: function(res) {

			this.inherited(arguments);

			this._updateParameter(this._additionalData.parameter);
		},

		_selectConfigNewForm: function(schema) {

			var customProps = {
				dataTemplate: {
					parameterColumns: true
				},
				template: ParameterForm
			};

			if (this._isParameters()) {
				customProps.modelSchema = schema.properties.matching.items;
			} else if (this._isParameter()){
				customProps.modelSchema = schema;
				customProps.dataTemplate.parameterColumns = false;
			} else {
				return this.inherited(arguments);
			}

			return customProps;
		},

		_loadItemRelationData: function(item, key) {

			if (this._isParameters(key)) {
				for (var i = 0; i < item.matching.length; i++) {
					this._currentValueSelect = key;

					this._formSubmitted({
						data: item.matching[i]
					});
				}
			} else {
				this.inherited(arguments);
			}
		},

		_restoreUnusedValues: function(item) {

			if (this._isNoValid(item.type)) {
				this.inherited(arguments);
				return;
			}

			var value = {
				id: item.dataDefinitionId,
				name: item.dataDefinitionName
			};

			this._formData.parameter.push(value);
		},

		_addAttributesForListItem: function(item) {

			item = this.inherited(arguments);

			if (this._isParameters() || this._isParameter()) {
				if (Utilities.isValidNumber(item.dataDefinitionId)) {
					for (var i = 0; i < this._formData.parameter.length; i++) {
						var dataDefinition = this._formData.parameter[i];

						if (dataDefinition.id === item.dataDefinitionId) {
							item.dataDefinitionName = dataDefinition.name;
							break;
						}
					}

					item.path = "root." + item.dataDefinitionId;
				}
			}

			return item;
		},

		_cleanUsedValues: function(item) {

			if (this._isNoValid()) {
				return this.inherited(arguments);
			}

			this._deleteItemInFormData(item, "parameter", "dataDefinitionId");
		},

		_deleteItemInModel: function(item) {

			if (this._isParameters(item.type)) {
				var obj = {};

				obj[this._parametersPath] = item.generatedId;

				this._publish(this.modelInstance.getChannel('DELETE_VALUE'), obj);
			} else {
				this.inherited(arguments);
			}
		},

		_addItemInModel: function(item) {

			if (this._isParameters()) {

				var obj = {};

				obj[this._parametersPath] = item;

				this._once(this.modelInstance.getChannel('VALUE_ADDED'),
					lang.hitch(this, this._subValueAddedForParameter, item), {
						predicate: lang.hitch(this, this._containerPropertyIsParameters)
					});

				this._publish(this.modelInstance.getChannel('ADD_VALUE'), obj);
			} else {
				this.inherited(arguments);
			}
		},

		_containerPropertyIsParameters: function(obj) {

			return obj[this._parametersPath] !== undefined;
		},

		_subValueAddedForParameter: function(item, res) {

			var copyItem = lang.clone(item);

			for (var key in res) {
				copyItem.generatedId = res[key].generatedId;
			}

			this._proccesItemForInjectToList(copyItem);

			this._updateItemsUsage(item);
		},

		_deleteFormType: function(item) {

			if (this._isParameters()) {
				if (this._formData.parameter.length === 1) {
					this.inherited(arguments);
				}
			} else {
				this.inherited(arguments);
			}
		},

		_restoreUnusedType: function(item) {

			if (this._isParameters(item.type)) {
				if (this._formData.parameter.length === 0) {
					this.inherited(arguments);
				}
			} else {
				this.inherited(arguments);
			}
		},

		_newItem: function(item) {

			if (this._isParameters()) {
				this._addItemInModel(item);
			} else {
				this.inherited(arguments);
			}
		},

		_isParameter: function(value) {

			if (!value) {
				value = this._currentValueSelect;
			}

			if (value === this._parameterPropertyName) {
				return true;
			}

			return false;
		},

		_isParameters: function(value) {

			if (!value) {
				value = this._currentValueSelect;
			}

			if (value === this._parametersPropertyName) {
				return true;
			}

			return false;
		},

		_isNoValid: function(value) {

			if (this._isParameter(value) || this._isParameters(value)) {
				return false;
			}

			return true;
		},

		_instanceDataToResult: function(data) {

			this.inherited(arguments);

			this._updateParameter(data);
		},

		_chkValidItem: function(item) {

			if (this._isNoValid()) {
				return this.inherited(arguments);
			}

			for (var i = 0; i < this._formData.parameter.length; i++) {
				var dataDefinition = this._formData.parameter[i];

				if (dataDefinition.id === item.dataDefinitionId) {
					return true;
				}
			}

			return false;
		},

		_updateParameter: function(data) {

			if (data && (!this._lastParameter || !Utilities.isEqual(this._lastParameter, data))) {

				this._lastParameter = data;

				if (data && data.properties && data.properties.measurements) {
					var parameters =  data.properties.measurements;
					this._formData.parameter = [];
					for (var i = 0; i < parameters.length; i++) {
						var item = parameters[i],
							name = item.parameter.name + ' - ' + item.unit.name + ' (z: ' + item.dataDefinition.z + ')';
							device = item.dataDefinition.device;

						if (device) {
							name += ' - ' + device.name + ' (id: ' + device.id + ')';
						}

						this._formData.parameter.push({
							id: item.dataDefinition.id,
							name: name
						});
					}
				}
			}
		}
	});
});