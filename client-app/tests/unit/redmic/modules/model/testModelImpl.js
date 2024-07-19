define([
	'dojo/_base/declare'
	, 'redmic/base/Mediator'
	, 'redmic/modules/model/ModelImpl'
], function(
	declare
	, Mediator
	, ModelImpl
) {

	var timeout, modelInstance, schema;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('ModelImpl tests', {
		before: function() {

			timeout = 1000;

			schema = {
				type: "object",
				properties: {
					id: {
						type: "number"
					},
					name: {
						type: "string"
					}
				}
			};

			modelInstance = new ModelImpl({
				parentChannel: 'test',
				schema: schema
			});
		},

		afterEach: function() {

			Mediator.publish(modelInstance.getChannel('CLEAR'));
		},

		tests: {
			Should_PublishValueChanged_When_DeserializeValue: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('VALUE_CHANGED'), dfd.callback(function() {}));

				Mediator.publish(modelInstance.getChannel('DESERIALIZE'), {
					data: {
						id: 1
					}
				});
			},

			Should_PublishValidationErrorsChanged_When_DeserializeValue: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('VALIDATION_ERRORS_CHANGED'), dfd.callback(function() {}));

				Mediator.publish(modelInstance.getChannel('DESERIALIZE'), {
					data: {
						id: 1
					}
				});
			},

			Should_PublishValidationErrorsChangedWithTruthyValidity_When_DeserializeValidValues: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('VALIDATION_ERRORS_CHANGED'), dfd.callback(function() {}), {
					predicate: function(res) {

						return res.isValid;
					}
				});

				Mediator.publish(modelInstance.getChannel('DESERIALIZE'), {
					data: {
						id: 1,
						name: 'a'
					}
				});
			},

			Should_PublishValidationErrorsChangedWithFalsyValidity_When_DeserializeInvalidValue: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('VALIDATION_ERRORS_CHANGED'), dfd.callback(function() {}), {
					predicate: function(res) {

						return !res.isValid;
					}
				});

				Mediator.publish(modelInstance.getChannel('DESERIALIZE'), {
					data: {
						id: 'a'
					}
				});
			},

			Should_PublishWasValidWithFalsyValidity_When_PublishIsValidOnInvalidValue: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('WAS_VALID'), dfd.callback(function() {}), {
					predicate: function(res) {

						return !res.isValid;
					}
				});

				Mediator.publish(modelInstance.getChannel('IS_VALID'));
			},

			Should_PublishWasValidWithFalsyValidity_When_PublishIsValidOnValidValue: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('WAS_VALID'), dfd.callback(function() {}), {
					predicate: function(res) {

						return res.isValid;
					}
				});

				Mediator.publish(modelInstance.getChannel('DESERIALIZE'), {
					data: {
						id: 1,
						name: 'a'
					}
				});

				Mediator.publish(modelInstance.getChannel('IS_VALID'));
			},

			Should_ReturnSameValue_When_SerializeAfterDeserializeValue: function() {

				var dfd = this.async(timeout),
					value = {
						data: {
							id: 1,
							name: 'a'
						}
					};

				Mediator.once(modelInstance.getChannel('SERIALIZED'), function(res) {

					assert.deepEqual(res, value, 'El valor obtenido no es el mismo que el seteado');
					dfd.resolve();
				});

				Mediator.publish(modelInstance.getChannel('DESERIALIZE'), value);

				Mediator.publish(modelInstance.getChannel('SERIALIZE'));
			},

			Should_ReturnOriginalSchema_When_GetPropertySchema: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('GOT_PROPERTY_SCHEMA'), dfd.callback(function(res) {

					assert.deepEqual(res.schema, schema.properties.name, 'El esquema obtenido no es el original');
				}));

				Mediator.publish(modelInstance.getChannel('GET_PROPERTY_SCHEMA'), {
					key: 'name'
				});
			},

			Should_ReturnOriginalSchema_When_GetRootSchema: function() {

				var dfd = this.async(timeout);

				Mediator.once(modelInstance.getChannel('GOT_PROPERTY_SCHEMA'), dfd.callback(function(res) {

					assert.deepEqual(res.schema, schema, 'El esquema obtenido no es el original');
				}));

				Mediator.publish(modelInstance.getChannel('GET_PROPERTY_SCHEMA'), {});
			}
		}
	});
});
