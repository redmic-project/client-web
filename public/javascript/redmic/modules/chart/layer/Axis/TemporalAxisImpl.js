define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/_base/kernel"
	, "./Axis"
	, "./_HorizontalCommons"
], function(
	d3
	, declare
	, lang
	, kernel
	, Axis
	, _HorizontalCommons
){
	return declare([Axis, _HorizontalCommons], {
		//	summary:
		//		Implementación de eje temporal.

		constructor: function(args) {

			this.config = {
				ownChannel: "temporalAxis",
				className: "axis xAxis",
				opacity: 0.6,
				parameterName: this.i18n.time,

				_domainMarginFactor: 0.01
			};

			lang.mixin(this, this.config, args);

			this._createLocaleDefinition();
			this._createLocaleFormats();
		},

		_createLocaleDefinition: function() {

			this._localeDefinition = {
				time: "%H:%M:%S",
				periods: ["AM", "PM"],
				days: [
					this.i18n.sunday, this.i18n.monday, this.i18n.tuesday, this.i18n.wednesday,
					this.i18n.thursday, this.i18n.friday, this.i18n.saturday
				],
				shortDays: [
					this.i18n.sundayShort, this.i18n.mondayShort, this.i18n.tuesdayShort,
					this.i18n.wednesdayShort, this.i18n.thursdayShort, this.i18n.fridayShort,
					this.i18n.saturdayShort
				],
				months: [
					this.i18n.january, this.i18n.february, this.i18n.march, this.i18n.april,
					this.i18n.may, this.i18n.june, this.i18n.july, this.i18n.august,
					this.i18n.september, this.i18n.october, this.i18n.november,
					this.i18n.december
				],
				shortMonths: [
					this.i18n.januaryShort, this.i18n.februaryShort, this.i18n.marchShort,
					this.i18n.aprilShort, this.i18n.mayShort, this.i18n.juneShort,
					this.i18n.julyShort, this.i18n.augustShort, this.i18n.septemberShort,
					this.i18n.octoberShort, this.i18n.novemberShort, this.i18n.decemberShort
				]
			};

			var localeProps;

			if (kernel.locale === "es") {
				localeProps = {
					decimal: ",",
					thousands: ".",
					dateTime: "%A, %e de %B de %Y, %X",
					date: "%d/%m/%Y"
				};
			} else {
				localeProps = {
					decimal: ".",
					thousands: ",",
					dateTime: "%a %b %e %X %Y",
					date: "%m/%d/%Y"
				};
			}

			lang.mixin(this._localeDefinition, localeProps);
		},

		_createLocaleFormats: function() {

			var locale = d3.timeFormatDefaultLocale(this._localeDefinition);

			this._localeFormats = {
				ms: locale.format(":%S.%L"),
				s: locale.format(":%S"),
				m: locale.format("%I:%M"),
				h: locale.format("%I %p"),
				d: locale.format("%a %d"),
				w: locale.format("%b %d"),
				M: locale.format("%B"),
				y: locale.format("%Y")
			};
		},

		_createAxis: function(container) {

			var axis = d3.axisBottom()
				.tickSizeInner(this.innerTickSize)
				.tickPadding(this.tickPadding)
				.tickFormat(lang.hitch(this, this._getTemporalTickFormat));

			container.attr("class", this.className);

			return axis;
		},

		_getTemporalTickFormat: function(date) {

			var f = this._localeFormats;
			return (d3.timeSecond(date) < date ? f.ms
				: d3.timeMinute(date) < date ? f.s
				: d3.timeHour(date) < date ? f.m
				: d3.timeDay(date) < date ? f.h
				: d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? f.d : f.w)
				: d3.timeYear(date) < date ? f.M
				: f.y)(date);
		},

		_updateAxis: function(axis) {

			this.rotateLabels && this._rotateLabels();
		},

		_getDomainWithMargin: function(domain) {

			var min = domain[0],
				max = domain[1],
				diff = max - min,
				margin;

			if (this.omitMargin || !diff) {
				margin = 1000;
			} else {
				// TODO se podría calcular los ms necesarios para que quepan los píxeles que ocupa
				// la línea o el punto de la gráfica (con scale.invert). De esa manera, cuando el
				// porcentaje calculado sea muy pequeño, usamos el cálculo en su lugar para
				// asegurarnos de que se ve bien
				margin = diff * this._domainMarginFactor;
			}

			domain[0].setMilliseconds(domain[0].getMilliseconds() - margin);
			domain[1].setMilliseconds(domain[1].getMilliseconds() + margin);

			return domain;
		}
	});
});
