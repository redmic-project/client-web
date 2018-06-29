define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/base/_Store"
], function(
	declare
	, lang
	, aspect
	, put
	, _Module
	, _Show
	, _Store
){
	return declare([_Module, _Show, _Store], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				'class': 'paginate',

				pageSizeOptions: [25, 50, 100, 200, 300],
				rowPerPage: 100,
				totalPages: null,
				_currentPage: 1,

				actions: {
					VALUE_CHANGED: "valueChanged",
					ADD_TO_QUERY: "addToQuery",
					GO_TO_PAGE: "goToPage",
					SET_TOTAL: "setTotal",
					RESET_PAGINATION: "resetPagination"
				}
			};

			lang.mixin(this, this.config);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("GO_TO_PAGE"),
				callback: "_subGoToPage"
			},{
				channel : this.getChannel("SET_TOTAL"),
				callback: "_subSetTotal"
			},{
				channel : this.getChannel("RESET_PAGINATION"),
				callback: "_subResetPagination"
			});
		},

		_initialize: function() {

			this._addSelectPageStructure();

			this._addOptionsStructure();
		},

		_addSelectPageStructure: function() {

			this.paginateSelectNode = put(this.domNode, 'div.selectPage nav');
		},

		_addOptionsStructure: function() {

			var divNode = put(this.domNode, 'div.selectOption');

			var selectNode = put(divNode, 'select.form-control');

			selectNode.onchange = lang.hitch(this, this._eventOptionClick, selectNode);

			for (var i = 0; i < this.pageSizeOptions.length; i++ ) {
				this._addOption(selectNode, this.pageSizeOptions[i]);
			}
		},

		_addOption: function(node, optionConfig) {

			var option = "option[value=$]";

			if (optionConfig == this.rowPerPage) {
				option += "[selected]";
			}
			put(node, option, optionConfig, optionConfig);
		},

		_eventOptionClick: function(node) {

			this.rowPerPage = parseInt(node.options[node.selectedIndex].value, 10);
			this._currentPage = 1;

			this._goToPage(this._currentPage);
		},

		_subGoToPage: function(req) {

			this._goToPage(req.index);
		},

		_subSetTotal: function(req) {

			this._setTotal(req.value);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._once(this._buildChannel(this.queryChannel, this.actions.GOT_PROPS),
				lang.hitch(this, this._subModelChannelGotProps));

			this._publish(this._buildChannel(this.queryChannel, this.actions.GET_PROPS), {
				modelChannel: true
			});
		},

		_subModelChannelGotProps: function(res) {

			var modelChannel = res.modelChannel;

			this._setSubscription({
				channel: this._buildChannel(modelChannel, this.actions.VALUE_CHANGED),
				callback: lang.hitch(this, this._subModelValueChanged)
			});
		},

		_subModelValueChanged: function(res) {

			var from = res.from;

			if (!this._updateDataByMe && Number.isInteger(from)) {
				this._currentPage = (from / this.rowPerPage) + 1;

				this._refreshBarPages();
			}
		},

		_subResetPagination: function() {

			this._resetPagination();
		},

		_resetPagination: function() {

			this._currentPage = 1;
		},

		_setTotal: function(/*int*/ total) {

			this.total = total;

			this._calcPaginate();
			this._refreshBarPages();
		},

		_calcPaginate: function() {

			if (this.total) {
				var div = this.total / this.rowPerPage;
				this.totalPages = Math.ceil(div);
			} else {
				this.totalPages = 0;
			}
		},

		_refreshBarPages: function() {

			if (this.containerUlNode) {
				this._cleanNode(this.containerUlNode);
			}

			this.containerUlNode = put(this.paginateSelectNode, 'ul.pagination');

			this._addAngleLeft();

			var left = true,
				right = true,
				hiddenAngle = false;

			if (!this.total || this.totalPages < 1) {
				left = false;
				right = false;
				hiddenAngle = true;
			} else {
				this._insertBarElement(this._currentPage, true);

				if (this._currentPage == 1) {
					left = false;
				}

				if (this._currentPage == this.totalPages) {
					right = false;
				}
			}

			this._addAngleRight();

			this._angleHidden(hiddenAngle);

			this._angle(left, right);
		},

		_cleanNode: function(node) {

			put(node, '!');
		},

		_insertBarElement: function(value, disable) {

			var node = put(this.containerUlNode, 'li[value=$]' + (disable ? '.active' : '') + ' a[value=$]', value, value, value);

			if (!disable) {
				node.onclick = lang.hitch(this, this._eventClick, value);
			}
		},

		_eventClick: function(value) {

			this._goToPage(value);

			this._currentPage = value;

			this._refreshBarPages();
		},

		_angleHidden: function(hidden) {

			if (hidden) {
				put(this.containerUlNode.parentNode, '.hidden');
			} else {
				put(this.containerUlNode.parentNode, '!hidden');
			}
		},

		_angle: function(left, right) {

			this._angleLeft(left);
			this._angleRight(right);
		},

		_addAngleLeft: function(hidden) {

			this.angleDoubleLeft = put(this.containerUlNode, 'li.anglePage span.angle.fa.fa-angle-double-left');
			this.angleLeft = put(this.containerUlNode, 'li.anglePage span.angle.fa.fa-angle-left');
		},

		_angleLeft: function(left) {

			if (left) {
				this._angleLeftEnable();
			} else {
				this._angleLeftDisable();
			}
		},

		_angleLeftEnable: function() {

			this.angleDoubleLeft.parentNode.onclick = lang.hitch(this, this._eventClick, 1);
			this.angleLeft.parentNode.onclick = lang.hitch(this, this._eventClick, this._currentPage - 1);
		},

		_angleLeftDisable: function() {

			var disabled = '.disabled';

			put(this.angleDoubleLeft.parentNode, disabled);
			put(this.angleLeft.parentNode, disabled);
		},

		_addAngleRight: function(hidden) {

			this.angleRight = put(this.containerUlNode, 'li.anglePage span.angle.fa.fa-angle-right');
			this.angleDoubleRight = put(this.containerUlNode, 'li.anglePage span.angle.fa.fa-angle-double-right');
		},

		_angleRight: function(right) {

			if (right) {
				this._angleRightEnable();
			} else {
				this._angleRightDisable();
			}
		},

		_angleRightDisable: function() {

			var disabled = '.disabled';

			put(this.angleRight.parentNode, disabled);
			put(this.angleDoubleRight.parentNode, disabled);
		},

		_angleRightEnable: function() {

			this.angleRight.parentNode.onclick = lang.hitch(this, this._eventClick, this._currentPage + 1);
			this.angleDoubleRight.parentNode.onclick = lang.hitch(this, this._eventClick, this.totalPages);
		},

		_goToPage: function(value) {

			if (this.totalPages && value && value <= this.totalPages && value > 0) {
				this._publishPagination(this._calcRank(value));
			}
		},

		_publishPagination: function(obj) {

			if (this.queryChannel) {

				this._updateDataByMe = true;

				this._publish(this._buildChannel(this.queryChannel, this.actions.ADD_TO_QUERY), {
					query: obj
				});
			}
		},

		_calcRank: function(value) {

			var start = (value - 1) * this.rowPerPage,
				obj = {
					size: this.rowPerPage
				};

			if (start !== undefined && start !== null) {
				obj.from = start;
			}

			return obj;
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_dataAvailable: function(response) {

			var data = response.data,
				total = (data.total >= 0) ? data.total : response.total;

			if ((total === undefined || total === null) && data.data) {
				total = data.data.total;
			}

			this._updateDataByMe = false;

			this._setTotal(total);
		}
	});
});
