define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "UserName schema",
		type: "object",
		required : ["id", "firstName", "lastName"],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			firstName: {
				type: "string"
			},
			lastName: {
				type: "string"
			}
		}
	};
});
