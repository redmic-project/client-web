define([
	'src/redmicConfig'
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "User schema",
		type: "object",
		required : ["id", "oldPassword", "password"],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			oldPassword: {
				type: "string",
				minLength: 6,
				format: "password"
			},
			password: {
				type: "string",
				minLength: 6,
				format: "password"
			}
		}
	};
});
