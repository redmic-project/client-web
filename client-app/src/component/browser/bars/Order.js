define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Componente que aporta un selector de campo de ordenación y dirección.

		constructor: function(args) {

			this.config = {
				'class': 'orderZone',
				hiddenClass: 'hidden',
				optionDefault: 'default',
				ascIcon: 'fa-sort-amount-asc',
				descIcon: 'fa-sort-amount-desc',
				defaultOrderField: 'updated',
				defaultOrderDirection: 'DESC',

				actions: {
					ADD_TO_QUERY: 'addToQuery',
					UPDATE_OPTIONS: 'updateOptions'
				}
			};

			lang.mixin(this, this.config);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('UPDATE_OPTIONS'),
				callback: '_subUpdateOptions'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createOrder();

			if (this.defaultOrderField !== this.optionDefault) {
				this._publishOrder();
			}
		},

		_subUpdateOptions: function(req) {

			var options = req.options;

			if (!options) {
				return;
			}

			this.options = options;

			this.selectOrderNode && put(this.selectOrderNode, '!');

			this._createSelectOrderOption();
		},

		_createOrder: function() {

			put(this.domNode, 'span', this.i18n.sort + ':');

			this.orderNode = put(this.domNode, 'div.containerOrder');

			this._createDirectionOrder();

			if (!this.options) {
				return;
			}

			this._createSelectOrderOption();
		},

		_createSelectOrderOption: function() {

			this._currentOrderField = this.defaultOrderField;

			this.options.unshift({
				value: this.optionDefault
			});

			this.selectOrderNode = put(this.orderNode, 'select.form-control');

			this.selectOrderNode.onchange = lang.hitch(this, this._eventOrderOptionClick);


			for (var i = 0; i < this.options.length; i++ ) {
				var item = this.options[i],
					selected = '';

				if (item.value === this.defaultOrderField) {
					selected = '[selected]';
				}

				put(this.selectOrderNode, 'option' + selected + '[value=$]', item.value,
					item.label || this.i18n[item.value] || item.value);
			}

			this._changeDirectionIcon();
		},

		_createDirectionOrder: function() {

			this._currentOrderDirection = this.defaultOrderDirection;

			this.directionOrderNode = put(this.orderNode, 'span.' + this.hiddenClass);
			this.directionOrderNode.onclick = lang.hitch(this, this._eventDirectionClick);

			this._changeDirectionIcon();
		},

		_changeDirectionIcon: function() {

			var directionIconClass = 'fa ' + (this._currentOrderDirection === 'ASC' ? this.ascIcon : this.descIcon);

			this.directionOrderNode.setAttribute('class', directionIconClass);

			if (this._currentOrderField === this.optionDefault) {
				this._hideDirectionIcon();
			} else {
				this._showDirectionIcon();
			}
		},

		_hideDirectionIcon: function() {

			put(this.directionOrderNode, '.' + this.hiddenClass);
		},

		_showDirectionIcon: function() {

			put(this.directionOrderNode, '!' + this.hiddenClass);
		},

		_eventOrderOptionClick: function(evt) {

			var optionSelect = this.selectOrderNode.options[this.selectOrderNode.selectedIndex].value;

			if (optionSelect !== this._currentOrderField) {
				this._currentOrderField = optionSelect;
				this._applyCurrentOrderDirection();
			}
		},

		_eventDirectionClick: function() {

			this._toggleCurrentOrderDirection();
			this._applyCurrentOrderDirection();
		},

		_toggleCurrentOrderDirection: function() {

			if (this._currentOrderDirection === 'ASC') {
				this._currentOrderDirection = 'DESC';
			} else {
				this._currentOrderDirection = 'ASC';
			}
		},

		_applyCurrentOrderDirection: function() {

			this._changeDirectionIcon();
			this._publishOrder();
		},

		_publishOrder: function() {

			if (!this.queryChannel) {
				return;
			}

			this._publish(this._buildChannel(this.queryChannel, this.actions.ADD_TO_QUERY), {
				query: {
					sorts: this._createSorts(),
					target: this.target
				}
			});
		},

		_createSorts: function() {

			var sorts = [];

			if (this._currentOrderField !== this.optionDefault) {
				sorts.push({
					field: this._currentOrderField,
					order: this._currentOrderDirection
				});
			}

			return sorts;
		}
	});
});
