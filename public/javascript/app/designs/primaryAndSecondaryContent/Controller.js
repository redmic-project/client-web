define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "RWidgets/Button"
], function (
	_Controller
	, declare
	, lang
	, put
	, Button
){
	return declare(_Controller, {
		//	summary:
		//		Diseño para doble contenido, donde el principal despliega sus contenidos en el secundario.

		constructor: function(args) {

			this.config = {
				title: this.i18n.info,
				'class': 'dualContent',

				primaryInClass: "primaryIn",
				primaryOutClass: "primaryOut",
				secondaryInClass: "secondaryIn",
				secondaryOutClass: "secondaryOut",
				hiddenClass: "hidden",

				primaryContentChannel: null,
				secondaryContentChannel: null,

				controllerActions: {
					CHANGE_TO_SECONDARY: "changeToSecondary"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerOwnCallbacksForEvents: function () {

			this._onEvt('HIDE', lang.hitch(this, this._onHide));
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("CHANGE_TO_SECONDARY"),
				callback: "_subChangeToSecondary"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this.addNewButton = new Button({
				label: this.i18n.back,
				'class': "success",
				title: this.i18n.back,
				onClick: lang.hitch(this, this._changeToPrimary)
			}).placeAt(this._backButtonNode);

			if (!this.primaryContentChannel) {
				console.error('Primary content channel is not specified');
			}
		},

		_subChangeToSecondary: function(req) {

			var secondaryChannel = req.channel;

			if (secondaryChannel) {
				this._changeToSecondary(secondaryChannel, req);
			} else if (this.secondaryContentChannel) {
				this._changeToSecondary(this.secondaryContentChannel, req);
			} else {
				console.error('Secondary content channel is not specified');
			}
		},

		_changeToSecondary: function(channel, args) {

			this.currentSecondaryContentChannel = channel;

			var primaryData = args.primaryData,
				title = args.title,
				showAnimation = this.secondaryInClass,
				hideAnimation = this.secondaryOutClass;

			put(this._secondaryContentNode, "!" + this.hiddenClass);

			if (args.showAnimation !== undefined) {
				showAnimation = args.showAnimation;
			}

			if (args.showAnimation !== undefined) {
				hideAnimation = args.hideAnimation;
			}

			this._showContent(channel, {
				node: this._secondaryContentNode,
				data: primaryData,
				showAnimation: showAnimation,
				hideAnimation: hideAnimation
			});

			var hiddenChannel = this._buildChannel(this.primaryContentChannel, this.actions.HIDDEN);

			this._once(hiddenChannel, lang.hitch(this, function(title) {

				put(this._backButtonNode, "!" + this.hiddenClass);
				put(this._primaryContentNode, "." + this.hiddenClass);
				this._updateTitle(title);
			}, title));

			this._hideContent(this.primaryContentChannel);
		},

		_changeToPrimary: function() {

			put(this._primaryContentNode, "!" + this.hiddenClass);
			put(this._backButtonNode, "." + this.hiddenClass);

			this._showContent(this.primaryContentChannel, {
				node: this._primaryContentNode,
				showAnimation: this.primaryInClass,
				hideAnimation: this.primaryOutClass
			});

			var hiddenChannel = this._buildChannel(this.currentSecondaryContentChannel, this.actions.HIDDEN);

			this._once(hiddenChannel, lang.hitch(this, function() {

				put(this._secondaryContentNode, "." + this.hiddenClass);
				this._updateTitle();
			}));

			this._hideContent(this.currentSecondaryContentChannel);
		},

		_showContent: function(channel, args) {

			var node = args.node,
				data = args.data,
				showAnimationClass = args.showAnimation,
				hideAnimationClass = args.hideAnimation,
				showChannel = this._buildChannel(channel, this.actions.SHOW);

			this._publish(showChannel, {
				node: node,
				data: data,
				animation: {
					showAnimation: showAnimationClass,
					hideAnimation: hideAnimationClass
				}
			});
		},

		_hideContent: function(channel, omitAnimation) {

			var hideChannel = this._buildChannel(channel, this.actions.HIDE);

			this._publish(hideChannel, {
				omitAnimation: omitAnimation
			});
		},

		_beforeShow: function() {

			put(this._backButtonNode, "." + this.hiddenClass);
			put(this._primaryContentNode, "!" + this.hiddenClass);
			put(this._secondaryContentNode, "." + this.hiddenClass);

			this._updateTitle();
			this._showContent(this.primaryContentChannel, {
				node: this._primaryContentNode,
				hideAnimation: this.primaryOutClass
			});
		},

		_onHide: function() {

			this._hideContent(this.primaryContentChannel, true);
			this.currentSecondaryContentChannel && this._hideContent(this.currentSecondaryContentChannel, true);
		}
	});
});
