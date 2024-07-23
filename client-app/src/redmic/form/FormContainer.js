define([
	'src/redmicConfig'
	, 'dijit/_TemplatedMixin'
	, 'dijit/_WidgetBase'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'dojo/dom-attr'
	, 'dojo/dom-class'
	, 'dojo/Evented'
	, 'dojo/query'
	, 'put-selector/put'
	, 'redmic/modules/form/input/_IgnoreNonexistentProperty'
	, 'redmic/modules/form/input/_Dependence'
	, 'redmic/modules/form/input/_DeleteOnClear'
	, 'redmic/modules/form/input/_DisableInput'

	, 'redmic/modules/form/input/DateRangeTextBoxImpl'
	, 'redmic/modules/form/input/MultiSelectImpl'
	, 'redmic/modules/form/input/RangeImpl'
	, 'redmic/modules/form/input/RadioButtonGroupImpl'
	, 'redmic/modules/form/input/ValueAndUnitSelectorImpl'
	, 'redmic/modules/form/input/CheckBoxImpl'
	, 'redmic/modules/form/input/CheckBoxGroupImpl'
	, 'redmic/modules/form/input/RadioButtonImpl'
	, 'redmic/modules/form/input/TextBoxImpl'
	, 'redmic/modules/form/input/NumberSpinnerImpl'
	, 'redmic/modules/form/input/NumberTextBoxImpl'
	, 'redmic/modules/form/input/SelectImpl'
	, 'redmic/modules/form/input/RangeSliderImpl'
	, 'redmic/modules/form/input/SliderImpl'
	, 'redmic/modules/form/input/KeywordsImpl'
	, 'redmic/modules/form/input/ColorPickerImpl'
	, 'redmic/modules/form/input/ColorPickerTextBoxImpl'
	, 'redmic/modules/form/input/FilteringSelectImpl'
	, 'redmic/modules/form/input/DateTextBoxImpl'
	, 'redmic/modules/form/input/DateTimeImpl'
	, 'redmic/modules/form/input/DateTimeTextBoxImpl'
	, 'redmic/modules/form/input/DateRangeImpl'
	, 'redmic/modules/form/input/AnnotationImpl'
	, 'redmic/modules/form/input/ColorsRampImpl'
	, 'redmic/modules/form/input/ColorImpl'
	, 'redmic/modules/form/input/SelectOnListPopupImpl'
	, 'redmic/modules/form/input/ButtonImpl'
	, 'redmic/modules/form/input/PointImpl'
	, 'redmic/modules/form/input/UploadFileImpl'
	, 'redmic/modules/form/input/TextAreaImpl'
	, 'redmic/modules/form/input/GeometryImpl'
	, 'redmic/modules/form/input/MapSearchImpl'

	, 'templates/SpeciesFilter'
	, 'templates/ProjectFilter'
	, 'templates/ProgramFilter'
	, 'templates/DocumentFilter'
	, 'templates/ContactFilter'
	, 'templates/OrganisationFilter'
	, 'templates/PlatformFilter'
	, 'templates/UnitFilter'
	, 'templates/DomainList'
], function(
	redmicConfig
	, _TemplatedMixin
	, _WidgetBase
	, declare
	, lang
	, Deferred
	, promiseAll
	, domAttr
	, domClass
	, Evented
	, query
	, put
	, _IgnoreNonexistentProperty
	, _Dependence
	, _DeleteOnClear
	, _DisableInput

	, DateRangeTextBoxImpl
	, MultiSelectImpl
	, RangeImpl
	, RadioButtonGroupImpl
	, ValueAndUnitSelectorImpl
	, CheckBoxImpl
	, CheckBoxGroupImpl
	, RadioButtonImpl
	, TextBoxImpl
	, NumberSpinnerImpl
	, NumberTextBoxImpl
	, SelectImpl
	, RangeSliderImpl
	, SliderImpl
	, KeywordsImpl
	, ColorPickerImpl
	, ColorPickerTextBoxImpl
	, FilteringSelectImpl
	, DateTextBoxImpl
	, DateTimeImpl
	, DateTimeTextBoxImpl
	, DateRangeImpl
	, AnnotationImpl
	, ColorsRampImpl
	, ColorImpl
	, SelectOnListPopupImpl
	, ButtonImpl
	, PointImpl
	, UploadFileImpl
	, TextAreaImpl
	, GeometryImpl
	, MapSearchImpl

	, SpeciesFilter
	, ProjectFilter
	, ProgramFilter
	, DocumentFilter
	, ContactFilter
	, OrganisationFilter
	, PlatformFilter
	, UnitFilter
	, DomainList
) {

	return declare([_WidgetBase, Evented, _TemplatedMixin], {
		//	summary:
		//		Contenedor de formularios de Redmic.
		//	description:
		//		Proporciona lo necesario para generar un formulario, en base a un JSON de configuración.

		//	template: Object
		//		Nombre de la plantilla del formulario a cargar.
		//	i18n: Object
		//		Traducciones del formulario a cargar.
		//	modelChannel: Object
		//		Canal del modelo sobre el que funciona el formulario.
		//	inputs: Object
		//		Instancias y nodos de los inputs del formulario.
		//	_templates: Object
		//		Colección de definiciones de plantillas disponibles para ser usadas por los inputs.

		constructor: function(/*Object*/ args) {

			this.config = {
				region: 'center',
				'class': 'formContainer',
				template: null,
				i18n: null,
				inputsProps: {},
				instance: null,
				modelChannel: null,
				inputs: {},
				redmicConfig: redmicConfig,
				timeout: 0,
				inverseLeftContainerClass: 'inverseLeftContainer',
				_minWidth: 370,

				dataTemplate: null,

				_templates: {
					'templates/SpeciesFilter': SpeciesFilter
					, 'templates/ProjectFilter': ProjectFilter
					, 'templates/ProgramFilter': ProgramFilter
					, 'templates/DocumentFilter': DocumentFilter
					, 'templates/ContactFilter': ContactFilter
					, 'templates/OrganisationFilter': OrganisationFilter
					, 'templates/PlatformFilter': PlatformFilter
					, 'templates/UnitFilter': UnitFilter
					, 'templates/DomainList': DomainList
				}
			};

			lang.mixin(this, this.config, args);

			if (this.loadInputs) {
				this.on('inputs', this.loadInputs);
			}

			if (this.dataTemplate) {
				this.templateString = this._getTemplate();
			} else {
				this.templatePath = require.toUrl('app/' + this.template + 'Form.html');
			}
		},

		_getTemplate: function() {

			this.dataTemplate.i18n = this.i18n;

			return this.template(this.dataTemplate);
		},

		startup: function() {

			this.inherited(arguments);

			var nodes = query('[data-redmic-type]', this.domNode),
				defsList = [];

			nodes.forEach(function(node) {

				this._startupNode(node, defsList);
			}, this);

			promiseAll(defsList).then(lang.hitch(this, function(results) {

				this.emit('inputs', this.inputs);
			}));
		},

		_startupNode: function(node, defsList) {

			// Si el nodo no tiene atributos, nos vamos
			if (!node.attributes) {
				return;
			}

			// Obtenemos las propiedades definidas desde el nodo
			var type = domAttr.get(node, 'data-redmic-type'),
				model = domAttr.get(node, 'data-redmic-model'),
				props = domAttr.get(node, 'data-redmic-props'),
				actions = domAttr.get(node, 'data-redmic-actions');

			var propertyName, targetProp,
				actionsToJSON = {},
				propsInputModule = {};

			// Obtenemos las acciones definidas desde el nodo y transformadas a JSON
			if (actions) {
				actionsToJSON = this._stringToJson(actions);
				// Para cada una de ellas le asignamos la llamada al método
				for (var key in actionsToJSON) {
					actionsToJSON[key] = lang.hitch(this, this._callbackWrapper, actionsToJSON[key]);
				}
			}

			// Obtenemos las propiedades definidas desde el nodo y transformadas a JSON
			var propsToJSON = props ? this._stringToJson(props) : {};
			// Mezclamos las propiedades con las acciones
			lang.mixin(propsToJSON, actionsToJSON);

			// Obtenemos el modelo con el que sincronizar a partir de la ruta definida desde el nodo
			if (model) {
				if (this.modelChannel) {
					propsInputModule.modelChannel = this.modelChannel;
				}
				propertyName = model;
			} else if (propsToJSON.propertyName) {
				propertyName = propsToJSON.propertyName;
			} else {
				propertyName = propsToJSON.label;
			}

			// Preparamos los nodos donde se colocarán los elementos del formulario
			var controlsNode = node,
				queryNode = query(node),
				parentInput = null;

			if (queryNode.parent || queryNode.children) {
				var parentNode = queryNode.parent()[0];
				// Si es un nodo de primer nivel
				if (!domAttr.has(parentNode, 'data-redmic-type')) {
					// Si es un nodo que no tiene hijos, abarca todo el espacio
					if (queryNode.children().length) { // Si es un nodo que tiene hijos, reservamos sólo una parte
						this.parentInput = propertyName;
					}
				} else {// Si es un nodo hijo (segundo nivel)
					parentInput = this.parentInput;
					controlsNode = put(node, '.embedded');
				}
			}

			if (propertyName) {
				targetProp = propertyName.split('/');
				targetProp = targetProp[targetProp.length - 1];
			}

			// Procedemos a crear el input
			var inputWidgetDfd = this._createInput(type, propsToJSON, propertyName, targetProp, propsInputModule);
			defsList.push(inputWidgetDfd);

			inputWidgetDfd && inputWidgetDfd.then(lang.hitch(this, this._onInputCreated, {
				controlsNode: controlsNode,
				propertyName: propertyName,
				parentInput: parentInput,
				propsToJSON: propsToJSON
			}));
		},

		_onInputCreated: function(args, inputWidget) {

			var inputProps = args.propsToJSON;
			var obj = {
				channel: inputWidget.getChannel(),
				node: args.controlsNode,
				isValid: inputProps.required ? false : true
			};

			if (args.parentInput) {
				obj.parent = args.parentInput;
			}

			if (inputProps.propertyNameDependence) {
				obj.propertyNameDependence = inputProps.propertyNameDependence;
			}

			this.inputs[args.propertyName] = obj;
		},

		_stringToJson: function(/*String*/ stringToConvert) {
			//	summary:
			//		Convierte a JSON un string.
			//	tags:
			//		private
			//	stringToConvert:
			//		String de entrada.

			var stringWithKeysInDoubleQuotes = stringToConvert.replace(/(\w+):[ |\t\n]*('[^']*')?/g, '"$1": $2'),
				stringWithStringValuesInDoubleQuotes = stringWithKeysInDoubleQuotes.replace(/\'/g, '"'),
				stringifiedJson = '{' + stringWithStringValuesInDoubleQuotes + '}';

			return JSON.parse(stringifiedJson);
		},

		_createInput: function(/*String*/ type, /*Object*/ props, /*String*/ propertyName,
			/*String*/ targetProp, /*object*/ propsInputModule) {
			//	summary:
			//		Crea el widget del input definido por los parámetros.
			//	tags:
			//		private
			//	returns:
			//		input instance

			var inputInstanceDfd = new Deferred(),

				placeholderKey = targetProp + 'PlaceHolder',
				// Propiedades por defecto para todos los inputs
				preProps = {
					'class': 'form-control',
					trim: true,
					placeHolder: this.i18n[placeholderKey in this.i18n ? placeholderKey : targetProp] || targetProp
				};

			var inputDefinition,
				template = props.template,
				templateDefinition = this._templates[template];

			if (template && !templateDefinition) {
				console.error('Template "%s" not found. Have you declared it previously on form component?', template);
			}

			delete props.template;

			// Según el tipo se crea el widget apropiado junto con sus props
			switch (type) {
				case 'boolean':
					preProps['class'] = '';
					inputDefinition = CheckBoxImpl;
					break;

				case 'booleanGroup':
					inputDefinition = CheckBoxGroupImpl;
					break;

				case 'uniqueGroup':
					inputDefinition = RadioButtonGroupImpl;
					break;

				case 'unique':
					preProps['class'] = '';
					inputDefinition = RadioButtonImpl;
					break;

				case 'valueAndUnit':
					preProps['class'] = 'valueAndUnitSelectorForm valueAndUnitSelector';
					inputDefinition = ValueAndUnitSelectorImpl;
					break;

				case 'email':
					preProps.intermediateChanges = true;
					preProps.type ='email';
					inputDefinition = TextBoxImpl;
					break;

				case 'step':
					preProps.intermediateChanges = true;
					inputDefinition = NumberSpinnerImpl;
					break;

				case 'number':
					inputDefinition = NumberTextBoxImpl;
					break;

				case 'select':
					inputDefinition = SelectImpl;
					break;

				case 'rangeSlider':
					inputDefinition = RangeSliderImpl;
					break;

				case 'slider':
					inputDefinition = SliderImpl;
					break;

				case 'keywords':
					delete preProps['class'];
					inputDefinition = KeywordsImpl;
					break;

				case 'colorPicker':
					inputDefinition = ColorPickerImpl;
					break;

				case 'colorPickerTextBox':
					inputDefinition = ColorPickerTextBoxImpl;
					break;

				case 'filter':
					delete preProps['class'];
					inputDefinition = FilteringSelectImpl;

					break;

				case 'date':
					inputDefinition = DateTextBoxImpl;
					break;

				case 'dateTime':
					inputDefinition = DateTimeImpl;
					break;

				case 'dateTimeTextBox':
					inputDefinition = DateTimeTextBoxImpl;
					break;

				case 'dateRangeTextBox':
					inputDefinition = DateRangeTextBoxImpl;
					break;

				case 'dateRange':
					inputDefinition = DateRangeImpl;
					break;

				case 'textarea':
					preProps.intermediateChanges = true;
					inputDefinition = TextAreaImpl;
					break;

				case 'geometry':
					inputDefinition = GeometryImpl;
					break;

				case 'mapSearch':
					inputDefinition = MapSearchImpl;
					break;

				case 'button':
					preProps.notLabel = true;
					targetProp += 'Button';
					inputDefinition = ButtonImpl;
					break;

				case 'point':
					inputDefinition = PointImpl;
					break;

				case 'password':
					preProps.intermediateChanges = true;
					preProps.type = 'password';
					preProps.invalidMessage = this.i18n.InvalidPassword;
					inputDefinition = TextBoxImpl;
					break;

				case 'confirm':
					preProps.intermediateChanges = true;
					preProps.type = 'password';
					preProps.placeHolder = this.i18n.confirmPassword;
					propsInputModule._validate = function(obj) {

						if (this._valueInput && this._valueInput.length >= 6 &&
							this.valueDependence === this._valueInput) {

							this._isValid = true;
						} else {
							this._isValid = false;
						}

						return !!this._isValid;
					};
					preProps.invalidMessage = this.i18n.InvalidConfirm;
					inputDefinition = TextBoxImpl;
					break;

				case 'upload':
					inputDefinition = UploadFileImpl;
					break;

				case 'annotation':
					preProps.notLabel = true;
					inputDefinition = AnnotationImpl;
					break;

				case 'range':
					inputDefinition = RangeImpl;
					break;

				case 'colorRamp':
					inputDefinition = ColorsRampImpl;
					break;

				case 'color':
					inputDefinition = ColorImpl;
					break;

				case 'multiSelect':
					inputDefinition = MultiSelectImpl;
					break;

				case 'selectOnListPopup':
					inputDefinition = SelectOnListPopupImpl;

					break;

				default:
					preProps.intermediateChanges = true;
					inputDefinition = TextBoxImpl;
					break;
			}

			// Mezclamos las props de fuera con las creadas aquí
			lang.mixin(preProps, props);
			if (this.inputsProps[propertyName]) {
				lang.mixin(preProps, this.inputsProps[propertyName]);
			}

			if (preProps.target && redmicConfig.services[preProps.target]) {
				preProps.target = redmicConfig.services[preProps.target];
			}

			var inputConfig = {
				inputProps: preProps,
				propertyName: propertyName,
				label: targetProp,
				'class': 'inputContainer',
				parentChannel: this.parentChannel
			};

			lang.mixin(inputConfig, propsInputModule);

			this._prepareInputInstanceCreation({
				definition: inputDefinition,
				template: templateDefinition,
				inputConfig: inputConfig,
				inputInstanceDfd: inputInstanceDfd
			});

			return inputInstanceDfd;
		},

		_prepareInputInstanceCreation: function(args) {

			var definition = args.definition,
				template = args.template,
				dfd = args.inputInstanceDfd,
				inputConfig = args.inputConfig;

			inputConfig.inputProps.template = template;

			this._createInputInstance(definition, inputConfig, dfd);
		},

		_createInputInstance: function(definition, config, dfd) {

			if (config.inputProps.deleteOnClear) {
				delete config.inputProps.deleteOnClear;
				definition = declare([definition, _DeleteOnClear]);
			}

			if (this.ignoreNonexistentProperty) {
				definition = declare([definition, _IgnoreNonexistentProperty]);
			}

			if (this.isDisableInputs) {
				definition = declare([definition, _DisableInput]);
			}

			if (config.inputProps.propertyNameDependence) {
				definition = declare([definition, _Dependence]);
			}

			dfd.resolve(new definition(config));
		},

		_callbackWrapper: function(functionName, obj) {

			if (this[functionName]) {
				this[functionName](obj);
			}
		},

		resize: function() {

			this.inherited(arguments);

			this._chkWidthAndChangeClass();
		},

		_chkWidthAndChangeClass: function() {

			var width = this.domNode.clientWidth,
				nodeForm = this.domNode.children[0];

			if (width < this._minWidth) {
				domClass.add(nodeForm, this.inverseLeftContainerClass);
			} else {
				domClass.remove(nodeForm, this.inverseLeftContainerClass);
			}
		}
	});
});
