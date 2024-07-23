define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment/moment.min'
	, "src/component/base/_Store"
	, "src/component/browser/_EditionTable"
	, "src/component/browser/bars/Pagination"
	, "src/component/browser/bars/Total"
], function(
	_CompositeInTooltipFromIconKeypad
	, _AddFilter
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, moment
	, _Store
	, _EditionTable
	, Pagination
	, Total
){
	return declare([Layout, Controller, _AddFilter, _CompositeInTooltipFromIconKeypad, _Store], {
		// summary:
		// 	Vista para puntos de un tracking.
		// description:
		// 	Permite ver los puntos de un tracking y editarlos.

		constructor: function(args) {

			this.config = {
				idProperty: 'uuid',
				title: "{viewContent}: {elementName}",
				replaceTarget: redmicConfig.services.trackElementTracking,
				target: [redmicConfig.services.activity],
				elementBaseTarget: redmicConfig.services.elementsTrackingActivity,
				pointTrackAnimalTarget: redmicConfig.services.animalTrackingActivity,
				pointTrackPlatformTarget: redmicConfig.services.platformTrackingActivity,

				browserExts: [_EditionTable]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				idProperty: this.idProperty,
				pathSeparator: '/',
				bars: [{
					instance: Total
				},{
					instance: Pagination
				}],
				tableConfig: {
					columns: [{
						property: "properties/date",
						label: this.i18n.date,
						style: "width: 20rem;",
						format: function(value) {
							return moment(value).format("YYYY-MM-DD HH:mm:ss");
						}
					},{
						property: "properties/qFlag",
						label: this.i18n.qFlag,
						style: "width: 20rem;"
					},{
						property: "properties/vFlag",
						label: this.i18n.vFlag,
						style: "width: 20rem;"
					},{
						property: "properties/speedKph",
						label: this.i18n.speedKph,
						style: "width: 12rem;",
						notContent: '-',
						format: lang.hitch(this, this._formatColumn, 'km/h')
					},{
						property: "properties/lastDistanceKm",
						label: this.i18n.lastDistanceKm,
						style: "width: 15rem;",
						notContent: '-',
						format: lang.hitch(this, this._formatColumn, 'km')
					},{
						property: "properties/cumulativeKm",
						label: this.i18n.cumulativeKm,
						style: "width: 15rem;",
						notContent: '-',
						format: lang.hitch(this, this._formatColumn, 'km')
					},{
						property: "properties/locationClass",
						label: this.i18n.locationClass,
						style: "width: 10rem;",
						notContent: '-'
					}]
				},
				formConfig: {
					template: "dataLoader/tracking/views/templates/form/TrackingPoint"
				}
			}, this.browserConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					vFlags: null,
					qFlags: null,
					accessibilityIds: null,
					returnFields: [
						"id",
						"properties.inTrack",
						"uuid"
					]
				}
			}, this.filterConfig || {}]);
		},

		_formatColumn: function(unit, value) {

			if (value === '-') {
				return value;
			}

			return value && (value.toFixed(3) + ' ' + unit);
		},

		_beforeShow: function() {

			if (!this.pathVariableId) {
				return;
			}

			var target = lang.replace(this.replaceTarget, {
				activityid: this.pathVariableId.activityid,
				elementuuid: this.pathVariableId.id
			});

			if (target === this.target[1]) {
				return;
			}

			this.target[1] = target;

			this._emitEvt('UPDATE_TARGET', {
				target: target,
				refresh: true
			});

			this._getElement();
			this._getActivity();
		},

		_getActivity: function() {

			var activityid = this.pathVariableId.activityid;

			if (this._lastActivity === activityid)
				return;

			this._lastActivity = this.pathVariableId.activityid;

			this._emitEvt('GET', {
				target: this.target[0],
				id: activityid,
				options: {},
				requesterId: this.getOwnChannel()
			});
		},

		_getElement: function() {

			var target = lang.replace(this.elementBaseTarget, {
				id: this.pathVariableId.activityid
			});

			if (this.target[2]) {
				this.target[2] = target;
			} else {
				this.target.push(target);
			}

			this._emitEvt('GET', {
				target: target,
				id: this.pathVariableId.id,
				options: {},
				requesterId: this.getOwnChannel()
			});
		},

		_itemAvailable: function(res, resWrapper) {

			var data = res.data;

			if (resWrapper.target === this.target[0]) {
				this._updateTargetForm(data);
			} else if (data) {
				this._setTitle(lang.replace(this.title, {
					viewContent: this.i18n.pointsTrack,
					elementName: data.name
				}));
			}
		},

		_updateTargetForm: function(data) {

			var cat = data.activityCategory,
				target;

			if (cat === 'at') {
				target = this.pointTrackAnimalTarget;
			} else if (cat === 'pt') {
				target = this.pointTrackPlatformTarget;
			} else {
				return;
			}

			target = lang.replace(target, {
				activityid: this.pathVariableId.activityid
			});

			this._publish(this.browser.getChannel("UPDATE_TARGET_FORM"), {
				target: target
			});
		}
	});
});
