define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Persistence"
	, "redmic/modules/base/_Store"
	, "redmic/base/Credentials"
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

		target: [],
		selectionTargetSuffix: '/_selection',
		notificationSuccess: false,
		omitRefreshAfterSuccess: true,

		_groupSelected: function(req) {

			var target = req.target,
				selectIds = this._getSelectionIds(),
				selectionId = target && selectIds && selectIds[target];

			this._initializeSelection(target);

			if (selectionId) {
				this._emitEvt('GET', {
					target: this._getTarget(target),
					id: selectionId,
					options: {},
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

			var targetBase = this._getTargetBase(resWrapper.target);

			if (this.selections[targetBase] && res.data && res.data.ids) {
				this._selectedAll(res.data.ids, targetBase);
			}
		},

		_emitSave: function(obj) {

			this._emitEvt('SAVE', obj);
		},

		_getDataToSave: function(action, ids, target) {

			var obj = {
				data: {
					ids: ids,
					action: action,
					idUser: this.userSelectionId
				},
				target: target + this.selectionTargetSuffix,
				omitSuccessNotification: true
			};

			var selectIds = this._getSelectionIds();

			if (selectIds && selectIds[target]) {
				obj.data.id = selectIds[target];
			}

			return obj;
		},

		_afterSaved: function(response, resWrapper) {

			var data = response.data,
				action = data.action,
				target = this._getTargetBase(resWrapper.target),
				selectionId = data.id,
				selectedIds = data.ids,
				selectionIds = this._getSelectionIds();

			if (!selectionIds) {
				selectionIds = {};
			}

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

		_getTarget: function(target) {

			var currentTarget = target + this.selectionTargetSuffix;
			if (this.target.indexOf(currentTarget) === -1) {
				this.target.push(currentTarget);
			}

			return currentTarget;
		},

		_getTargetBase: function(target) {

			return target.replace(this.selectionTargetSuffix, "");
		},

		_errorAvailable: function(error, status, resWrapper) {

			var selectIds = this._getSelectionIds(),
				target = this._getTargetBase(this._cleanTrailingSlash(resWrapper.target));

			if (!selectIds) {
				selectIds = {};
			}

			delete selectIds[target];

			this._setSelectionIds(selectIds);

			this._emitSelectionTargetLoaded(target);
		},

		_getSelectionIds: function() {

			return Credentials.get("selectIds");
		},

		_setSelectionIds: function(selectionIds) {

			Credentials.set("selectIds", selectionIds);
		}
	});
});
