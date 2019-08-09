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

		_itemAvailable: function(res) {

			var targetBase = this._getTargetBase(res.target);

			if (this.selections[targetBase] && response.data && response.data.ids) {
				this._selectedAll(response.data.ids, targetBase);
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
				target: target
			};

			var selectIds = this._getSelectionIds();

			if (selectIds && selectIds[target]) {
				obj.data.id = selectIds[target];
			}

			return obj;
		},

		_subSaved: function(result) {

			if (result.error) {
				//TODO: aqui sacar notification o algo
				return;
			}

			var resp = result.body,
				selectIds = this._getSelectionIds();

			if (!selectIds) {
				selectIds = {};
			}

			selectIds[this._getTargetBase(resp.target)] = resp.id;
			this._setSelectionIds(selectIds);

			if (resp.action === this.actions.SELECT) {
				this._select(resp.ids, this._getTargetBase(resp.target));
				return;
			}

			if (resp.action === this.actions.DESELECT) {
				this._deselect(resp.ids, this._getTargetBase(resp.target));
				return;
			}

			if (resp.action === this.actions.CLEAR_SELECTION) {
				this._clearSelection(this._getTargetBase(resp.target));
				return;
			}
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

		_subDataError: function(res) {

			if (!res.success && res.error) {
				this._errorSelectionTargetNotExits(res);
			}
		},

		_errorSelectionTargetNotExits: function(res) {

			var selectIds = this._getSelectionIds(),
				target = this._getTargetBase(this._cleanTrailingSlash(res.error.target));

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
