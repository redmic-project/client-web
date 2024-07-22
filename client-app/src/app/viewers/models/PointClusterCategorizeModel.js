define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "PointClusterCategorize schema",
		type: "object",
		required : ["layerType"],
		"additionalProperties": false,
		properties: {
			layerType: {
				type: "string"
			},
			style: {
				type: ["object", "null"],
				required : ["categorize", "field", "radius", "color", "division", "opacity"],
				properties: {
					categorize: {
						type: "boolean"
					},
					/*field: {
						type: "string"
					},*/
					field: {
						type: "object",
						required : ["key", "type"],
						"additionalProperties": true,
						properties: {
							key: {
								type: "string"
							},
							type: {
								type: "string"
							},
							divisions: {
								"type": "array",
								"items": {
									type: "integer"
								}
							}
						}
					},
					cuantil: {
						type: ["string", "null"]
					},
					division: {
						type: "integer"
					},
					radius: {
						type: "object",
						required : ["min", "max"],
						properties: {
							min: {
								type: "integer",
								"default": "1"
							},
							max: {
								type: "integer",
								"default": "20"
							}
						}
					},
					color: {
						"type": "array",
						"items": {
							type: "string"
						}
					},
					opacity: {
						type: "number",
						"default": "1"
					}
				}
			}
		}
	};
});