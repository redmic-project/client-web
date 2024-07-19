define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "UserImage schema",
		type: "object",
		required : ["id"],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			image: {
				type: ["string", "null"],
				format: "uri"
			}
		}
	};
});