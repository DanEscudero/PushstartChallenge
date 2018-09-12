/**
 * Draws block in graphics according to properties
 * @param {*} graphics to be drawn
 * @param {*} param1 Block properties
 * @param {*} isFinal
 */
function drawBlock(graphics, { size, color }, isFinal = false) {
	// Format color to be compatible with Graphics method
	color = formatColor(color);
	graphics.clear();
	graphics.beginFill(color);

	// Set dimensions
	const width = 40;
	const height = size * width;

	// Draw block
	const stroke = 3;
	graphics.lineStyle(stroke, '0x000000');
	graphics.drawRoundedRect(-width / 2, -height / 2, width, height, 3);
	graphics.endFill();

	// If we're in final block, let's add an extra effect to the block
	if (isFinal) {
		graphics.lineStyle(0);
		graphics.beginFill('0xb0b0b0', 0.75);
		const step = 8;

		const xBorder = width / 2;
		const yBorder = height / 2;

		for (let x = -(width - stroke) / 2; x <= xBorder; x += step) {
			for (let y = -(height - stroke) / 2; y <= yBorder; y += step) {
				graphics.drawRect(x, y, step / 1.5, step / 1.5);
			}
		}
	}
}

/**
 * Draws color modifier, adds to array
 * @param {*} color
 * @param {*} index
 */
function setupColorModifier(color, index) {
	const modifierBlock = new PIXI.Graphics();
	stage.addChild(modifierBlock);

	// Define dimensions
	const width = 40;

	modifierBlock.lineStyle(2, '0xffffff');
	modifierBlock.beginFill(formatColor(color));
	modifierBlock.drawRoundedRect(-width / 2, -width / 2, width, width, 2);
	modifierBlock.endFill();

	modifiers[index] = {
		block: modifierBlock,
		properties: {
			type: 'color',
			index,
			color: formatColor(color)
		}
	};
}

/**
 * Draws size modifier, add to array
 * @param {*} size
 * @param {*} index
 */
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
		drawShrinkModifier(modifierBlock, width);
	} else {
		drawEnlargeModifier(modifierBlock, width);
	}

	modifiers[index] = {
		block: modifierBlock,
		properties: {
			type: 'size',
			index,
			size: Number(size)
		}
	};
}

/**
 * Draw details of shrink modifier
 * @param {*} graphics to be drawn
 * @param {*} size
 */
function drawShrinkModifier(graphics, size) {
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

/**
 * Draw details of enlarge modifier
 * @param {*} graphics to be drawn
 * @param {*} size
 */
function drawEnlargeModifier(graphics, size) {
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

/**
 *
 * @param {*} numWords number of words in the text
 */
function getCreditsText(numWords = 200) {
	const bla = [
		'cup',
		'steam',
		'true',
		'pretend',
		'illegal',
		'fresh',
		'scrape',
		'eyes',
		'plausible',
		'swim',
		'water',
		'wholesale'
	];

	let text = '';
	for (let i = 0; i < numWords; i++) {
		text += bla[Math.floor(Math.random() * bla.length)] + ' ';
	}

	return text;
}
