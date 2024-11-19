define([
	'dijit/form/Button'
	, 'dojo/_base/declare'
	, 'src/util/CookieLoader'
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

					globalThis.location.href = '/';
				}
			}).placeAt('goBack');

			new CookieLoader({
				omitWarning: true
			});
		}
	});
});
