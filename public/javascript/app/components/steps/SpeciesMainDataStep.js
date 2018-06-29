define([
	"app/components/steps/MainDataStep"
	, "app/designs/externalTextSearchList/main/Worms"
	, "app/redmicConfig"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/layout/DialogSimple"
], function (
	MainDataStep
	, Worms
	, redmicConfig
	, ContentPane
	, declare
	, lang
	, aspect
	, DialogSimple
){
	return declare(MainDataStep, {
		//	summary:
		//		Step de SpeciesMainData.

		constructor: function (args) {

			this.config = {
				speciesMainEvents: {
					GET_PROPERTY_VALUE: "getPropertyValue"
				},
				speciesMainActions: {
					SET_PROPERTY_VALUE: "setPropertyValue"
				},
				formTemplate: "administrative/taxonomy/views/templates/forms/Species",
				target: redmicConfig.services.species,
				label: this.i18n.species
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixSpeciesMainEventsAndActions));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeSpeciesMain));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineSpeciesMainSubscriptions));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineSpeciesMainPublications));
			aspect.before(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setSpeciesMainOwnCallbacksForEvents));
		},

		_mixSpeciesMainEventsAndActions: function() {

			lang.mixin(this.events, this.speciesMainEvents);
			lang.mixin(this.actions, this.speciesMainActions);

			delete this.speciesMainEvents;
			delete this.speciesMainActions;
		},

		_initializeSpeciesMain: function() {

			this.worms = new Worms({
				parentChannel: this.getChannel(),
				notificationSuccess: false
			});
		},

		_defineSpeciesMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.worms.getChannel("UPDATE_DATA"),
				callback: "_subUpdateByWorms"
			},{
				channel : this.form.getChannel("GOT_PROPERTY_VALUE"),
				callback: "_subGotPropertyValue"
			});
		},

		_defineSpeciesMainPublications: function() {

			this.publicationsConfig.push({
				event: 'GET_PROPERTY_VALUE',
				channel: this.form.getChannel("GET_PROPERTY_VALUE")
			});
		},

		_setSpeciesMainOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onHideStep));
			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._onHideStep));
		},

		postCreate: function() {

			this._once(this.form.getChannel('SHOWN'), lang.hitch(this, function() {
				this._publish(this.form.getChannel("SET_METHOD"), {
					"onSearchByScientificName": lang.hitch(this, this._searchByScientificName)
				});

				this._publish(this.form.getChannel("SET_METHOD"), {
					"onSearchByAphia": lang.hitch(this, this._searchByAphia)
				});
			}));

			this.wormsNode = new ContentPane({
				region: "center"
			});

			this.wormsDialog = new DialogSimple({
				title: this.i18n.worms,
				centerContent: this.wormsNode,
				width: 4,
				height: "md",
				reposition: "e",
				onHide: lang.hitch(this, this._hideWormsTool)
			});

			this.wormsDialog.own(this.domNode);

			this.inherited(arguments);
		},

		_onHideStep: function(evt) {

			this._hideWormsTool();
		},

		_subUpdateByWorms: function(item) {

			if (!item || !item.data) {
				return;
			}

			item = item.data;

			if (this.currentData) {
				for (var key in item) {
					if (item[key] === null) {
						delete item[key];
					}
				}
			}

			this._publish(this.form.getChannel("SET_DATA"), {
				data: item,
				toInitValues: false,
				keepAllData: this.currentData ? true : false
			});

			this._hideWormsTool();
		},

		_hideWormsTool: function() {

			this._publish(this.worms.getChannel("HIDE"));
			this.wormsDialog.hide();
		},

		_searchByScientificName: function() {

			this._ownRequestWorms = true;
			this._emitEvt('GET_PROPERTY_VALUE', {
				propertyName: "scientificName"
			});
		},

		_searchByAphia: function() {

			this._ownRequestWorms = true;
			this._emitEvt('GET_PROPERTY_VALUE', {
				propertyName: "aphia"
			});
		},

		_subGotPropertyValue: function(res) {

			if (res && (res.propertyName == "aphia" || res.propertyName == "scientificName") && this._ownRequestWorms) {
				this._ownRequestWorms = false;

				var showInfo = {
					node: this.wormsNode.domNode
				};

				if (res.value) {
					showInfo.data = res.value;
				}

				if (this.currentData) {
					showInfo.editionMode = true;
				}

				this._publish(this.worms.getChannel("SHOW"), showInfo);
				this.wormsDialog.show();
			}
		}
	});
});
