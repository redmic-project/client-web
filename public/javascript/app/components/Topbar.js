define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/Manager"
], function(
	ContentPane
	, declare
	, lang
	, put
	, Manager
){
	return declare(ContentPane, {
		//	summary:
		//		Widget que controla la barra superior, siempre visible y compartida.
		//	description:
		//		Zona común que comparten todos los módulos.

		constructor: function(args) {

			this.config = {
				"class": "topbar",
				region: "top",
				doLayout: false,
				show: {
					left: true,
					right: true
				}
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			// Se crean los nodos
			this.logoNode = put(this.domNode, "div.topbarLogo", {
				innerHTML: "<a href='/home' d-state-url=true title='" + this.i18n.home +
					"'><img class='logo' src='/resources/images/logos/redmicSimple.png'></a>"
			});

			var envDfd = window.env;

			if (envDfd) {
				envDfd.then(lang.hitch(this, function(env) {

					put(this.domNode, 'div.versionNumber', env.version);
				}));
			}

			if (this.show.left) {
				this.leftNode = put(this.domNode, "div.manager");
			}

			this.manager = new Manager({
				parentChannel: this.parentChannel
			}, this.leftNode);
		}
	});
});
