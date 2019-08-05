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

		selectionTargetSuffix: "/_selection",

		constructor: function(args) {

			this.notificationSuccess = false;
		},

		_groupSelected: function(req) {

			var target = req.selectionTarget,
				selectIds = Credentials.get("selectIds");

			this._initializeSelection(target);

			if (target && selectIds && selectIds[target]) {
				this._emitEvt('GET', {
					target: this._getTarget(target),
					id: selectIds[target],
					options: {},
					requesterId: this.getOwnChannel()
				});
			} else {
				this._emitEvt('GROUP_SELECTED', [this.selections[target].items, target]);
			}
		},

		_itemAvailable: function(response) {

			if (response.target) {
				var targetBase = this._getTargetBase(response.target);

				if (this.selections[targetBase] && response.data && response.data.ids) {
					this._selectedAll(response.data.ids, targetBase);
				}
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

			var selectIds = Credentials.get("selectIds");

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
				selectIds = Credentials.get("selectIds");

			if (!selectIds) {
				selectIds = {};
			}

			selectIds[this._getTargetBase(resp.target)] = resp.id;
			Credentials.set("selectIds", selectIds);

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

			var selectIds = Credentials.get("selectIds"),
				target = this._getTargetBase(this._cleanTrailingSlash(res.error.target));

			if (!selectIds) {
				selectIds = {};
			}

			delete selectIds[target];

			Credentials.set("selectIds", selectIds);

			this._emitSelectionTargetLoaded(target);
		}
	});
});
