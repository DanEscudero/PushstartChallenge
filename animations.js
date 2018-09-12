function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

/**
 * Animates puzzle name
 */
function animatePuzzleName() {
	const duration = 0.4;
	const delay = 1;

	const nameTL = new TimelineMax();
	mainTL.add(nameTL);

	nameTL.add('introLabel', 1);
	nameTL
		.to(puzzleName, duration, { alpha: 1 }, 'introLabel')
		.to(puzzleName.scale, duration, { x: 1.25, y: 1.25 }, 'introLabel')
		.to(puzzleName.scale, duration, { x: 1, y: 1 })
		.to(puzzleName, 0.25, { delay: 0.5, alpha: 0 });
}

/**
 * Animates individual transformation
 * @param {*} xPosition Position of modifier
 * @param {*} param1 Properties of trasformer
 */
function animateTransformation(xPosition, { type = -1, color = -1, size = -1 }) {
	const transformedProperties =
		type === 'size'
			? { size, color: initial.properties.color }
			: { size: initial.properties.size, color };

	const transformBlock = () => drawBlock(initial.block, transformedProperties);

	// Create transformation TimeLine and add to main timeline
	const blockTL = new TimelineMax();
	mainTL.add(blockTL);

	// Move block to modifier
	blockTL.to(initial.block, 1.5, { x: xPosition, ease: Power2.easeInOut });

	// Animate block scaling up or down, according to modifier
	if (type === 'size') {
		// Halve block's size for shrinker modifier; Double for enlarger
		const scale = size === 1 ? 0.5 : 2;
		blockTL.to(initial.block.scale, 0.4, { y: scale });
		blockTL.to(initial.block.scale, Number.EPSILON, { y: 1 });
	}

	// Render new block
	blockTL.add(new TweenMax({}, Number.EPSILON, { onComplete: transformBlock }));

	// Update block's properties
	initial.properties = transformedProperties;
}

/**
 * Animates initial block hitting or fitting with final block
 * @param {*} isCorrect
 */
function animateFinalBlock(isCorrect) {
	const finalTL = new TimelineMax();
	mainTL.add(finalTL);

	if (isCorrect) {
		// If blocks are matching, we animate correct feedback
		// Initial block moves up to end block
		finalTL.to(initial.block, 1.5, { x: final.block.x, ease: Power2.easeInOut });
	} else {
		// Else, if blocks are wrong, we try to fit block, and get wrong feedback
		const lastModifier = modifiers[modifiers.length - 1];
		const xDifference = final.block.x - lastModifier.block.x;

		const target1 = lastModifier.block.x + xDifference * 0.75;
		const target2 = lastModifier.block.x + xDifference * 0.5;

		finalTL
			.add(new TweenMax.to(initial.block, 0.75, { x: target1, ease: Power2.easeIn }))
			.add(new TweenMax.to(initial.block, 0.75, { x: target2, ease: Power2.easeOut }));
	}
}

/**
 * Hide all components
 */
function hideAll() {
	const components = [track, initial.block, final.block].concat(modifiers.map(m => m.block));
	components.forEach(component => mainTL.add(() => (component.visible = false)));
}

/**
 * Hide all components
 */
function outAnimation() {
	const components = [track, initial.block, final.block].concat(modifiers.map(m => m.block));
	mainTL.add(TweenMax.to(components, 0.75, { x: `+=${1.25 * stage.width}` }));
}

/**
 * Animates out transition and credits
 */
function animateEndGame() {
	let style = {
		fontFamily: 'Arial',
		fontSize: 14,
		fill: '0x000000',
		strokeThickness: 1,
		align: 'center',
		wordWrap: true,
		wordWrapWidth: 200
	};
	const creditsText = getCreditsText();
	const credits = new PIXI.Text(creditsText, style);

	stage.addChild(credits);
	credits.anchor.set(0.5, 0);
	credits.x = renderer.width / 2;
	credits.y = renderer.height;

	style = {
		fontFamily: 'Arial',
		fontSize: 32,
		fill: '0xff1010',
		dropShadow: true,
		dropShadowBlur: 20,
		dropShadowAlpha: 0.25,
		strokeThickness: 1
	};
	const thanks = new PIXI.Text('Thanks for playing!', style);

	stage.addChild(thanks);
	thanks.anchor.set(0.5, 0.5);
	thanks.x = renderer.width / 2;
	thanks.y = renderer.height + thanks.height;

	outAnimation();
	const delay = mainTL.duration();
	const duration = 2;

	const tallerBlockHeight = Math.max(final.block.height, final.block.height);
	const yTarget = track.y + tallerBlockHeight / 2 + thanks.height;

	TweenMax.to(credits, duration, { y: -credits.height, ease: Power0.easeNone }).delay(delay);
	TweenMax.to(thanks, 1, { y: yTarget, ease: Back.easeOut }).delay(delay + duration + 0.75);
}
