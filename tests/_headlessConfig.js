module.exports = function(args) {
	// TODO hay que generalizar este módulo, no solo para headless sino para configs de navegadores según args

	var userDataDir = args.userDataDir || '.config';

	return {
		environments: [{
			browserName: 'chrome',
			'goog:chromeOptions': {
				args: [
					'headless',
					'disable-gpu',
					'disable-extensions',
					'no-sandbox',
					'window-size=1280,768',
					'user-data-dir=' + userDataDir
				]
			}
		/*}, {
			browserName: 'firefox',
			'moz:firefoxOptions': {
				args: [
					'--headless',
					'--width=1280',
					'--height=768'
				]
			}
		*/}]
	};
};
