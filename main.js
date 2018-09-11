const backgroundColor = '0x505050';
var renderer = PIXI.autoDetectRenderer(640, 480, {
	backgroundColor,
	antialias: true
});
document.body.appendChild(renderer.view);

const stage = new PIXI.Container();
const mainTL = new TimelineMax();

let levels;
let gameStep = 0;
let modifiersIndex = 0;

let track, initial, final, modifiers, puzzleName, debug;

loadLevels();
function loadLevels() {
	request = new XMLHttpRequest();
	request.open('GET', '/levels.json', true);

	request.onload = () => {
		if (request.status >= 200 && request.status < 400) {
			levels = JSON.parse(request.responseText);

			// Once levels are loaded, we can setup puzzle
			onLoaded();
		}
	};

	request.send();
}

function onLoaded() {
	setupPuzzle();
}

function setupPuzzle() {
	// TODO: remove debug
	debug = new PIXI.Graphics();
	debug.beginFill('0xff0000', 0.25);
	debug.lineStyle(1, '0xff0000');
	stage.addChild(debug);

	setupPuzzleName(levels[gameStep].name);

	const positioningPad = 50;
	setupTrack(positioningPad);

	final = getBlock(positioningPad, levels[gameStep].final, true);
	initial = getBlock(positioningPad, levels[gameStep].initial, false);

	modifiers = [];
	setupModifiers(levels[gameStep].modifiers);

	const { type } = levels[gameStep].modifiers[0];
	repositionModifiers(type);
	setModifiersVisibility(type);

	updateZOrder();

	render();
	const { isCorrect, isFinalAnswer } = validateAnswer();
	animateFeedback({ isCorrect, isFinalAnswer });
}

function setupPuzzleName(name) {
	const style = {
		fontFamily: 'Arial',
		fontSize: 32,
		fill: '0xff1010',
		dropShadow: true,
		dropShadowBlur: 20,
		dropShadowAlpha: 0.25,
		strokeThickness: 1
	};
	puzzleName = new PIXI.Text(name, style);

	stage.addChild(puzzleName);
	puzzleName.anchor.set(0.5, 0.5);
	puzzleName.x = renderer.width / 2;
	puzzleName.y = puzzleName.height;
	puzzleName.alpha = 0;
}

function setupTrack(pad = 50) {
	track = new PIXI.Graphics();
	stage.addChild(track);

	track.lineStyle(1, '0x000000');
	track.beginFill('0xf0f0f0');
	track.drawRect(pad, renderer.height / 2, renderer.width - 2 * pad, 5);
}

function getBlock(positioningPad = 50, { size, color }, isFinal) {
	const blockGraphics = new PIXI.Graphics();
	stage.addChild(blockGraphics);
	drawBlock(blockGraphics, { size, color }, isFinal);

	blockGraphics.x = isFinal ? renderer.width - positioningPad : positioningPad;
	blockGraphics.y = renderer.height / 2;

	return {
		block: blockGraphics,
		properties: {
			size: Number(size),
			color: formatColor(color)
		}
	};
}

function setupModifiers(levelModifiers) {
	if (levelModifiers[0].type === 'select') {
		levelModifiers = levelModifiers[0].options;
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
}

function repositionModifiers(type) {
	if (type !== 'select') {
		// Position modifiers along all track
		let currentXPosition = initial.block.x;
		const available = final.block.x - initial.block.x;
		const increase = available / (modifiers.length + 1);

		modifiers.forEach(modifier => {
			currentXPosition += increase;

			modifier.block.x = currentXPosition;
			modifier.block.y = final.block.y;
		});
	} else {
		// Position modifiers in the center
		modifiers.forEach(modifier => {
			modifier.block.x = (final.block.x - initial.block.x) / 2;
			modifier.block.y = final.block.y;
		});
	}
}

function setModifiersVisibility(type) {
	// Hide all modifiers if we're in select mode
	modifiers.forEach((modifier, index) => {
		modifier.block.visible = type !== 'select';
	});

	// Except for the first, that should be always visible
	modifiers[0].block.visible = true;
}

function updateZOrder() {
	const lastIndex = stage.children.length - 1;
	stage.setChildIndex(final.block, lastIndex);
	stage.setChildIndex(initial.block, lastIndex);
}

function render() {
	renderer.render(stage);
}

function validateAnswer() {
	// First we should check if initial and end blocks are matching
	const isCorrect =
		initial.properties.color === final.properties.color &&
		initial.properties.size === final.properties.size;

	const isFinalAnswer = gameStep === levels.length - 1;

	return { isCorrect, isFinalAnswer };
}

function animateFeedback({ isCorrect, isFinalAnswer }) {
	animatePuzzleName();
	modifiers.forEach(modifier => {
		animateModifier(modifier.block.x, modifier.properties);
	});

	animateFinalBlock(isCorrect);

	if (isFinalAnswer) {
		animateEndGame();
	} else {
		animateStepTransition();
	}

	animate();
}
