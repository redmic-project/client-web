define([
	"app/base/views/extensions/_AddForm"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_Persistence"
	, "src/component/form/_ShowInTableList"
	, "src/component/form/FormContainerImpl"
	, "src/component/form/_ListenModelHasChanged"
	, "app/base/views/extensions/_Edition"
	, "RWidgets/Button"
	, "put-selector/put"
	, "./_ButtonsInRow"
	, "./_Table"
], function(
	_AddForm
	, declare
	, lang
	, aspect
	, _Persistence
	, _ShowInTableList
	, FormContainerImpl
	, _ListenModelHasChanged
	, _Edition
	, Button
	, put
	, _ButtonsInRow
	, _Table
) {

	return declare([_Table, _Persistence, _ButtonsInRow, _Edition, _AddForm], {
		//	summary:
		//		Extensión .

		constructor: function(args) {

			this.config = {
				listButtonsEdition: [{
					groupId: "edition",
					icons:[{
						icon: "fa-edit",
						btnId: "edit",
						title: "edit",
						option: "default",
						node: true,
						returnItem: true
					},{
						icon: "fa-trash-o",
						btnId: "remove",
						title: "remove"
					}]
				}]
			};

			lang.mixin(this, this.config);

			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineEditionViewSubscriptions));
		},

		_getBrowserButtons: function() {

			var buttonsConfig = this.rowConfig && this.rowConfig.buttonsConfig,
				buttonsList = buttonsConfig && buttonsConfig.listButton;

			if (buttonsList) {
				return buttonsList;
			}

			return [];
		},

		_setBrowserButtons: function(listButton) {

			this.rowConfig = this._merge([{
				buttonsConfig: {
					listButton: listButton
				}
			}, this.rowConfig || {}]);
		},

		_createFormDefinition: function() {

			return declare([FormContainerImpl, _ListenModelHasChanged, _ShowInTableList]);
		},

		_defineEditionViewSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("UPDATE_TARGET_FORM"),
				callback: "_subUpdateTargetForm"
			},{
				channel : this.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});
		},

		_subUpdateTargetForm: function(obj) {

			this.baseTarget = obj.target;
		},

		_addEditionButtons: function() {

		},

		_formHidden: function() {

			this._nodeForm && put(this._nodeForm, "!");

			var node = this._editionRow.firstChild;
			node && put(node, "!hidden");
		},

		_formSubmitted: function(res) {

			if (res.error) {
				return;
			}

			this._emitEvt('LOADING', {
				global: true
			});

			this._emitEvt('SAVE', {
				target: this._getTarget(),
				data: res.data,
				idProperty: this.idProperty
			});
		},

		_afterSaved: function(result) {

			this._emitEvt('LOADED');

 			this._updateData(result.data);
		},

		_getSavedObjToPublish: function(results) {

			results.hide = true;
			return results;
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_getNodeForForm: function() {

			return this._nodeForm.firstChild;
		},

		_editElement: function(evt) {

			this._changeNodeAndShowEditForm("edit", evt);
		},

		_copyElement: function(evt) {

			this._changeNodeAndShowEditForm("copy", evt);
		},

		_subRemoved: function(result) {

			if (result.success) {
				this._publish(this.getChannel("REFRESH"));
			}
		},

		_changeNodeAndShowEditForm: function(type, evt) {

			if (evt.node) {

				this._lastItem && this._publish(this.form.getChannel("CANCEL"));

				this._editionRow = evt.node;

				this._nodeForm = this._editionRow.firstChild.cloneNode(true);

				put(this._editionRow.firstChild, ".hidden");

				put(this._editionRow.firstChild, '-', this._nodeForm);

				this._showEditForm(type, evt);
			}
		},

		_showEditForm: function(type, evt) {

			this.type = type;

			var item = evt.item;

			if (!(this.target instanceof Array)) {
				this.target = ["", this.target];
			}

			this.target[0] = lang.replace(this._getTarget(), item);

			if (this.itemByDataList && evt.item) {
				this._showForm(evt.item);
			} else {
				this._getForActive = true;

				this._emitEvt('GET', {
					target: this._getTarget(),
					requesterId: this.getOwnChannel(),
					id: evt[this.idProperty]
				});
			}
		},

		_itemAvailable: function(response) {

			if (!this._getForActive) {
				return this.inherited(arguments);
			}

			this._getForActive = false;

			var item = response.data;

			this._showForm(item);
		},

		_showForm: function(item) {

			if (this.type === "copy") {
				this._cleanNotDesiredProps(item);
			}

			this._lastItem = item;

			if (!this.form) {
				this._createForm({
					modelTarget: lang.replace(this._getTarget(), item)
				});
			}

			this._emitEvt('SHOW_FORM', {
				data: item,
				toInitValues: true,
				node: this._getNodeForForm()
			});
		}
	});
});
