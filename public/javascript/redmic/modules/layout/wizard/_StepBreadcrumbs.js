define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function(
	declare
	, lang
	, aspect
	, put
){
	return declare(null, {
		//	summary:
		//		Extensión de Wizard para poder ver los pasos existentes.
		//	description:
		//		Añade una barra de breadcrumbs de los pasos y permite volver a los ya resueltos.

		constructor: function(args) {

			this._stepBreadcrumbsConfig = {
				breadcrumbsClass: "wizardBreadcrumbs",
				breadcrumbClass: "wizardBreadcrumb",
				breadcrumbStatusClass: "statusIndicator",
				breadcrumbCurrentClass: "current",
				breadcrumbVisitedClass: "visited",
				breadcrumbDisabledClass: "disabled",
				breadcrumbResolvedClass: "resolved",

				_breadcrumbs: []
			};

			lang.mixin(this, this._stepBreadcrumbsConfig, args);

			aspect.after(this, "_initialize", lang.hitch(this, this._initializeStepBreadcrumbs));
			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setStepBreadcrumbsOwnCallbacksForEvents));
			aspect.after(this, "_onStepShownSuccessfully",
				lang.hitch(this, this._onStepShownSuccessfullyStepBreadcrumbs));
			//aspect.after(this, "_flushedComplete", lang.hitch(this, this._flushedCompleteStepBreadcrumbs));
			aspect.after(this, "_clear", lang.hitch(this, this._clearStepBreadcrumbs));
		},

		_initializeStepBreadcrumbs: function() {

			this.breadcrumbsNode = put("ol." + this.breadcrumbsClass);
		},

		_setStepBreadcrumbsOwnCallbacksForEvents: function() {

			this._onEvt('NEW_RESULTS', lang.hitch(this, this._stepBreadcrumbsEvaluateStepsStatus));
			this._onEvt('REFRESH_TRACE', lang.hitch(this, this._stepBreadcrumbsRefreshTrace));
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.stepLabelNode, "-", this.breadcrumbsNode);
			put("!", this.stepLabelNode);
		},

		_onStepShownSuccessfullyStepBreadcrumbs: function() {

			this._stepBreadcrumbsEvaluateStepsStatus();
		},

		_stepBreadcrumbsRefreshTrace: function(req) {

			var stepAdded = req.added,
				stepsRemoved = req.removedCount;

			stepsRemoved && this._removeStepBreadcrumbs(stepsRemoved);
			stepAdded && this._addStepBreadcrumb(stepAdded);
		},

		_removeStepBreadcrumbs: function(stepsRemoved) {

			for (var i = 0; i < stepsRemoved; i++) {

				this._deleteStepBreadcrumb(this._breadcrumbs.pop());
			}
		},

		_deleteStepBreadcrumb: function(breadcrumbObj) {

			var node = breadcrumbObj.box;

			put(node, "!");
		},

		_addStepBreadcrumb: function(stepAdded) {

			var stepId = stepAdded.id,
				stepLabel = stepAdded.label;

			if (!this._editing || !this.steps[stepId].noEditable) {

				this._createBreadcrumb(stepLabel, stepId);
			}
		},

		_createBreadcrumb: function(label, stepId) {

			var box = put(this.breadcrumbsNode, "li." + this.breadcrumbClass),
				content = put(box, "span." + this.breadcrumbDisabledClass, label),
				status = put(content, "div." + this.breadcrumbStatusClass);

			this._breadcrumbs.push({
				stepId: stepId,
				box: box,
				content: content,
				status: status
			});
		},

		_stepBreadcrumbsEvaluateStepsStatus: function() {

			for (var i = 0; i < this._breadcrumbs.length; i++) {

				this._stepBreadcrumbsEvaluateStepStatus(this._breadcrumbs[i]);
			}
		},

		_stepBreadcrumbsEvaluateStepStatus: function(breadcrumbObj) {

			var stepId = breadcrumbObj.stepId,
				breadcrumb = breadcrumbObj.content;

			if (stepId === this.currentStep) {

				this._setBreadcrumbStatus(breadcrumb, this.breadcrumbCurrentClass);
				breadcrumb.onclick = "";
			} else if (this._getStepResults(stepId)) {

				this._setBreadcrumbStatus(breadcrumb, this.breadcrumbResolvedClass);
				breadcrumb.onclick = lang.hitch(this, this._goToStep, stepId, false);
			} else if (this._getVisitedStep(stepId)) {

				this._setBreadcrumbStatus(breadcrumb, this.breadcrumbVisitedClass);
				breadcrumb.onclick = lang.hitch(this, this._goToStep, stepId, false);
			} else {

				this._setBreadcrumbStatus(breadcrumb, this.breadcrumbDisabledClass);
				breadcrumb.onclick = "";
			}
		},

		_setBreadcrumbStatus: function(breadcrumb, newStatusClass) {

			var statusClasses = [
				this.breadcrumbCurrentClass,
				this.breadcrumbVisitedClass,
				this.breadcrumbDisabledClass,
				this.breadcrumbResolvedClass
			];

			for (var i = 0; i < statusClasses.length; i++) {

				var statusClass = statusClasses[i],
					operator = statusClass === newStatusClass ? "." : "!";

				put(breadcrumb, operator + statusClass);
			}
		},

		/*_flushedCompleteStepBreadcrumbs: function() {

			this._emptyBreadcrumbs();
		},*/

		_clearStepBreadcrumbs: function() {

			this._emptyBreadcrumbs();
		},

		_emptyBreadcrumbs: function() {

			var lastIndex = this._breadcrumbs.length - 1;
			for (var i = 0; i <= lastIndex; i++) {

				this._deleteStepBreadcrumb(this._breadcrumbs.pop());
			}
		}
	});
});
