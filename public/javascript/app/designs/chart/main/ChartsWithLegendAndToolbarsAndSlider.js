define([
	"app/designs/chart/layout/SideAndTopAndBottomContent"
	, "app/designs/chart/main/_ChartsWithToolbarsAndSlider"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/chart/SmartLegend/TimeSeriesSmartLegendImpl"
], function (
	SideAndTopAndBottomContent
	, _ChartsWithToolbarsAndSlider
	, declare
	, lang
	, TimeSeriesSmartLegendImpl
){
	return declare([SideAndTopAndBottomContent, _ChartsWithToolbarsAndSlider], {
		//	summary:
		//		Main ChartsWithLegendAndToolbarsAndSlider.

		_initializeMain: function() {

			this._smartLegend = new TimeSeriesSmartLegendImpl({
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer,
					this.chartsContainer.getChannel)
			});

			this.inherited(arguments);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._smartLegend.getChannel("SHOW"), {
				node: this.sideNode
			});
		}
	});
});