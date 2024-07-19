define([
	"app/redmicConfig"
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "PointCluster schema",
		type: "object",
		required : ["layerType"],
		"additionalProperties": false,
		properties: {
			layerType: {
				type: "string"
			},
			style: {
				type: ["object", "null"],
				required : ["categorize", "color", "opacity"],
				"additionalProperties": false,
				properties: {
					categorize: {
						type: "boolean"
					},
					size: {
						type: "integer",
						"default": "5"
					},
					color: {
						type: "string",
						"default": "orange"
					},
					/*icon: {
						type: "string",
						"default": ""
					},*/
					opacity: {
						type: "number",
						"default": "1"
					}
				}
			}
		}
	};
});