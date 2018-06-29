define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "ProtocolsServiceOGC schema",
		type: "object",
		required: ["type", "url"],
		properties: {
			id: {
				type: ["integer", "null"]
			},
			type: {
				type: "string"
			},
			url: {
				type: ["string", "null"],
				format: "url"
			}
		}
	};
});