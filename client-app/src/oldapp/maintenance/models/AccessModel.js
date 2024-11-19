define([
	'src/redmicConfig'
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "Access schema",
		type: "object",
		required : ['perms', 'module'],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			perms: {
				type: "integer"
			},
			module: {
				type: "integer",
				url: redmicConfig.services.module
			}
		}
	};
});
