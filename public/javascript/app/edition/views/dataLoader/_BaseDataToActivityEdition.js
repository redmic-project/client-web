define([
	"app/base/views/_View"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_BaseDataToActivityEditionItfc"
], function(
	_View
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, aspect
	, _BaseDataToActivityEditionItfc
){
	return declare([_View, Layout, Controller, _BaseDataToActivityEditionItfc], {
		//	summary:
		//		Vista de edición base para la carga de datos.
		//	description:
		//		Muestra el wizard para la edición de una Actividad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				type: null,
				addMode: 'add',
				editMode: 'edit',
				loadMode: 'load',
				primaryTitleAdd: this.i18n.addLoadDataToActivity,
				primaryTitleEdit: this.i18n.editLoadDataToActivity,
				secondaryTitleAdd: "{name}",
				secondaryTitleEdit: "{properties.name}"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setBaseDataBeforeConfigurations));
			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setBaseDataConfigurations));
		},

		_setBaseDataBeforeConfigurations: function() {

			var targetReplace = redmicConfig.services[this.target];

			this.target = lang.replace(targetReplace || this.target, this.pathVariableId);

			if (this.editionTarget) {
				targetReplace = redmicConfig.services[this.editionTarget];
				this.editionTarget = lang.replace(targetReplace || this.editionTarget, this.pathVariableId);
			} else {
				this.editionTarget = this.target;
			}
		},

		_setBaseDataConfigurations: function() {

			this._selectMode();

			this.editorConfig = this._merge([{
				title: this.titleWizard,
				editionTitle: this.titleWizard,
				currentStep: this.currentStep,
				steps: this.steps
			}, this.editorConfig || {}]);
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

			if (this.getOwnChannel().indexOf("/" + mode) !== -1) {
				this._modeWizard = mode;
				this['_' + mode + 'ModeConfig']();
				return true;
			}

			return false;
		},

		_addModeConfig: function() {

			this.titleWizard = {
				primary: this.primaryTitleAdd,
				secondary: this.secondaryTitleAdd
			};
		},

		_editModeConfig: function() {

			this.titleWizard = {
				primary: this.primaryTitleEdit,
				secondary: this.secondaryTitleEdit
			};
		},

		_afterShowController: function() {

			if (this.activityData) {
				this._loadActivity();
				this._updateTitle(this.activityData);
			}
		},

		_itemAvailable: function(response) {

			this.inherited(arguments);

			response && response.data && this._saveIdPropertyData(response.data);
		},

		_saveIdPropertyData: function(data) {

			this._data = {
				id: data.id,
				uuid: data.uuid
			};
		},

		_loadActivity: function() {

			this._once(this.editor.getChannel('SHOWN'), lang.hitch(this, this._editorShown, {
				data: this.activityCategory,
				id: "activityCategory"
			}));

			var objActivity = {
				data: this.activityData.id,
				id: "activityId"
			};

			this._once(this.editor.getChannel('SHOWN'), lang.hitch(this, this._editorShown, objActivity));

			this._processOptionsInit();
		},

		_editorShown: function(obj) {

			this._publish(this.editor.getChannel("NEW_ADDITIONAL_DATA"), obj);
		},

		_updateTitleInWizard: function(data) {

			this._publish(this.editor.getChannel("SET_PROPS"), {
				title: {
					primary: this.titleWizard.primary,
					secondary: lang.replace(this.titleWizard.secondary, data)
				}
			});
		}
	});
});