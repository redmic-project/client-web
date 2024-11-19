define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/component/taskAction/Report'
], function(
	declare
	, lang
	, aspect
	, Report
) {

	return declare(null, {
		//	summary:
		//		Extensión de vistas de detalle para añadir funcionalidad relativa a la generación y descarga de
		//		informes.

		constructor: function(args) {

			this.config = {
				_generateReportButtonConfig: {
					icon: 'fa-print',
					btnId: 'generateReport',
					title: this.i18n.printToPdf
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setConfigurations', lang.hitch(this, this._setGenerateReportConfigurations));
			aspect.before(this, '_initialize', lang.hitch(this, this._initializeGenerateReport));
		},

		_setGenerateReportConfigurations: function() {

			if (!this.reportService) {
				console.warn('Tried to add report download button, but "reportService" was not defined at view "%s"',
					this.getChannel());

				return;
			}

			if (!this.titleRightButtonsList) {
				this.titleRightButtonsList = [];
			}

			this.titleRightButtonsList.push(this._generateReportButtonConfig);
		},

		_initializeGenerateReport: function() {

			this._reportTaskAction = new Report({
				parentChannel: this.getChannel()
			});
		},

		_generateReportOnClick: function() {

			this._publish(this._reportTaskAction.getChannel('GENERATE_REPORT'), {
				selectionTarget: this._getReportSelectionTarget(),
				reportService: this.reportService,
				id: parseInt(this.pathVariableId, 10)
			});
		},

		_getReportSelectionTarget: function() {

			return this.selectionTarget || this.target;
		}
	});
});
