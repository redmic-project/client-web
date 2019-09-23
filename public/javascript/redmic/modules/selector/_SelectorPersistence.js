define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Persistence'
	, 'redmic/modules/base/_Store'
	, 'redmic/base/Credentials'
], function(
	declare
	, lang
	, _Persistence
	, _Store
	, Credentials
) {

	return declare([_Store, _Persistence], {
		//	summary:
		//		Lógica necesaria para hacer persistente la selección de elementos (usando un servicio remoto).

		selectionTargetSuffix: '/_selection',

		selectionTargetSuffixesByAction: {
			select: 'select',
			deselect: 'deselect',
			clearSelection: 'clearselection'
		},

		selectionEndpointsByAction: {
			select: 'commands',
			deselect: 'commands',
			clearSelection: 'commands',
			groupSelected: 'view'
		},

		endpointVariableName: '{endpoint}',

		omitRefreshAfterSuccess: true,

		target: [],


		_getSelectionTarget: function(action, target) {

			var selectionEndpoint = this.selectionEndpointsByAction[action];

			if (!selectionEndpoint) {
				console.error('Selection endpoint not found for action "%s"', action);
				return target;
			}

			var targetWithEndpointReplaced = target.replace(this.endpointVariableName, selectionEndpoint),
				selectionTarget;

			if (this._isSettingsSelectionFormat(target)) {
				selectionTarget = targetWithEndpointReplaced;
			} else {
				selectionTarget = targetWithEndpointReplaced + this.selectionTargetSuffix;
			}

			this._addSelectionTarget(selectionTarget);
			return selectionTarget;
		},

		_recoverSelectionTarget: function(target) {

			var replacement = '/' + this.endpointVariableName + '/';

			return target.replace('/commands/', replacement).replace('/view/', replacement);
		},

		_isSettingsSelectionFormat: function(target) {

			return target.indexOf(this.endpointVariableName) !== -1;
		},

		_groupSelected: function(req) {

			var target = req.target,
				selectionIds = this._getSelectionIds(),
				selectionId = selectionIds[target];

			this._initializeSelection(target);

			if (selectionId) {
				this._emitEvt('GET', {
					target: this._getSelectionTarget(this.actions.GROUP_SELECTED, target),
					id: selectionId,
					requesterId: this.getOwnChannel()
				});
			} else {
				var selection = this.selections[target],
					selectionItems = selection && selection.items;

				this._emitEvt('GROUP_SELECTED', {
					selection: selectionItems,
					target: target
				});
			}
		},

		_itemAvailable: function(res, resWrapper) {

			var receivedTarget = resWrapper.target,
				data = res.data,
				selectionTarget = this._recoverSelectionTarget(receivedTarget),
				selectedIds;

			this._removeSelectionTarget(selectionTarget);

			if (!data) {
				return;
			}

			if (this._isSettingsSelectionFormat(selectionTarget)) {
				selectedIds = data.selection;
			} else {
				selectionTarget = this._getTargetWithoutSelectionSuffix(selectionTarget);
				selectedIds = data.ids;
			}

			var selection = this.selections[selectionTarget];

			if (selection && selectedIds) {
				this._selectedAll(selectedIds, selectionTarget);
			}
		},

		_emitSave: function(obj) {

			this._emitEvt('SAVE', obj);
		},

		_getDataToSave: function(actionName, req) {

			var action = this.actions[actionName],
				selectionIds = this._getSelectionIds(),
				selectionId = selectionIds[req.target],
				dataToSave = this._getDataToSaveInRightFormat(action, req);

			dataToSave.omitSuccessNotification = true;
			if (selectionId) {
				dataToSave.data.id = selectionId;
			}

			return dataToSave;
		},

		_getDataToSaveInRightFormat: function(action, req) {

			if (this._isSettingsSelectionFormat(req.target)) {
				return this._createDataToSaveInSettingsFormat(action, req);
			}

			return this._createDataToSaveInOldFormat(action, req);
		},

		_createDataToSaveInSettingsFormat: function(action, req) {

			var targetWithSuffix = req.target + '/' + this._getTargetSuffix(action),
				selectionTarget = this._getSelectionTarget(action, targetWithSuffix);

			return {
				data: {
					selection: req.items,
					userId: this.userSelectionId
				},
				target: selectionTarget
			};
		},

		_getTargetSuffix: function(action) {

			var suffix = this.selectionTargetSuffixesByAction[action];

			if (!suffix) {
				console.error('Selection target suffix not found for action "%s"', action);
			}

			return suffix;
		},

		_createDataToSaveInOldFormat: function(action, req) {

			var selectionTarget = req.target + this.selectionTargetSuffix;

			return {
				data: {
					ids: req.items,
					action: action,
					idUser: this.userSelectionId
				},
				target: selectionTarget
			};
		},

		_afterSaved: function(res, resWrapper) {

			var receivedTarget = resWrapper.target,
				selectionTarget = this._recoverSelectionTarget(receivedTarget);

			this._removeSelectionTarget(selectionTarget);
			resWrapper.target = selectionTarget;

			if (this._isSettingsSelectionFormat(selectionTarget)) {
				this._afterSavedInSettingsFormat(res, resWrapper);
			} else {
				this._afterSavedInOldFormat(res, resWrapper);
			}
		},

		_afterSavedInSettingsFormat: function(res, resWrapper) {

			var data = res.data,
				selectedIds = data.selection,
				settingsId = data.id,
				resTarget = resWrapper.target,
				resTargetSplitted = resTarget.split('/'),
				suffix = resTargetSplitted.pop(),
				target = resTargetSplitted.join('/'),
				selectionIds = this._getSelectionIds();

			selectionIds[target] = settingsId;
			this._setSelectionIds(selectionIds);

			for (var action in this.selectionTargetSuffixesByAction) {
				var suffixByAction = this.selectionTargetSuffixesByAction[action];
				if (suffixByAction !== suffix) {
					continue;
				}

				if (action === this.actions.SELECT) {
					this._select(selectedIds, target);
				} else if (action === this.actions.DESELECT) {
					var deselectedIds = resWrapper.req.data.selection;
					this._deselect(deselectedIds, target);
				} else if (action === this.actions.CLEAR_SELECTION) {
					this._clearSelection(target);
				}
			}
		},

		_afterSavedInOldFormat: function(res, resWrapper) {

			var data = res.data,
				action = data.action,
				target = this._getTargetWithoutSelectionSuffix(resWrapper.target),
				selectionId = data.id,
				selectedIds = data.ids,
				selectionIds = this._getSelectionIds();

			selectionIds[target] = selectionId;
			this._setSelectionIds(selectionIds);

			if (action === this.actions.SELECT) {
				this._select(selectedIds, target);
			} else if (action === this.actions.DESELECT) {
				this._deselect(selectedIds, target);
			} else if (action === this.actions.CLEAR_SELECTION) {
				this._clearSelection(target);
			}
		},

		_afterSaveError: function(error, status, resWrapper) {

			console.error('Selection persistence error:', error);
		},

		_addSelectionTarget: function(target) {

			if (this.target.indexOf(target) === -1) {
				this.target.push(target);
			}
		},

		_removeSelectionTarget: function(target) {

			var index = this.target.indexOf(target);
			if (index !== -1) {
				this.target.splice(index, 1);
			}
		},

		_getTargetWithoutSelectionSuffix: function(target) {

			return this._cleanTrailingSlash(target).replace(this.selectionTargetSuffix, '');
		},

		_errorAvailable: function(error, status, resWrapper) {

			var selectionIds = this._getSelectionIds(),
				target = this._getTargetWithoutSelectionSuffix(resWrapper.target);

			delete selectionIds[target];
			this._setSelectionIds(selectionIds);

			this._emitSelectionTargetLoaded(target);
		},

		_getSelectionIds: function() {

			return Credentials.get('selectIds') || {};
		},

		_setSelectionIds: function(selectionIds) {

			Credentials.set('selectIds', selectionIds);
		}
	});
});
