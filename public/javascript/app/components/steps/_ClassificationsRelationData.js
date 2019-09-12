define([
	"app/designs/formList/main/_RequestAndParseData"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "templates/RelationDataClassificationForm"
], function (
	_RequestAndParseData
	, redmicConfig
	, declare
	, lang
	, Utilities
	, ClassificationForm
){
	return declare(_RequestAndParseData, {
		//	summary:
		//		Extensión para la relación de datos de clasificaciones.

		constructor: function (args) {

			this.config = {
				classificationsTarget: redmicConfig.services.objectType,
				_countCassificationsInData: 0,

				_classificationsPropertyName: "classifications",
				_classificationsPath: "classifications/matching"
			};

			lang.mixin(this, this.config, args);

			this.itemsClassifications = {
				classifications: {
					target: this.classificationsTarget
				}
			};

			this.target.push(this.classificationsTarget);
		},

		_updateFormData: function(res) {

			this.inherited(arguments);

			var objectGroup,
				objectGroups = res.objectGroups;

			if (!objectGroups) {
				return;
			}

			if (objectGroups && objectGroups.length) {
				objectGroup = objectGroups;
			}

			if (objectGroup && (!this._lastobjectGroup ||
				!Utilities.isEqual(this._lastobjectGroup, objectGroup))) {

				this._lastobjectGroup = lang.clone(objectGroup);
				this._requestClassifications(objectGroup);
			}
		},

		_isClassifications: function(value) {

			if (!value) {
				value = this._currentValueSelect;
			}

			if (value === this._classificationsPropertyName) {
				return true;
			}

			return false;
		},

		_selectConfigNewForm: function(schema) {

			if (!this._isClassifications()) {
				return this.inherited(arguments);
			}

			var customProps = {
				modelSchema: schema.properties.matching.items,
				template: ClassificationForm,
				dataTemplate: this.classificationDataTemplate
			};

			this.items = this.itemsClassifications;

			return customProps;
		},

		_loadItemRelationData: function(item, key) {

			if (this._isClassifications(key)) {
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

		_proccesItemForInjectToList: function(item) {

			if (this._isClassifications(item.type)) {
				item[this.idProperty] = item.generatedId;
			}

			item = this.inherited(arguments);

			if (this._isClassifications(item.type)) {
				this._requestItems(item);
			}
		},

		_publishLocalData: function(dataToInject) {

			this.inherited(arguments);
			this._addLeavesForType(this.resultsToPub);
		},

		_addAttributesForListItem: function(item) {

			item = this.inherited(arguments);

			if (this._isClassifications(item.type)) {
				item.path = "root." + item.generatedId;
				item.leaves = 1;
			}

			return item;
		},

		_deleteItemInModel: function(item) {

			if (this._isClassifications(item.type)) {
				var obj = {};

				obj[this._classificationsPath] = item.generatedId;

				this._publish(this.modelInstance.getChannel('DELETE_VALUE'), obj);
			} else {
				this.inherited(arguments);
			}
		},

		_addItemInModel: function(item) {

			if (this._isClassifications()) {

				var obj = {};

				obj[this._classificationsPath] = item;

				this._once(this.modelInstance.getChannel('VALUE_ADDED'),
					lang.hitch(this, this._subValueAddedForClassifications, item), {
						predicate: lang.hitch(this, this._containerPropertyIsClassifications)
					});

				this._publish(this.modelInstance.getChannel('ADD_VALUE'), obj);
			} else {
				this.inherited(arguments);
			}
		},

		_containerPropertyIsClassifications: function(obj) {

			return obj[this._classificationsPath] !== undefined;
		},

		_subValueAddedForClassifications: function(item, res) {

			var copyItem = lang.clone(item);

			for (var key in res) {
				copyItem.generatedId = res[key].generatedId;
			}

			this._proccesItemForInjectToList(copyItem);

			this._updateItemsUsage(item);
		},

		_deleteFormType: function(item) {

			if (this._isClassifications()) {
				if (this._formData.columns.length === 1) {
					this.inherited(arguments);
				}
			} else {
				this.inherited(arguments);
			}
		},

		_restoreUnusedType: function(item) {

			if (this._isClassifications(item.type)) {
				if (this._formData.columns.length === 0) {
					this.inherited(arguments);
				}
			} else {
				this.inherited(arguments);
			}
		},

		_newItem: function(item) {

			if (this._isClassifications()) {
				this._addItemInModel(item);
			} else {
				this.inherited(arguments);
			}
		},

		_addLeavesForType: function(item) {

			var obj = lang.clone(item);

			delete obj.type;

			obj.dataType = "subData";
			obj[this.idProperty] += "1";
			obj.path += "." + obj.dataType;
			obj.leaves = 0;

			this._emitEvt('INJECT_ITEM', {
				data: obj,
				target: this.getChannel(),
				noSetTotal: true
			});
		},

		_requestClassifications: function(data) {

			var ids = [];

			for (var i = 0; i < data.length; i++) {
				ids.push(data[i].split('.').pop());
			}

			this._requestClassificationsMGet = true;

			this._emitEvt('REQUEST', {
				target: this.target[1],
				method: "POST",
				action: "_mget",
				query: {
					ids: ids
				},
				requesterId: this.getOwnChannel()
			});
		},

		_dataAvailable: function(response, resWrapper) {

			var target = resWrapper.target,
				data = response.data;

			if (target === this.classificationsTarget && !this._activePost && this._requestClassificationsMGet) {
				this._requestClassificationsMGet = false;
				this._updateClassifications(data.data);
				return;
			}

			this.inherited(arguments);
		},

		_updateClassifications: function(data) {

			this.classificationsTypes = data;
			this.classificationDataTemplate = {
				classifications: []
			};

			for (var i = 0; i < data.length; i++) {
				this.classificationDataTemplate.classifications.push({
					model: this._classificationsPropertyName + "/" + i,
					label: data[i].name,
					classificationType: data[i].path
				});
			}
		},

		_parseResultMget: function(data, key) {

			if (!this._isClassifications(key)) {
				return this.inherited(arguments);
			}

			var dataReturn = [],
				paths = lang.clone(this.resultsToPub[key]);

			for (var i = 0; i < paths.length; i++) {
				var pathSplit = paths[i].split(this.pathSeparator),
					item = null;

				for (var p = 1; p < pathSplit.length; p++) {
					var aux = data[p - 1];
					aux.parent = item;
					item = aux;
				}

				dataReturn.push(item);

				data.splice(0, pathSplit.length - 1);
			}

			return dataReturn;
		},

		_parseIdsOfMget: function(ids, key) {

			if (!this._isClassifications(key)) {
				return this.inherited(arguments);
			}

			var idsReturn = [];

			for (var i = 0; i < ids.length; i++) {
				var pathSplit = ids[i].split(this.pathSeparator);
				for (var p = 1; p < pathSplit.length; p++)
					idsReturn.push(parseInt(pathSplit[p], 10));
			}

			return idsReturn;
		}
	});
});