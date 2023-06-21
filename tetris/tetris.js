//落下スピード
const tetro_speed = 400;

//フィールドサイズ
const field_col = 10;
const field_row = 20;

//ブロックサイズ
const block_size = 30;

//スクリーンサイズ
const screen_w = block_size * field_col;
const screen_h = block_size * field_row;

//テトロミノのサイズ
const tetro_size = 4;

//テトロミノ
let tetro;

const tetro_colors = [
	"#000000",//空
	"#00ffff",//I
	"#ffff00",//O
	"#6600cc",//T
	"#ff8c00",//L
	"#0000cd",//J
	"#32cd32",//S
	"#ff0000"//Z
];

const tetro_types = [
	[],//空
	[//I
		[0,0,0,0],
		[1,1,1,1],
		[0,0,0,0],
		[0,0,0,0]
	],
	[//O
		[0,0,0,0],
		[0,1,1,0],
		[0,1,1,0],
		[0,0,0,0]
	],
	[//T
		[0,1,0,0],
		[0,1,1,0],
		[0,1,0,0],
		[0,0,0,0]
	],
	[//L
		[0,1,0,0],
		[0,1,0,0],
		[0,1,1,0],
		[0,0,0,0]
	],
	[//J
		[0,0,1,0],
		[0,0,1,0],
		[0,1,1,0],
		[0,0,0,0]
	],
	[//S
		[0,0,0,0],
		[0,1,1,0],
		[1,1,0,0],
		[0,0,0,0]
	],
	[//Z
		[0,0,0,0],
		[1,1,0,0],
		[0,1,1,0],
		[0,0,0,0]
	]
];

//テトロミノの形状
let tetro_type;

//初期位置
const start_x = field_col/2 - tetro_size/2;
const start_y = 0;

//テトロミノの座標
let tetro_x = start_x;
let tetro_y = start_y;

//フィールド
let field = [];

//簡易スコア
let score_count = 0;

//ゲームオーバー
let over = false;

let game = document.getElementById("game");
let con = game.getContext("2d");

game.width = screen_w;
game.height = screen_h;
game.style.border = "4px solid #555";

tetro_type = 1 + Math.floor(Math.random() * (tetro_types.length - 1));
tetro = tetro_types[tetro_type];

init();
draw();

setInterval(drop_tetro, tetro_speed);

//フィールドの初期化
function init() {
	for(let i = 0; i < field_row; i++) {
		field[i] = [];
		for(let j = 0; j < field_col; j++) {
			field[i][j] = 0;
		}
	}
}

//ブロックの描画
function draw_block(j,i,c) {
	let display_x = j * block_size;
	let display_y = i * block_size;
	con.fillStyle = tetro_colors[c];
	con.fillRect(display_x,display_y,block_size,block_size);
	con.strokeStyle = "black";
	con.strokeRect(display_x,display_y,block_size,block_size);
}

//全体の描画
function draw() {
	con.clearRect(0,0,screen_w,screen_h);
	for(let i = 0; i < field_row; i++) {
		for(let j = 0; j < field_col; j++) {
			if(field[i][j]) {
				draw_block(j,i,field[i][j]);
			}
		}
	}
	for(let i = 0; i < tetro_size; i++) {
		for(let j = 0; j < tetro_size; j++) {
			if(tetro[i][j]) {
				draw_block(tetro_x + j,tetro_y + i,tetro_type);
			}
		}
	}

	let score = document.getElementById("score");
		score.innerHTML = "SCORE　" + score_count * 1000;
	
	if(over) {
		let gameover = document.getElementById("gameover");
		gameover.innerHTML = "GAME OVER";
	}
}

//当たり判定
function check_move(move_x,move_y,after_tetro) {
	if(after_tetro == undefined) after_tetro = tetro;
	for(let i = 0; i < tetro_size; i++) {
		for(let j = 0; j < tetro_size; j++) {
			if(after_tetro[i][j]) {
				let after_x = tetro_x + move_x + j;
				let after_y = tetro_y + move_y + i;
				if(after_y < 0 || after_x < 0 || after_y >= field_row || after_x >= field_col || field[after_y][after_x]) {
					return false;
				}
			}
		}
	}
	return true;
}

//テトロミノの回転
function rotate() {
	let after_tetro = [];
	for(let i = 0; i < tetro_size; i++) {
		after_tetro[i] = [];
		for(let j = 0; j < tetro_size; j++) {
			after_tetro[i][j] = tetro[tetro_size - j - 1][i];
		}
	}
	return after_tetro;
}

//テトロミノの固定処理
function fix_tetro() {
	for(let i = 0; i < tetro_size; i++) {
		for(let j = 0; j < tetro_size; j++) {
			if(tetro[i][j]) {
				field[tetro_y + i][tetro_x + j] = tetro_type;
			}
		}
	}
}

//ライン消し判定処理
function check_line() {
	let line_count = 0;
	for(let i = 0; i < field_row; i++) {
		let flag = true;
		for(let j = 0; j < field_col; j++) {
			if(!field[i][j]) {
				flag = false;
				break;
			}
		}
		if(flag) {
			line_count++;
			score_count++;
			for(let new_y = i; new_y > 0; new_y--) {
				for(let new_x = 0; new_x < field_col; new_x++) {
					field[new_y][new_x] = field[new_y - 1][new_x];
				}
			}
		}
	}
}

//テトロミノの落下処理
function drop_tetro() {
	if(over) return;
	if(check_move(0,1)) {
		tetro_y++;
	}else {
		fix_tetro();
		check_line();
		tetro_type = 1 + Math.floor(Math.random() * (tetro_types.length - 1));
		tetro = tetro_types[tetro_type];
		tetro_x = start_x;
		tetro_y = start_y;

		if(!check_move(0,0)) {
			over = true;
		}
	}
	draw();
}

//キーボードイベント
document.onkeydown = function(e) {
	if(over) return;
	switch(e.key){
		case "ArrowLeft"://←
			if(check_move(-1,0))tetro_x--;
			break;
		/*case "ArrowUp"://↑
			if(check_move(0,-1))tetro_y--;
			break;*/
		case "ArrowRight"://→
			if(check_move(1,0))tetro_x++;
			break;
		case "ArrowDown"://↓
			if(check_move(0,1))tetro_y++;
			break;
		case " "://space
			let after_tetro = rotate();
			if(check_move(0,0,after_tetro)) tetro = after_tetro;
			break;
	}
	draw();
}
