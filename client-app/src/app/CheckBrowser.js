define([
	'dojo/sniff'
], function(
	has
) {

	return {
		_supportedBrowsersAndMinVersion: [{
			name: 'chrome',
			version: 31
		},{
			name: 'ff',
			version: 28
		},{
			name: 'edge',
			version: 12
		},{
			name: 'safari',
			version: 8
		},{
			name: 'webkit',
			version: 537.36
		}],

		_allowedBots: ['Googlebot', 'bingbot'],

		isSupported: function() {

			var userAgent = navigator && navigator.userAgent,
				i;

			if (userAgent) {
				for (i = 0; i < this._allowedBots.length; i++) {
					var allowedBotFragment = this._allowedBots[i];
					if (userAgent.indexOf(allowedBotFragment) !== -1) {
						return true;
					}
				}
			}

			for (i = 0; i < this._supportedBrowsersAndMinVersion.length; i++) {
				var item = this._supportedBrowsersAndMinVersion[i],
					name = item.name,
					version = item.version;

				if (has(name) >= version) {
					return true;
				}
			}

			return false;
		}
	};
});
