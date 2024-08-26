define([
	'dojo/sniff'
], function(
	has
) {

	return {
		_supportedBrowsersAndMinVersion: [{
			name: 'chrome',
			version: 86
		},{
			name: 'ff',
			version: 78
		},{
			name: 'edge',
			version: 86
		},{
			name: 'safari',
			version: 14
		},{
			name: 'opr',
			version: 72
		}],

		_allowedBots: [
			'googlebot'
			, 'duckduckgo'
			, 'bingbot',
			, 'slurp'
			, 'applebot'
		],

		isSupported: function() {

			var userAgent = navigator && navigator.userAgent;

			if (userAgent && this._allowedBots.find(lang.hitch(this, this._findBotAgent, userAgent))) {
				return true;
			}

			return !!this._supportedBrowsersAndMinVersion.find(lang.hitch(this, this._findSupportedBrowser));
		},

		_findBotAgent: function(userAgent, allowedBotFragment) {


			return userAgent.toLowerCase().includes(allowedBotFragment);
		},

		_findSupportedBrowser: function(item) {

			var browserVersion = has(item.name);

			return browserVersion && browserVersion >= item.version;
		}
	};
});
