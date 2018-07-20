module.exports = function(args) {
	// TODO hay que generalizar este módulo, no solo para headless sino para configs de navegadores según args

	var userDataDir = args.userDataDir || '.config';

	return {
		environments: [{
			browserName: 'chrome',
			chromeOptions: {
				args: [
					'headless',
					'disable-gpu',
					'no-sandbox',
					'window-size=1280,768',
					'user-data-dir=' + userDataDir
				]
			}
		}]
	};
};
