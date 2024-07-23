define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/ChartsContainer/InfoChartsContainerImpl"
], function (
	_Controller
	, declare
	, lang
	, InfoChartsContainerImpl
){
	return declare(_Controller, {
		//	summary:
		//		Controlador para diseño de componentes que constan de un contenedor de gráficas y elementos añadidos
		//		al mismo.

		constructor: function(args) {

			this.config = {
				chartsContainerExts: []
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.chartsContainerConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.chartsContainerConfig || {}]);
		},

		_initializeController: function() {

			this.chartsContainerExts.unshift(InfoChartsContainerImpl);

			this.chartsContainer = new declare(this.chartsContainerExts)(this.chartsContainerConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.chartsContainer.getChannel("SHOW"), {
				node: this.chartsNode
			});
		}
	});
});
