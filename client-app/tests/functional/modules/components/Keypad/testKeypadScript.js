require([
	'dojo/_base/declare'
	, 'dojo/dom'
	, 'src/component/components/Keypad/TrizoneKeypadImpl'
	, 'src/component/components/Keypad/Keypad'
], function(
	declare
	, dom
	, TrizoneKeypadImpl
	, Keypad
){

	var btn1Config = {
			zone: 'left',
			props: {
				'class': 'primary'
			}
		},
		btn2Config = {
			zone: 'center',
			props: {
				'class': 'success'
			}
		},
		btn3Config = {
			zone: 'right',
			props: {
				'class': 'warning'
			}
		},
		keypad = new TrizoneKeypadImpl({
			parentChannel: 'test',
			items: {
				btn1: btn1Config,
				btn2: btn2Config,
				btn3: btn3Config
			}
		});

	keypad._once(keypad.getChannel('KEYPAD_INPUT'), function(obj) {

		window.inputKey = obj.inputKey;
	});

	keypad._publish(keypad.getChannel('HIDE_BUTTON'), {
		key: 'btn2'
	});

	keypad._publish(keypad.getChannel('DISABLE_BUTTON'), {
		key: 'btn3'
	});
	keypad._publish(keypad.getChannel('ENABLE_BUTTON'), {
		key: 'btn3'
	});

	keypad._publish(keypad.getChannel('SHOW'), {
		node: dom.byId('container')
	});
});
