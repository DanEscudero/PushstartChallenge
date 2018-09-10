const backgroundColor = '0x505050';
var renderer = PIXI.autoDetectRenderer(640, 480, {
	backgroundColor,
	antialias: true
});
document.body.appendChild(renderer.view);

const stage = new PIXI.Container();
const tl = new TimelineMax();

let levels;
let gameStep = 0;

let track, initial, final, modifiers;

loadLevels();
render();
// animate();

function loadLevels() {
	request = new XMLHttpRequest();
	request.open('GET', '/levels.json', true);

	request.onload = () => {
		if (request.status >= 200 && request.status < 400) {
			levels = JSON.parse(request.responseText);

			// Once levels are loaded, we can setup puzzle
			setupPuzzle();
		}
	};

	request.send();
}

function setupPuzzle() {
	const pad = 50;
	setupTrack(pad);

	initial = new PIXI.Graphics();
	stage.addChild(initial);
	drawBlock(initial, levels[gameStep].initial);
	initial.position.set(pad, renderer.height / 2);

	final = new PIXI.Graphics();
	stage.addChild(final);
	drawBlock(final, levels[gameStep].final);
	final.position.set(renderer.width - pad, renderer.height / 2);

	modifiers = [];
	setupModifiers(levels[gameStep].modifiers);

	render();
}

function setupTrack(pad = 50) {
	track = new PIXI.Graphics();
	stage.addChild(track);

	track.lineStyle(1, '0x000000');
	track.beginFill('0xf0f0f0');
	track.drawRect(pad, renderer.height / 2, renderer.width - 2 * pad, 5);
}

function drawBlock(graphics, { size, color }) {
	// Format color to be compatible with Graphics method
	color = color.replace('#', '0x');
	graphics.beginFill(color);

	// Set dimensions
	const width = 40;
	const height = size === 1 ? width : 2 * width;

	// Draw block
	graphics.lineStyle(3, '0x000000');
	graphics.drawRoundedRect(-width / 2, -height / 2, width, height, 3);
}

function setupModifiers(levelModifiers) {
	if (levelModifiers[0].type === 'select') {
		setupModifiers(levelModifiers[0].options);
		return;
	}

	modifiers = Array(levelModifiers.length);
	levelModifiers.forEach((modifier, index) => {
		switch (modifier.type) {
			case 'resize':
				setupSizeModifier(modifier.size, index);
				break;
			case 'colorize':
				setupColorModifier(modifier.color, index);
				break;
		}
	});

	repositionModifiers();
}

function setupSizeModifier(size, index) {
	const modifierBlock = new PIXI.Graphics();
	stage.addChild(modifierBlock);

	// Define dimensions
	const width = 40;

	modifierBlock.lineStyle(2, '0xffffff');
	modifierBlock.beginFill('0x000000');
	modifierBlock.drawRoundedRect(-width / 2, -width / 2, width, width, 2);
	modifierBlock.endFill();

	if (size === 1) {
		drawSmallModifier(modifierBlock, width);
	} else {
		drawLargeModifier(modifierBlock, width);
	}

	modifiers[index] = modifierBlock;
}

function drawSmallModifier(graphics, size) {
	const pad = 4;

	graphics.lineStyle(1, '0xffffff');
	graphics.beginFill('0xffffff');

	// Bottom triangle, pointing up
	graphics.moveTo(size / 2 - pad, size / 2 - pad);
	graphics.lineTo(-(size / 2) + pad, size / 2 - pad);
	graphics.lineTo(0, pad);

	// Upper traingle, pointing down
	graphics.moveTo(size / 2 - pad, -size / 2 + pad);
	graphics.lineTo(-size / 2 + pad, -size / 2 + pad);
	graphics.lineTo(0, -pad);
	graphics.endFill();
}

function drawLargeModifier(graphics, size) {
	const pad = 4;

	graphics.lineStyle(1, '0xffffff');
	graphics.beginFill('0xffffff');

	// Bottom triangle, pointing down
	graphics.moveTo(size / 2 - pad, pad);
	graphics.lineTo(-(size / 2) + pad, pad);
	graphics.lineTo(0, size / 2 - pad);

	// Upper triangle, pointing up
	graphics.moveTo(size / 2 - pad, -pad);
	graphics.lineTo(-size / 2 + pad, -pad);
	graphics.lineTo(0, -size / 2 + pad);
	graphics.endFill();
}

function repositionModifiers() {
	let currentXPosition = initial.x;
	const available = final.x - initial.x;
	const increase = available / (modifiers.length + 1);

	modifiers.forEach(modifier => {
		currentXPosition += increase;

		modifier.x = currentXPosition;
		modifier.y = renderer.height / 2;
	});
}

function render() {
	renderer.render(stage);
}

// function animate() {
// 	requestAnimationFrame(animate);
// 	renderer.render(stage);
// }
