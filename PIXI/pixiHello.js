// Pixi is saying hello!
const type = PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas';
PIXI.utils.sayHello(type)