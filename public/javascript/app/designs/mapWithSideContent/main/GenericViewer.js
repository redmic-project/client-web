define([
	"app/base/views/extensions/_ShowInPopupResultsFromQueryOnMap"
	, "app/base/views/extensions/_QueryOnMap"
	, "app/designs/base/_Main"
	, "app/designs/mapWithSideContent/Controller"
	, "app/designs/mapWithSideContent/layout/MapAndContentAndTopbar"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"

	, "app/designs/primaryAndSecondaryContent/Controller"
	, "app/designs/primaryAndSecondaryContent/layout/Layout"
	, "app/designs/sidebarAndContent/main/GenericViewerPrimaryContent"
	, "app/designs/sidebarAndContent/main/GenericViewerSecondaryContent"
	, "app/designs/sidebarAndContent/main/GenericViewerConfigLayerContent"
	, "app/designs/sidebarAndContent/main/_LayersManagementTab"
], function(
	_ShowInPopupResultsFromQueryOnMap
	, _QueryOnMap
	, _Main
	, Controller
	, Layout
	, ContentPane
	, declare
	, lang
	, _Store

	, PrimaryAndSecondaryContentController
	, PrimaryAndSecondaryContentLayout
	, GenericViewerPrimaryContent
	, GenericViewerSecondaryContent
	, GenericViewerConfigLayerContent
	, _LayersManagementTab
){
	return declare([Layout, Controller, _Main, _Store, _QueryOnMap, _ShowInPopupResultsFromQueryOnMap], {
		//	summary:
		//		Main para visor genérico.
		//	description:
		//

		constructor: function (args) {

			this.config = {

			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.primaryContentConfig = this._merge([{
				parentChannel: this.getChannel(),
				viewerConfigByActivityCategory: this._viewerConfigByActivityCategory
			}, this.primaryContentConfig || {}]);

			this.secondaryContentConfig = this._merge([{
				parentChannel: this.getChannel(),
				viewerConfigByActivityCategory: this._viewerConfigByActivityCategory
			}, this.secondaryContentConfig || {}]);

			this.configLayerContentConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.configLayerContentConfig || {}]);
		},

		_initializeMain: function() {

			this.primaryContentConfig.getMapChannel = lang.hitch(this.map, this.map.getChannel);

			this.primaryContent = new declare([
				GenericViewerPrimaryContent,
				_LayersManagementTab
			])(this.primaryContentConfig);

			this.secondaryContent = new GenericViewerSecondaryContent(this.secondaryContentConfig);

			this.configLayerContent = new GenericViewerConfigLayerContent(this.configLayerContentConfig);

			this.primaryAndSecondaryContent = new declare([
				PrimaryAndSecondaryContentLayout,
				PrimaryAndSecondaryContentController
			])({
				parentChannel: this.getChannel(),
				primaryContentChannel: this.primaryContent.getChannel(),
				secondaryContentChannel: this.secondaryContent.getChannel(),
				title: this.i18n.viewer
			});
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.primaryContent.getChannel("CHANGE_TO_SECONDARY"),
				callback: "_subChangeToSecondary"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this.sideNode = new ContentPane({
				splitter: true,
				region: "right",
				'class': "col-xs-6 col-sm-5 col-md-6 col-lg-5 sideTabContainer"
			});

			this.contentNode.addChild(this.sideNode);

			this._publish(this.primaryAndSecondaryContent.getChannel("SHOW"), {
				node: this.sideNode
			});
		},

		_subChangeToSecondary: function(req) {

			if (req.source === 'layers') {
				req.channel = this.configLayerContent.getChannel();
			}

			this._publish(this.primaryAndSecondaryContent.getChannel("CHANGE_TO_SECONDARY"), req);
		}
	});
});
