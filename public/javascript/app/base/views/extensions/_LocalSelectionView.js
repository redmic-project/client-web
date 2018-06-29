define([
	"./_LocalSelectionViewItfc"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_SelectionBase"
	, "redmic/modules/gateway/LocalSelectorGatewayImpl"
], function (
	_LocalSelectionViewItfc
	, declare
	, lang
	, aspect
	, _SelectionBase
	, LocalSelectorGatewayImpl
){
	return declare([_SelectionBase, _LocalSelectionViewItfc], {
		//	summary:
		//

		constructor: function (args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_afterSetConfigurations", lang.hitch(this, this._setLocalSelectionViewConfigurations));
			aspect.after(this, "_initialize", lang.hitch(this, this._afterInitialize));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineLocalSelectionViewSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineLocalSelectionViewPublications));
		},

		_setLocalSelectionViewConfigurations: function() {

			if (this.browserConfig) {
				this.browserConfig = this._merge([{
					selectorChannel: this.getChannel(),
					browserConfig: {
						selectorChannel: this.getChannel()
					}
				}, this.browserConfig || {}]);
			}

			if (this.isList) {
				this.selectorChannel = this.getChannel();
			}

			if (this.geoJsonLayerConfig) {

				this.geoJsonLayerConfig = this._merge([{
					selectorChannel: this.getChannel()
				}, this.geoJsonLayerConfig || {}]);
			}
		},

		_afterInitialize: function() {

			this.localSelector = new LocalSelectorGatewayImpl({
				parentChannel: this.getChannel(),
				channelsDefinition: [{
					input: this.getChannel("SELECT"),
					output: this.getChannel("SELECTED"),
					subMethod: "select"
				},{
					input: this.getChannel("DESELECT"),
					output: this.getChannel("DESELECTED"),
					subMethod: "deselect"
				},{
					input: this.getChannel("CLEAR_SELECTION"),
					output: this.getChannel("SELECTION_CLEARED"),
					subMethod: "clearSelection"
				},{
					input: this.getChannel("SELECT_ALL"),
					output: this.getChannel("SELECTED_ALL"),
					subMethod: "selectAll"
				}]
			});
		},

		_defineLocalSelectionViewSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SELECTION_CLEARED"),
				callback: "_subSelectionCleared"
			},{
				channel : this.getChannel("SELECTED"),
				callback: "_subSelected"
			},{
				channel : this.getChannel("DESELECTED"),
				callback: "_subDeselected"
			},{
				channel : this.getChannel("SELECTED_ALL"),
				callback: "_subSelectedAll"
			});
		},

		_defineLocalSelectionViewPublications: function() {

			this.publicationsConfig.push({
				event: 'CLEAR_SELECTION',
				channel : this.getChannel("CLEAR_SELECTION"),
				callback: "_pubClearSelection"
			},{
				event: 'SELECT',
				channel : this.getChannel("SELECT"),
				callback: "_pubSelect"
			},{
				event: 'DESELECT',
				channel : this.getChannel("DESELECT"),
				callback: "_pubDeselect"
			});
		},

		_pubClearSelection: function(channel) {

			this._localClearSelection.apply(this, arguments);

			this._publish(channel, {
				selectionTarget: this.target
			});
		},

		_pubSelect: function(channel, ids) {

			this._localSelect.apply(this, arguments);

			this._publish(channel, {
				items: ids,
				selectionTarget: this.target
			});
		},

		_pubDeselect: function(channel, ids) {

			this._localDeselect.apply(this, arguments);

			this._publish(channel, {
				items: ids,
				selectionTarget: this.target
			});
		},

		_subSelected: function() {

			this._localSelected.apply(this, arguments);
		},

		_subDeselected: function() {

			this._localDeselected.apply(this, arguments);
		},

		_subSelectionCleared: function() {

			this._localSelectionCleared.apply(this, arguments);
		},

		_subSelectedAll: function() {

			this._localSelectionSelectedAll.apply(this, arguments);
		}
	});
});
