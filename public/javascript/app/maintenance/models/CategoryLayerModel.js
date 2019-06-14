define([], function() {

	return {
		"$schema": "http://json-schema.org/schema#",
		title: "CategoryLayer schema",
		type: "object",
		required: ["name"],
		properties: {
			id: {
				type: ["string", "null"]
			},
			name: {
				type: "string"
			}
		}
	};
});
