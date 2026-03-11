define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/form/FormContainerImpl'
	, 'src/component/layout/genericDisplayer/GenericWithTopbarDisplayerImpl'
	, 'src/design/map/_AddTabsDisplayerComponent'
], function(
	declare
	, lang
	, FormContainerImpl
	, GenericWithTopbarDisplayerImpl
	, _AddTabsDisplayerComponent
) {

	return declare(_AddTabsDisplayerComponent, {
		// summary:
		//   Lógica de diseño para añadir un componente TrackingSettings, para configurar cómo visualizar datos de
		//   seguimiento sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		postMixInProperties: function() {

			const defaultConfig = {
				actions: {
					VALUE_CHANGED: 'valueChanged'
				},
				timeMode: false,
				_trackingTransitionRate: 900,
				_deltaProgress: 3600000
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('settingsFormConfig', {
				parentChannel,
				template: 'viewers/views/templates/forms/Tracking',
				formContainerConfig: {
					loadInputs: inputs => this._loadInputsFormAndShow(inputs),
					defaultTrackingMode: this.timeMode ? 1 : 0
				}
			});

			this.mergeComponentAttribute('settingsFormWrapperConfig', {
				parentChannel,
				title: this.i18n.settings
			});
		},

		createDesignControllerComponents: function() {

			const inheritedComponents = this.inherited(arguments);

			const settingsFormInstance = this._createDesignSettingsFormComponent(),
				settingsFormWrapper = this._createDesignSettingsFormWrapperComponent(settingsFormInstance);

			return lang.mixin(inheritedComponents, {settingsFormWrapper});
		},

		_createDesignSettingsFormComponent: function() {

			return new FormContainerImpl(this.settingsFormConfig);
		},

		_createDesignSettingsFormWrapperComponent: function(settingsFormInstance) {

			this.mergeComponentAttribute('settingsFormWrapperConfig', {
				content: settingsFormInstance
			});

			return new GenericWithTopbarDisplayerImpl(this.settingsFormWrapperConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const tabsDisplayerInstance = this.getComponentInstance('tabsDisplayer'),
				settingsFormWrapperInstance = this.getComponentInstance('settingsFormWrapper');

			this._publish(tabsDisplayerInstance.getChannel('ADD_TAB'), {
				title: this.i18n.settings,
				iconClass: 'fa fa-cog',
				channel: settingsFormWrapperInstance.getChannel()
			});
		},

		_loadInputsFormAndShow: function(inputs) {

			// TODO mejorar para que no haga falta averiguar desde fuera el canal de un input concreto
			this.inputsForm = inputs;

			for (let key in inputs) {
				const inputChannel = inputs[key].channel,
					inputNode = inputs[key].node;

				this._publish(this._buildChannel(inputChannel, 'SHOW'), {
					node: inputNode
				});

				this._subscribe(this._buildChannel(inputChannel, 'VALUE_CHANGED'),
					res => this._subTrackingSettingsInputValueChanged(res));
			}

			if (this.timeMode) {
				this._onTrackingSettingsModeChange('1');
			} else {
				this._publish(this._buildChannel(inputs.interval.channel, 'HIDE'));
			}
		},

		_subTrackingSettingsInputValueChanged: function(res) {

			const inputName = res.name,
				inputValue = res.value;

			if (inputName === 'markers') {
				this._onTrackingSettingsMarkersChange?.(inputValue);
			} else if (inputName === 'mode') {
				this._onTrackingSettingsModeChange(inputValue);
			} else if (inputName === 'rate') {
				this._onTrackingSettingsRateChange?.(inputValue);
			} else if (inputName === 'interval') {
				this._onTrackingSettingsIntervalChange?.(inputValue);
			}
		},

		_onTrackingSettingsModeChange: function(inputValue) {

			this.inherited(arguments);

			this._emitEvt('PRESS_PROGRESS_BUTTON', {
				key: 'STOP'
			});

			// TODO mejorar para que no haga falta averiguar desde fuera el canal de un input concreto
			const intervalInputChannel = this.inputsForm.interval.channel;
			if (inputValue === '0') {
				this.timeMode = false;
				this._publish(this._buildChannel(intervalInputChannel, 'HIDE'));
			} else {
				this.timeMode = true;
				this._publish(this._buildChannel(intervalInputChannel, 'SHOW'));
			}
		}
	});
});
