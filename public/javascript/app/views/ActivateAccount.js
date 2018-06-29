define([
	"app/redmicConfig"
	, 'dojo/_base/declare'
	, "dojo/_base/lang"
	, "dojo/dom"
	, "dojo/request"
	, "redmic/base/RedmicLocalStorage"

	, "dojo/domReady!"
], function(
	redmicConfig
	, declare
	, lang
	, dom
	, request
	, RedmicLocalStorage
){
	return declare(null, {

		constructor: function(args) {

			lang.mixin(this, args);

			var data = {
				token: this.token
			};

			request(redmicConfig.services.activateAccount, {
				handleAs: "json",
				method: "POST",
				data: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/javascript, application/json"
				}
			}).then(function(result) {

				if (result.success) {
					RedmicLocalStorage.setItem("accountActivated", "true");
					window.location = "/";
				} else {
					window.location = "/404";
				}
			}, function(err) {

				window.location = "/404";
			});
		}
	});
});
