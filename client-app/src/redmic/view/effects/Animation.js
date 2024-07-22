define([
	"dojo/_base/declare"
	, "dojo/_base/html"
	, "dojo/_base/fx"
	, "dojo/_base/lang"
], function(
	declare
	, html
	, baseFx
	, lang
){
	return declare(null, {

		fadeInInProgress: null,
		fadeOutInProgress: null,

		_transition:function(newWidget, oldWidget){

			// Needed later for calling this.inherited(arguments);
			that = this;
			var a = arguments;

			// An animation was stopped: don't do the whole animation thing, reset everything,
			// called this.inherited(arguments) as if nothing happened
			if( this.fadeInInProgress || this.fadeOutInProgress ){

				// Stop animations
				if( this.fadeInInProgress ){ this.fadeInInProgress.stop(); }
				if( this.fadeOutInProgress ){ this.fadeOutInProgress.stop(); }

				// Reset opacity for everything
				html.style(newWidget.domNode, "opacity", 1);
				html.style(oldWidget.domNode, "opacity", 1);

				// call inherited(arguments) as if nothing happened
				this.inherited(arguments);
				return;
			}

			// ////////////////////////////////////////
			// // FADEOUT
			// ////////////////////////////////////////
			// console.log("Fade out starting");
			that.fadeOutInProgress = baseFx.fadeOut({
				node:oldWidget.domNode,
				duration: 150,
				onStop: function(){
					that.fadeOutInProgress = null;
				},

				// ////////////////////////////////////////
				// // FADEIN
				// ////////////////////////////////////////
				onEnd: function(){
					that.fadeOutInProgress = null;

					// Make the widget transparent, and then call inherited -- which will do the actual switch.
					html.style(newWidget.domNode, "opacity", 0);
					that.inherited(a);

					// At this point the widget is visible, selected but transparent.
					// Let's fix that...
					that.fadeInInProgress = baseFx.fadeIn({
						node:newWidget.domNode,
						duration: 150,
						onStop: function(){
							that.fadeInInProgress = null;
						},
						onEnd: function(){
							that.fadeInInProgress = null;
						}
					}).play();
				}
			}).play();
		}
	}); // Declare
}); // Define
