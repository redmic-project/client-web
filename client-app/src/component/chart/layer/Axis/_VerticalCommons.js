define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	d3
	, declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Elementos comunes para los ejes vinculados a la disposición vertical.

		constructor: function(args) {

			this.config = {
				orient: 'left'
			};

			lang.mixin(this, this.config, args);

			this._onEvt('ORIENT_SET', lang.hitch(this, this._onOrientSet));
			this._onEvt('REFRESHED', lang.hitch(this, this._onRefreshed));
		},

		_createAxis: function(container) {

			var axis = this._getAxisInstance();

			container.attr('class', this.className);

			return axis;
		},

		_getAxisInstance: function() {

			var leftOriented = this.orient === 'left',
				axisConstructor = leftOriented ? 'axisLeft' : 'axisRight',
				axis = d3[axisConstructor]();

			axis
				.tickSizeInner(this.innerTickSize)
				.tickPadding(this.tickPadding);

			return axis;
		},

		_createLabel: function(container) {

			var textContent = this.i18n[this.parameterName] || this.parameterName;

			this._textElement = container.append('svg:text')
				.style('text-anchor', 'middle')
				.text(textContent);
		},

		_onRefreshed: function() {

			this._relocateLabel();
		},

		_relocateLabel: function() {

			var leftOriented = this.orient === 'left',
				labelTransform = this._getLabelTransform(leftOriented),
				labelXPos = this._getLabelXPosition(leftOriented),
				labelYPos = this._getLabelYPosition(leftOriented);

			this._textElement
				.attr('transform', labelTransform)
				.attr('x', labelXPos)
				.attr('y', labelYPos);
		},

		_getLabelXPosition: function(leftOriented) {

			var bbox = this._container.node().getBBox(),
				axisHeight = bbox.height;

			return (leftOriented ? -axisHeight : axisHeight) / 2;
		},

		_onOrientSet: function(changeObj) {

			var orient = changeObj.value,
				oldOrient = changeObj.oldValue;

			if (orient === oldOrient) {
				return;
			}

			var leftOriented = orient === 'left',
				textAnchor = orient === 'left' ? 'end' : 'start',
				scale = this._axis.scale();

			this._container.attr('text-anchor', textAnchor);

			this._axis = this._getAxisInstance();
			this._axis.scale(scale);

			this._refresh();
		}
	});
});
