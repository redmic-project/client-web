define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/request"
	, "dojo/json"
], function(
	declare
	, lang
	, xhr
	, JSON
){
	return declare(null, {
		//	summary:
		//		Funcionalidades de persistencia para el modelo.
		//	description:
		//		Proporciona método 'save' al modelo.

		constructor: function(args) {

			this.config = {
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/javascript, application/json"
				},
				handleAs: "json"
			};

			lang.mixin(this, this.config, args);
		},

		save: function() {

			if (!this.isValid) {
				console.error("Tried to save invalid model '%s' with this schema:", this.get("modelName"),
					this.get("schema"));

				return;
			}

			if (!this.hasChanged) {
				console.error("Tried to save unchanged model '%s' with this schema:", this.get("modelName"),
					this.get("schema"));

				return;
			}

			var id = this.getIdValue(),
				method = this.get("isNew") ? "POST" : "PUT",
				data = JSON.stringify(this.serialize()),
				target = this.target + "/";

			return xhr(id ? target + id : target, {
				headers: this.headers,
				handleAs: this.handleAs,
				method: method,
				data: data
			});
		}
	});
});
