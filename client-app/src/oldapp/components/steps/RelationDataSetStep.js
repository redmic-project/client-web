define([
	"app/base/views/extensions/_AddSelectInput"
	, "app/designs/formList/layout/LayoutWithTopForm"
	, "app/designs/formList/Controller"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
	, "src/component/browser/_ButtonsInRow"
	, "src/component/browser/_Framework"
	, "src/component/browser/_MultiTemplate"
	, "src/component/browser/HierarchicalImpl"
	, "RWidgets/Utilities"
	, "templates/RelationDataParentList"
	, "templates/RelationDataChildList"
], function (
	_AddSelectInput
	, LayoutWithTopForm
	, Controller
	, redmicConfig
	, declare
	, lang
	, moment
	, _ButtonsInRow
	, _Framework
	, _MultiTemplate
	, HierarchicalImpl
	, Utilities
	, TemplateListParent
	, TemplateListChild
){
	return declare([LayoutWithTopForm, Controller, _AddSelectInput], {
		//	summary:
		//		Step para relacionar datos entre si.

		constructor: function (args) {

			this.config = {
				// WizardStep params
				label: this.i18n.relations,
				title: this.i18n.relationsCreated,
				/*modelConfig: {
					props: {
						serializeAdditionalProperties: true
					}
				},*/

				target: ["relationData"],
				_createFormInitial: false,
				formTypeOptions: {},
				_columnUsage: {},
				_formData: {},

				// General params
				idProperty: "id",
				ownChannel: "relationDataSetStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				browserBase: [HierarchicalImpl, _Framework, _ButtonsInRow, _MultiTemplate],
				browserConfig: {
					idProperty: 'path',
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-trash",
								btnId: "remove",
								callback: "_removeItem",
								condition: "type",
								returnItem: true
							}]
						}
					},
					templatesByTypeGroup: {
						type: TemplateListParent,
						subData: TemplateListChild
					}
				}
			}, this.browserConfig || {}]);

			this.selectInputConfig = this._merge([{
				includeEmptyValue: false
			}, this.selectInputConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.selectInput.getChannel("SHOW"), {
				node: this.topLeftNode
			});

			if (this._additionalData) {
				this._newAdditionalData(this._additionalData);
			}
		},

		_onNewResults: function(res) {

			this._updateFormData(res.results);
		},

		_newAdditionalData: function(res) {

			this._newData(res);
		},

		_newData: function(res) {

			if (res.loadFile) {

				this._updateFormData(res);

				if (!this.data || !Utilities.isEqual(this.data, res.loadFile)) {

					this.data = res.loadFile;

					this._loadDataInPreviewList = true;

					this._processModelAndData(this.data);
				}
			}
		},

		_updateFormData: function(res) {

		},

		_processModelAndData: function(data) {

			this._setModel({
				schema: data.matching
			});

			this._once(this.modelInstance.getChannel('GOT_PROPS'),
				lang.hitch(this, this._subGetPropertyByProcessData));

			this._publish(this.modelInstance.getChannel('GET_PROPS'), {
				modelInstance: true,
				modelBuildDfd: true
			});
		},

		_subGetPropertyByProcessData: function(obj) {

			var action = lang.hitch(this, this._processIncomingDataAndBuildFormData, obj.modelInstance);

			if (obj.modelBuildDfd.isFulfilled()) {
				action();
			} else {
				obj.modelBuildDfd.then(action);
			}
		},

		_processIncomingDataAndBuildFormData: function(modelInstance) {

			this.data.matching = lang.clone(modelInstance._schema);

			this._processMatchingData(this.data.matching);

			this._processLoadedData(this.data);

			this._loadFormTypesInSelector();
		},

		_processMatchingData: function(matchs) {

			var properties = matchs.properties;

			for (var key in properties) {
				this._addFormType(key);
			}
		},

		_addFormType: function(key) {

			var labelUncapitalize = Utilities.uncapitalize(key);
				label = this.i18n[labelUncapitalize] ? this.i18n[labelUncapitalize] : key;

			if (!(this.data.matching.properties[key].type instanceof Array)) {
				label += " *";
			}

			if (!this.formTypeOptions[key]) {
				this.formTypeOptions[key] = label;
			}
		},

		_deleteFormType: function(item) {

			var type = this._currentValueSelect;


			if (this.formTypeOptions[type]) {
				delete this.formTypeOptions[type];
			}

			this._loadFormTypesInSelector(true);
		},

		_processLoadedData: function(data) {

			var headers = data.header;
			data = data.data;

			if (!data.length) {
				return;
			}

			this._formData.columns = [];

			for (var i = 0; i < headers.length; i++) {
				this._processItemData(headers[i]);
			}
		},

		_processItemData: function(head) {

			this._formData.columns.push({
				value: head
			});
		},

		_loadFormTypesInSelector: function(formHide) {

			if (this._blockLoadFormTypesInSelector) {
				return;
			}

			var formTypeOptions = [];
			for (var key in this.formTypeOptions) {
				formTypeOptions.push({
					value: key,
					label: this.formTypeOptions[key]
				});
			}

			if (this.form && formHide) {
				this._publish(this.form.getChannel("HIDE"));
				this._publish(this.form.getChannel("DISCONNECT"));
			}

			this._publish(this.selectInput.getChannel("SET_OPTIONS"), {
				options: ['']
			});

			this._publish(this.selectInput.getChannel("CLEAR"));

			this._publish(this.selectInput.getChannel("SET_OPTIONS"), {
				options: formTypeOptions
			});

			this.form && this._publish(this.form.getChannel('CLEAR'));

			if (formTypeOptions.length === 0) {
				this._currentValueSelect = null;
			}
		},

		_onSelectInputChange: function(res) {

			if (!res.value) {
				this._currentValueSelect = null;
				return;
			}

			if (this._currentValueSelect && this._currentValueSelect === res.value) {
				return;
			}

			this._currentValueSelect = res.value;

			this._once(this.modelInstance.getChannel('GOT_PROPERTY_INSTANCE'),
				lang.hitch(this, this._subGotPropertyInstanceByValueSelector));

			this._publish(this.modelInstance.getChannel('GET_PROPERTY_INSTANCE'), {
				key: res.value
			});
		},

		_subGotPropertyInstanceByValueSelector: function(obj) {

			var schema = this._clearTypeInSubSchema(lang.clone(obj.instance._schema));

			this._createForm(this._selectConfigNewForm(schema));

			this._injectFormData();

			this._emitEvt("SHOW_FORM", {
				node: this.formNode
			});

			this._setAutomaticValueInColumns(obj.propertyName);
		},

		_setAutomaticValueInColumns: function(value) {

			var columns = this._formData.columns;

			if (value && columns) {
				for (var i = 0; i < columns.length; i++) {
					if (columns[i].value === value) {
						this._publish(this.form.getChildChannel('modelInstance', 'SET_PROPERTY_VALUE'), {
							'columns': [value]
						});

						break;
					}
				}
			}
		},

		_clearTypeInSubSchema: function(schema) {

			if (schema.type instanceof Array) {
				schema.type = schema.type[0];
			}

			return schema;
		},

		_selectConfigNewForm: function(schema) {

			var customProps;

			switch(this._currentValueSelect) {
				case "pointGeometry":
					customProps = {
						template: "components/viewCustomization/relationData/views/templates/PointGeometry"
					};
					break;
				case "device":
					customProps = {
						template: "components/viewCustomization/relationData/views/templates/Device"
					};
					break;
				case "areaType":
					customProps = {
						template: "components/viewCustomization/relationData/views/templates/AreaType"
					};
					break;
				default:
					customProps = {
						template: "components/viewCustomization/relationData/views/templates/Default"
					};
			}

			customProps.modelSchema = schema;

			return customProps;
		},

		_injectFormData: function() {

			this._once(this.form.getChannel('SHOWN'), lang.hitch(this, function() {

				if (!this._originalFormData) {
					this._originalFormData = lang.clone(this._formData);
				}

				this._sendDataToForm();

				this._subscribe(this.form.getChildChannel('modelInstance', 'VALUE_CHANGED'),
					lang.hitch(this, this._subValueChangedModel));
			}));
		},

		_subValueChangedModel: function(res) {},

		_subValidationErrorsChanged: function(res) {},

		_subWasValid: function(res) {

			this._isCompleted = res.isValid;

			this._emitEvt('REFRESH_STATUS');
		},

		_removeCallback: function(evt) {

			this._deleteItemInModel(evt.item);

			this._restoreData(evt.item);

			this._sendDataToForm();
		},

		_restoreData: function(item) {

			this._restoreUnusedType(item);
			this._restoreUnusedColumns(item);
			this._restoreUnusedValues(item);
		},

		_restoreUnusedType: function(item) {

			this._addFormType(item.type);

			this._loadFormTypesInSelector();
		},

		_deleteItemInModel: function(item) {

			this._publish(this.modelInstance.getChannel('CLEAR'), {
				properties: [item.type]
			});
		},

		_restoreUnusedColumns: function(results) {

			var columns = this._selectColumnsInData(results);

			if (columns) {
				for (var i = 0; i < columns.length; i++) {
					this._formData.columns.push({
						value: columns[i]
					});
				}
			}
		},

		_selectColumnsInData: function(data) {

			return data.columns;
		},

		_restoreUnusedValues: function(results) {

			return;
		},

		_formSubmitted: function(res) {

			if (res.error || !this._chkValidItem(res.data)) {
				return;
			}

			this._newItem(res.data);

			this._publish(this.form.getChannel("SAVED"), {
				success: true,
				clear: true
			});
		},

		_chkValidItem: function(item) {

			return true;
		},

		_newItem: function(item) {

			this._proccesItemForInjectToList(lang.clone(item));

			this._addItemInModel(item);

			this._updateItemsUsage(item);
		},

		_updateItemsUsage: function(item) {

			this._deleteFormType(item);
			this._cleanUsedColumns(item);
			this._cleanUsedValues(item);

			this._sendDataToForm();
		},

		_proccesItemForInjectToList: function(item) {

			item.type = this._currentValueSelect;

			item = this._addAttributesForListItem(item);

			this._emitEvt('INJECT_ITEM', {
				data: item,
				target: this.getChannel()
			});

			return item;
		},

		_addItemInModel: function(item) {

			var obj = {};

			obj[this._currentValueSelect] = item;

			this._publish(this.modelInstance.getChannel('SET_PROPERTY_VALUE'), obj);
		},

		_addAttributesForListItem: function(item) {

			//revisar si el cambio al type no genera conflictos
			item.path = "root." + item.type;
			item.dataType = "type";

			item.leaves = 0;

			return item;
		},

		_cleanUsedColumns: function(results) {

			var columns = this._selectColumnsInData(results);

			if (columns) {
				for (var i = 0; i < this._formData.columns.length; i++) {
					var columnObj = this._formData.columns[i];

					if (columns.indexOf(columnObj.value) >= 0) {
						this._formData.columns.splice(i, 1);
						i--;
					}
				}
			}
		},

		_cleanUsedValues: function(results) {

			return;
		},

		_deleteItemInFormData: function(results, prop, propToResults) {

			for (var i = this._formData[prop].length - 1; i >= 0; i--) {
				var propObj = this._formData[prop][i];

				if (results.hasOwnProperty(propToResults)) {
					var res = results[propToResults];

					if (propObj.id === res || propObj.value === res) {
						this._formData[prop].splice(i, 1);
					}
				}
			}
		},

		_sendDataToForm: function() {

			this._emitEvt("INJECT_ITEM", {
				data: this._formData,
				target: this.target[0]
			});
		},

		_clearWizardStep: function() {

			this._isCompleted = false;

			this._emitEvt('REFRESH_STATUS');

			this._cleanData();

			this.inherited(arguments);
		},

		_cleanData: function() {

			this.modelInstance && this._publish(this.modelInstance.getChannel("CLEAR"));
			this._publish(this.browser.getChildChannel('browser', "CLEAR"));

			//Reinicia el select de los type
			this.formTypeOptions = {};
			this._processMatchingData(this.data.matching);
			this._loadFormTypesInSelector(true);

			//Limpia los input del formulario
			this._formData = lang.clone(this._originalFormData);
			this._sendDataToForm();
		},

		_instanceDataToResult: function(data) {

		},

		_doFlush: function() {

			this._once(this.modelInstance.getChannel('SERIALIZED'),
				lang.hitch(this, this._subSerializedModel));

			this._publish(this.modelInstance.getChannel("SERIALIZE"));
		},

		_subSerializedModel: function(res) {

			var obj = {
				step: this.stepId,
				results: res.data,
				status: true
			};

			this._emitEvt('FLUSH', obj);
		}
	});
});
