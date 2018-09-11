function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

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
		.to(puzzleName, 0.25, { delay: 0.5, alpha: 0 })
		.to({}, 1, {});
}

function animateModifier(xPosition, { type = -1, color = -1, size = -1, index = -1 }) {
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
			.add(new TweenMax.to(initial.block, 0.75, { x: target1 }))
			.add(new TweenMax.to(initial.block, 0.75, { x: target2 }));
	}
}

animateStepTransition() {
	console.warn('StepTransition - TODO');
}

animateEndGame() {
	console.warn('EndGame - TODO');
}
