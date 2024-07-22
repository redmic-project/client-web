define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "User schema",
		type: "object",
		required : ["firstName", "lastName", "email", "password", "accept", "reCaptcha"],
		"additionalProperties": false,
		properties: {
			id: {
				type: ["integer", "null"]
			},
			firstName: {
				type: "string"
			},
			lastName: {
				type: "string"
			},
			sector: {
				type: ["integer", "null"],
				url: redmicConfig.services.userSector
			},
			email: {
				type: "string",
				format: "email"
			},
			password: {
				type: "string",
				format: "password"
			},
			accept: {
				type: "boolean"
			},
			reCaptcha: {
				type: "string"
			}
		}
	};
});