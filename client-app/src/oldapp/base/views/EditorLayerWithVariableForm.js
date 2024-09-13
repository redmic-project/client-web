define([
	"app/base/views/extensions/_AddForm"
	, "app/base/views/extensions/_AddSelectInput"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, 'put-selector/put'
	, "src/component/base/_Module"
	, "src/component/base/_Show"
], function (
	_AddForm
	, _AddSelectInput
	, declare
	, lang
	, domClass
	, put
	, _Module
	, _Show
){
	return declare([_Module, _Show, _AddForm, _AddSelectInput], {
		//	summary:
		//		Step para relacionar datos entre si.

		'class': 'editorLayerStyle',

		constructor: function (args) {

			this.config = {
				actions: {
					SET_PROPERTY_VALUE: "setPropertyValue"
				},
				activeClass: 'active',
				// General params
				idProperty: "id",
				ownChannel: "editorLayerWithVariableForm"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.selectInputConfig = this._merge([{
				includeEmptyValue: false,
				label: this.i18n.representation
			}, this.selectInputConfig || {}]);

			this.formConfig = this._merge([{
				buttonsConfig: {
					reset: {
						disable: false
					},
					submit: {
						props: {
							label: this.i18n.apply
						}
					},
					clear: {
						disable: true
					}
				}
			}, this.formConfig || {}]);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getParentChannel('HIDE'),
				callback: "_subParentHide"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, 'div.titleStyleContainer.mediumSolidContainer span', this.i18n.style);
			this._selectInputNode = put(this.domNode, 'div.selectInputContainer');

			this.optionsNode = put(this.domNode, 'div.optionsContainer');

			this.noCategorizeNode = put(this.optionsNode, 'div');
			put(this.noCategorizeNode, 'span', this.i18n.uncategorized);
			this.noCategorizeNode.onclick = lang.hitch(this, this._onCategorizeClick, false);

			this.categorizeNode = put(this.optionsNode, 'div');
			put(this.categorizeNode, 'span', this.i18n.categorized);
			this.categorizeNode.onclick = lang.hitch(this, this._onCategorizeClick, true);

			this._formNode = put(this.domNode, 'div.formStyleContainer');

			this._publish(this.selectInput.getChannel("SHOW"), {
				node: this._selectInputNode
			});
		},

		_onCategorizeClick: function(categorize) {

			if (this._selectCategorize === categorize)
				return;

			domClass.toggle(this.noCategorizeNode, this.activeClass);
			domClass.toggle(this.categorizeNode, this.activeClass);

			this._selectCategorize = categorize;

			this._changeLayerType(this._lastLayerType);
		},

		_subParentHide: function() {

			this._existsForm = false;
		},

		_onSelectInputChange: function(res) {

			var value = res.value;

			/*if (this._lastLayerType === value &&
				(!this._isCategorize || this._selectCategorize === this._defaultCategorize));
				return;*/

			this._changeLayerType(value);
		},

		_changeLayerType: function(value) {

			var configActivity = this.currentData.configActivity,
				layerStyle = configActivity.map.layerStyle,
				configCategory = layerStyle[value],
				obj = {
					node: this._formNode,
					data: {
						layerType: value
					}
				};

			if (!configCategory)
				return;

			this._lastLayerType = value;

			this._createForm(this._prepareConfigForm(configCategory));

			obj.toInitValues = !this._existsForm;

			if (!this._existsForm) {
				obj.data.style = this._defaultStyle;
				this._existsForm = true;
			}

			this._emitEvt("SHOW_FORM", obj);
		},

		_prepareConfigForm: function(configCategory) {

			var objForm = this._isCategorize ?
				this._schemaAndTemplateWithCategorize(configCategory) : this._schemaAndTemplate(configCategory);

			objForm.modelSchema.properties.layerType['default'] = this._defaultLayerType;

			return objForm;
		},

		_schemaAndTemplate: function(configCategory) {

			var schema = configCategory.schema,
				template = configCategory.template;

			return {
				template: template,
				modelSchema: schema
			};
		},

		_schemaAndTemplateWithCategorize: function(configCategory) {

			var schema = this._selectCategorize ? configCategory.schemaCategorize : configCategory.schema,
				template = this._selectCategorize ? configCategory.templateCategorize : configCategory.template;

			schema.properties.style.properties.categorize['default'] = this._defaultCategorize.toString();

			if (this._selectCategorize === this._defaultCategorize)
				this._existsForm = false;

			return {
				template: template,
				modelSchema: schema
			};
		},

		getNodeToShow: function() {

			return this.domNode;
		},

		_beforeShow: function(req) {

			!this._existsForm && this._updateConfig(req.data);
		},

		_updateConfig: function(data) {

			this._defaultLayerType = data.dataModel.layerType;
			this._defaultStyle = data.dataModel.style;
			//this._noCategorization();
			this._prepareCategorization();

			this.currentData = data;

			this._changeOptionsSelectInput(data);
		},

		_prepareCategorization: function() {

			this._isCategorize = true;
			this._defaultCategorize = !!(this._defaultStyle && this._defaultStyle.categorize);
			this._initializeCategorization();
		},

		_initializeCategorization: function() {

			if (!this._isCategorize)
				return;

			this._selectCategorize = this._defaultCategorize;

			put(this.optionsNode, '!hidden');
			put(this.categorizeNode, '!' + this.activeClass);
			put(this.noCategorizeNode, '!' + this.activeClass);

			if (this._selectCategorize)
				put(this.categorizeNode, '.' + this.activeClass);
			else
				put(this.noCategorizeNode, '.' + this.activeClass);
		},

		_noCategorization: function() {

			this._isCategorize = false;

			put(this.optionsNode, '.hidden');
		},

		_changeOptionsSelectInput: function(data) {

			if (!data)
				data = this.currentData;

			var configActivity = data.configActivity,
				layer = configActivity.map && configActivity.map.layer,
				options = [],
				obj;

			for (var key in layer) {
				obj = {
					value: key,
					label: key
				};

				options.push(obj);
			}

			this._publish(this.selectInput.getChannel("SET_VALUE"), {
				name: this._defaultLayerType
			});

			this._publish(this.selectInput.getChannel("SET_OPTIONS"), {
				options: options
			});
		},

		_formResetted: function() {

			this._existsForm = false;
			this._initializeCategorization();

			this._publish(this.selectInput.getChannel("SET_VALUE"), {
				name: this._defaultLayerType
			});
		},

		_formSubmitted: function(obj) {

			this._publish(this._buildChannel(this.currentData.modelLayerChannel, this.actions.SET_PROPERTY_VALUE), obj);

			this._publish(this.form.getChildChannel('modelInstance', "REMEMBER_CURRENT_VALUE"));
		}
	});
});
