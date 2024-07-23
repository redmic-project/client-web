define([], function() {

	return {
		credentials: credentials,
		env: {
			cwd: process.cwd(),
			scriptSuffix: 'Script',
			reportersOutputPath: reportersOutputPath
		},
		selector: {
			cookiesNotice: 'span.cookies'
			, homeButton: 'a.topbarLogo'
			, userArea: 'div.userArea > :first-child'
			, notificationArea: 'div.notification'
			, saveButton: 'div.keypad div.right span.success'
			, cancelButton: 'div.keypad div.right span.danger'
			, resetButton: 'div.keypad div.left span.primary'
			, clearButton: 'div.keypad div.left span.warning'
			, topbarReportButton: 'div.manager div.right div.btnGroup span.primary > span'
			, alert: 'div.ajs-modal > div.ajs-dialog'
			, form: 'form'
			, map: 'div.map.leaflet-container'
			, fileUploadInput: 'input.dz-hidden-input'
			, notLoading: ':not([loading="true"])'
			, loading: '*[loading="true"]'
			, pdfViewer: 'div.windowContent object[data]'
			, okAlertify: 'div.alertify div.ajs-footer button.ajs-ok'
			, cancelAlertify: 'div.alertify div.ajs-footer button.ajs-cancel'
		},
		url: {
			login: '/login'
			, home: '/home'
			, register: '/register'
			, recover: '/recover-password'
			, redmicInfo: '/what-is-redmic'
			, innerRedmicInfo: '/inner-what-is-redmic'
			, terms: '/terms-and-conditions'
			, feedback: '/feedback'
		},
		timeout: {
			shortFindElement: 500,
			findElement: 5000,
			longFindElement: 30000,
			veryLongFindElement: 70000,
			veryShortSleep: 250,
			shortSleep: 500,
			longSleep: 1000,
			veryLongSleep: 5000,
			loading: 20000
		}
	};
});
