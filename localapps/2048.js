
const EMPTY = "";
let grid;
let gridElem = document.querySelector("#grid");
let tileIdx = 0; // debug

function makeGrid(n) {
	return Array.from({length: n}, (x,i) => Array.from({length: n}, (x,i) => EMPTY));
}

function NewGame() {
	gridElem.replaceChildren();
	tileIdx = 0;
	// TODO set score = 0;
	grid = makeGrid(4);
	spawnRandomTile();
}
// TODO add saving
addEventListener('DOMContentLoaded', NewGame);

function createTile(x, y, value) {
	const tile = document.createElement("div");
	tile.setAttribute("class","tile appearing");
	tile.setAttribute("x",`${x}`);
	tile.setAttribute("y",`${y}`);
	tile.setAttribute("value",`${value}`);
	gridElem.appendChild(tile);
	setTimeout(() => {tile.setAttribute("class", "tile");}, 100); 
	tile.removeAttribute("style");
	tileIdx += 1;
	return {"value": value, "elem": tile, "idx": tileIdx};
}

function spawnRandomTile() {
	let positions = [];
	for (let y=0; y<grid.length; y++) {
		for (let x=0; x<grid.length; x++) {
			if (grid[y][x]===EMPTY) positions.push([x,y]);
		}
	}
	// random sample
	let [x,y] = positions[Math.floor(Math.random() * positions.length)];
	let value = 2 + Math.floor(Math.random()*2)*2; // 50/50 of being 2 or 4
	grid[y][x] = createTile(x,y,value);
}

function clearOldTiles() {
	for (el of gridElem.children) if (el.hasAttribute("discard")) {
		el.remove();
	}
}

moveUp = () => tryMove(1, 0, 1);
moveDown = () => tryMove(1, 0, -1);
moveLeft = () => tryMove(0, 1, 1);
moveRight = () => tryMove(0, 1, -1);
addEventListener('keydown', e => {
	// console.log([[...grid[0]],[...grid[1]],[...grid[2]],[...grid[3]]]);
	switch(e.key){
		case 'ArrowUp': moveUp(); break;
		case 'ArrowDown': moveDown(); break;
		case 'ArrowLeft': moveLeft(); break;
		case 'ArrowRight': moveRight(); break;
	}
});

function tryMove(vertical, horizontal, sign) {
	clearOldTiles();
	let moved = false;
	let score = 0;
	let size = grid.length;
	for (let row=0; row < size; row++) { // perpendicular to the direction
		//console.log(`row idx: ${row}`);
		let merged = false;
		row_start_x = row * vertical + (sign<0 ? size-1 : 0)*horizontal;
		row_start_y = row * horizontal + (sign<0 ? size-1 : 0)*vertical;
		// source index is j, dest is i
		let i = 0; // tiles resulting
		let dst_y = row_start_y; // last empty tile
		let dst_x = row_start_x;
		//console.log(`dst position is: ${dst_x}, ${dst_y}`);

		// we always have i < j here
		for (let j=1; j < size; j++) { // parallel to the direction
			let y = row_start_y + j*sign*vertical;
			let x = row_start_x + j*sign*horizontal;
			//console.log(`src idx: j=${j}, x=${x}, y=${y}`);
			let src = grid[y][x];
			if (src===EMPTY) continue;
			// try move src to dst, merging if possible
			// otherwise increment dst and move src there instead
			// (might be the same position)
			//console.log(`item at x=${x}, y=${y}: ${src.value}, ${src.elem}`);
			let dst_item = grid[dst_y][dst_x];
			if (dst_item!==EMPTY) {
				//console.log(`dst not empty at ${dst_x}, ${dst_y}`);
				if (!merged && dst_item.value===src.value) {
					//console.log(`merging at x=${dst_x}, y=${dst_y}`);
					moved = true;
					merged = true;
					score += src.value*2;
					src.elem.setAttribute('x', dst_x);
					src.elem.setAttribute('y', dst_y);
					src.elem.setAttribute('discard', "");
					dst_item.elem.setAttribute('discard', "");
					grid[dst_y][dst_x] = createTile(dst_x, dst_y, src.value * 2);
					grid[y][x] = EMPTY;
					continue;
				} else {
					// we couldn't merge and the slot is full,
					// so move over to the next available slot
					i += 1;
					dst_y += sign*vertical;
					dst_x += sign*horizontal;
					//console.log(`moved dst, now ${dst_x},${dst_y}`);
				}
			}
			if (dst_y==y && dst_x==x) {
				//console.log("staying in the same place");
				// moving to the same position
			} else {
				//console.log(`moved to ${dst_x}, ${dst_y}`);
				moved = true;
				merged = false;
				src.elem.setAttribute('x', dst_x);
				src.elem.setAttribute('y', dst_y);
				grid[dst_y][dst_x] = src;
				grid[y][x] = EMPTY;
			}
		}
	}
	if (moved) {
		if (score > 0) {
			// TODO add score to total;
		}
		spawnRandomTile();
		setTimeout(clearOldTiles, 200);
	}
}

