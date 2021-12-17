define([], function() {

	return {
		"$schema": "http://json-schema.org/schema#",
		title: "DownloadsServiceOGC schema",
		type: "object",
		required: ["name", "url"],
		properties: {
			id: {
				type: ["integer", "null"]
			},
			name: {
				type: "string"
			},
			url: {
				type: ["string", "null"],
				format: "url"
			}
		}
	};
});
