class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.mine = false;
		this.near = 0;
		this.clicked = false;
		this.flagged = false;

		if ((this.x + this.y) % 2 === 0) {
			this.color = "#aad751";
		} else {
			this.color = "#9dc949";
		}
	}

	isMine() {
		return this.mine;
	}

	isClicked() {
		return this.clicked;
	}

	isFlagged() {
		return this.flagged;
	}

	getNear() {
		return this.near;
	}

	countNear() {
		if (!this.mine) {
			for (let xoff = -1; xoff < 2; xoff++) {
				for (let yoff = -1; yoff < 2; yoff++) {
					if (!(xoff === 0 && yoff === 0)) {
						let relX = this.x + xoff;
						let relY = this.y + yoff;

						if (inBounds(relX, relY) && board[relY][relX].isMine()) {
							this.near++;
						}
					}
				}
			}
		}
	}

	click() {
		if (!this.clicked && !this.flagged) {
			if (this.mine) {
				state = 2;
				draw();
				drawMine(this.x, this.y);
				clearInterval(thread);
				gameOver();
			} else {
				this.switchColor();

				if (this.near === 0) {
					this.clearZeros();
				}

				this.clicked = true;
				draw();
			}
		}
	}

	flag() {
		if (!this.clicked) {
			if (!this.flagged && flags > 0) {
				this.flagged = true;
				flags--;
				draw();
				setTimeout(checkWin, 10);
			} else if (this.flagged) {
				this.flagged = false;
				flags++;
				draw();
			}
		}
	}

	clearZeros() {
		this.switchColor();
		this.clicked = true;

		if (this.flagged) {
			this.flagged = false;
			flags++;
		}

		if (this.near === 0 && !this.mine) {
			for (let xoff = -1; xoff < 2; xoff++) {
				for (let yoff = -1; yoff < 2; yoff++) {
					let relX = this.x + xoff;
					let relY = this.y + yoff;

					if (inBounds(relX, relY)) {
						let c = board[relY][relX];
						if (c !== this && !c.isClicked()) {
							c.clearZeros();
						}
					}
				}
			}
		}
	}

	switchColor() {
		if ((this.x + this.y) % 2 === 0) {
			this.color = "#e5c29f";
		} else {
			this.color = "#d7b899";
		}
	}
}
