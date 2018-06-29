define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/base/Mediator"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/layout/wizard/_StepNavigation"
	, "redmic/modules/layout/wizard/Wizard"
], function(
	ContentPane
	, declare
	, lang
	, put
	, Mediator
	, _Module
	, _Show
	, _StepNavigation
	, Wizard
){

	var resetText = "[RESETEADO] ",

		label1 = "step1",
		textContent1 = "contenido de step1",
		stepResult1 = "resultado de step1",
		label2 = "step2",
		textContent2 = "contenido de step2",
		stepResult2 = "resultado de step2",
		label3 = "step3",
		textContent3 = "contenido de step3",
		stepResult3 = "resultado de step3",
		label4 = "step4",
		textContent4 = "contenido de step4",
		stepResult4 = "resultado de step4",
		label5 = "step5",
		textContent5 = "contenido de step5",
		stepResult5 = "resultado de step5",

		stepProps = [
			declare(null, {
				label: label1,
				content: textContent1,
				_results: stepResult1
			}),
			declare(null, {
				label: label2,
				content: textContent2,
				_results: stepResult2
			}),
			declare(null, {
				label: label3,
				content: textContent3,
				_results: stepResult3
			}),
			declare(null, {
				label: label4,
				content: textContent4,
				_results: stepResult4
			}),
			declare(null, {
				label: label5,
				content: textContent5,
				_results: stepResult5
			})
		],
		stepImpls = [];

	for (var i = 0; i < stepProps.length; i++) {
		var stepDefinition = declare([ContentPane, _Module, _Show, stepProps[i]], {

			constructor: function(args) {

			},

			_initialize: function() {

				this.textContent = this.content;
				this._isCompleted = true;
			},

			_getNodeToShow: function() {

				this.emit(this.events.REFRESH_STATUS);
				return this.containerNode;
			}
		});

		stepImpls.push(stepDefinition);
	}

	var step1 = {
			definition: stepImpls[0]
		},
		step2 = {
			definition: stepImpls[1]
		},
		step3 = {
			definition: stepImpls[2]/*,
			getNextStepId: function(currentStep, results) {
				return currentStep + 2;
			}*/
		},
		step4 = {
			definition: stepImpls[3],
			skippable: true,
			isCompleted: function(results) {
				return false;
			}
		},
		step5 = {
			definition: stepImpls[4]/*,
			getPrevStepId: function(currentStep, results) {
				return currentStep - 2;
			}*/
		},

		timeout, wizard,

		validateStep = function(stepId) {
			wizard._visitedSteps[stepId] = true;
			var stepInstance = wizard._stepInstances[stepId];
			stepInstance && stepInstance.emit(stepInstance.events.REFRESH_STATUS);
		};


	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Wizard module tests", {
		before: function() {

			timeout = 100;

			wizard = new declare(Wizard)({
				parentChannel: "view",
				steps: [step1, step2, step3, step4, step5]
			});
		},

		afterEach: function() {

			Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
				stepId: 0
			});

			wizard._stepResults = {
				0: stepResult1
			};

			wizard._stepStatuses = {
				0: true
			};

			wizard._visitedSteps = {
				0: true
			};
		},

		after: function() {

			for (var i = 0; i < 3; i++) {
				var step = wizard._stepInstances[i];
				step && Mediator.publish(step.getChannel("DISCONNECT"));
			}

			Mediator.publish(wizard.getChannel("DISCONNECT"));
		},

		tests: {
			"Creation": function() {

				assert.isDefined(wizard._stepInstances, "El Step inicial del Wizard no se ha creado correctamente");
			},

			"Show in node": function() {

				var dfd = this.async(timeout);

				Mediator.once(wizard.getChannel("SHOWN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se mostró correctamente");
					assert.strictEqual(wizard.stepLabelNode.innerText, label1, "El label del Wizard no se ha seteado correctamente");
					assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent1, "El contenido del Wizard no se ha seteado correctamente");
				}));

				Mediator.publish(wizard.getChannel("SHOW"), {
					node: put("div")
				});
			},

			"Hide from node": function() {

				var dfd = this.async(timeout);

				Mediator.once(wizard.getChannel("HIDDEN"), dfd.callback(function(obj) {
					assert.ok(obj.success, "No se ocultó correctamente");
				}));

				Mediator.publish(wizard.getChannel("HIDE"));
			},

			"Next step": function() {

				Mediator.publish(wizard.getChannel("NEXT_STEP"));

				assert.isDefined(wizard._stepInstances[1], "El siguiente Step no se ha creado correctamente");
				assert.strictEqual(wizard.stepLabelNode.innerText, label2, "El label del Wizard no se ha seteado correctamente");
				assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent2, "El contenido del Wizard no se ha seteado correctamente");
			},

			"Previous step": function() {

				Mediator.once(wizard._stepInstances[1].getChannel("STEP_SHOWN"), lang.hitch(this, function() {

					Mediator.publish(wizard.getChannel("PREVSTEP"));

					assert.strictEqual(wizard.stepLabelNode.innerText, label1, "El label del Wizard no se ha seteado correctamente");
					assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent1, "El contenido del Wizard no se ha seteado correctamente");
				}));

				Mediator.publish(wizard.getChannel("NEXT_STEP"));
			},

			"Go to step": function() {

				Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
					stepId: 2
				});

				Mediator.once(wizard._stepInstances[2].getChannel("STEP_SHOWN"), lang.hitch(this, function() {

					assert.isDefined(wizard._stepInstances[2], "El Step al que vamos no se ha creado correctamente");
					assert.strictEqual(wizard.stepLabelNode.innerText, label3, "El label del Wizard no se ha seteado correctamente");
					assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent3, "El contenido del Wizard no se ha seteado correctamente");
				}));
			},

			"Next step from a step affected by getStepToJump": function() {

				Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
					stepId: 3
				});

				Mediator.once(wizard._stepInstances[3].getChannel("STEP_SHOWN"), lang.hitch(this, function(){
					assert.strictEqual(wizard.stepLabelNode.innerText, label4,
						"El label del Wizard no se ha seteado correctamente después de saltar de paso");

					Mediator.publish(wizard.getChannel("NEXT_STEP"));

					assert.isDefined(wizard._stepInstances[4],
						"El Step al que íbamos a saltar no se ha creado correctamente");
					assert.strictEqual(wizard.stepLabelNode.innerText, label5,
						"El label del Wizard no se ha seteado correctamente");
					assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent5,
						"El contenido del Wizard no se ha seteado correctamente");
				}));
			},

			"Prev step from a step affected by getStepToJump": function() {

				assert.strictEqual(wizard.stepLabelNode.innerText, label1, "El label del Wizard no se ha seteado correctamente");

				Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
					stepId: 4
				});

				Mediator.once(wizard._stepInstances[4].getChannel("STEP_SHOWN"), lang.hitch(this, function(){
					assert.isDefined(wizard._stepInstances[4],
						"El Step al que íbamos a saltar no se ha creado correctamente");
					assert.strictEqual(wizard.stepLabelNode.innerText, label5,
						"El label del Wizard no se ha seteado correctamente después de saltar de paso");

					Mediator.publish(wizard.getChannel("PREV_STEP"));

					assert.strictEqual(wizard.stepLabelNode.innerText, label1,
						"El label del Wizard no se ha seteado correctamente");
					assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent1,
						"El contenido del Wizard no se ha seteado correctamente");
				}));
			},

			"Steps status listening": function() {

				Mediator.publish(wizard.getChannel("NEXT_STEP"));

				Mediator.once(wizard._stepInstances[1].getChannel("STEP_SHOWN"), lang.hitch(this, function(){
					assert.isDefined(wizard._stepStatuses[1], "El estado del siguiente Step no se ha obtenido");
				}));
			},

			"Steps results publication": function() {

				Mediator.once(wizard.getChannel("STEPS_CONFIRMED"), lang.hitch(this, function(obj) {
					assert.propertyVal(obj.results, "0", stepResult1,
						"El resultado no está presente o tiene un valor diferente al esperado");
					assert.propertyVal(obj.results, "1", stepResult2,
						"El resultado no está presente o tiene un valor diferente al esperado");
					assert.propertyVal(obj.results, "2", stepResult3,
						"El resultado no está presente o tiene un valor diferente al esperado");
					assert.notProperty(obj.results, "3",
						"El resultado no está presente o tiene un valor diferente al esperado");
					assert.propertyVal(obj.results, "4", stepResult5,
						"El resultado no está presente o tiene un valor diferente al esperado");
				}));

				Mediator.publish(wizard.getChannel("NEXT_STEP"));
				Mediator.publish(wizard.getChannel("NEXT_STEP"));
				Mediator.publish(wizard.getChannel("NEXT_STEP"));
				Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
					stepId: 0
				});

				Mediator.publish(wizard.getChannel("CONFIRM_STEPS"));
			},

			"New results subscription by Steps": function() {

				/*assert.propertyVal(wizard._stepInstances[0]._wizardResults, 0, stepResult1,
					"Los resultados de los steps al inicio no son correctos");*/

				Mediator.publish(wizard.getChannel("NEXT_STEP"));
				/*assert.propertyVal(wizard._stepInstances[1]._wizardResults, 0, stepResult1,
					"Los resultados de los steps anteriores no se guardaron en el primer salto");*/
				assert.propertyVal(wizard._stepInstances[1]._wizardResults, 1, stepResult2,
					"Los resultados de los steps anteriores no se guardaron en el primer salto");

				Mediator.publish(wizard.getChannel("NEXT_STEP"));
				/*assert.propertyVal(wizard._stepInstances[2]._wizardResults, 0, stepResult1,
					"Los resultados de los steps anteriores no se guardaron en el segundo salto");*/
				assert.propertyVal(wizard._stepInstances[2]._wizardResults, 1, stepResult2,
					"Los resultados de los steps anteriores no se guardaron en el segundo salto");
				assert.propertyVal(wizard._stepInstances[2]._wizardResults, 2, stepResult3,
					"Los resultados de los steps anteriores no se guardaron en el segundo salto");

				Mediator.publish(wizard.getChannel("NEXT_STEP"));
				/*assert.propertyVal(wizard._stepInstances[3]._wizardResults, 0, stepResult1,
					"Los resultados de los steps anteriores se alteraron al volver atrás");*/
				assert.propertyVal(wizard._stepInstances[3]._wizardResults, 1, stepResult2,
					"Los resultados de los steps anteriores se alteraron al volver atrás");
				assert.propertyVal(wizard._stepInstances[3]._wizardResults, 2, stepResult3,
					"Los resultados de los steps anteriores se alteraron al volver atrás");
				assert.propertyVal(wizard._stepInstances[3]._wizardResults, 3, stepResult4,
					"Los resultados de los steps anteriores se alteraron al volver atrás");

				Mediator.publish(wizard.getChannel("PREV_STEP"));
				/*assert.propertyVal(wizard._stepInstances[2]._wizardResults, 0, stepResult1,
					"Los resultados de los steps anteriores se alteraron al volver atrás");*/
				assert.propertyVal(wizard._stepInstances[2]._wizardResults, 1, stepResult2,
					"Los resultados de los steps anteriores se alteraron al volver atrás");
				assert.propertyVal(wizard._stepInstances[2]._wizardResults, 2, stepResult3,
					"Los resultados de los steps anteriores se alteraron al volver atrás");
				assert.propertyVal(wizard._stepInstances[2]._wizardResults, 3, stepResult4,
					"Los resultados de los steps no contienen resultados futuros al volver atrás");
			},

			"Step which never is completed, don't publish it's results": function() {

				validateStep(1);
				validateStep(2);
				Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
					stepId: 3
				});

				assert.notProperty(wizard._stepResults, 3,
					"Los resultados de los steps contienen el resultado de un step irresoluble");
			}
		}
	});

	registerSuite("Wizard module with _StepNavigation extension tests", {
		before: function() {

			timeout = 100;

			var wizardDefinition = declare(Wizard).extend(_StepNavigation);
			wizard = new wizardDefinition({
				parentChannel: "view",
				steps: [step1, step2, step3]
			});
		},

		afterEach: function() {

			Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
				stepId: 0
			});

			wizard._stepResults = {
				0: stepResult1
			};

			wizard._stepStatuses = {
				0: true
			};

			wizard._visitedSteps = {
				0: true
			};
		},

		after: function() {

			for (var i = 0; i < 3; i++) {
				var step = wizard._stepInstances[i];
				step && Mediator.publish(step.getChannel("DISCONNECT"));
			}

			Mediator.publish(wizard.getChannel("DISCONNECT"));
		},

		tests: {
			"Creation": function() {

				assert.isDefined(wizard.keypad, "La instancia de Keypad no se ha creado correctamente");
				assert.isDefined(wizard.keypadNode, "El contenedor del Keypad no se ha creado correctamente");
			},

			"Next step triggered by keypad": function() {

				Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
					inputKey: "next",
					inputInstance: wizard.keypad._itemInstances.next
				});

				assert.isDefined(wizard._stepInstances[1], "El siguiente Step no se ha creado correctamente");
				assert.strictEqual(wizard.stepLabelNode.innerText, label2, "El label del Wizard no se ha seteado correctamente");
				assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent2, "El contenido del Wizard no se ha seteado correctamente");
			},

			"Previous step triggered by keypad": function() {

				Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
					inputKey: "next",
					inputInstance: wizard.keypad._itemInstances.next
				});

				Mediator.once(wizard._stepInstances[1].getChannel("STEP_SHOWN"), lang.hitch(this, function(){
					Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
						inputKey: "prev",
						inputInstance: wizard.keypad._itemInstances.prev
					});

					assert.isDefined(wizard._stepInstances[0],
						"El Step anterior no se ha creado correctamente");
					assert.strictEqual(wizard.stepLabelNode.innerText, label1,
						"El label del Wizard no se ha seteado correctamente");
					assert.strictEqual(wizard.contentNode.containerNode.innerText, textContent1,
						"El contenido del Wizard no se ha seteado correctamente");
				}));
			},

			"Steps results publication triggered by keypad": function() {

				Mediator.once(wizard.getChannel("STEPS_CONFIRMED"), lang.hitch(this, function(obj) {
					assert.propertyVal(obj.results, 0, stepResult1,
						"No se publicaron los resultados esperados");
					assert.propertyVal(obj.results, 1, stepResult2,
						"No se publicaron los resultados esperados");
					assert.propertyVal(obj.results, 2, stepResult3,
						"No se publicaron los resultados esperados");
					assert.notProperty(obj.results, 3,
						"No se publicaron los resultados esperados");
				}));

				Mediator.once(wizard._stepInstances[0].getChannel("STEP_SHOWN"), lang.hitch(this, function(){
					Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
						inputKey: "confirm",
						inputInstance: wizard.keypad._itemInstances.confirm
					});
				}));

				Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
					inputKey: "next",
					inputInstance: wizard.keypad._itemInstances.next
				});

				Mediator.once(wizard._stepInstances[1].getChannel("STEP_SHOWN"), lang.hitch(this, function(){

					Mediator.once(wizard._stepInstances[2].getChannel("STEP_SHOWN"), lang.hitch(this, function(){

						Mediator.once(wizard._stepInstances[3].getChannel("STEP_SHOWN"), lang.hitch(this, function(){

							Mediator.publish(wizard.getChannel("GO_TO_STEP"), {
								stepId: 0
							});
						}));

						Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
							inputKey: "next",
							inputInstance: wizard.keypad._itemInstances.next
						});
					}));

					Mediator.publish(wizard.keypad.getChannel("KEYPAD_INPUT"), {
						inputKey: "next",
						inputInstance: wizard.keypad._itemInstances.next
					});
				}));
			}
		}
	});

});
