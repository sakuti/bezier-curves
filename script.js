// Curves
// Saku (saku.lol)
// 24.1.2023

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');


const sliders = [], posArr = [];
let blockCount = 0, lastColor;

const audio = new Audio('./metronome.mp3');
const playAudio = true;

let step = 0.00125;
const colorTypes = [
	'#ff5c5c',
	'#39da8a',
	'#5b8dee',
	'#fdac41',
	'#f6dc62',
	'#74e0e6',
	'#ac5cd9'
]


// Prepare the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.appendChild(canvas);
document.addEventListener('click', clickEvent);
startInterval();
runTest();



function runTest() {
	for(index in colorTypes) {
		let x = index;
		setTimeout(() => {
			const offset = x * 50;
			const positions = [];

			for(let i = 0; i < 4; i++) {
				let position = {};
				if(i === 0) position = { x: window.innerWidth / 4.25 - offset, y: window.innerHeight - window.innerHeight / 5 };
				if(i === 3) position = { x: window.innerWidth / 1.25 + offset, y: window.innerHeight - window.innerHeight / 5 };
				if(i === 1) position = { x: window.innerWidth / 2.25, y: window.innerHeight / 4 - offset };
				if(i === 2) position = { x: window.innerWidth / 1.75, y: window.innerHeight / 4 - offset };

				drawDot(position.x, position.y, colorTypes[x]);
				positions.push(position);
			}

			drawPoints(positions, colorTypes[x]);
		}, x * 100);
	}
}



function clickEvent(e) {
	posArr.push({ x: e.clientX, y: e.clientY });
	drawDot();
	
	if(posArr.length >= 4) {
		drawPoints();
	};
}



function startInterval() {
	setInterval(() => {
		for(id in sliders) {
			var bezierPos = Bezier(
				sliders[id].points,
				sliders[id].tPosition
			);
				
			setPosition(sliders[id].blockId, bezierPos.x, bezierPos.y);
			sliders[id].reverse ? sliders[id].tPosition -= sliders[id].step : sliders[id].tPosition += sliders[id].step;

			if(sliders[id].tPosition >= 1.0 || sliders[id].tPosition <= 0.0) {
				sliders[id].reverse
				? (sliders[id].reverse = !1, sliders[id].tPosition = 0)
				: (sliders[id].reverse = !0, sliders[id].tPosition = 1);
				
				if(playAudio) {
					audio.cloneNode().play();
				}
			}
		}
	}, 0)
}



/**
 * Get random hexadecimal color from colorTypes array
 * @name getRandomHex
 * @returns 
 */
function getRandomHex() {
	return colorTypes[Math.floor(Math.random() * colorTypes.length)];
}



function drawDot(x, y, c) {
	if(!x) x = posArr[posArr.length - 1].x;
	if(!y) y = posArr[posArr.length - 1].y;
	if(!lastColor) lastColor = getRandomHex();

	ctx.beginPath();
	ctx.fillStyle = `${c || lastColor}30`;
	ctx.arc(x, y, 5, 0, 2 * Math.PI);
	ctx.fill();
}



/**
 * Draw bezier curve between points and create a new slider
 * @name drawPoints
 */
function drawPoints(positions, color) {
	if(!positions) positions = posArr;
	if(!color) color = lastColor;
	const ctx = canvas.getContext('2d');

	blockCount++;
	createBlock(blockCount, color);

	ctx.strokeStyle = color + '90';
	ctx.beginPath();
	ctx.moveTo(positions[0].x, positions[0].y);
	ctx.bezierCurveTo(positions[1].x, positions[1].y, positions[2].x, positions[2].y, positions[3].x, positions[3].y);
	ctx.stroke();

	lastColor = undefined;

	sliders.push({
		tPosition: 0,
		blockId: blockCount,
		step: step,
		reverse: false,
		points: [
			{ x: positions[0].x, y: positions[0].y },
			{ x: positions[1].x, y: positions[1].y },
			{ x: positions[2].x, y: positions[2].y },
			{ x: positions[3].x, y: positions[3].y }
		]
	});

	posArr.length = 0;
}



/**
 * Update position of block with specified id
 * @name setPosition
 * @param {*} id ID of the block
 * @param {*} x X coordinate
 * @param {*} y Y coordinate
 */
function setPosition(id, x, y) {
	const block = document.querySelector(`#b-${id}`);
	block.style.top = `${y-4}px`;
	block.style.left = `${x-4}px`;
}



/**
 * Create new fixed block to the DOM
 * @name createBlock
 * @param {*} id ID of the block 
 */
function createBlock(id, color) {
	const newBlock = document.createElement('div');

	newBlock.id = `b-${id}`;
	newBlock.classList.add('block');
	newBlock.style.backgroundColor = color || lastColor;

	document.body.appendChild(newBlock);
}



/**
 * Bezier function which takes in curve points and t variable
 * @param {*} p Bezier points
 * @param {*} t 
 * @returns 
 */
function Bezier(p, t){
	const { a, b, c, d } = { a: p[0], b: p[1], c: p[2], d: p[3] };
	const point = { x: 0, y: 0 };

	const mt  = 1 - t;
	const mt2 = mt * mt;
	
	//fx(t) = x1 * (1-t)³ + x2 * 3 * (1-t)²t + x3 * 3 * (1-t)t² + x4 * t³
	point.x = a.x * (mt2 * mt) + b.x * 3 * mt2 * t + c.x * 3 * mt * t * t + d.x * t * t * t;
	
	//fy(t) = y1 * (1-t)³ + y2 * 3 * (1-t)²t + y3 * 3 * (1-t)t² + y4 * t³
	point.y = a.y * (mt2 * mt) + b.y * 3 * mt2 * t + c.y * 3 * mt * t * t + d.y * t * t * t;
	
	return point;
}