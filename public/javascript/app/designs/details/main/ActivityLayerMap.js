define([
	"app/base/views/extensions/_ListenActivityDataAndAccessByActivityCategory"
	, "app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/designs/mapWithSideContent/main/Geographic"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'redmic/modules/map/layer/WmsLayerImpl'
	, 'templates/ActivityLayerList'
], function(
	_ListenActivityDataAndAccessByActivityCategory
	, _Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, Geographic
	, declare
	, lang
	, WmsLayerImpl
	, ActivityLayerList
) {

	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection,
		_ListenActivityDataAndAccessByActivityCategory], {
		//	summary:
		//		Vista detalle de ActivityLayerMap.

		constructor: function(args) {

			this.config = {
				_titleRightButtonsList: [],
				noScroll: true,
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				geographic: {
					width: 6,
					height: 6,
					type: Geographic,
					props: {
						title: this.i18n.map,
						target: this.targetChange,
						classWindowContent: "view",
						notTextSearch: true,
						browserConfig: {
							template: ActivityLayerList
						}
					}
				}
			}, this.widgetConfigs || {}]);

			this.layerConfig = this._merge([{
				idProperty: 'uuid',
				parentChannel: this.getChannel()
			}, this.layerConfig || {}]);
		},

		_initialize: function() {

			if (!this.definitionLayer) {
				this.definitionLayer = [WmsLayerImpl];
			}

			this._layerDefinition = declare(this.definitionLayer);
		},

		_clearModules: function() {

			this._publish(this._widgets.geographic.getChannel("CLEAR"));
			this._publish(this._widgets.geographic.getChannel("REFRESH"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this.targetChange = lang.replace(this.templateTargetChange, {id: this.pathVariableId});

			this._publish(this._widgets.geographic.getChannel("UPDATE_TARGET"), {
				target: this.targetChange,
				refresh: true
			});
		}
	});
});
