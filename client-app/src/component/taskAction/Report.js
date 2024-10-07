define([
	'alertify'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/util/Credentials'
], function(
	alertify
	, declare
	, lang
	, _Module
	, Credentials
) {

	return declare(_Module, {
		//	summary:
		//		Componente de petición de tareas para la acción de generar informes.

		constructor: function(args) {

			this.config = {
				ownChannel: 'reportTaskAction',
				events: {
					GENERATE_REPORT_TASK: 'generateReportTask'
				},
				actions: {
					GENERATE_REPORT: 'generateReport',
					GET_REPORT: 'getReport'
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('GENERATE_REPORT'),
				callback: '_subGenerateReport',
				options: {
					predicate: lang.hitch(this, this._chkGenerateReport)
				}
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GENERATE_REPORT_TASK',
				channel: this._buildChannel(this.taskChannel, 'GET_REPORT')
			});
		},

		_chkGenerateReport: function(req) {

			if (Credentials.userIsGuest()) {
				this._denyAccessToGuestUsers();
				return false;
			}

			var condition = req && req.selectionTarget && req.reportService;

			if (!condition) {
				console.warn('Missing props at GENERATE_REPORT publication, received:', req);
			}

			return !!condition;
		},

		_subGenerateReport: function(req) {

			var reportConfig = {
				target: req.selectionTarget,
				serviceTag: req.reportService,
				id: req.id
			};

			this._emitEvt('GENERATE_REPORT_TASK', reportConfig);
		},

		_denyAccessToGuestUsers: function() {

			var banIcon = '<i class="fa fa-ban fa-2x iconBanAlertify"></i>',
				banMessage = '<span class="verticalAlignAlertify">' + this.i18n.banGuestMessage +
				'<a href="/register"> ' + this.i18n.registerAuthFailed + ' </a>' + this.i18n.banGuestMessage2 +
				'<a href="/terms-and-conditions"> ' + this.i18n.useCondition + ' </a></span>';

			alertify.alert(this.i18n.titleAlert, banIcon + banMessage);
		}
	});
});
