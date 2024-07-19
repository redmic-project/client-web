define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/redmicConfig"
	, "app/user/models/PasswordModel"
	, "app/user/models/UserImageModel"
	, "app/user/models/UserNameModel"
	, "app/user/models/UserEmailModel"
	, "app/user/models/UserSectorModel"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/base/Credentials"
	, "redmic/modules/base/_Window"
	, "redmic/modules/base/_Persistence"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "redmic/modules/form/_CreateKeypad"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/_ListenModelHasChanged"
	, "templates/UserImage"
	, "templates/UserTitle"
	, "templates/UserEmail"
	, "templates/UserName"
	, "templates/UserSector"
	, "templates/UserPassword"
	, "redmic/modules/notification/TaskNotification"
], function(
	Controller
	, Layout
	, redmicConfig
	, modelSchemaUserPassword
	, modelSchemaUserImage
	, modelSchemaUserName
	, modelSchemaUserEmail
	, modelSchemaUserSector
	, declare
	, lang
	, Credentials
	, _Window
	, _Persistence
	, _ButtonsInRow
	, _MultiTemplate
	, ListImpl
	, TemplateDisplayer
	, _CreateKeypad
	, FormContainerImpl
	, _ListenModelHasChanged
	, TemplateImage
	, TemplateTitle
	, TemplateEmail
	, TemplateName
	, TemplateSector
	, TemplatePassword
	, TaskNotification
) {

	return declare([Layout, Controller, _Persistence], {
		//	summary:
		//		Vista detalle de user.

		constructor: function(args) {

			this.target = redmicConfig.services.accountData;
			this.targetImage = redmicConfig.services.changeUserImage;

			this.config = {
				_titleRightButtonsList: [],
				centerTitle: true,
				type: "API",
				idProperty: "id",
				noScroll: true,
				propsWidget: {
					omitTitleCloseButton: true
				},
				events: {
					ALL_TASK_SOCKET: "allTaskSocket"
				},
				actions: {
					AVAILABLE: "available",
					REQUEST: "request",
					ALL_TASK: "allTask"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: "user_title"
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				userImage: {
					width: 2,
					height: 3,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.image,
						template: TemplateImage,
						"class": "imageContainer.imageContainerEdit",
						target: this.target,
						associatedIds: [this.ownChannel]
					}
				},
				userData: {
					width: 4,
					height: 3,
					type: declare([ListImpl, _ButtonsInRow, _MultiTemplate]),
					props: {
						title: "Datos de usuario",
						target: this.target,
						idProperty: "dataType",
						rowConfig: {
							buttonsConfig: {
								listButton: [{
									icon: "fa-edit",
									btnId: "edit",
									title: this.i18n.edit,
									returnItem: true,
									condition: "edit"
								}]
							}
						}
					}
				},
				notifications: {
					width: 6,
					height: 3,
					type: TaskNotification,
					props: {
						title: this.i18n.notifications
					}
				}
			}, this.widgetConfigs || {}]);

			this.formBaseConfig = this._merge([{
				parentChannel: this.getChannel(),
				storeChannel: this.getChannel(),
				idProperty: this.idProperty,
				target: this.target,
				"class": "scrollWrapper formInBox",
				buttonsConfig: {
					submit: {
						props: {
							label: this.i18n.save
						}
					}
				}
			}, this.formBaseConfig || {}]);
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ALL_TASK_SOCKET',
				channel: this._buildChannel(this.taskChannel, this.actions.ALL_TASK)
			});
		},

		_subListBtnEvent: function(response) {

			this[response.item.callback]();
		},

		_afterSaved: function(res, resWrapper) {

			var result = res.data;

			this._emitEvt('LOADED');

			result.hide = true;
			this._publish(this.formActive.getChannel("SAVED"), result);

			this._showBoxUser(resWrapper.target);

			this._refreshModules();
		},

		_nameEdit: function() {

			var formConfig = this._merge([{
				template: "user/views/templates/forms/UserName",
				modelSchema: modelSchemaUserName,
				targetSave: redmicConfig.services.changeName,
				title: this.i18n.changeName
			}, this.formBaseConfig || {}]);

			this._createAndShowForm({
				formConfig: formConfig,
				label: "_nameEdit",
				labelNode: 'userData'
			});
		},

		_emailEdit: function() {

			var formConfig = this._merge([{
				template: "user/views/templates/forms/UserEmail",
				modelSchema: modelSchemaUserEmail,
				targetSave: redmicConfig.services.changeEmail,
				title: this.i18n.changeEmail
			}, this.formBaseConfig || {}]);

			this._createAndShowForm({
				formConfig: formConfig,
				label: "_emailEdit",
				labelNode: 'userData'
			});
		},

		_sectorEdit: function() {

			var formConfig = this._merge([{
				template: "user/views/templates/forms/UserSector",
				modelSchema: modelSchemaUserSector,
				targetSave: redmicConfig.services.changeUserSector,
				title: this.i18n.changeUserSector
			}, this.formBaseConfig || {}]);

			this._createAndShowForm({
				formConfig: formConfig,
				label: "_secotrEdit",
				labelNode: 'userData'
			});
		},

		_passwordEdit: function() {

			var formConfig = this._merge([{
				template: "user/views/templates/forms/ChangePassword",
				modelSchema: modelSchemaUserPassword,
				targetSave: redmicConfig.services.changePassword,
				title: this.i18n.changePassword
			}, this.formBaseConfig || {}]);

			this._createAndShowForm({
				formConfig: formConfig,
				label: "_passwordEdit",
				noData: true,
				labelNode: 'userData'
			});
		},

		_createAndShowForm: function(obj) {

			this._createForm(obj);

			this.formActive = this[obj.label + 'Form'];

			if (!obj.noData) {
				this._once(this._buildChannel(this.storeChannel, this.actions.AVAILABLE),
					lang.hitch(this, function(resWrapper) {

					if (resWrapper && resWrapper.res && resWrapper.res.data) {
						this._showFormAndHideBoxUser(this.formActive, obj.labelNode, resWrapper.res.data);
					}
				}));

				this._emitEvt('REQUEST', {
					target: obj.formConfig.target,
					requesterId: this.formActive.getOwnChannel()
				});
			} else {
				this._showFormAndHideBoxUser(this.formActive, obj.labelNode);
			}
		},

		_createForm: function(obj) {

			var nameForm = obj.label + 'Form',
				instanceForm = this[nameForm];

			if (instanceForm) {
				return;
			}

			this._setIdDefault(obj);

			var formDef = declare([FormContainerImpl, _ListenModelHasChanged, _CreateKeypad]);

			var FormDefinition = declare(formDef).extend(_Window);
			this[obj.label + 'Form'] = instanceForm = new FormDefinition(obj.formConfig);

			this._createSubscriptionsForm(instanceForm, obj);
		},

		_createSubscriptionsForm: function(instanceForm, obj) {

			this._subscribe(instanceForm.getChannel("CANCELLED"), lang.hitch(this, function() {

				this._showBoxUser(obj.formConfig.targetSave ? obj.formConfig.targetSave : obj.formConfig.target);
			}));

			this._subscribe(instanceForm.getChannel("SUBMITTED"), lang.hitch(this, function(res) {

				if (res.error) {
					return;
				}

				this._emitEvt('LOADING', {
					global: true
				});

				this._emitEvt('SAVE', {
					data: res.data,
					target: obj.formConfig.targetSave ? obj.formConfig.targetSave : obj.formConfig.target,
					idProperty: this.idProperty
				});
			}));
		},

		_setIdDefault: function(obj) {

			if (obj.formConfig.modelSchema.properties.id !== undefined) {
				obj.formConfig.modelSchema.properties.id['default'] = Credentials.get("userId");
			}
		},

		_showFormAndHideBoxUser: function(form, label, data) {

			this._publish(this._widgets[label].getChannel("HIDE"));

			this._publish(form.getChannel("SHOW"), {
				data: data,
				toInitValues: true,
				node: this._nodes[label]
			});
		},

		_showBoxUser: function(target) {

			var label = "userData";

			if (target === this.targetImage) {
				label = "userImage";
			}

			var instanceWidget = this._widgets[label];

			this._publish(instanceWidget.getChannel("SHOW"), {
				node: this._nodes[label]
			});
		},

		_subscribeToWidgets: function() {

			this._once(this._widgets.userImage.getChannel("SHOWN"), lang.hitch(this, this._subUserImageShownOnce));
		},

		_subUserImageShownOnce: function() {

			this._nodes.userImage.onclick = lang.hitch(this, this._tryToGoToEditImage);
		},

		_tryToGoToEditImage: function(evt) {

			var node = evt.target || evt.currentTarget,
				nodeTagName = node.tagName,
				nodeAttribute = node.getAttribute('data-redmic-id');

			if (nodeTagName === 'IMG' || nodeAttribute === 'changeImage') {
				this._goToEditImage();
			}
		},

		_goToEditImage: function() {

			var formConfig = this._merge([{
				template: "user/views/templates/forms/UserImage",
				modelSchema: modelSchemaUserImage,
				targetSave: this.targetImage,
				title: this.i18n.changeImage
			}, this.formBaseConfig || {}]);

			this._createAndShowForm({
				formConfig: formConfig,
				label: "_imageEdit",
				labelNode: 'userImage'
			});
		},

		_afterShow: function() {

			this._setSubscription({
				channel : this._widgets.userData.getChannel("BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});

			this._publish(this._widgets.userData.getChannel("ADD_TEMPLATE"), {
				typeGroup: "name",
				template: TemplateName
			});

			this._publish(this._widgets.userData.getChannel("ADD_TEMPLATE"), {
				typeGroup: "email",
				template: TemplateEmail
			});

			this._publish(this._widgets.userData.getChannel("ADD_TEMPLATE"), {
				typeGroup: "sector",
				template: TemplateSector
			});

			this._publish(this._widgets.userData.getChannel("ADD_TEMPLATE"), {
				typeGroup: "password",
				template: TemplatePassword
			});
		},

		_clearModules: function() {

			this._publish(this._widgets.userData.getChannel("CLEAR"));
		},

		_refreshModules: function() {

			this._clearModules();

			this._emitEvt('INJECT_ITEM', {
				data: {},
				target: "user_title"
			});

			this._emitEvt('ALL_TASK_SOCKET', {});

			this._emitEvt('REQUEST', {
				target: this.target,
				requesterId: this.getOwnChannel()
			});
		},

		_dataAvailable: function(response) {

			var data = response.data;

			this._injectItemList({
				firstName: data.firstName,
				lastName: data.lastName,
				callback: "_nameEdit",
				edit: true,
				dataType: "name"
			}, "userData");

			this._injectItemList({
				email: data.email,
				callback: "_emailEdit",
				dataType: "email"
			}, "userData");

			this._injectItemList({
				sector: data.sector,
				callback: "_sectorEdit",
				edit: true,
				dataType: "sector"
			}, "userData");

			this._injectItemList({
				password: "******",
				callback: "_passwordEdit",
				edit: true,
				dataType: "password"
			}, "userData");

			this._injectItemList(data, "userImage");
		},

		_generateWidgets: function() {

			this.inherited(arguments);

			this._subscribeToWidgets();
		},

		_injectItemList: function(data, widget) {

			this._emitEvt('INJECT_ITEM', {
				data: data,
				target: this.target,
				requesterId: this._widgets[widget].getOwnChannel()
			});
		}
	});
});
