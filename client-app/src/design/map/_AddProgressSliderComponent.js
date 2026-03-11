define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/components/ProgressSlider/ProgressSlider'
], function(
	declare
	, lang
	, ProgressSlider
) {

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir un componente ProgressSlider, para visualizar datos de forma progresiva
		//   sobre el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					SET_PROGRESS_MAX: 'setProgressMax',
					SET_PROGRESS_MIN: 'setProgressMin',
					SET_PROGRESS_TIMEOUT: 'setProgressTimeout',
					SET_PROGRESS_DELTA: 'setProgressDelta',
					PRESS_PROGRESS_BUTTON: 'pressProgressButton'
				},
				topbarNodeClasses: 'mediumSolidContainer.rounded.barSliderContainer'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('progressSliderConfig', {
				parentChannel,
				props: {
					showValue: true,
					valueInTooltip: false
				}
			});
		},

		createDesignControllerComponents: function() {

			const inheritedComponents = this.inherited(arguments);

			const progressSlider = this._createDesignProgressSliderComponent();

			return lang.mixin(inheritedComponents, {progressSlider});
		},

		_createDesignProgressSliderComponent: function() {

			return new ProgressSlider(this.progressSliderConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this.on('ME_OR_ANCESTOR_HIDDEN', () => this._addProgressSliderComponentOnHide());
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const progressSliderInstance = this.getComponentInstance('progressSlider');

			this.subscriptionsConfig.push({
				channel: progressSliderInstance.getChannel('CHANGE_VALUE'),
				callback: '_subProgressSliderChangeValue'
			});
		},

		_definePublications: function() {

			this.inherited(arguments);

			const progressSliderInstance = this.getComponentInstance('progressSlider');

			this.publicationsConfig.push({
				event: 'SET_PROGRESS_MAX',
				channel: progressSliderInstance.getChannel('SET_MAX')
			},{
				event: 'SET_PROGRESS_MIN',
				channel: progressSliderInstance.getChannel('SET_MIN')
			},{
				event: 'SET_PROGRESS_TIMEOUT',
				channel: progressSliderInstance.getChannel('SET_TIMEOUT')
			},{
				event: 'SET_PROGRESS_DELTA',
				channel: progressSliderInstance.getChannel('SET_DELTA')
			},{
				event: 'PRESS_PROGRESS_BUTTON',
				channel: progressSliderInstance.getChannel('BUTTON_ACTION')
			});
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			const progressSliderInstance = this.getComponentInstance('progressSlider'),
				topbarNode = this.getLayoutNode('topbar');

			this._publish(progressSliderInstance.getChannel('SHOW'), {
				node: topbarNode
			});
		},

		_subProgressSliderChangeValue: function(res) {

			this._onProgressSliderChangeValue?.(res);
		},

		_updateProgressSliderLimits: function(/*Object*/ limits, /*Boolean?*/ reset) {

			this._emitEvt('SET_PROGRESS_MIN', {
				value: limits?.min,
				reset: !!reset
			});

			this._emitEvt('SET_PROGRESS_MAX', {
				value: limits?.max
			});
		},

		_addProgressSliderComponentOnHide: function() {

			this._emitEvt('PRESS_PROGRESS_BUTTON', {
				key: 'PAUSE'
			});
		}
	});
});
