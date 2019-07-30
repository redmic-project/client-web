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

		isSupported: function() {

			for (var i = 0; i < this._supportedBrowsersAndMinVersion.length; i++) {
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
