define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "UserSector schema",
		type: "object",
		required : ["id"],
		"additionalProperties": false,
		properties: {
			id: {
				type: "integer"
			},
			sector: {
				type: ["integer", "null"],
				url: redmicConfig.services.userSector
			}
		}
	};
});