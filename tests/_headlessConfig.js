module.exports = function(args) {

	return {
		environments: [{
			browserName: 'chrome',
			chromeOptions: {
				args: [
					'headless',
					'disable-gpu',
					'no-sandbox',
					'window-size=1280,768'
				]
			}
		}]
	};
};
