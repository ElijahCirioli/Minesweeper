const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

const controlsHeight = 50;
const backgroundColor = "#62a155";
const textColors = ["#364cd9", "#487d41", "#ff0000", "#9e35db"];
const mineColors = ["#ad4c4c", "#8a2d2d"];

let tileDifficulty = [15, 20, 25];
let mineDifficulty = [45, 60, 100];

let numTiles = tileDifficulty[1]; //width and height of the board in tiles
let numMines = mineDifficulty[1]; //how many mines are distributed throughout the board
let ts; //tile size
let flags;
let board, mines;
let state, thread;
let timeInit;

function setup() {
	ts = Math.floor(canvas.width / numTiles);
	createMines(0, 0);
	flags = numMines;

	state = 0;
	draw();
}

function createMines(blankX, blankY) {
	board = [];
	//setup board
	for (let y = 0; y < numTiles; y++) {
		board[y] = [];
		for (let x = 0; x < numTiles; x++) {
			board[y][x] = new Cell(x, y);
		}
	}

	mines = [];
	//distribute mines
	for (let m = 0; m < numMines; m++) {
		let x = Math.floor(Math.random() * numTiles);
		let y = Math.floor(Math.random() * numTiles);

		while (board[y][x].isMine()) {
			x = Math.floor(Math.random() * numTiles);
			y = Math.floor(Math.random() * numTiles);
		}

		mines.push(board[y][x]);
		board[y][x].mine = true;
	}

	//calculate nearby mines
	for (const row of board) {
		for (const c of row) {
			c.countNear();
		}
	}

	let blankCell = board[blankY][blankX];
	if (blankCell.getNear() !== 0 || blankCell.isMine()) {
		createMines(blankX, blankY);
	}
}

function draw() {
	context.textAlign = "center";
	context.font = "bold " + (ts - 4) + "px Arial";

	for (const row of board) {
		for (const c of row) {
			context.fillStyle = c.color;
			context.fillRect(c.x * ts, c.y * ts, ts, ts);

			const numNear = c.getNear();
			if (c.isFlagged()) {
				if (state === 2 && !c.isMine()) {
					context.fillStyle = textColors[0];
				} else {
					context.fillStyle = mineColors[0];
				}
				context.fillText("⚑", c.x * ts + ts / 2, c.y * ts + ts * 0.8);
			} else if (c.isClicked() && numNear > 0) {
				if (numNear < textColors.length) {
					context.fillStyle = textColors[numNear - 1];
				} else {
					context.fillStyle = textColors[textColors.length - 1];
				}

				context.fillText(numNear, c.x * ts + ts / 2, c.y * ts + ts * 0.8);
			}
		}
	}

	drawBar();
}

function drawBar() {
	context.fillStyle = backgroundColor;
	context.fillRect(0, canvas.height - controlsHeight, canvas.width, 50);

	context.fillStyle = mineColors[0];
	context.textAlign = "left";
	context.font = "bold 30px Arial";
	context.fillText("⚑", 32, canvas.height - 16);
	context.fillStyle = "white";
	context.font = "bold 26px Arial";
	context.fillText(flags, 60, canvas.height - 17);

	context.font = "bold 24px Arial";
	context.fillText("🕒", 140, canvas.height - 17);
	context.font = "bold 26px Arial";
	if (timeInit !== undefined) {
		let t = new Date() - timeInit;
		let minutes = Math.floor(t / 60000);
		let seconds = Math.floor((t % 60000) / 1000);
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		context.fillText(minutes + ":" + seconds, 180, canvas.height - 17);
	} else {
		context.fillText("0:00", 180, canvas.height - 17);
	}
}

function drawWin() {
	context.fillStyle = backgroundColor;
	context.fillRect(0, canvas.height - controlsHeight, 130, 50);
	context.textAlign = "left";
	context.font = "bold 30px Arial";
	context.fillStyle = "white";
	context.font = "bold 26px Arial";
	context.fillText("YOU WIN", 15, canvas.height - 16);
}

function gameOver() {
	let m = mines[0];
	let time = 15;

	if (m.isFlagged()) {
		time = 0;
	} else {
		drawMine(m.x, m.y);
	}

	mines.shift();
	if (mines.length > 0) {
		setTimeout(gameOver, time);
	}
}

function checkWin() {
	let count = numMines;
	for (const m of mines) {
		if (m.isFlagged()) {
			count--;
		}
	}
	if (count === 0) {
		clearInterval(thread);
		drawWin();
		state = 2;
	}
}

function drawMine(x, y) {
	context.fillStyle = mineColors[0];
	context.fillRect(x * ts, y * ts, ts, ts);
	context.fillStyle = mineColors[1];
	context.beginPath();
	context.arc(x * ts + ts / 2, y * ts + ts / 2, ts / 4, 0, 7);
	context.fill();
}

function inBounds(x, y) {
	return x >= 0 && y >= 0 && x < numTiles && y < numTiles;
}

document.getElementById("easy-button").onclick = (e) => {
	numTiles = tileDifficulty[0];
	numMines = mineDifficulty[0];
	setup();
};
document.getElementById("medium-button").onclick = (e) => {
	numTiles = tileDifficulty[1];
	numMines = mineDifficulty[1];
	setup();
};
document.getElementById("hard-button").onclick = (e) => {
	numTiles = tileDifficulty[2];
	numMines = mineDifficulty[2];
	setup();
};

canvas.onmousedown = (e) => {
	e = e || window.event;

	let rect = e.target.getBoundingClientRect();
	let cx = e.clientX - rect.left;
	let cy = e.clientY - rect.top;

	let isRight;

	if ("which" in e) {
		isRight = e.which === 3;
	} else if ("button" in e) {
		isRight = e.button === 2;
	}

	if (state === 0 || state === 1) {
		if (cy < canvas.height - controlsHeight) {
			let x = Math.floor(cx / ts);
			let y = Math.floor(cy / ts);

			if (state === 0) {
				state = 1;
				timeInit = new Date();
				thread = setInterval(drawBar, 100);
				createMines(x, y);
			}
			if (isRight) {
				board[y][x].flag();
			} else {
				board[y][x].click();
			}
		}
	}
};

document.oncontextmenu = (e) => {
	return false;
};

window.onload = setup();
