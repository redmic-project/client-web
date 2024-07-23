define([
	'src/redmicConfig'
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "Permissions schema",
		type: "object",
		required : ["firstName", "enabled", "role", "lastName", "email"],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			firstName: {
				type: "string"
			},
			enabled: {
				type: "boolean"
			},
			role: {
				type: "integer",
				url: redmicConfig.services.role
			},
			lastName: {
				type: "string"
			},
			email: {
				type: "string",
				format: "email"
			},
			"accesses": {
				"type": "array",
				"items": {
					type: "object",
					required : ["module", "perms"],
					"additionalProperties": false,
					properties: {
						module: {
							"type": "integer",
							"url": redmicConfig.services.module
						},
						perms: {
							"type": "integer"
						}
					}
				}
			}
		}
	};
});
