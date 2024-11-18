define([
	'src/redmicConfig'
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "UploadFileTimeSeries schema",
		type: "object",
		required : ["fileName", "separator"],
		"additionalProperties": false,
		properties: {
			id: {
				type: ["integer", "null"]
			},
			fileName: {
				type: "string"
			},
			separator: {
				type: "string",
				"maxLength": 1,
				"default": ";"
			}
		}
	};
});
