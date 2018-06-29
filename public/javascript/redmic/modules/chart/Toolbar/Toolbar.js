define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "./_ToolbarItfc"
], function(
	declare
	, lang
	, _Module
	, _Show
	, _ToolbarItfc
){
	return declare([_Module, _Show, _ToolbarItfc], {
		//	summary:
		//		Barra de herramientas para cambiar el funcionamiento de las gráficas.

		constructor: function(args) {

			this.config = {
				events: {
					TOOL_ACTUATED: "toolActuated"
				},
				actions: {
					TOOL_ACTUATED: "toolActuated",
					SHOW_TOOL: "showTool",
					HIDE_TOOL: "hideTool"
				},
				'class': "chartsToolbar"
			};

			lang.mixin(this, this.config, args);
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'TOOL_ACTUATED',
				channel: this.getChannel("TOOL_ACTUATED")
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
