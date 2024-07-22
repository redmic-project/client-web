define([
	'app/base/views/extensions/_LocalSelectionView'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'redmic/modules/browser/_Select'
], function (
	_LocalSelectionView
	, declare
	, lang
	, aspect
	, _Select
){
	return declare(_LocalSelectionView, {
		//	summary:
		//

		constructor: function (args) {

			this.config = {
				simpleSelection: true,
				_totalSelected: 0,

				browserExts: [_Select]
			};

			lang.mixin(this, this.config, args);

			if (!this.simpleSelection) {
				this._results = [];
			}

			aspect.after(this, '_setConfigurations', lang.hitch(this, this._setCompleteBySelectionConfigurations));
			aspect.before(this, '_clearStep', lang.hitch(this, this._completeBySelectionClearStep));
			aspect.before(this, '_resetStep', lang.hitch(this, this._completeBySelectionResetStep));
		},

		_setCompleteBySelectionConfigurations: function() {

			this.browserConfig = this._merge([{

			}, this.browserConfig || {}, {
				simpleSelection: this.simpleSelection
			}]);
		},

		// pisa los botones de edición
		_addListButtonsEdition: function() {},

		_localSelected: function(item) {

			var ids = item.ids instanceof Array ? item.ids : [item.ids],
				_changeResults = false;

			if (!this.simpleSelection) {
				for (var i = 0; i < ids.length; i++) {
					var id = ids[i];
					if (this._results.indexOf(id) < 0) {
						_changeResults = true;
						this._totalSelected ++;
						this._results.push(id);
					}
				}
			} else {
				this._totalSelected = 1;
				this._results = ids[0];
			}

			this._emitChangeResults();
		},

		_emitChangeResults: function() {

			this._isCompleted = !!this._totalSelected;

			if (this.propertyName) {
				var obj = {};
				obj[this.propertyName] = this._results;

				this._emitEvt('SET_PROPERTY_VALUE', obj);
			}

			this._emitEvt('REFRESH_STATUS');
		},

		_localDeselected: function(item) {

			var id = item.ids instanceof Array ? item.ids[0]: item.ids;

			if (!this.simpleSelection) {
				var posArrayItem = this._results.indexOf(id);

				if (posArrayItem > -1) {
					this._results.splice(posArrayItem, 1);
					this._totalSelected--;
				}
			} else {
				this._totalSelected = 0;
				this._results = null;
			}

			this._emitChangeResults();
		},

		_localClearSelection: function(channel) {

			if (!this.simpleSelection) {
				this._results = [];
			} else {
				this._results = null;
			}

			this._totalSelected = 0;

			this._emitChangeResults();
		},

		_instanceDataToResult: function(data) {

			if (!data || !this.propertyName || !data[this.propertyName]) {
				return;
			}

			this._emitEvt('CLEAR_SELECTION');

			this._defaultData = data;
			var result = data[this.propertyName][this.idProperty];

			this._emitEvt('SELECT', result);
		},

		_completeBySelectionClearStep: function() {

			this._emitEvt('CLEAR_SELECTION');
		},

		_completeBySelectionResetStep: function() {

			this._emitEvt('CLEAR_SELECTION');

			this._instanceDataToResult(this._defaultData);
		}
	});
});
