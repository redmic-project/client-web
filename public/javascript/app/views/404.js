define([
	"dijit/form/Button"
	, 'dojo/_base/declare'

	, "dojo/domReady!"
], function(
	Button
	, declare
){
	return declare(null, {

		constructor: function() {

			new Button({
				'class': "primary",
				label: "Go back",
				onClick: function() {

					window.location = "/";
				}
			}).placeAt("goBack");
		}
	});
});
