define([
	'moment/moment.min'
], function(
	moment
){
	return {
		date: function(value) {

			if (!value) {
				return null;
			}

			var regExp = new RegExp('^[0-9]{4,}-[0-9]{2}-[0-9]{2}$');
			if (!regExp.test(value)) {
				return 'A valid ISO 8601 date string (in YYYY-MM-DD format) was expected';
			}

			if (!moment(value).isValid()) {
				return 'A possible date (not only in the right format) was expected';
			}

			return null;
		},

		'date-time': function(value) {

			if (!value) {
				return null;
			}

			var regExp = new RegExp(
				'^[0-9]{4,}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+|)(?:[+-][0-9]{2}:?(?:[0-9]{2}|)|Z)$'
			);

			if (!regExp.test(value)) {
				return 'A valid ISO 8601 date-time string was expected';
			}

			if (!moment(value).isValid()) {
				return 'A possible date-time (not only in the right format) was expected';
			}

			return null;
		},

		duration: function(value) {

			if (!value) {
				return null;
			}

			var amount = '[\\.,0-9]+',
				regExp = new RegExp(
					'^P(' + amount + 'Y|)(' + amount + 'M|)(' + amount + 'W|)(' + amount + 'D|)' +
					'(T(' + amount + 'H|)(' + amount + 'M|)(' + amount + 'S|))?$'
				);

			if (!regExp.test(value)) {
				return 'A valid ISO 8601 duration string was expected';
			}

			if (!moment.duration(value).asMilliseconds()) {
				return 'A possible duration (not only in the right format) was expected';
			}

			return null;
		},

		email: function(value) {

			if (!value) {
				return null;
			}

			var regExp = new RegExp(
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			);

			if (!regExp.test(value)) {
				return 'A valid e-mail address string was expected';
			}

			return null;
		},

		uri: function(value) {

			if (!value) {
				return null;
			}

			var regExp = new RegExp(
				/^(?:[A-Za-z][A-Za-z0-9+\-.]*:(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?(?:\#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?|(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?(?:\#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?)$/
			);

			if (!regExp.test(value)) {
				return 'A valid URI string was expected';
			}

			return null;
		},

		url: function(value) {

			if (!value) {
				return null;
			}

			var protocols = '((https?)|(ftp))',
				textSegment = '\\w-.:@%+~#={}',
				textSegmentPlusParams = textSegment + '?&/',
				regExp = new RegExp('^(' + protocols + ':\/\/)?[' + textSegment + ']{2,256}\.[a-z]{2,6}[' +
					textSegmentPlusParams + ']*$');

			if (!regExp.test(value)) {
				return 'A valid URL string was expected';
			}

			return null;
		},

		password: function(value) {

			if (!value) {
				return null;
			}

			var regExp = new RegExp('^[a-zA-Z0-9!@#$%&?*_+-]{6,24}$');

			if (!regExp.test(value)) {
				return 'Password length must be between 6 and 24 characters';
			}

			return null;
		},

		colour: function(value) {

			if (!value) {
				return null;
			}

			var regExp = new RegExp('^[#][a-fA-F0-9]{6}$');

			if (!regExp.test(value)) {
				return 'A valid colour string was expected';
			}

			return null;
		}
	};
});
