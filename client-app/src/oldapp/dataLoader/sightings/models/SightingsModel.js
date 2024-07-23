define([
	'src/redmicConfig'
], function (
	redmicConfig
){
	return {
		"$schema": "http://json-schema.org/schema#",
		title: "Citation schema",
		type: "object",
		required: [ "type", "geometry", "properties" ],
		additionalProperties: false,
		properties: {
			"id": {
				type: "integer"
			},
			"type": {
				type: "string",
				"enum": [ "Feature" ]
			},
			"geometry": {
				type: "object",
				required: [ "type", "coordinates" ],
				additionalProperties: false,
				properties: {
					"type": {
						type: "string",
						"enum": [ "Point" ]
					},
					"coordinates": {
						type: "array",
						minItems: 2,
						maxItems: 3,
						items: {
							"type": "number",
							maximum: 9000000000000000,
							minimum: -9000000000000000
						}
					}
				}
			},
			"properties": {
				type: "object",
				additionalProperties: false,
				required : ["radius", "species", "sex", "lifeStage", "activity", "accessibility"],
				properties: {
					"radius": {
						type: "number",
						maximum: 500000,
						minimum: 0
					},
					"species": {
						type: "integer",
						url: redmicConfig.services.species,
						"labelProperty": "scientificName"
					},
					"scientificName": {
						type: "string"
					},
					"sex": {
						type: "integer",
						url: redmicConfig.services.sex
					},
					"lifeStage": {
						type: "integer",
						url: redmicConfig.services.lifeStage
					},
					"nickname": {
						type: "string"
					},
					"images": {
						"type": "string"
					},
					"activity": {
						type: "integer",
						url: redmicConfig.services.activity
					},
					"specimenCount": {
						type: "integer"
					},
					"collectorName": {
						type: "string"
					},
					"note": {
						type: "string"
					},
					"date": {
						type: "string",
						format: "date-time"
					},
					"confidence": {
						type: "integer",
						url: redmicConfig.services.confidence
					},
					"accessibility": {
						type: "integer",
						url: redmicConfig.services.accessibility
					}/*,

					"isReleaseCase": {
						type: "integer"
					}*/
				}
			}
		}
	};
});
