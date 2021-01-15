define([
	"app/base/models/_Model"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "./Model"
], function(
	_Model
	, declare
	, lang
	, Deferred
	, Model
){
	return declare(Model, {
		//	summary:
		//		Implementación del modelo.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				props: {},
				ownChannel: "model",
				valuePropertyName: "value",
				pathSeparator: "/",

				_lastValidationErrors: {}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.modelInstance = new _Model(this.props);

			this.modelBuildDfd = new Deferred();
		},

		_doEvtFacade: function() {

			this.modelInstance.on('validationErrorsChanged', lang.hitch(this, this._onValidationErrorsChanged));
			this.modelInstance.on('valueChanged', lang.hitch(this, this._groupEventArgs, 'VALUE_CHANGED'));
			this.modelInstance.on('valueAdded', lang.hitch(this, this._groupEventArgs, 'VALUE_ADDED'));
			this.modelInstance.on('valueRemoved', lang.hitch(this, this._groupEventArgs, 'VALUE_REMOVED'));
			this.modelInstance.on('valueReindexed', lang.hitch(this, this._groupEventArgs, 'VALUE_REINDEXED'));
		},

		_onModelBuilt: function() {

			this.modelBuildDfd.resolve();

			this._emitEvt("MODEL_BUILD");
		},

		_onValidationErrorsChanged: function(errors) {

			this._lastValidationErrors = errors;
			this._emitEvt('VALIDATION_ERRORS_CHANGED', {
				errors: errors,
				isValid: this.modelInstance.get("isValid")
			});

			this._getIsValidStatus();
		},

		_setPropertyValue: function(key, value) {

			var dfd = this._obtainPropertyInstance(key);

			dfd.then(lang.hitch(this, function(value, instance) {

				if (!instance || !instance.modelInstanceName) {
					return;
				}

				if (!value || typeof value !== "object") {
					instance.set(this.valuePropertyName, value);
				} else {
					instance.deserialize(value);
				}
			}, value));
		},

		_deleteValue: function(key, index) {

			var dfd = this._obtainPropertyInstance(key);

			dfd.then(lang.hitch(this, function(index, instance) {

				if (this._isArrayInstance(instance)) {
					instance.deleteValue(index);
				}
			}, index));
		},

		_isArrayInstance: function(instance) {

			var schema = instance ? instance.get("schema") : null,
				type = schema ? schema.type : null;

			if (type instanceof Array) {
				type = type[0];
			}

			return type === "array";
		},

		_addValue: function(key, value) {

			var dfd = this._obtainPropertyInstance(key);

			dfd.then(lang.hitch(this, function(value, instance) {

				if (!this._isArrayInstance(instance)) {
					return;
				}

				instance.addValue(value);
			}, value));
		},

		_getPropertyValue: function(req) {

			var key = req.propertyName,
				valuePropertyName = req.valueProperty ? req.valueProperty : this.valuePropertyName,
				dfd = this._obtainPropertyInstance(key);

			dfd.then(lang.hitch(this, function(key, valuePropertyName, instance) {

				var obj = {
					propertyName: key,
					isValid: false
				};

				if (instance) {
					obj[valuePropertyName] = instance.get(valuePropertyName);
					obj.isValid = instance.get("isValid");
				}

				this._emitEvt('GOT_PROPERTY_VALUE', obj);
			}, key, valuePropertyName));
		},

		_doActionWhenBuilt: function(action) {

			if (this.modelBuildDfd.isFulfilled()) {
				action();
			} else {
				this.modelBuildDfd.then(action);
			}
		},

		_deserialize: function(req) {

			var action = lang.hitch(this.modelInstance, this.modelInstance.deserialize,
				req.data, req.toInitValues, req.keepAllData);

			this._doActionWhenBuilt(action);
		},

		_serialize: function(req) {

			var noSerializeNullValue = this.noSerializeNullValue;

			if (req.noSerializeNullValue !== undefined) {
				noSerializeNullValue = req.noSerializeNullValue;
			}

			var action = lang.hitch(this, function() {

				this._emitEvt('SERIALIZED', {
					data: this.modelInstance.serialize(noSerializeNullValue)
				});
			});

			this._doActionWhenBuilt(action);
		},

		_obtainPropertyInstance: function(key, ignoreNonexistent) {

			var keySplit = key.split(this.pathSeparator),
				dfd = new Deferred(),
				action = lang.hitch(this, function(keySplit, dfd) {

					this._findPropertyInstance({
						pathArray: keySplit,
						dfd: dfd,
						ignoreNonexistent: ignoreNonexistent
					}, this.modelInstance);
				}, keySplit, dfd);

			this._doActionWhenBuilt(action);

			return dfd;
		},

		_findPropertyInstance: function(obj, propertyInstance) {

			var pathArray = obj.pathArray,
				dfd = obj.dfd,
				ignoreNonexistent = obj.ignoreNonexistent;

			for (var i = 0; i < pathArray.length; i++) {
				var nextPropertyInstance = propertyInstance.get(pathArray[i], true);

				if (!nextPropertyInstance) {
					if (!ignoreNonexistent) {
						console.error("Tried to get missing instance for property '%s' at model '%s'", pathArray[i],
							this.getChannel());
					}

					propertyInstance = null;

					break;
				} else if (nextPropertyInstance.then) {
					pathArray.splice(0, i + 1);

					nextPropertyInstance.then(lang.hitch(this, this._findPropertyInstance, {
						pathArray: pathArray,
						dfd: dfd,
						ignoreNonexistent: ignoreNonexistent
					}));

					return;
				} else {
					propertyInstance = nextPropertyInstance;
				}
			}

			dfd.resolve(propertyInstance);
		},

		_obtainPropertySchema: function(key) {

			var keySplit = key.split(this.pathSeparator),
				dfd = new Deferred(),
				action = lang.hitch(this, function(propKeySplit, schemaDfd) {

					this._findPropertySchema({
						pathArray: propKeySplit,
						dfd: schemaDfd
					}, this.modelInstance);
				}, keySplit, dfd);

			this._doActionWhenBuilt(action);

			return dfd;
		},

		_findPropertySchema: function(obj, propertyInstance) {

			var pathArray = obj.pathArray,
				dfd = obj.dfd,
				schema = propertyInstance.get('schema');

			for (var i = 0; i < pathArray.length; i++) {
				var pathItem = pathArray[i],
					schemaType = schema.type;

				if (!pathItem.length) {
					break;
				}

				if (schemaType === 'object' || (schemaType instanceof Array && schemaType.indexOf('object') !== -1)) {
					schema = schema.properties;
				}

				if (pathItem === '{i}' && (schemaType === 'array' || (schemaType instanceof Array && schemaType.indexOf('array') !== -1))) {
					schema = schema.items;
				} else {
					schema = schema[pathItem];
				}

				if (!schema) {
					console.error("Tried to get schema of missing property '%s' at model '%s'", pathItem,
						this.getChannel());

					break;
				}
			}

			dfd.resolve(schema);
		},

		_reset: function(req) {

			var action = lang.hitch(this, function(req) {

				this.modelInstance.reset(req.properties);
			}, req);

			this._doActionWhenBuilt(action);
		},

		_clear: function(req) {

			var action = lang.hitch(this, function(req) {

				this.modelInstance.clear(req.properties);
			}, req);

			this._doActionWhenBuilt(action);
		},

		_getPropertyIsValidStatus: function(req) {

			var propertyName = req.propertyName;

			if (!propertyName) {
				return;
			}

			this._obtainPropertyInstance(propertyName).then(lang.hitch(this, function(propertyName, instance) {

				this._emitEvt('WAS_VALID', {
					propertyName: propertyName,
					value: instance.get(this.valuePropertyName),	// TODO debe mandar el valor?? creo que no
					errors: this._lastValidationErrors[propertyName],
					isValid: instance.get("isValid")
				});
			}, propertyName));
		},

		_getIsValidStatus: function() {

			var action = lang.hitch(this, function() {

				this._emitEvt('WAS_VALID', {
					errors: this._lastValidationErrors,
					isValid: this.modelInstance.get("isValid")
				});
			});

			this._doActionWhenBuilt(action);
		},

		_getHasChangedStatus: function() {

			var action = lang.hitch(this, function() {

				this._emitEvt('WAS_CHANGED', {
					hasChanged: this.modelInstance.get("hasChanged")
				});
			});

			this._doActionWhenBuilt(action);
		},


		_getIdPropertyValue: function(req) {

			var key = req.key,
				dfd = this._obtainPropertyInstance(key);

			dfd.then(lang.hitch(this, function(key, instance) {

				this._emitEvt('GOT_ID_PROPERTY', {
					propertyName: key,
					value: instance.getIdValue()
				});
			}, key));
		},

		_getPropertyInstance: function(req) {

			var key = req.key,
				ignoreNonexistent = req.ignoreNonexistent,
				dfd = this._obtainPropertyInstance(key, ignoreNonexistent);

			dfd.then(lang.hitch(this, function(key, instance) {

				this._emitEvt('GOT_PROPERTY_INSTANCE', {
					instance: instance,
					propertyPath: instance && instance.get("modelPath"),
					propertyName: key
				});
			}, key));
		},

		_getPropertySchema: function(req) {

			var key = req.key || '',
				dfd = this._obtainPropertySchema(key);

			dfd.then(lang.hitch(this, function(propKey, schema) {

				this._emitEvt('GOT_PROPERTY_SCHEMA', {
					schema: schema,
					propertyName: propKey
				});
			}, key));
		},

		_rememberCurrentValue: function(req) {

			this.modelInstance.reinitializeWithCurrentValue();

			this._emitEvt('WAS_CHANGED', {
				hasChanged: this.modelInstance.get("hasChanged")
			});
		},

		_getModelUuid: function(req) {

			return this.modelInstance.get('modelUuid');
		},

		_saveModel: function() {

			if (!this.modelInstance.isValid) {
				console.error('Tried to save invalid model \'%s\' with this schema:',
					this.modelInstance.get('modelName'), this.modelInstance.get('schema'));

				return;
			}

			if (!this.modelInstance.hasChanged) {
				console.error('Tried to save unchanged model \'%s\' with this schema:',
					this.modelInstance.get('modelName'), this.modelInstance.get('schema'));

				return;
			}

			var id = this.modelInstance.getIdValue(),
				data = this.modelInstance.serialize();

			this._emitEvt('SAVE', {
				target: this.target,
				id: id,
				data: data
			});
		},

		_afterSaved: function(res, resWrapper) {

			this._emitEvt('SAVE_MODEL', {
				success: true,
				data: res.data
			});
		},

		_afterSaveError: function(error, status, resWrapper) {

			this._emitEvt('SAVE_MODEL', {
				success: false,
				data: resWrapper.res.data
			});
		}
	});
});
