define([
	'src/redmicConfig'
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "User schema",
		type: "object",
		required : ["name", "email", "subject"],
		"additionalProperties": false,
		properties: {
			id: {
				type: ["integer", "null"]
			},
			name: {
				type: "string"
			},
			email: {
				type: "string",
				format: "email"
			},
			message: {
				type: ["string", "null"]
			},
			subject: {
				type: "string"
			},
			codeError: {
				type: ["string", "null"]
			},
			reCaptcha: {
				type: "string"
			}
		}
	};
});
