define([
	"dijit/layout/BorderContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/keys"
	, "dojo/Deferred"
	, "put-selector/put"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "src/component/model/ModelImpl"
	, "./_WizardStep"
], function(
	BorderContainer
	, declare
	, lang
	, keys
	, Deferred
	, put
	, _Module
	, _Show
	, ModelImpl
	, _WizardStep
){
	return declare([_Module, _Show], {
		//	summary:
		//		Secuenciador de vistas ordenadas. Asistente.
		//	description:
		//		Ayuda al usuario para completar una tarea paso a paso.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				events: {
					ALL_STEPS_DONE: "allStepsDone",
					NEW_RESULTS: "newResults",
					NEW_ADDITIONAL_DATA: "newAdditionalData",
					SERIALIZE: "serialize",
					HAS_CHANGED: "hasChanged",
					REFRESH_STATUS: "refreshStatus",
					REFRESH_DATA: "refreshData",
					REFRESH_TRACE: "refreshTrace"
				},
				actions: {
					NEXT_STEP: "nextStep",
					PREV_STEP: "prevStep",
					GO_TO_STEP: "goToStep",
					CONFIRM_STEPS: "confirmSteps",
					STEPS_CONFIRMED: "stepsConfirmed",
					SERIALIZE: "serialize",
					SERIALIZED: "serialized",
					DESERIALIZE: "deserialize",
					CLEAR: "clear",
					IS_VALID: "isValid",
					NEW_ADDITIONAL_DATA: "newAdditionalData",
					WAS_VALID: "wasValid",
					COMPLETE_WIZARD_BY_STEP: "completeWizardByStep",
					NEW_STATUS: "newStatus",
					HAS_CHANGED: "hasChanged",
					WAS_CHANGED: "wasChanged",
					CLEAR_TRACE: "clearTrace",
					UPDATE_TRACE: "updateTrace"
				},
				ownChannel: "wizard",
				notCancel: false,
				noTitle: false,
				title: "Wizard",
				containerClass: "wizard",
				containerContentClass: "wizardContent",
				wizardLabelClass: "wizardLabel",
				stepLabelClass: "wizardStepLabel",
				contentClass: "wizardStepContent",
				steps: {},
				checkpoints: {},
				_stepsTrace: [],
				_additionalData: {},
				currentStep: "0",
				_stepInstances: {},
				_subscriptionsToSteps: {},
				_publicationsToSteps: {},
				_initialData: null,
				_stepsResults: {},
				_stepStatuses: {},
				_skippableSteps: {},
				_visitedSteps: {},
				_getNextStepIdFunctions: {},
				_getPrevStepIdFunctions: {},
				_stepInstancesByFlush: {}
			};

			lang.mixin(this, this.config, args);

			this._defaultCurrentStep = this.currentStep;

			this._defaultStepStatuses = this._stepStatuses;
		},

		_initialize: function() {

			if (!this.modelChannel && (this.modelSchema || this.modelTarget)) {

				this.modelInstance = new ModelImpl({
					parentChannel: this.getChannel(),
					schema: this.modelSchema,
					target: this.modelTarget
				});

				this.modelChannel = this.modelInstance.getChannel();
			}
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("NEXT_STEP"),
				callback: "_subNextStep"
			},{
				channel : this.getChannel("PREV_STEP"),
				callback: "_subPrevStep"
			},{
				channel : this.getChannel("GO_TO_STEP"),
				callback: "_subGoToStep"
			},{
				channel : this.getChannel("UPDATE_TRACE"),
				callback: "_subUpdateTrace"
			},{
				channel : this.getChannel("CLEAR_TRACE"),
				callback: "_subClearTrace"
			},{
				channel : this.getChannel("NEW_ADDITIONAL_DATA"),
				callback: "_subNewAdditionalData"
			},{
				channel : this.getChannel("CONFIRM_STEPS"),
				callback: "_subConfirmSteps",
				options: {
					predicate: lang.hitch(this, this._allStepsDone)
				}
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel : this.getChannel("COMPLETE_WIZARD_BY_STEP"),
				callback: "_subCompleteWizardByStep"
			},{
				channel : this.getChannel("NEW_STATUS"),
				callback: "_subStepNewStatus"
			});

			if (this.modelChannel) {
				this.subscriptionsConfig.push({
					channel : this._buildChannel(this.modelChannel, this.actions.WAS_VALID),
					callback: "_subModelWasValid",
					options: {
						predicate: lang.hitch(this, this._chkModelWasValid)
					}
				},{
					channel : this._buildChannel(this.modelChannel, this.actions.WAS_CHANGED),
					callback: "_subWasChanged"
				});
			}
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ALL_STEPS_DONE',
				channel: this.getChannel("STEPS_CONFIRMED")
			});

			if (this.modelChannel) {
				this.publicationsConfig.push({
					event: 'SERIALIZE',
					channel: this._buildChannel(this.modelChannel, this.actions.SERIALIZE)
				},{
					event: 'HAS_CHANGED',
					channel: this._buildChannel(this.modelChannel, this.actions.HAS_CHANGED)
				});
			}
		},

		_setOwnCallbacksForEvents: function() {

			this.on("title" + this.propSetSuffix, this._setTitle);

			this._onEvt('SHOW', lang.hitch(this, this._loadInitialStep));
			this._onEvt('HIDE', lang.hitch(this, this._clear));
			//this._onEvt('ANCESTOR_SHOW', lang.hitch(this, this._loadInitialStep));
			//this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._clear));
		},

		_loadInitialStep: function() {

			this._showStep(this.currentStep, "n");
		},

		postCreate: function() {

			this.container = put("div[tabindex=0]." + this.containerClass);

			this._setTitle(this.title);

			this.wizardContentNode = put(this.container, "div." + this.containerContentClass);

			this.stepLabelNode = put(this.wizardContentNode, "div." + this.stepLabelClass);

			this.contentNode = put(this.wizardContentNode, "div." + this.contentClass);

			//this.container.onkeyup = lang.hitch(this, this._eventKeyCode);
		},

		_getStepInstance: function(id) {

			return this._stepInstances[id] || this._createStepInstance(id);
		},

		_createStepInstance: function(id) {

			var stepObj = this._getStepConfig(id),
				stepDefinition = stepObj.definition,
				skippable = stepObj.skippable,
				getNextStepId = stepObj.getNextStepId,
				getPrevStepId = stepObj.getPrevStepId;

			if (stepDefinition) {

				var stepProps = this._buildStepProps(id);

				if (skippable) {

					this._setSkippableStep(id);
				}

				if (getNextStepId) {

					if (typeof getNextStepId === "string") {

						this._getNextStepIdFunctions[id] = lang.partial(function(key) { return key; }, getNextStepId);
					} else {

						this._getNextStepIdFunctions[id] = getNextStepId;
					}
				}

				if (getPrevStepId) {

					if (typeof getPrevStepId === "string") {

						this._getPrevStepIdFunctions[id] = lang.partial(function(key) { return key; }, getPrevStepId);
					} else {

						this._getPrevStepIdFunctions[id] = getPrevStepId;
					}
				}

				return this._loadStep(id, stepDefinition, stepProps);
			}
		},

		_buildStepProps: function(id) {

			var stepObj = this._getStepConfig(id),
				skippable = stepObj.skippable,
				isStepCompleted = stepObj.isStepCompleted,
				getStepResults = stepObj.getStepResults,
				noEditable = stepObj.noEditable,
				stepProps = {
					stepId: id.toString(),
					parentChannel: this.getChannel(),
					region: 'center',
					skippable: !!skippable,
					noEditable: !!noEditable,
					getNextStepId: stepObj.getNextStepId,
					getPrevStepId: stepObj.getPrevStepId,
					_additionalData: this._getAdditionalData()
				};

			if (this.modelChannel) {
				stepProps.modelChannel = this.modelChannel;
			}

			if (isStepCompleted) {
				stepProps.isStepCompleted = isStepCompleted;
			}

			if (getStepResults) {
				stepProps.getStepResults = getStepResults;
			}

			return stepProps;
		},

		_getStepConfig: function(id) {

			return this.steps[id] || {};
		},

		/*_eventKeyCode: function(evt) {

			if (evt.ctrlKey) {

				if (evt.keyCode === keys.RIGHT_ARROW) {

					this._goToNextStep();
				} else if (evt.keyCode === keys.LEFT_ARROW) {

					this._goToPrevStep();
				}
			}
		},*/

		_beforeShow: function(req) {

			var data = req.data;

			if (data) {
				if (data.id) {
					this._editing = true;

					if (!this.noTitle) {
						this._setTitle(this.editionTitle, data);
					}
				}

				this._instanceDataToResults(data);
			}
		},

		_setTitle: function(obj, data) {

			if (!obj) {
				return;
			}

			var title, subTitle;

			if (obj instanceof Object) {
				if (obj.value)
					obj = obj.value;

				title = obj.primary;
				subTitle = obj.secondary;
			} else {
				title = obj;
			}

			if (!this.wizardContainerLabelNode) {
				this.wizardContainerLabelNode = put(this.container, "div." + this.wizardLabelClass);
			}

			this.wizardLabelNode = this._processLabelTitle(title, this.wizardLabelNode, data);
			this.wizardSubLabelNode = this._processLabelTitle(subTitle, this.wizardSubLabelNode, data);
		},

		_processLabelTitle: function(text, node, data) {

			if (text) {
				if (data) {
					text = lang.replace(text, data);
				}

				if (!node && this.wizardContainerLabelNode) {
					node = put(this.wizardContainerLabelNode, "div", text);
				} else {
					node.innerHTML = text;
				}

				put(node, "[title=$]", text);

				return node;
			}
		},

		getNodeToShow: function() {

			return this.container;
		},

		_publishToStep: function(stepInstance, action, obj) {

			this._publish(stepInstance.getChannel(action), obj);
		},

		_loadStep: function(stepId, stepDefinition, stepProps) {

			lang.mixin(stepProps, this.steps[stepId].props);

			var StepDefinition = declare([_WizardStep, stepDefinition]),
				stepInstance = new StepDefinition(stepProps);

			this._stepInstances[stepId] = stepInstance;

			this._doSubscriptionsToStep(stepId, stepInstance);
			this._preparePublicationsToStep(stepId, stepInstance);
			this._doPublicationsToStep(stepId, stepInstance);

			return stepInstance;
		},

		_doSubscriptionsToStep: function(stepId, stepInstance) {

			this._subscriptionsToSteps[stepId] = this._setSubscriptions([{
				channel : stepInstance.getChannel("NEW_STATUS"),
				callback: "_subStepNewStatus"
			},{
				channel : stepInstance.getChannel("GO_FORWARD"),
				callback: "_subStepGoForward"
			}]);
		},

		_preparePublicationsToStep: function(stepId, stepInstance) {

			this._publicationsToSteps[stepId] = this._setPublications([{
				event: 'REFRESH_TRACE',
				channel: stepInstance.getChannel("REFRESH_TRACE")
			},{
				event: 'NEW_RESULTS',
				channel: stepInstance.getChannel("NEW_RESULTS")
			},{
				event: 'NEW_ADDITIONAL_DATA',
				channel: stepInstance.getChannel("NEW_ADDITIONAL_DATA")
			},{
				event: 'REFRESH_DATA',
				channel: stepInstance.getChannel("REFRESH_DATA")
			},{
				event: 'REFRESH_STATUS',
				channel: stepInstance.getChannel("REFRESH_STATUS")
			}]);
		},

		_doPublicationsToStep: function(stepId, stepInstance) {

			this._publish(stepInstance.getChannel("NEW_RESULTS"), {
				results: this._getStepsResults(),
				lastUpdatedStepId: this.currentStep
			});

			//this._additionalData && this._publish(stepInstance.getChannel("NEW_ADDITIONAL_DATA"), this._additionalData);

			this._initialData && this._publishDataToStep(stepInstance, this._initialData);

			this.modelChannel && this._publish(this._buildChannel(this.modelChannel, this.actions.IS_VALID));
			this._publish(stepInstance.getChannel("REFRESH_STATUS"));
		},

		_publishDataToStep: function(stepInstance, data) {

			this._publishToStep(stepInstance, "REFRESH_DATA", {
				data: data
			});
		},

		_showStep: function(id, /*String*/ direction) {

			var stepInstance = this._getStepInstance(id);

			if (!stepInstance) {
				return;
			}

			this._emitEvt("LOADING");

			this._once(stepInstance.getChannel("STEP_SHOWN"), lang.hitch(this, this._onceStepShown, direction));

			this._publishToStep(stepInstance, "SHOW_STEP", {
				node: this.contentNode,
				data: lang.clone(this.currentData),
				editing: !!this._editing,
				direction: direction
			});
		},

		_onceStepShown: function(direction, res) {

			var stepId = res.stepId,
				stepLabel = res.stepLabel,
				success = res.success;

			if (success) {

				direction === "n" && this._updateStepsTrace(stepId, stepLabel, false);
				this._onStepShownSuccessfully(stepId, stepLabel);
			} else {

				this._showStep(stepId, direction);
			}

			this._emitEvt("LOADED");
		},

		_subClearTrace: function() {

			this._emitEvt("REFRESH_TRACE", {
				removedCount: this._stepsTrace.length
			});

			this._stepsTrace = [];
		},

		_subUpdateTrace: function(res) {

			var stepId = res.stepId || this.currentStep,
				deleteNextsSteps = res.deleteNextsSteps,
				stepLabel = res.stepLabel || '';

			this._updateStepsTrace(stepId, stepLabel, deleteNextsSteps);
		},

		_updateStepsTrace: function(stepId, stepLabel, deleteNextsSteps) {

			var updateObj = this._updateStepsTraceWhenGoingForward(stepId, deleteNextsSteps);

			if (!Object.keys(updateObj).length) {
				return;
			}

			var pubObj = {
				trace: this._stepsTrace
			};

			if (updateObj.added) {

				pubObj.added = {
					id: updateObj.added,
					label: stepLabel
				};
			}

			if (updateObj.removedCount) {

				pubObj.removedCount = updateObj.removedCount;
			}

			this._emitEvt("REFRESH_TRACE", pubObj);
		},

		_updateStepsTraceWhenGoingForward: function(newStepId, deleteNextsSteps) {

			var posCurrentStep = this._stepsTrace.indexOf(this.currentStep),
				updateObj = {};

			if (posCurrentStep < 0 || posCurrentStep === this._stepsTrace.length - 1) {

				this._addStepToTrace(newStepId, updateObj);
			} else if (deleteNextsSteps && this._stepsTrace[posCurrentStep] === newStepId) {

				this._deleteStepsTraceItemsFromPositionToEnd(posCurrentStep, updateObj);
			}  else if (this._stepsTrace[posCurrentStep + 1] !== newStepId) {

				this._deleteStepsTraceItemsFromPositionToEnd(posCurrentStep, updateObj);
				this._addStepToTrace(newStepId, updateObj);
			}

			return updateObj;
		},

		_addStepToTrace: function(stepId, updateObj) {

			this._stepsTrace.push(stepId);

			updateObj.added = stepId;
		},

		_deleteStepsTraceItemsFromPositionToEnd: function(posCurrentStep, updateObj) {

			var posCurrentStepPlusOne = posCurrentStep + 1;

			while (posCurrentStepPlusOne !== this._stepsTrace.length) {

				this._removeStepFromTrace(updateObj);
			}
		},

		_removeStepFromTrace: function(updateObj) {

			this._stepsTrace.pop();

			if (!updateObj.removedCount) {
				updateObj.removedCount = 0;
			}

			updateObj.removedCount++;
		},

		_onStepShownSuccessfully: function(stepId, stepLabel) {

			if (this.currentStep.toString() !== stepId) {
				this._hideStep(this.currentStep);
				this.currentStep = stepId;
			}

			this._setVisitedStep(stepId);
			this._setLabel(stepLabel, stepId);
		},

		_setVisitedStep: function(id) {

			this._visitedSteps[id] = true;
		},

		_getVisitedStep: function(id) {

			return !!this._visitedSteps[id];
		},

		_hideStep: function(id, mustClear) {

			var stepInstance = this._getStepInstance(id);

			if (!stepInstance) {
				return;
			}

			mustClear && this._publishToStep(stepInstance, "CLEAR");

			this._publishToStep(stepInstance, "HIDE");
		},

		_hideAllSteps: function(mustClear) {

			for (var id in this._stepInstances) {

				this._hideStep(id, mustClear);
			}
		},

		_setLabel: function(label, stepId) {

			this.stepLabelNode.innerHTML = label;
		},

		_subCompleteWizardByStep: function(res) {

			this._idStepCompleteWizard = res.idStep;
		},

		_nextStepIsAllowed: function() {

			var dfd = new Deferred();

			if (!this._getStepStatus(this.currentStep) || this.currentStep === this._idStepCompleteWizard) {
				dfd.resolve(false);

				return dfd;
			}

			var getNextStepIdFunction = this._getNextStepIdFunctions[this.currentStep];

			if (!getNextStepIdFunction) {
				var stepInstance = this._getStepInstance(this.currentStep);

				if (stepInstance) {
					this._once(stepInstance.getChannel("GOT_NEXT_STEP"), lang.hitch(this,
						this._onceGotStepResolveWithIt, dfd));

					this._publishToStep(stepInstance, "GET_NEXT_STEP", {
						editing: !!this._editing
					});

					return dfd;
				}
			} else {
				var nextStepId = getNextStepIdFunction(this.currentStep, this._getStepsResults());

				dfd.resolve(nextStepId);

				return dfd;
			}

			dfd.resolve(true);
			return dfd;
		},

		_onceGotStepResolveWithIt: function(dfd, res) {

			var stepId = res.stepId,
				isValid = !!this.steps[stepId];

			dfd.resolve(isValid ? stepId : false);
		},

		_subNextStep: function(req) {

			this._goToNextStep();
		},

		_goToNextStep: function() {

			var tryToGoNext = lang.hitch(this, this._tryToGo, this._nextStepIsAllowed, this._reallyGoToNextStep);

			if (this.checkpoints[this.currentStep]) {
				this._runCheckpoint(tryToGoNext);
			} else {
				tryToGoNext();
			}
		},

		_runCheckpoint: function(tryToGoNext) {

			this._emitEvt("LOADING");

			var dfd = new Deferred();

			dfd.then(lang.hitch(this, this._afterCheckpoint, tryToGoNext, this.currentStep));

			this._stepInstanceByCheckpoint();

			this._flushSteps(lang.partial(this.checkpoints[this.currentStep], this, dfd));
		},

		_stepInstanceByCheckpoint: function() {

			var key;

			this._stepInstancesByFlush = {};

			for (var i = 0; i < this._stepsTrace.length; i++) {
				key = this._stepsTrace[i];

				this._stepInstancesByFlush[key] = true;

				if (key === this.currentStep) {
					break;
				}
			}
		},

		_afterCheckpoint: function(tryToGoNext, stepId, obj) {

			this._emitEvt("LOADED");

			if (!obj.success) {
				return;
			}

			tryToGoNext();

			var data = obj.data;

			if (data) {
				var additionalDataId = stepId;
				if (data.id) {
					additionalDataId = data.id;
				}

				this._setAdditionalData(data, additionalDataId);
			}
		},

		_tryToGo: function(allowedCbk, goCbk) {

			lang.hitch(this, allowedCbk)().then(lang.hitch(this, function(value) {

				if (!value) {
					console.error("Tried to go to disallowed or nonexistent step from step '%s' at module '%s'",
						this.currentStep, this.getChannel());
				} else {
					lang.hitch(this, goCbk)(value);
				}
			}));
		},

		_reallyGoToNextStep: function(nextStepId) {

			if (nextStepId) {

				var currentStepInstance = this._getStepInstance(this.currentStep);

				this._once(currentStepInstance.getChannel("BEFORE_GOING_NEXT_STEP_DONE"),
					lang.hitch(this, this._showStep, nextStepId, "n"));

				this._publishToStep(currentStepInstance, "DO_BEFORE_GOING_NEXT_STEP");
			}
		},

		_prevStepIsAllowed: function() {

			var dfd = new Deferred(),
				stepInstance = this._getStepInstance(this.currentStep);

			if (stepInstance) {
				this._once(stepInstance.getChannel("GOT_PREV_STEP"), lang.hitch(this, this._onceGotStepResolveWithIt,
					dfd));

				this._publishToStep(stepInstance, "GET_PREV_STEP", {
					editing: !!this._editing
				});

				return dfd;
			}

			dfd.resolve(true);

			return dfd;
		},

		_subPrevStep: function(req) {

			this._goToPrevStep();
		},

		_goToPrevStep: function() {

			this._tryToGo(this._prevStepIsAllowed, this._reallyGoToPrevStep);
		},

		_reallyGoToPrevStep: function(prevStepId) {

			if (prevStepId) {

				this._showStep(prevStepId, "p");
			}
		},

		_goToStepIsAllowed: function(req) {

			var stepId = req.stepId,
				dfd = new Deferred();

			if (!this.steps[stepId]) {

				dfd.reject();
				return dfd;
			}

			this._checkRequiredPreviousStepUnvisited(stepId).then(
				lang.partial(function(dfd) { dfd.reject(); }, dfd),
				lang.partial(function(dfd) { dfd.resolve(); }, dfd));

			return dfd;
		},

		_checkRequiredPreviousStepUnvisited: function(stepId) {

			var stepInstance = this._getStepInstance(stepId),
				dfd = new Deferred();

			if (!stepInstance) {

				dfd.resolve();
			} else {

				this._checkPreviousSteps(stepId, stepInstance, dfd);
			}

			return dfd;
		},

		_checkPreviousSteps: function(stepId, stepInstance, dfd) {

			if (!stepInstance) {

				dfd.resolve();
				return;
			}

			if (stepId === this._defaultCurrentStep) {

				dfd.reject();
				return;
			}

			this._once(stepInstance.getChannel("GOT_PREV_STEP"),
				lang.hitch(this, this._listenOncePreviousStep, stepInstance, dfd));

			this._publishToStep(stepInstance, "GET_PREV_STEP", {
				stepId: stepId,
				stepsResults: this._getStepsResults()
			});
		},

		_listenOncePreviousStep: function(stepInstance, dfd, res) {

			var prevStepId = res.stepId;

			if (!prevStepId || prevStepId === this._defaultCurrentStep) {

				dfd.reject();
				return;
			}

			if ((!this._getSkippableStep(prevStepId) && !this._getVisitedStep(prevStepId))) {

				dfd.resolve();
				return;
			}

			this._checkPreviousSteps(prevStepId, this._getStepInstance(prevStepId), dfd);
		},

		_setSkippableStep: function(id) {

			this._skippableSteps[id] = true;
		},

		_getSkippableStep: function(id) {

			return !!this._skippableSteps[id];
		},

		_subGoToStep: function(req) {

			this._goToStepIsAllowed(req).then(lang.hitch(this, this._goToStep, req.stepId, req.updateTrace), function(){});
		},

		_goToStep: function(stepId, updateTrace) {

			if (!this.steps[stepId] || this.currentStep === stepId) {
				return;
			}

			this._hideStep(this.currentStep);
			this._showStep(stepId, "s");

			updateTrace && this._updateStepsTrace(stepId, "", true);
		},

		_subStepNewStatus: function(res) {

			var status = res.status,
				stepId = res.step,
				results = res.results;

			this._setStepStatus(stepId, status);
			this._setStepResults(stepId, results);

			this._emitEvt('NEW_RESULTS', {
				results: this._getStepsResults(),
				lastUpdatedStepId: stepId
			});

			this.modelChannel && this._emitEvt("HAS_CHANGED");
		},

		_subNewAdditionalData: function(res) {

			this._setAdditionalData(res.data, res.id);
		},

		_setStepStatus: function(stepId, status) {

			this._stepStatuses[stepId] = status;
		},

		_getStepStatus: function(id) {

			return this._stepStatuses[id];
		},

		_getStepResults: function(id) {

			return this._stepsResults[id];
		},

		_getStepsResults: function() {

			return this._stepsResults || {};
		},

		_getAdditionalData: function() {

			return this._additionalData || {};
		},

		_setAdditionalData: function(data, additionalDataId) {

			this._additionalData[additionalDataId] = data;

			this._emitEvt("NEW_ADDITIONAL_DATA", this._additionalData);
		},

		_setStepResults: function(id, results) {

			this._stepsResults[id] = results;
		},

		_chkModelWasValid: function(res) {

			return !res.propertyName;
		},

		_subModelWasValid: function(res) {

			var isValid = res.isValid;

			this._modelWasValid = isValid;
		},

		_subWasChanged: function(res) {

			this._modelHasChanged = res.hasChanged;

			this._onModelWasChanged && this._onModelWasChanged(res);
		},

		_allStepsDone: function() {

			if (!this._idStepCompleteWizard && (!this.modelChannel || !this._modelWasValid)) {
				for (var id in this.steps) {
					if (!this._getStepStatus(id) && !this._getSkippableStep(id)) {
						return false;
					}
				}
			}

			return this.modelChannel ? this._modelWasValid && this._modelHasChanged : true;
		},

		_subConfirmSteps: function() {

			this._confirmSteps();
		},

		_confirmSteps: function() {

			this._emitEvt('LOADING');

			this._stepInstancesByFlush = this._stepInstances;

			this._flushSteps(lang.hitch(this, this._flushedComplete));
		},

		_flushSteps: function(callback) {

			this.stepsFlushed = {};

			for (var key in this._stepInstancesByFlush) {

				var stepInstance = this._getStepInstance(key);

				this._once(stepInstance.getChannel("FLUSHED"), lang.hitch(this, this._subStepFlushed, callback));

				this._publishToStep(stepInstance, "FLUSH");
			}
		},

		_subStepFlushed: function(callback, res) {

			var stepId = res.step,
				status = res.status,
				results = res.results;

			if (!status) {
				this._flushedIncomplete(stepId, res.error);
				return;
			}

			this._setStepResults(stepId, results);
			this.stepsFlushed[stepId] = true;

			if (Object.keys(this.stepsFlushed).length === Object.keys(this._stepInstancesByFlush).length) {
				callback(this._getStepsResults());
			}
		},

		_flushedIncomplete: function(stepId, error) {

			this._goToStep(stepId, false);

			this._emitEvt('LOADED');

			var description = "Error on step " + stepId + '. ';

			if (error && error.description) {
				description += error.description;
			}

			this._emitEvt('COMMUNICATION', {
				level: "error",
				description: description
			});
		},

		_flushedComplete: function(results) {

			if (this.modelChannel) {

				this._once(this._buildChannel(this.modelChannel, this.actions.SERIALIZED),
					lang.hitch(this, this._subSerialized));

				this._emitEvt('SERIALIZE');
			} else {

				this._emitEvt('ALL_STEPS_DONE', {
					data: this.resultsToInstanceData(this._getStepsResults())
				});

				this._emitEvt('LOADED');
			}
		},

		_subStepGoForward: function(req) {

			this._goToNextStep();
		},

		_subSerialized: function(res) {

			this._emitEvt('ALL_STEPS_DONE', {
				data: this.resultsToInstanceData(res.data)
			});

			this._emitEvt('LOADED');
		},

		resultsToInstanceData: function(results) {

			return results;
		},

		_subClear: function(res) {

			if (res && res.steps) {
				this._clearSteps(res.steps);
			} else {
				this._clear();
			}
		},

		_clearSteps: function(obj) {

			for (var i = 0; i < obj.length; i++) {
				this._clearStep(obj[i]);
			}
		},

		_clear: function() {

			this._hideAllSteps(true);

			this.currentStep = this._defaultCurrentStep;
			this._stepsResults = {};
			this._stepStatuses = this._defaultStepStatuses;
			this._visitedSteps = {};
			this._stepsTrace = [];

			if (this.modelChannel) {
				this._publish(this._buildChannel(this.modelChannel, this.actions.CLEAR));
			}
		},

		_instanceDataToResults: function(data) {

			this._initialData = data;

			if (this.modelChannel) {

				this._publish(this._buildChannel(this.modelChannel, this.actions.DESERIALIZE), {
					data: data,
					toInitValues: true
				});

				this._stepInstances[this.currentStep] &&
					this._doPublicationsToStep(this.currentStep, this._stepInstances[this.currentStep]);

			} else {
				this._emitEvt("REFRESH_DATA", {
					data: data
				});
			}
		},

		_clearStep: function(stepId) {

			if (!this._stepInstances[stepId]) {
				return;
			}

			var stepInstance = this._getStepInstance(stepId);

			stepInstance && this._publishToStep(stepInstance, "CLEAR");

			//this._initialData = null;
		},

		_resetStep: function(stepId) {

			var stepInstance = this._getStepInstance(stepId);

			stepInstance && this._publishToStep(stepInstance, "RESET", {
				initialData: this._initialData
			});
		}

	});
});
