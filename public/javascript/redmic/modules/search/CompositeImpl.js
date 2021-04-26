define([
	"app/base/views/extensions/_AddForm"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "templates/FilterForm"
	, "./Search"
], function(
	_AddForm
	, declare
	, lang
	, aspect
	, formTemplate
	, Search
){
	return declare([Search, _AddForm], {
		//	summary:
		//
		//	description:
		//

		'class': 'compositeSearch',

		constructor: function(args) {

			this.config = {
				ownChannel: "compositeSearch",
				idProperty: 'id',

				compositeEvents: {},

				compositeActions: {
					CHANGED_MODEL: "changedModel",
					CHANGE_FILTER_CHANNEL: "changeFilterChannel",
					REQUEST_FILTER: "requestFilter",
					REMEMBER_CURRENT_VALUE: "rememberCurrentValue",
					HAS_CHANGED: "hasChanged",
					WAS_CHANGED: "wasChanged"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixCompositeEventsAndActions));
			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setCompositeConfigurations));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineCompositeSubscriptions));
			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setCompositeOwnCallbacksForEvents));
		},

		_setCompositeConfigurations: function() {

			this.formConfig = this._merge([{
				formContainerConfig: {
					ignoreNonexistentProperty: true,
					isDisableInputs: true
				},
				modelConfig: {
					noSerializeNullValue: true,
					filterSchema: true
				},
				buttonsConfig: {
					reset: {
						noActive: false
					},
					submit: {
						props: {
							label: this.i18n.apply
						}
					},
					clear: {
						noActive: true
					},
					cancel: {
						noActive: false,
						zone: "left"
					}
				},
				cancel: function() {

					this._emitEvt('CANCELLED');
				},
				template: formTemplate,
				dataTemplate: {
					formTitle: this.i18n.filters
				}
			}, this.formConfig || {}]);
		},

		_mixCompositeEventsAndActions: function() {

			lang.mixin(this.events, this.compositeEvents);
			lang.mixin(this.actions, this.compositeActions);

			delete this.compositeEvents;
			delete this.compositeActions;
		},

		_defineCompositeSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel('CHANGE_FILTER_CHANNEL'),
				callback: "_subFilterChangeChannel"
			});
		},

		_setCompositeOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._afterHide));
		},

		postCreate: function() {

			this._initByFilter();
		},

		_initByFilter: function() {

			if (!this.filterChannel) {
				return;
			}

			if (this._filterSubscriptions) {
				this._removeSubscriptions(this._filterSubscriptions);
			}

			this._createFilterSubscriptions();

			this._once(this._buildChannel(this.filterChannel, this.actions.GOT_PROPS),
				lang.hitch(this, this._subFilterGotProps));

			this._publish(this._buildChannel(this.filterChannel, this.actions.GET_PROPS), {
				modelInstance: true
			});
		},

		_createFilterSubscriptions: function() {

			this._filterSubscriptions = this._setSubscriptions([{
				channel: this._buildChannel(this.filterChannel, this.actions.CHANGED_MODEL),
				callback: "_subFilterChangedModel"
			}]);
		},

		_onQueryChannelPropSet: function(evt) {

			this._updateFilterChannel(evt.value);
		},

		_subFilterChangeChannel: function(req) {

			this._updateFilterChannel(req.filterChannel);
		},

		_updateFilterChannel: function(filterChannel) {

			if (filterChannel && (!this.filterChannel || this.filterChannel !== filterChannel)) {
				this.filterChannel = filterChannel;
				this._initByFilter();
			}
		},

		_subFilterGotProps: function(req) {

			if (req.modelInstance) {
				this._setModelChannel(req.modelInstance.getChannel());
			}
		},

		_subFilterChangedModel: function(req) {

			this._setModelChannel(req.modelChannel);
		},

		_setModelChannel: function(modelChannel) {

			if (modelChannel) {
				this.formConfig.modelChannel = modelChannel;
				this.modelChannel = modelChannel;

				this._createForm();

				this._emitEvt("SHOW_FORM", {
					node: this.domNode
				});
			}
		},

		_formSubmitted: function(res) {

			if (res.error) {
				return;
			}

			var data = res.data;

			this._publish(this.form.getChannel('ENABLE_BUTTON'), {
				key: 'reset'
			});

			this._publish(this._buildChannel(this.filterChannel, this.actions.REQUEST_FILTER), {
				data: data
			});

			this._submitted = true;

			this._afterSubmitted();
		},

		_afterSubmitted: function() {

			this._rememberCurrentValue();
		},

		_formCancelled: function() {

			this._resetModel();
		},

		_afterHide: function() {

			if (!this.modelChannel) {
				return;
			}

			setTimeout(lang.hitch(this, function() {
				if (!this._submitted) {
					this._resetModel();
				}
			}), 50);
		},

		_resetModel: function() {

			this._once(this._buildChannel(this.modelChannel, this.actions.WAS_CHANGED),
				lang.hitch(this, this._subModelWasChangedAfterHide));

			this._publish(this._buildChannel(this.modelChannel, this.actions.HAS_CHANGED));
		},

		_subModelWasChangedAfterHide: function(res) {

			if (res.hasChanged) {
				this._publish(this._buildChannel(this.modelChannel, this.actions.RESET));
			}
		},

		_beforeShow: function() {

			this._rememberCurrentValue();
		},

		_rememberCurrentValue: function() {

			this._submitted = false;

			this._once(this._buildChannel(this.modelChannel, this.actions.WAS_CHANGED),
				lang.hitch(this, this._subModelWasChangedBeforeShow));

			this._publish(this._buildChannel(this.modelChannel, this.actions.HAS_CHANGED));
		},

		_subModelWasChangedBeforeShow: function(res) {

			if (res.hasChanged) {
				this._publish(this._buildChannel(this.modelChannel, this.actions.REMEMBER_CURRENT_VALUE));
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_newSearch: function(/*object*/ evt) {

			this._emitEvt('SEARCH', lang.clone(evt));
		},

		_reset: function() {

		}
	});
});
