define(function() {

	return {
		"$schema": "http://json-schema.org/draft-04/schema#",
		"title": "Domain",
		"type": "object",
		"properties": {
			"id": {
				"type": ["integer", "null"]
			},
			"name": {
				"type": "string",
				"minLength": 1,
				"maxLength": 150
			},
			"name_en": {
				"type": "string",
				"minLength": 1,
				"maxLength": 150
			}
		},
		"required": ["name", "name_en"]
	};
});
