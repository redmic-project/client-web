define([], function() {

	var assert = intern.getPlugin('chai').assert;

	return {

		setAndCheckInvalidValues: function(instance, invalidValues) {

			for (var i = 0; i < invalidValues.length; i++) {
				var invalidValue = invalidValues[i],
					assertMethod;

				instance.set("value", invalidValue);
				assert.isFalse(instance.get("isValid"), "La validación no falla con el valor erróneo '" +
					invalidValue + "'");

				if (typeof invalidValue === "object") {
					if (invalidValue) {
						if (invalidValue instanceof Array) {
							assertMethod = "sameDeepMembers";
						} else {
							assertMethod = "deepEqual";
						}
					} else {
						assertMethod = "strictEqual";
					}
				} else {
					assertMethod = "strictEqual";
				}

				assert[assertMethod](instance.get("value"), invalidValue, "El valor erróneo almacenado '" +
					invalidValue + "' no se ha preservado");
			}
		}
	};
});
