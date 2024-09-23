module.exports = function(args) {

	var headless = args.headless,
		browser = args.browser,
		browserList = typeof browser === 'string' ? browser.split(',') : browser,
		chromeBrowserVersion = args.chromeBrowserVersion,
		firefoxBrowserVersion = args.firefoxBrowserVersion,
		windowWidth = 1280,
		windowHeight = 768,
		environments = [];

	var browserConfigs = {
		chromeConfig: {
			browserName: 'chrome',
			'goog:chromeOptions': {
				args: [
					'disable-search-engine-choice-screen',
					'disable-extensions',
					'window-size=' + windowWidth + ',' + windowHeight
				]
			}
		},
		firefoxConfig: {
			browserName: 'firefox',
			'moz:firefoxOptions': {
				args: [
					'--width=' + windowWidth,
					'--height=' + windowHeight
				]
			}
		},
		internetExplorerConfig: {
			browserName: 'internet explorer'
		}
	};

	if (headless) {
		browserConfigs.chromeConfig['goog:chromeOptions'].args.push('headless', 'disable-gpu', 'no-sandbox');
		browserConfigs.firefoxConfig['moz:firefoxOptions'].args.push('--headless');
	}

	if (chromeBrowserVersion) {
		var chromeBrowserVersionSplitted = chromeBrowserVersion.split('.'),
			chromeBrowserMajorMinorVersion = chromeBrowserVersionSplitted.slice(0, 2).join('.');

		browserConfigs.chromeConfig.browserVersion = chromeBrowserMajorMinorVersion;
	}

	if (firefoxBrowserVersion) {
		browserConfigs.firefoxConfig.browserVersion = firefoxBrowserVersion;
	}

	for (var i = 0; i < browserList.length; i++) {
		var browserItem = browserList[i];
		environments.push(browserConfigs[browserItem.trim() + 'Config']);
	}

	return environments;
};
