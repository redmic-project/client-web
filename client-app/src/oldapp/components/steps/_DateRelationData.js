define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
], function (
	declare
	, lang
	, moment
){
	return declare(null, {
		//	summary:
		//

		constructor: function (args) {

			this.config = {
				_datePropertyName: "date"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._optionsDate = this._optionsFormatDate();
		},

		_optionsFormatDate: function() {

			var dates = ['DD-MM-YYYY', 'YYYY-MM-DD'],
				times = ['HH', 'HH:mm', 'HH:mm:ss', 'HH:mm:ss.SSS'],
				contentDefault = ['YYYY', 'MM-YYYY', 'YYYY-MM'],
				content = [],
				i;

			for (i = 0; i < contentDefault.length; i++) {
				this._addOptionFormatDate(content, contentDefault[i]);
			}

			for (i = 0; i < dates.length; i++) {
				this._generatorOptionsFormatDate(dates[i], times, content);
			}

			return content;
		},

		_generatorOptionsFormatDate: function(date, arrayTime, content) {

			this._addOptionFormatDate(content, date);

			for (var i = 0; i < arrayTime.length; i++) {
				this._addOptionWithTime(content, date, ' ', arrayTime[i]);
				this._addOptionWithTime(content, date, 'T', arrayTime[i]);
				this._addOptionWithTime(content, date, ',', arrayTime[i]);
			}
		},

		_addOptionWithTime: function(content, date, separator, time) {

			var value = date + separator + time;

			this._addOptionFormatDate(content, value);
			this._addOptionFormatDate(content, value + 'Z');
		},

		_addOptionFormatDate: function(content, value) {

			content.push(value);
			content.push(value.replace(/-/g, "/"));
		},

		_selectConfigNewForm: function(schema) {

			if (!this._isDate()) {
				return this.inherited(arguments);
			}

			return {
				modelSchema: schema,
				template: "components/viewCustomization/relationData/views/templates/Date"
			};
		},

		_isDate: function(value) {

			if (!value) {
				value = this._currentValueSelect;
			}

			if (value === this._datePropertyName) {
				return true;
			}

			return false;
		},

		_subValueChangedModel: function(res) {

			if (this._isDate()) {
				var value = res['columns/0'];

				if (value) {
					var dateValue = this.data.data[0][value],
						format = false;

					for (var i = 0; i < this._optionsDate.length; i++) {

						var momentValid = moment(dateValue, this._optionsDate[i], true).isValid();

						if (momentValid) {
							format = this._optionsDate[i];
							break;
						}
					}

					if (format) {
						this._publish(this.form.getChildChannel('modelInstance', 'SET_PROPERTY_VALUE'), {
							'format': this._parseToFormatForAPI(format)
						});
					}
				}
			} else {
				this.inherited(arguments);
			}
		},

		_chkValidItem: function(item) {

			if (this._isDate()) {
				var dateValue = this.data.data[0][item.columns[0]],
					isValid = moment(dateValue, this._parseToFormatForJS(item.format), true).isValid();

					if (!isValid)
						this._emitEvt('COMMUNICATION', {
							type: "alert",
							level: "error",
							description: "Formato incorrecto"
						});

				return isValid;
			} else {
				return this.inherited(arguments);
			}
		},

		_parseToFormatForAPI: function(format) {

			format = format.replace(/D/g, "d");
			format = format.replace(/Y/g, "y");

			return format;
		},

		_parseToFormatForJS: function(format) {

			format = format.replace(/d/g, "D");
			format = format.replace(/y/g, "Y");

			return format;
		}
	});
});
