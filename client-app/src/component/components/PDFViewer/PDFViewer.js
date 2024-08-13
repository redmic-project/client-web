define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/util/Credentials"
	, "src/component/base/_Module"
	, "src/component/base/_Show"
	, "src/component/layout/templateDisplayer/TemplateDisplayer"
	, "put-selector/put"
	, 'src/redmicConfig'
	, "templates/DocumentAuthFailed"
	, "templates/DocumentNotAvailable"
], function(
	declare
	, lang
	, Credentials
	, _Module
	, _Show
	, TemplateDisplayer
	, put
	, redmicConfig
	, TemplateAuthFailed
	, TemplateNoAvailable
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Modulo para visualizar documentos PDF.
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		'class': "viewerPDF",

		constructor: function(args) {

			this.config = {
				roleGuestActive: false,
				lastPDF: null,
				targetAuthFailed: "authFailedInfo",
				actions: {
					LOAD_PDF: "loadPDF"
				},
				ownChannel: "pdfViewer"
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._afterHide));
		},

		_initialize: function() {

			this.objectNode = put(this.domNode, "object[type='text/html'][height='100%'][width='100%']");
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("LOAD_PDF"),
				callback: "_subLoadPdf"
			});
		},

		_subLoadPdf: function(obj) {

			this._loadPdf(obj.url);
		},

		_beforeShow: function(req) {

			var url = (req.data && req.data.url) || this.urlPdf;

			if (url) {
				this._loadPdf(url);
			} else if (!this.lastPDF) {
				this._showTemplateDisplayerPdfError();
			}
		},

		_afterHide: function() {

			this._hideTemplateDisplayerPdfError();
		},

		_loadPdf: function(url) {

			var authChecker = this._authChecker();

			if (authChecker && (this.roleGuestActive || Credentials.get("accessToken")) && url &&
				url.substring((url.length - 4), (url.length)) === ".pdf") {

				if (this.lastPDF && this.lastPDF === url) {
					return;
				}

				this.lastPDF = url;

				var useBuilt = (/true/i).test(redmicConfig.getEnvVariableValue('envUseBuilt')),
					path = '/' + (useBuilt ? 'dist/js' : 'dep') + '/pdfjs/web/viewer.html?file=' + url;

				if (!this.roleGuestActive) {
					path += '?access_token%3D' + Credentials.get("accessToken");
				}

				this.objectNode.setAttribute("data", path);

				if (this.dialog) {
					var namePDF = url.split('/');
					this.dialog.set("title", namePDF[namePDF.length - 1]);
				}

				this.objectNode.addEventListener("load", lang.hitch(this, this._observerError));
			} else {
				this._showTemplateDisplayerPdfError();
			}
		},

		_authChecker: function() {

			if (!this.roleGuestActive && Credentials.get("userRole") === "ROLE_GUEST") {
				if (this.templateDisplayerPdfError) {
					this._publish(this.templateDisplayerPdfError.getChannel("CHANGE_TEMPLATE"), {
						template: TemplateAuthFailed
					});
				}

				return false;
			} else {
				this._hideTemplateDisplayerPdfError();

				return true;
			}
		},

		_showTemplateDisplayerPdfError: function() {

			this.lastPDF = null;

			if (!this.templateDisplayerPdfError) {
				this.templateDisplayerPdfError = new TemplateDisplayer({
					parentChannel: this.getChannel(),
					template: TemplateNoAvailable,
					"class": "mediumSolidContainer.viewerPDFAuthFailed.borderRadius",
					target: this.targetAuthFailed
				});
			}

			this._publish(this.templateDisplayerPdfError.getChannel("SHOW"), {
				node: this.domNode
			});

			this.objectNode.setAttribute("class", "hidden");
		},

		_hideTemplateDisplayerPdfError: function() {

			this.objectNode.classList.remove("hidden");

			if (this.templateDisplayerPdfError) {
				this._publish(this.templateDisplayerPdfError.getChannel("HIDE"));
			}
		},

		_observerError: function() {

			this.observer = new MutationObserver(lang.hitch(this, function(mutations) {

				mutations.forEach(lang.hitch(this, function() {

					if (this._isErrorPdfViewer()) {
						this._pdfError();
						this.observer.disconnect();
					}
				}));
			}));

			var config = { attributes: true, childList: true, characterData: true },
				node = this._getNodeObserver();

			node && this.observer.observe(node, config);
		},

		_isErrorPdfViewer: function() {

			var node = this._getNodeObserver();

			return !node || !node.hidden;
		},

		_getNodeObserver: function() {

			var all = this.objectNode && this.objectNode.contentDocument && this.objectNode.contentDocument.all,
				grandParentNode = all && all.errorMessage && all.errorMessage.parentNode;

			return grandParentNode && grandParentNode.parentNode;
		},

		_pdfError: function() {

			this._showTemplateDisplayerPdfError();
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
