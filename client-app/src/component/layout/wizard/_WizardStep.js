define([
	'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "src/component/model/ModelImpl"
	, "./_WizardStepItfc"
], function(
	redmicConfig
	, declare
	, lang
	, aspect
	, Deferred
	, ModelImpl
	, _WizardStepItfc
) {

	return declare(_WizardStepItfc, {
		//	summary:
		//		Extensión para los módulos usados como Step dentro de un Wizard.
		//	description:
		//		Aporta lo necesario para comunicarse con Wizard.

		wizardStepEvents: {
			REFRESH_STATUS: "refreshStatus",
			SET_PROPERTY_VALUE: "setPropertyValue",
			GET_PROPERTY_VALUE: "getPropertyValue",
			DELETE_VALUE: "deleteValue",
			ADD_VALUE: "addValue",
			FLUSH: "flush",
			IS_VALID: 'isValid',
			GO_FORWARD: "goForward",
			GET_ID_PROPERTY: "getIdProperty",
			STEP_SHOWN: "stepShown",
			GOT_NEXT_STEP: "gotNextStep",
			GOT_PREV_STEP: "gotPrevStep",
			BEFORE_GOING_NEXT_STEP_DONE: "beforeGoingNextStepDone",
			MODEL_RESET: 'modelReset',
			MODEL_CLEAR: 'modelClear',
			GET_PROPERTY_SCHEMA: 'getPropertySchema'
		},

		wizardStepActions: {
			NEW_STATUS: "newStatus",
			NEW_RESULTS: "newResults",
			REFRESH_DATA: "refreshData",
			REFRESH_STATUS: "refreshStatus",
			SET_PROPERTY_VALUE: "setPropertyValue",
			GET_PROPERTY_VALUE: "getPropertyValue",
			GOT_PROPERTY_INSTANCE: "gotPropertyInstance",
			GET_PROPERTY_INSTANCE: "getPropertyInstance",
			DELETE_VALUE: "deleteValue",
			ADD_VALUE: "addValue",
			FLUSH: "flush",
			IS_VALID: "isValid",
			WAS_VALID: "wasValid",
			VALIDATION_ERRORS_CHANGED: "validationErrorsChanged",
			FLUSHED: "flushed",
			GOT_ID_PROPERTY: "gotIdProperty",
			GET_ID_PROPERTY: "getIdProperty",
			GO_FORWARD: "goForward",
			SHOW_STEP: "showStep",
			STEP_SHOWN: "stepShown",
			GET_NEXT_STEP: "getNextStep",
			GOT_NEXT_STEP: "gotNextStep",
			GET_PREV_STEP: "getPrevStep",
			GOT_PREV_STEP: "gotPrevStep",
			DO_BEFORE_GOING_NEXT_STEP: "doBeforeGoingNextStep",
			BEFORE_GOING_NEXT_STEP_DONE: "beforeGoingNextStepDone",
			NEW_ADDITIONAL_DATA: "newAdditionalData",
			REFRESH_TRACE: "refreshTrace",
			RESET: "reset",
			CLEAR: "clear",
			VALUE_CHANGED: "valueChanged",
			MODEL_RESET: 'modelReset',
			MODEL_CLEAR: 'modelClear',
			GET_PROPERTY_SCHEMA: 'getPropertySchema',
			GOT_PROPERTY_SCHEMA: 'gotPropertySchema'
		},

		constructor: function(args) {

			if (!this.statusStep) {
				this.statusStep = true;
			}

			if (!this.label) {
				this.label = "step";
			}

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixWizardStepEventsAndActions));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineWizardStepSubscriptions));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineWizardStepPublications));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeWizardStep));
		},

		_mixWizardStepEventsAndActions: function () {

			lang.mixin(this.events, this.wizardStepEvents);
			lang.mixin(this.actions, this.wizardStepActions);
			delete this.wizardStepEvents;
			delete this.wizardStepActions;
		},

		_initializeWizardStep: function() {

			if (this.modelChannel) {
				this._setModelChannel(this.modelChannel);
				this._setGlobalModelUsed(true);
			} else if (this.modelTarget || this.modelSchema) {
				this.modelConfig = this._merge([{
					schema: this.modelSchema,
					target: this.modelTarget
				}, this.modelConfig || {}]);

				this._setModel(this.modelConfig);
				this._setGlobalModelUsed(false);
			}
		},

		_defineWizardStepSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("REFRESH_TRACE"),
				callback: "_subRefreshTrace"
			},{
				channel: this.getChannel("NEW_ADDITIONAL_DATA"),
				callback: "_subNewAdditionalData"
			},{
				channel: this.getChannel("NEW_RESULTS"),
				callback: "_subNewResults"
			},{
				channel: this.getChannel("DO_BEFORE_GOING_NEXT_STEP"),
				callback: "_subDoBeforeGoingNextStep"
			},{
				channel: this.getChannel("REFRESH_STATUS"),
				callback: "_subRefreshStatus"
			},{
				channel: this.getChannel("REFRESH_DATA"),
				callback: "_subRefreshData"
			},{
				channel: this.getChannel("FLUSH"),
				callback: "_subFlush"
			},{
				channel: this.getChannel("SHOW_STEP"),
				callback: "_subShowStep"
			},{
				channel: this.getChannel("GET_NEXT_STEP"),
				callback: "_subGetNextStep"
			},{
				channel: this.getChannel("GET_PREV_STEP"),
				callback: "_subGetPrevStep"
			},{
				channel: this.getChannel("RESET"),
				callback: "_subReset"
			},{
				channel: this.getChannel("CLEAR"),
				callback: "_subClear"
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineWizardStepPublications: function () {

			this.publicationsConfig.push({
				event: 'GO_FORWARD',
				channel: this.getChannel('GO_FORWARD')
			},{
				event: 'REFRESH_STATUS',
				channel: this.getChannel("NEW_STATUS"),
				callback: "_pubNewStatus"
			},{
				event: 'FLUSH',
				channel: this.getChannel("FLUSHED")
			},{
				event: 'STEP_SHOWN',
				channel: this.getChannel("STEP_SHOWN")
			},{
				event: 'GOT_NEXT_STEP',
				channel: this.getChannel("GOT_NEXT_STEP")
			},{
				event: 'GOT_PREV_STEP',
				channel: this.getChannel("GOT_PREV_STEP")
			},{
				event: 'BEFORE_GOING_NEXT_STEP_DONE',
				channel: this.getChannel("BEFORE_GOING_NEXT_STEP_DONE")
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_setModel: function(res) {

			if (this.modelInstance) {
				// TODO revisar esto, puede originar problemas, quizá desconectar y/o destruir primero
				delete this.modelInstance;
			}

			res.parentChannel = this.getChannel();

			this.modelInstance = new ModelImpl(res);

			this._setModelChannel(this.modelInstance.getChannel());
		},

		_setModelChannel: function(modelChannel) {

			this.modelChannel = modelChannel;

			this._deleteModelSubscriptionAndPublications();
			this._createModelSubscriptions();
			this._createModelPublications();
		},

		_getGlobalModelUsed: function() {

			return this.statusFlags.globalModelUsed;
		},

		_setGlobalModelUsed: function(value) {

			this.statusFlags.globalModelUsed = value;
		},

		_createModelSubscriptions: function() {

			this._modelSubscriptions = this._setSubscriptions([{
				channel: this._buildChannel(this.modelChannel, this.actions.VALIDATION_ERRORS_CHANGED),
				callback: "_subValidationErrorsChanged"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.VALUE_CHANGED),
				callback: "_subValueChanged",
				options: {
					predicate: lang.hitch(this, this._containedPropertyIsMine)
				}
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.WAS_VALID),
				callback: "_subWasValid"
			},{
				channel: this._buildChannel(this.modelChannel, this.actions.GOT_ID_PROPERTY),
				callback: "_subGotIdProperty",
				options: {
					predicate: lang.hitch(this, this._chkGotIdProperty)
				}
			},{
				channel : this._buildChannel(this.modelChannel, this.actions.GOT_PROPERTY_SCHEMA),
				callback: '_subGotPropertySchema',
				options: {
					predicate: lang.hitch(this, this._chkGotPropertySchema)
				}
			}]);
		},

		_createModelPublications: function() {

			this._modelPublications = this._setPublications([{
				event: 'GET_PROPERTY_VALUE',
				channel: this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_VALUE)
			},{
				event: 'SET_PROPERTY_VALUE',
				channel: this._buildChannel(this.modelChannel, this.actions.SET_PROPERTY_VALUE)
			},{
				event: 'DELETE_VALUE',
				channel: this._buildChannel(this.modelChannel, this.actions.DELETE_VALUE)
			},{
				event: 'ADD_VALUE',
				channel: this._buildChannel(this.modelChannel, this.actions.ADD_VALUE)
			},{
				event: 'GET_ID_PROPERTY',
				channel: this._buildChannel(this.modelChannel, this.actions.GET_ID_PROPERTY)
			},{
				event: 'IS_VALID',
				channel: this._buildChannel(this.modelChannel, this.actions.IS_VALID)
			},{
				event: 'MODEL_RESET',
				channel: this._buildChannel(this.modelChannel, this.actions.MODEL_RESET)
			},{
				event: 'MODEL_CLEAR',
				channel: this._buildChannel(this.modelChannel, this.actions.MODEL_CLEAR)
			},{
				event: 'GET_PROPERTY_SCHEMA',
				channel: this._buildChannel(this.modelChannel, this.actions.GET_PROPERTY_SCHEMA)
			}]);
		},

		_deleteModelSubscriptionAndPublications: function() {

			this._modelSubscriptions && this._removeSubscriptions(this._modelSubscriptions);
			this._modelPublications && this._removePublications(this._modelPublications);
		},

		_subDoBeforeGoingNextStep: function() {

			var dfd = new Deferred();

			dfd.then(lang.hitch(this, this._emitEvt, "BEFORE_GOING_NEXT_STEP_DONE"));

			if (this._beforeGoingNextStepDfd) {
				console.error("Tried to do actions before going to next step twice, in '%s' step, at module '%s'",
					this.stepId, this.getChannel());

				dfd.reject();
			} else {
				this._beforeGoingNextStepDfd = dfd;
				this._beforeGoingNextStep();
			}
		},

		_beforeGoingNextStep: function() {

			this._fulfillBeforeGoingNextStepDfd(true);
		},

		_fulfillBeforeGoingNextStepDfd: function(success) {

			this._beforeGoingNextStepDfd[success ? "resolve" : "reject"]();
			delete this._beforeGoingNextStepDfd;
		},

		_subFlush: function() {

			this._doFlush();
		},

		_doFlush: function() {

			var obj = {
				step: this.stepId,
				results: this.getStepResults(),
				status: this.statusStep
			};

			this._emitEvt('FLUSH', obj);
		},

		_subShowStep: function(req) {

			var node = req.node,
				data = req.data,
				editing = req.editing,
				direction = req.direction,
				success = req.success || !(editing && this.noEditable),
				pubObj = {
					success: success,
					stepLabel: this.label
				};

			if (success) {
				pubObj.stepId = this.stepId;

				this._once(this.getChannel('SHOWN'), lang.hitch(this, this._emitEvt, 'STEP_SHOWN', pubObj));

				this._publish(this.getChannel('SHOW'), {
					node: node,
					data: data
				});
			} else {
				if (direction === "n") {
					pubObj.stepId = this._getNextStepId(this.stepId, this._getWizardResults());
				} else if (direction === "p") {
					pubObj.stepId = this._getPrevStepId(this.stepId, this._getWizardResults());
				}

				this._emitEvt('STEP_SHOWN', pubObj);
			}
		},

		_subGetNextStep: function(req) {

			var stepId = this._getNextStepId(this.stepId, this._getWizardResults());

			this._emitGotStep('GOT_NEXT_STEP', stepId);
		},

		_subGetPrevStep: function(req) {

			var stepId = this._getPrevStepId(this.stepId, this._getWizardResults());

			this._emitGotStep('GOT_PREV_STEP', stepId);
		},

		_emitGotStep: function(evtName, stepId) {


			var isDfd = stepId && !!stepId.then;

			if (isDfd) {
				stepId.then(lang.hitch(this, function(evt, stepIdResolved) {
					this._emitEvt(evt, { stepId: stepIdResolved });
				}, evtName));
			} else {
				this._emitEvt(evtName, { stepId: stepId });
			}
		},

		_subRefreshTrace: function(res) {

			this._wizardStepsTrace = res.trace;

			this._onRefreshTrace(res);
		},

		_subNewAdditionalData: function(res) {

			this._additionalData = res;

			this._newAdditionalData(res);
		},

		_subNewResults: function(res) {

			this._wizardResults = res.results;

			this._onNewResults(res);
		},

		_subRefreshData: function(req) {

			var data = req.data;
			data && this._instanceDataToResult(data);
		},

		_subRefreshStatus: function(req) {

			this._emitEvt('REFRESH_STATUS');
		},

		_subValidationErrorsChanged: function(res) {

			this._evaluateValidationErrors(res);
		},

		_subWasValid: function(res) {

			this._evaluateValidationErrors(res);
		},

		_subValueChanged: function(res) {

			this._emitEvt('REFRESH_STATUS');

			this._valueChanged(res);
		},

		_evaluateValidationErrors: function(obj) {

			var errors = obj.errors || {},
				propErrors = errors[this.propertyName],
				oldIsValidProperty = this._isValidProperty;

			this._isValidProperty = !propErrors;

			if ((/true/i).test(redmicConfig.getEnvVariableValue('envDebug'))) {
				console.warn('Wizard step validation', {
					property: this.propertyName,
					isValid: this._isValidProperty,
					validation: JSON.parse(JSON.stringify(propErrors || {})),
					channel: this.getChannel()
				});
			}

			if (oldIsValidProperty !== this._isValidProperty) {
				this._emitEvt('REFRESH_STATUS');
			}
		},

		_pubNewStatus: function(channel, req) {

			if (this.propertyName && this.modelChannel && this._isValidProperty === undefined) {
				this._emitEvt('IS_VALID');
				return;
			}

			var step, status, results;

			if (!req) {
				req = {};
			}

			if (req.stepId) {
				step = req.stepId;
			} else {
				step = this.stepId;
			}

			if (req.status) {
				status = req.status;
			} else {
				status = (!(this.propertyName && this.modelChannel) ||
				this._isValidProperty) && this.isStepCompleted(this._wizardResults, this.skippable);
			}

			if (req.results) {
				results = req.results;
			} else {
				results = status ? this.getStepResults() : null;
			}

			this.statusStep = status;

			this._publish(channel, {
				step: step,
				status: status,
				results: results
			});
		},

		isStepCompleted: function(results, skippable) {

			return skippable || this._isCompleted;
		},

		getStepResults: function() {

			return this._results;
		},

		_getWizardResults: function() {

			return this._wizardResults;
		},

		_chkGotIdProperty: function(req) {

			return req.property === this.propToRead;
		},

		_chkGotPropertySchema: function(res) {

			var propName = res.propertyName;

			if (!propName || !this.propToRead) {
				return false;
			}

			return propName === this.propToRead || propName.indexOf(this.propToRead) === 0;
		},

		_containedPropertyIsMine: function(obj) {

			return obj[this.propertyName] !== undefined;
		},

		_subGotIdProperty: function(req) {

			this._gotIdProperty(req.value);
		},

		_subGotPropertySchema: function(res) {

			this._onGotPropertySchema(res.schema);
		},

		_getNextStepId: function() {

			if (this.getNextStepId) {
				if (typeof this.getNextStepId === "string") {
					return this.getNextStepId;
				} else {
					return this.getNextStepId(arguments);
				}
			}

			var id = parseInt(this.stepId, 10),
				nextStepId = id + 1;

			return nextStepId.toString();
		},

		_getPrevStepId: function() {

			var ret;

			if (this._wizardStepsTrace) {
				var pos = this._wizardStepsTrace.indexOf(this.stepId);
				if (pos > 0) {
					ret = this._wizardStepsTrace[pos - 1];
				}
			}

			return ret;
		},

		_subReset: function(req) {

			this._resetWizardStep(req.initialData);
		},

		_resetWizardStep: function(initialData) {

			this._internalResetStep();
			this._resetStep(initialData);

			this._emitEvt('REFRESH_STATUS');
		},

		_internalResetStep: function() {

			if (!this.propertyName) {
				return;
			}

			this._emitEvt('MODEL_RESET', {
				properties: [this.propertyName]
			});
		},

		_subClear: function() {

			this._clearWizardStep();
		},

		_clearWizardStep: function() {

			this._internalClearStep();
			this._clearStep();

			this._emitEvt('REFRESH_STATUS');
		},

		_internalClearStep: function() {

			this._isCompleted = false;
			this._results = null;

			if (!this.propertyName) {
				return;
			}

			this._emitEvt('MODEL_CLEAR', {
				properties: [this.propertyName]
			});
		}
	});
});
