define([
	"app/base/views/EditorLayerWithVariableForm"
	, "app/designs/base/_Main"
	, "app/designs/sidebarAndContent/Controller"
	, "app/designs/sidebarAndContent/layout/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/search/CompositeImpl"
], function(
	EditorLayerWithVariableForm
	, _Main
	, Controller
	, Layout
	, declare
	, lang
	, CompositeImpl
){
	return declare([Layout, Controller, _Main], {
		//	summary:
		//		Main para visor genérico.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				labelActiveDefault: 'filters'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.sidebarConfig = this._merge([{
				items: [{
					label: "filters",
					icon: "fa-filter",
					active: true
				},{
					label: "style",
					icon: "fa-paint-brush"
				}]
			}, this.sidebarConfig || {}],
			{
				arrayMergingStrategy: "concatenate"
			});

			this.compositeConfig = this._merge([{
				parentChannel: this.getChannel(),
				formConfig: {
					buttonsConfig: {
						cancel: {
							noActive: true
						}
					},
					classContainer: '.mediumTexturedContainer'
				}
			}, this.compositeConfig || {}]);

			this.editorLayerConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.editorLayerConfig || {}]);
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._mainAfterHide));
		},

		_initializeMain: function() {

			this.composite = new CompositeImpl(this.compositeConfig);
		},

		_mainAfterHide: function(data) {

			this._publish(this.composite.getChannel("HIDE"));
		},

		_filtersCallback: function() {

			return {
				instance: this.composite
			};
		},

		_styleCallback: function() {

			if (!this.editorLayer) {
				this.editorLayer = new EditorLayerWithVariableForm(this.editorLayerConfig);
			}

			return {
				instance: this.editorLayer,
				data: {
					configActivity: this.currentData.configActivity,
					modelLayerChannel: this.currentData.modelLayerChannel,
					dataModel: this.currentData.dataModel
				}
			};
		},

		_beforeShow: function(req) {

			this._updateConfig(req.data);

			this.currentData = req.data;

			this._publish(this.sidebar.getChannel("UPDATE_ACTIVE"), {
				label: this.labelActiveDefault
			});

			this.labelActiveDefault && this._itemLabelInSidebar(this.labelActiveDefault);
		},

		_updateConfig: function(data) {

			this._publish(this.composite.getChannel("CHANGE_FILTER_CHANNEL"), {
				filterChannel: data.filterChannel
			});
		}
	});
});
