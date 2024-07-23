define([
	"app/components/steps/SelectActivityCategoryStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/edition/views/dataLoader/AddDataIF"
	, "app/edition/views/dataLoader/AddDataFT"
	, "app/edition/views/dataLoader/AddDataOC"
	, "app/edition/views/dataLoader/EditDataAR"
	, "app/edition/views/dataLoader/LoadDataAR"
	, "app/edition/views/dataLoader/LoadDataFT"
	, "app/edition/views/dataLoader/LoadDataOC"
	, "app/edition/views/dataLoader/LoadDataTR"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "src/component/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityCategoriesNoExist"
], function(
	SelectActivityCategoryStep
	, Controller
	, Layout
	, AddDataIF
	, AddDataFT
	, AddDataOC
	, EditDataAR
	, LoadDataAR
	, LoadDataFT
	, LoadDataOC
	, LoadDataTR
	, redmicConfig
	, declare
	, lang
	, Deferred
	, TemplateDisplayer
	, TemplateNoExist
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición base para la carga de datos.
		//	description:
		//		Muestra el wizard para la edición de una Actividad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: [redmicConfig.services.activity],
				activityCategoriesByActivityTypeTarget: redmicConfig.services.activityCategoriesByActivityType,
				activityData: null,
				activityCategory: null,
				activityCategoriesOptions: null,
				addMode: 'add',
				editMode: 'edit',
				loadMode: 'load',
				idProperty: "activityid",

				activityCategories: {
					"ft": {
						add: AddDataFT,
						edit: AddDataFT,
						load: LoadDataFT
					},
					"oc": {
						add: AddDataOC,
						edit: AddDataOC,
						load: LoadDataOC
					},
					"at": {
						add: LoadDataTR,
						load: LoadDataTR
					},
					"pt": {
						add: LoadDataTR,
						load: LoadDataTR
					},
					"if": {
						add: AddDataIF,
						edit: AddDataIF
					},
					"ar": {
						add: LoadDataAR,
						edit: EditDataAR,
						load: LoadDataAR
					}
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._afterHide));
		},

		_emitGetActivity: function() {

			var activityId = this.pathVariableId.activityid;

			if (this.activityData && this.activityData.id === parseInt(activityId, 10)) {
				delete this.activityCategory;
				this._processActivity();
			} else {
				this._cleanDataToActivity();

				this._emitEvt('GET', {
					target: this.target[0],
					requesterId: this.getOwnChannel(),
					id: activityId
				});
			}
		},

		_cleanDataToActivity: function() {

			delete this.activityData;
			delete this.activityCategory;
			delete this.activityCategoriesOptions;
		},

		_itemAvailable: function(res, resWrapper) {

			var target = resWrapper.target,
				data = res.data;

			if (target === this.target[0]) {
				if (!this.activityData ||
					this.activityData.activityCategory !== data.activityCategory ||
					this.activityData.id !== data.id) {

					this.activityData = data;
					this._processActivity();
				}
			} else if (target === this.target[1]) {
				this.activityCategoriesOptions = data;
				this._processActivityCategories();
			}
		},

		_processActivity: function() {

			// No tenemos datos de la actividad
			if (!this.activityData) {
				console.error("No data to activity");
				return;
			}

			// Tenemos categoría de la actividad
			if (this.activityData.activityCategory) {
				this.activityCategory = this.activityData.activityCategory;
				this._editorByActivityCategory();
				return;
			}

			// Tenemos opciones de las categorías de la actividad
			if (this.activityCategoriesOptions) {
				this._processActivityCategories();
			} else {
				// Pedimoss las opciones de las categorías de la actividad
				this._emitGetActivityTypeCategories();
			}
		},

		_emitGetActivityTypeCategories: function() {

			this.target[1] = lang.replace(this.activityCategoriesByActivityTypeTarget, this.activityData.activityType);

			this._emitEvt('GET', {
				target: this.target[1],
				requesterId: this.getOwnChannel(),
				id: ''
			});
		},

		_processActivityCategories: function() {

			if (this.activityCategoriesOptions.length > 1) {
				this._processActivityCategoriesOptions();
			} else if (this.activityCategoriesOptions.length === 1) {
				this.activityCategory = this.activityCategoriesOptions[0];
				this._editorByActivityCategory();
			} else {
				this._noExistsActivityCategory();
			}
		},

		_processActivityCategoriesOptions: function() {

			if (!this.selectActivityCategoryInstance) {
				this._createSelectActivityCategory();
			}

			this._publish(this.selectActivityCategoryInstance.getChannel("SHOW"), {
				node: this.domNode,
				data: this.activityCategoriesOptions
			});

			this._dfdEditor.resolve();
		},

		_noExistsActivityCategory: function() {

			if (!this.noExistsActivityCategoryInstance) {
				this.noExistsActivityCategoryInstance = new TemplateDisplayer({
					parentChannel: this.getChannel(),
					"class": "mediumSolidContainer.viewerPDFAuthFailed.borderRadius",
					template: TemplateNoExist
				});
			}

			this._publish(this.noExistsActivityCategoryInstance.getChannel("SHOW"), {
				node: this.domNode
			});

			this._dfdEditor.resolve();
		},

		_createSelectActivityCategory: function() {

			this.selectActivityCategoryInstance = new SelectActivityCategoryStep({
				parentChannel: this.getChannel()
			});

			this._subscribe(this.selectActivityCategoryInstance.getChannel("CHANGED"), lang.hitch(this, this._subChanged));
		},

		_subChanged: function(res) {

			this.activityCategory = res.value;
			this._editorByActivityCategory();
		},

		_editorByActivityCategory: function() {

			var mode = this._selectMode(),
				config = this.activityCategories[this.activityCategory];

			if (!config || !config[mode]) {
				this._noExistsActivityCategory();
				return;
			}

			this._generateEditor(config[mode]);
		},

		_selectMode: function(mode) {

			if (this._checkMode(this.addMode)) {
				return this.addMode;
			} else if (this._checkMode(this.editMode)) {
				return this.editMode;
			} else if (this._checkMode(this.loadMode)) {
				return this.loadMode;
			}
		},

		_checkMode: function(mode) {

			if (this.getOwnChannel().indexOf("/" + mode + "/") !== -1) {
				return true;
			}

			return false;
		},

		_generateEditor: function(def) {

			if (this._editorInstance) {
				this._publish(this._editorInstance.getChannel("HIDE"));
				this._publish(this._editorInstance.getChannel("DISCONNECT"));
				delete this._editorInstance;
			}

			var editorConfig = this._merge([{
				parentChannel: this.getChannel(),
				ownChannel: this.getOwnChannel(),
				activityData: this.activityData,
				activityCategory: this.activityCategory,
				pathVariableId: this.pathVariableId,
				editorConfig: {
					_additionalData: {
						activityCategory: this.activityCategory,
						activityId: this.activityData.id
					}
				}
			}, this.editorConfig || {}]);

			this._editorInstance = new def(editorConfig);

			if (this.selectActivityCategoryInstance) {
				this._publish(this.selectActivityCategoryInstance.getChannel("HIDE"));
			}

			this._publish(this._editorInstance.getChannel('SHOW'), {
				node: this.domNode
			});

			if (this._dfdEditor && !this._dfdEditor.isFulfilled()) {
				this._dfdEditor.resolve();
			}
		},

		_beforeShow: function(req) {

			this._dfdEditor = new Deferred();

			this._emitGetActivity();

			// TODO esto es un apaño, a falta de rediseñar esta vista, que en lugar de reutilizar recursos, sigue una
			// implementación propia que rompe con todo lo demás (tan solo por el hecho de necesitar pedir los datos
			// de la actividad previamente)
			if (this.editor) {
				this._publish(this.editor.getChannel('DESTROY'));
			}

			return this._dfdEditor;
		},

		_afterHide: function(req) {

			if (this.selectActivityCategoryInstance) {
				this._publish(this.selectActivityCategoryInstance.getChannel("HIDE"));
			}

			if (this._editorInstance) {
				this._publish(this._editorInstance.getChannel('HIDE'), {
					node: this.domNode
				});

				this._publish(this._editorInstance.getChannel('DISCONNECT'));
			}
		}
	});
});
