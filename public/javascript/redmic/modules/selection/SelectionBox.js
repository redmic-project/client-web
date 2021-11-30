define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'put-selector/put'
	, 'redmic/base/Credentials'
	, 'redmic/modules/base/_ListenQueryParams'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Selection'
	, 'redmic/modules/base/_ShowInTooltip'
	, 'redmic/modules/base/_ShowOnEvt'
	, 'redmic/modules/layout/listMenu/ListMenu'
	, 'redmic/modules/selection/SelectionManager'
], function(
	declare
	, lang
	, Deferred
	, put
	, Credentials
	, _ListenQueryParams
	, _Module
	, _Show
	, _Selection
	, _ShowInTooltip
	, _ShowOnEvt
	, ListMenu
	, SelectionManager
) {

	return declare([_Module, _Show, _Selection, _ListenQueryParams], {
		//	summary:
		//		Indicador del número de seleccionados con botones asociados.
		//	description:
		//		Informa del número de elementos seleccionados para un determinado 'target' (un tipo de datos concreto).

		constructor: function(args) {

			this.config = {
				ownChannel: 'selectionBox',
				events: {
					SET_SELECTION_TARGET: 'setSelectionTarget',
					SAVE_SELECTION: 'saveSelection',
					RESTORE_SELECTION: 'restoreSelection'
				},
				actions: {
					REFRESH: 'refresh'
				},

				omitLoading: true
			};

			lang.mixin(this, this.config, args);

			// TODO apaño temporal, hasta que se desvincule la petición de seleccionados de este módulo
			this._settingsIdDfd = new Deferred();
		},

		_setConfigurations: function() {

			this.listMenuSelectionConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: [{
					'label': this.i18n.clearSelection,
					'value': 'clearSelection',
					'icon': 'fa-eraser',
					'callback': '_clearSelectionButtonCallback'
				},{
					'label': this.i18n.restoreSelection,
					'value': 'restoreSelection',
					'icon': 'fa-cloud-download',
					'callback': '_loadSavedSelectionsButtonCallback',
					'condition': lang.hitch(this, this._isRegisteredUser)
				},{
					'label': this.i18n.saveSelection,
					'value': 'saveSelection',
					'icon': 'fa-cloud-upload',
					'callback': '_saveSelectionButtonCallback',
					'condition': lang.hitch(this, this._isRegisteredUser)
				}],
				classTooltip: 'tooltipButtonMenu tooltipButtonChart'
			}, this.listMenuSelectionConfig || {}]);
		},

		_initialize: function() {

			var ListMenuDefinition = declare([ListMenu, _ShowOnEvt]).extend(_ShowInTooltip);
			this.loadSelectionListMenu = new ListMenuDefinition(this.listMenuSelectionConfig);

			this._selectionManager = new SelectionManager({
				parentChannel: this.getChannel()
			});
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel('REFRESH'),
				callback: '_subRefresh'
			},{
				channel: this.loadSelectionListMenu.getChannel('EVENT_ITEM'),
				callback: '_subLoadSelectionListEventItem'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SET_SELECTION_TARGET',
				channel: this._selectionManager.getChannel('SET_PROPS')
			},{
				event: 'SAVE_SELECTION',
				channel: this._selectionManager.getChannel('SAVE_SELECTION')
			},{
				event: 'RESTORE_SELECTION',
				channel: this._selectionManager.getChannel('RESTORE_SELECTION')
			});
		},

		postCreate: function() {

			put(this.domNode, '.selectionBox.form-control');
			put(this.domNode, 'span', 'Sel:');
			this.selectionCount = put(this.domNode, 'span', '0');
			this.buttonsContainer = put(this.domNode, 'span.fa.fa-caret-down');

			this._publish(this.loadSelectionListMenu.getChannel('ADD_EVT'), {
				sourceNode: this.domNode
			});

			// TODO apaño temporal, hasta que se desvincule la petición de seleccionados de este módulo
			this._emitEvt('GET_QUERY_PARAMS');

			this.inherited(arguments);
		},

		_subLoadSelectionListEventItem: function(res) {

			var cbk = res.callback;

			if (cbk && this[cbk]) {
				this[cbk](res);
			}
		},

		// TODO apaño temporal, hasta que se desvincule la petición de seleccionados de este módulo
		_gotQueryParams: function(queryParams) {

			if (queryParams['settings-id']) {
				this._settingsIdDfd.cancel();
			} else {
				this._settingsIdDfd.resolve();
			}
		},

		_subRefresh: function(req) {

			var selectionTarget = req.selectionTarget;

			this.selectionTarget = selectionTarget;

			this._emitEvt('SET_SELECTION_TARGET', {
				selectionTarget: selectionTarget
			});

			// TODO apaño temporal, hasta que se desvincule la petición de seleccionados de este módulo
			this._settingsIdDfd.then(lang.hitch(this, function() {

				// TODO esto no debería ser responsabilidad de SelectionBox, sería mejor que lo hiciera la vista, por ejemplo
				this._clearSelection();
				this._emitEvt('GROUP_SELECTED');
			}));
		},

		_isRegisteredUser: function(item) {

			return Credentials.get('userRole') !== 'ROLE_GUEST';
		},

		_select: function(item, total) {

			this._updateSelectionBox(total);
		},

		_deselect: function(item, total) {

			this._updateSelectionBox(total);
		},

		_clearSelection: function() {

			this._updateSelectionBox(0);
		},

		_updateSelectionBox: function(total) {

			if (!isNaN(total)) {
				this.selectionCount.innerHTML = total;
			}
		},

		_saveSelectionButtonCallback: function() {

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: 'saveSelection'
				}
			});

			this._emitEvt('SAVE_SELECTION');
		},

		_loadSavedSelectionsButtonCallback: function() {

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: 'loadSelection'
				}
			});

			this._emitEvt('RESTORE_SELECTION');
		},

		_clearSelectionButtonCallback: function() {

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: 'clearSelection'
				}
			});

			this._emitEvt('CLEAR_SELECTION');
		}
	});
});
