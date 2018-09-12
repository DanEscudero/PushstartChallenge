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

/**
 * Loads levels json, calls onLoaded when done
 */
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

/**
 * Starts animations, creates Puzzle and animates puzzle name
 */
function onLoaded() {
	animate();
	setupPuzzle();
	animatePuzzleName();
}

/**
 * Creates puzzle - setup blocks, modifiers, puzzle name and track
 */
function setupPuzzle() {
	setupPuzzleName(levels[gameStep].name);

	const positioningPad = 50;
	setupTrack(positioningPad);

	final = getBlock(positioningPad, levels[gameStep].final, true);
	initial = getBlock(positioningPad, levels[gameStep].initial, false);
	createButton(initial);

	modifiers = [];
	setupModifiers(levels[gameStep].modifiers);

	const { type } = levels[gameStep].modifiers[0];
	repositionModifiers(type);
	if (type === 'select') {
		setModifiersVisibility(type);
	}

	updateZOrder();

	if (type === 'select') {
		modifiers.forEach(modifier => createButton(modifier));
	}

	enableInput();
	render();
}

/**
 * Creates puzzle name
 * @param {*} name
 */
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

/**
 * Setups track
 * @param {*} positioningPad
 */
function setupTrack(positioningPad = 50) {
	track = new PIXI.Graphics();
	stage.addChild(track);

	track.lineStyle(1, '0x000000');
	track.beginFill('0xf0f0f0');
	track.drawRect(positioningPad, renderer.height / 2, renderer.width - 2 * positioningPad, 5);
}

/**
 * returns object with block and properties
 * @param {*} positioningPad
 * @param {*} param1 Block properties
 * @param {*} isFinal If is or not final block
 */
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

/**
 * Sets all modifiers
 * @param {*} levelModifiers
 */
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

/**
 * Positions all modifiers along the track
 * @param {*} type If it's 'select', modifiers have a different behavior
 */
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
			modifier.block.x = (final.block.x + initial.block.x) / 2;
			modifier.block.y = final.block.y;
		});
	}
}

/**
 * Hides all modifiers but the first
 * @param {*} type
 */
function setModifiersVisibility() {
	modifiers.forEach(modifier => (modifier.block.visible = false));

	// Except for the first, that should be always visible
	modifiers[0].block.visible = true;
}

/**
 * Fixes z-Order to make sure moving blocks are in front of stopped blocks
 */
function updateZOrder() {
	const lastIndex = stage.children.length - 1;
	stage.setChildIndex(final.block, lastIndex);
	stage.setChildIndex(initial.block, lastIndex);
}

/**
 * Renders stage
 */
function render() {
	renderer.render(stage);
}

/**
 * Sets any component as a button
 * @param {*} button
 */
function createButton(button) {
	const { block } = button;
	block.buttonMode = true;

	block.on('mousedown', () => onUserClick(button));
}

/**
 * Reacts to user click
 * @param {*} component Clicked component
 */
function onUserClick(component) {
	// This function receives either initial button or one of the modifiers
	if (component !== initial) {
		modifiers[modifiersIndex].block.visible = false;
		modifiersIndex = (modifiersIndex + 1) % modifiers.length;
		modifiers[modifiersIndex].block.visible = true;
		return;
	}

	// Disable input, to avoid any over clicking
	disableInput();

	// Validate answer to decide what kind of feedback should we have
	const { isCorrect, isFinalAnswer } = validateAnswer();

	// Animate feedback - block walking on track and transforming along the way
	animateFeedback(isCorrect, isFinalAnswer);

	// If it's not final answer, we go to next step
	if (!isFinalAnswer) {
		mainTL.add(() => {
			hideAll();

			gameStep += isCorrect;
			setupPuzzle();

			animatePuzzleName();
		}, '+=1');
	}
}

/**
 * Disables user input
 */
function disableInput() {
	initial.block.interactive = false;
	modifiers.forEach(modifier => (modifier.block.interactive = false));
}

/**
 * Enables user input
 */
function enableInput() {
	initial.block.interactive = true;
	modifiers.forEach(modifier => (modifier.block.interactive = true));
}

/**
 * Compares transformed with final block. Also, returns if current step is the last one
 */
function validateAnswer() {
	// Lets check if initial and end blocks are matching
	const currentLevel = levels[gameStep];
	const { type } = currentLevel.modifiers[0];

	const initialBlock = Object.assign({}, initial.properties);
	// Lets apply just one modification - the selected one
	if (type === 'select') {
		const modifier = modifiers[modifiersIndex];
		Object.assign(initialBlock, modifier.properties);
	} else {
		// Lets apply all modifications
		modifiers.forEach(modifier => {
			Object.assign(initialBlock, modifier.properties);
		});
	}

	const isCorrect =
		initialBlock.color === final.properties.color &&
		initialBlock.size === final.properties.size;

	const isFinalAnswer = gameStep === levels.length - 1;

	return { isCorrect, isFinalAnswer };
}

/**
 * Animates feedback
 * @param {*} isCorrect
 */
function animateFeedback(isCorrect, isFinalAnswer) {
	const currentLevel = levels[gameStep];
	const { type } = currentLevel.modifiers[0];

	if (type !== 'select') {
		// We animate for all blocks
		modifiers.forEach(modifier => {
			animateTransformation(modifier.block.x, modifier.properties);
			Object.assign(initial.properties, modifier.properties);
		});
	} else {
		// Else, animate just for the selected one
		const modifier = modifiers[modifiersIndex];
		animateTransformation(modifier.block.x, modifier.properties);
		Object.assign(initial.properties, modifier.properties);
	}

	animateFinalBlock(isCorrect);

	if (isFinalAnswer) {
		animateEndGame();
	}
}
