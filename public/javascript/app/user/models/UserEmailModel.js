define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "UserEmail schema",
		type: "object",
		required : ["id", "email"],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			email: {
				type: "string",
				format: "email"
			}
		}
	};
});