define([
	'dojo/sniff'
], function(
	has
) {

	return {
		_supportedBrowsersAndMinimumVersion: {
			'chrome': 31,
			'ff': 28,
			'opera': 17,
			'safari': 8,
			'edge': 12
		},

		isSupported: function() {

			for (var key in this._supportedBrowsersAndMinimumVersion) {
				var version = this._supportedBrowsersAndMinimumVersion[key];

				if (has(key) >= version) {
					return true;
				}

			}

			return false;
		}
	};
});
