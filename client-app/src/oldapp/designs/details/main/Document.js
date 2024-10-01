define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/detail/_GenerateReport'
	, 'src/util/Credentials'
	, 'templates/DocumentInfo'
	, './_DetailsBase'
	, './DocumentPDF'
], function(
	redmicConfig
	, declare
	, lang
	, _GenerateReport
	, Credentials
	, TemplateInfo
	, _DetailsBase
	, DocumentPDF
) {

	return declare([_DetailsBase, _GenerateReport], {
		//	summary:
		//		Vista detalle de Document.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.document,
				activitiesTargetBase: redmicConfig.services.activityDocuments,
				templateInfo: TemplateInfo,

				reportService: 'document'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onDocumentDetailsHidden));
		},

		_setMainConfigurations: function() {

			this.inherited(arguments);

			this.widgetConfigs = this._merge([
				this.widgetConfigs || {},
				{
					info: {
						height: 4
					},
					activityList: {
						height: 4
					},
					pdf: {
						width: 6,
						height: 6,
						hidden: true,
						type: DocumentPDF,
						props: {
							title: 'document',
							pathVariableId: this.pathVariableId
						}
					}
				}
			]);
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target !== redmicConfig.services.document) {
				return;
			}

			var documentData = res.data,
				pdfUrl = documentData.internalUrl,
				privatePdf = documentData.privateInternalUrl;

			if (!pdfUrl || (privatePdf && !Credentials.userIsEditor())) {
				this._hideWidget('pdf');
			} else {
				this._showWidget('pdf');
			}
		},

		_clearModules: function() {

			this.inherited(arguments);

			this._publish(this._getWidgetInstance('pdf').getChannel('CLEAR'));
		},

		_refreshModules: function() {

			this.inherited(arguments);

			this._checkPathVariableId();

			this._publish(this._getWidgetInstance('pdf').getChannel('SET_PROPS'), {
				pathVariableId: this.pathVariableId
			});
		},

		_onDocumentDetailsHidden: function() {

			this._hideWidget('pdf');
		}
	});
});
