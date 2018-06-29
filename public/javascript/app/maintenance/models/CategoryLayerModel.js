define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "CategoryLayer schema",
		type: "object",
		required: ["name", "atlas"],
		properties: {
			id: {
				type: ["string", "null"]
			},
			name: {
				type: "string"
			},
			atlas: {
				'default': "false",
				type: "boolean"
			}
		}
	};
});