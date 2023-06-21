const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const socket = io();

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

let drawing = false;

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);

  const data = {
    x: e.clientX,
    y: e.clientY,
    drawing: false,
    eraser: eraserMode,
  };

  socket.emit('draw', data);
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();

  const data = {
    x: e.clientX,
    y: e.clientY,
    drawing: true,
    eraser: eraserMode,
  };

  socket.emit('draw', data);
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

socket.on('draw', (data) => {
  ctx.lineWidth = data.eraser ? 60 : 1;
  ctx.strokeStyle = data.eraser ? '#FFFFFF' : '#000000';

  if (data.drawing) {
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
  }
});

//ペンと消しゴム
let eraserMode = false;

document.getElementById('pen-button').addEventListener('click', () => {
  eraserMode = false;
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000000';
});

document.getElementById('eraser-button').addEventListener('click', () => {
  eraserMode = true;
  ctx.lineWidth = 60;
  ctx.strokeStyle = '#FFFFFF';
});

//付箋
document.getElementById('add-sticky-note-button').addEventListener('click', () => {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  const color = getRandomColor();
  const text = '';
  sendStickyNote(x, y, color, text);
});

function createStickyNote(x, y, color, id, text) {
  const stickyNote = document.createElement('div');
  stickyNote.classList.add('sticky-note');
  stickyNote.style.left = x + 'px';
  stickyNote.style.top = y + 'px';
  stickyNote.style.backgroundColor = color;
  stickyNote.id = id;

  const textarea = document.createElement('textarea');
  stickyNote.appendChild(textarea);

  textarea.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  textarea.addEventListener('input', () => {
    socket.emit('editStickyNote', {
      id: stickyNote.id,
      text: textarea.value,
    });
  });

  textarea.value = text || '';

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-button');
  stickyNote.appendChild(deleteButton);

  deleteButton.addEventListener('click', () => {
    socket.emit('deleteStickyNote', id);
    stickyNote.remove();
  });

  document.body.appendChild(stickyNote);

  stickyNote.addEventListener('mousedown', (e) => {
    const offsetX = e.clientX - parseFloat(stickyNote.style.left);
    const offsetY = e.clientY - parseFloat(stickyNote.style.top);
  
    const onMouseMove = (e) => {
      stickyNote.style.left = e.clientX - offsetX + 'px';
      stickyNote.style.top = e.clientY - offsetY + 'px';
    };
  
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      socket.emit('moveStickyNote', {
        id: stickyNote.id,
        x: parseFloat(stickyNote.style.left),
        y: parseFloat(stickyNote.style.top),
      });
    };
  
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function getRandomColor() {
  const num = Math.floor(Math.random() * 4);
  if (num == 3) {
    color = '#ff89ff'
  } else if(num == 2) {
    color = '#89ffff'
  } else if(num == 1) {
    color = '#89ff89'
  } else {
    color = '#ffff89'
  }
  return color;
}

function sendStickyNote(x, y, color, text) {
  const id = 'sticky-note-' + Date.now();
  const data = { id, x, y, color, text };
  socket.emit('createStickyNote', data);
  createStickyNote(data.x, data.y, data.color, data.id, data.text);
}

socket.on('createStickyNote', (data) => {
  createStickyNote(data.x, data.y, data.color, data.id, data.text);
});

socket.on('moveStickyNote', (data) => {
  const stickyNote = document.getElementById(data.id);
  if (stickyNote) {
    stickyNote.style.left = data.x + 'px';
    stickyNote.style.top = data.y + 'px';
  }
});

socket.on('editStickyNote', (data) => {
  const stickyNote = document.getElementById(data.id);
  if (stickyNote) {
    const textarea = stickyNote.querySelector('textarea');
    if (textarea) {
    textarea.value = data.text;
    }
  }
});

socket.on('deleteStickyNote', (id) => {
  const stickyNote = document.getElementById(id);
  if (stickyNote) {
    stickyNote.remove();
  }
});

//描画をクリア
function clearWhiteboard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveDrawing();
}

document.getElementById('clear-button').addEventListener('click', () => {
  clearWhiteboard();
  socket.emit('clearBoard');
});

socket.on('clearBoard', () => {
  clearWhiteboard();
});


//描画を自動保存
function saveDrawing() {
  const drawingData = canvas.toDataURL();
  localStorage.setItem('savedDrawing', drawingData);
}

function restoreDrawing() {
  const savedDrawingData = localStorage.getItem('savedDrawing');
  if (savedDrawingData) {
    const img = new Image();
    img.src = savedDrawingData;
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
  }
}

const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

canvas.addEventListener('mouseup', () => {
  drawing = false;
  saveDrawing();
});

socket.on('draw', (data) => {
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  saveDrawing();
});

window.addEventListener('load', () => {
  restoreDrawing();
});