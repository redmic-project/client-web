define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/redmicConfig"
	, "app/user/models/PasswordModel"
	, "app/user/models/UserImageModel"
	, "app/user/models/UserNameModel"
	, "app/user/models/UserEmailModel"
	, "app/user/models/UserSectorModel"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/query"
	, "redmic/base/Credentials"
	, "redmic/modules/base/_Window"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "redmic/modules/form/_CreateKeypad"
	, "redmic/modules/form/FormContainerImpl"
	, "redmic/modules/form/_ListenModelHasChanged"
	, "redmic/modules/store/Persistence"
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
	, _AddTitle
	, redmicConfig
	, modelSchemaUserPassword
	, modelSchemaUserImage
	, modelSchemaUserName
	, modelSchemaUserEmail
	, modelSchemaUserSector
	, declare
	, lang
	, query
	, Credentials
	, _Window
	, _ButtonsInRow
	, _MultiTemplate
	, ListImpl
	, TemplateDisplayer
	, _CreateKeypad
	, FormContainerImpl
	, _ListenModelHasChanged
	, Persistence
	, TemplateImage
	, TemplateTitle
	, TemplateEmail
	, TemplateName
	, TemplateSector
	, TemplatePassword
	, TaskNotification
){
	return declare([Layout, Controller/*, _AddTitle*/], {
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
					noCloseWindow: true
				},
				events: {
					SAVED_FORM: "savedForm",
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

		_initialize: function() {

			this.persistence = new Persistence({
				parentChannel: this.getChannel()
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.persistence.getChannel("SAVED"),
				callback: "_subSaved"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'SAVED_FORM',
				channel: this.persistence.getChannel("SAVE")
			},{
				event: 'ALL_TASK_SOCKET',
				channel: this._buildChannel(this.taskChannel, this.actions.ALL_TASK)
			});
		},

		_subListBtnEvent: function(response) {

			this[response.item.callback]();
		},

		_subSaved: function(result) {

			this._emitEvt('LOADED');

			if (!result.success) {
				return;
			}

			result.hide = true;
			this._publish(this.formActive.getChannel("SAVED"), result);

			this._showBoxUser(result.target);

			this._refreshModules();

			this._publish(this._buildChannel(this.storeChannel, this.actions.REQUEST), {
				target: redmicConfig.services.profile,
				type: this.type
			});
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
					lang.hitch(this, function(item) {
						if (item && item.body && item.body.data) {
							this._showFormAndHideBoxUser(this.formActive, obj.labelNode, item.body.data);
						}
				}));

				this._publish(this._buildChannel(this.storeChannel, this.actions.REQUEST), {
					target: obj.formConfig.target,
					requesterId: this.formActive.getOwnChannel(),
					type: this.type
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

			this[obj.label + 'Form'] = instanceForm = new declare(formDef).extend(_Window)(obj.formConfig);

			this._createSubscriptionsForm(instanceForm, obj);
		},

		_createSubscriptionsForm: function(instanceForm, obj) {

			this._subscribe(instanceForm.getChannel("CANCELLED"), lang.hitch(this, function(res) {
				this._showBoxUser(obj.formConfig.targetSave ? obj.formConfig.targetSave : obj.formConfig.target);
			}));

			this._subscribe(instanceForm.getChannel("SUBMITTED"), lang.hitch(this, function(res) {

				if (res.error) {
					return;
				}

				this._emitEvt('LOADING', {
					global: true
				});

				this._emitEvt('SAVED_FORM', {
					item: res.data,
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

			this._publish(form.getChannel('SHOW_WINDOW'));
		},

		_showBoxUser: function(target) {

			var label = "userData";

			if (target === this.targetImage) {
				label = "userImage";
				this._subscriptionOnceChangeImage();
			}

			var instanceWidget = this._widgets[label];

			this._publish(instanceWidget.getChannel("SHOW"), {
				node: this._nodes[label]
			});

			this._publish(instanceWidget.getChannel('SHOW_WINDOW'));
		},

		_subscriptionOnceChangeImage: function() {

			this._once(this._widgets.userImage.getChannel("SHOWN"), lang.hitch(this, this._createOnClickChangeImage));
		},

		_createOnClickChangeImage: function() {

			setTimeout(lang.hitch(this, function() {
				this.changeImageNode = query("[data-redmic-id='changeImage']", this._nodes.userImage)[0];

				if (this.changeImageNode) {
					this.changeImageNode.onclick = lang.hitch(this, this._changeImageOnClick);
					this.changeImageNode.parentNode.firstChild.onclick = lang.hitch(this, this._changeImageOnClick);
				}
			}), 250);
		},

		_changeImageOnClick: function() {

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

		_afterShow: function(request) {

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

			this.startup();
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

			this._publish(this._buildChannel(this.storeChannel, this.actions.REQUEST), {
				target: this.target,
				requesterId: this.getOwnChannel(),
				type: this.type
			});
		},

		_dataAvailable: function(response) {

			this._injectItemList({
				firstName: response.data.firstName,
				lastName: response.data.lastName,
				callback: "_nameEdit",
				edit: true,
				dataType: "name"
			}, "userData");

			this._injectItemList({
				email: response.data.email,
				callback: "_emailEdit",
				dataType: "email"
			}, "userData");

			this._injectItemList({
				sector: response.data.sector,
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

			//this._subscriptionOnceChangeImage();

			this._injectItemList(response.data, "userImage");
		},

		_buildVisualization: function() {

			this._subscriptionOnceChangeImage();

			this.inherited(arguments);
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
