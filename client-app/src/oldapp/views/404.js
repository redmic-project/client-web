define([
	'dijit/form/Button'
	, 'dojo/_base/declare'
	, 'src/util/CookieLoader'

	, 'dojo/domReady!'
], function(
	Button
	, declare
	, CookieLoader
) {

	return declare(null, {

		constructor: function() {

			new Button({
				'class': 'primary',
				label: 'Go back',
				onClick: function() {

					location.href = '/';
				}
			}).placeAt('goBack');

			new CookieLoader({
				omitWarning: true
			});
		}
	});
});
