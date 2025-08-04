// Clase orientada a objetos para cada fragmento de código que cae
class Codigo {
  constructor(x, y, texto, correcto) {
    this.x = x;
    this.y = y;
    this.texto = texto;
    this.correcto = correcto;
  }

  mover() {
    this.y += 2;
  }

  dibujar(ctx) {
    ctx.fillStyle = this.correcto ? '#00ff00' : '#ff4444';
    ctx.fillRect(this.x, this.y, 80, 20);
    ctx.fillStyle = 'black';
    ctx.fillText(this.texto, this.x + 5, this.y + 15);
  }
}

// Clase orientada a objetos para representar una estrella del fondo animado (Tarea 2)
class Estrella {
  constructor(x, y, radio, velocidad) {
    this.x = x;
    this.y = y;
    this.radio = radio;
    this.velocidad = velocidad;
  }

  mover(canvasHeight) {
    this.y += this.velocidad;
    if (this.y > canvasHeight) {
      this.y = 0;
      this.x = Math.random() * window.innerWidth;
    }
  }

  dibujar(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }
}

// Clase principal del juego
class Juego {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.collectSound = document.getElementById('collectSound');
    this.shipX = 180;
    this.shipY = 360;
    this.shipWidth = 40;
    this.goodCode = ['<div>', '{color:blue;}', 'function()'];
    this.badCode = ['<dog>', '++html', '@wrong'];
    this.fallingItems = [];
    this.score = 0;
    this.gameRunning = false;
    this.spawnInterval = null;

    // Minijuego de estrellas
    this.juegoActivo = false;
    this.puntuacion = 0;
    this.estrella = document.getElementById("estrella");
    this.juegoArea = document.getElementById("juegoArea");
    this.puntuacionTexto = document.getElementById("puntuacion");

    // Fondo animado con estrellas
    this.starfield = document.getElementById('starfield');
    this.starCtx = this.starfield.getContext('2d');
    this.stars = [];
    this.inicializarEstrellas();

    // Eventos de usuario
    document.addEventListener('keydown', (e) => this.moverNave(e));
    document.getElementById('startCodeGame').addEventListener('click', () => this.startGame());
    document.getElementById('stopCodeGame').addEventListener('click', () => this.stopGame());
    document.getElementById('exitCodeGame').addEventListener('click', () => this.exitGame());
    document.getElementById('startStarGame').addEventListener('click', () => this.iniciarJuego());
    document.getElementById('stopStarGame').addEventListener('click', () => this.detenerJuego());
    document.getElementById('exitStarGame').addEventListener('click', () => this.salirJuego());
    this.animateStars();
  }

  inicializarEstrellas() {
    this.starfield.width = window.innerWidth;
    this.starfield.height = window.innerHeight;
    for (let i = 0; i < 100; i++) {
      this.stars.push(new Estrella(
        Math.random() * this.starfield.width,
        Math.random() * this.starfield.height,
        Math.random() * 2 + 1,
        Math.random() * 0.5 + 0.1
      ));
    }
  }

  animateStars() {
    this.starCtx.clearRect(0, 0, this.starfield.width, this.starfield.height);
    for (let star of this.stars) {
      star.mover(this.starfield.height);
      star.dibujar(this.starCtx);
    }
    requestAnimationFrame(() => this.animateStars());
  }

  drawShip() {
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(this.shipX, this.shipY, this.shipWidth, 20);
  }

  updateGame() {
    if (!this.gameRunning) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawShip();

    for (let i = 0; i < this.fallingItems.length; i++) {
      const item = this.fallingItems[i];
      item.mover();
      item.dibujar(this.ctx);

      if (item.y + 20 >= this.shipY && item.x < this.shipX + this.shipWidth && item.x + 80 > this.shipX) {
        if (item.correcto) {
          this.score++;
          this.collectSound.currentTime = 0;
          this.collectSound.play();
        }
        this.fallingItems.splice(i, 1);
        i--;
      } else if (item.y > this.canvas.height) {
        this.fallingItems.splice(i, 1);
        i--;
      }
    }

    this.ctx.fillStyle = 'white';
    this.ctx.fillText('Puntaje: ' + this.score, 10, 20);
    requestAnimationFrame(() => this.updateGame());
  }

  spawnItem() {
    const isGood = Math.random() > 0.5;
    const text = isGood
      ? this.goodCode[Math.floor(Math.random() * this.goodCode.length)]
      : this.badCode[Math.floor(Math.random() * this.badCode.length)];
    this.fallingItems.push(new Codigo(Math.random() * (this.canvas.width - 80), 0, text, isGood));
  }

  startGame() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.fallingItems = [];
      this.score = 0;
      this.spawnInterval = setInterval(() => this.spawnItem(), 1000);
      this.updateGame();
    }
  }

  stopGame() {
    this.gameRunning = false;
    clearInterval(this.spawnInterval);
  }

  exitGame() {
    this.stopGame();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('¡Gracias por jugar!', 120, 200);
  }

  moverNave(e) {
    if (this.gameRunning) {
      if (e.key === 'ArrowLeft' && this.shipX > 0) this.shipX -= 10;
      if (e.key === 'ArrowRight' && this.shipX < this.canvas.width - this.shipWidth) this.shipX += 10;
    }
  }

  iniciarJuego() {
    if (this.juegoActivo) return;
    this.juegoActivo = true;
    this.puntuacion = 0;
    this.moverEstrella();
    this.estrella.style.display = "block";
    this.estrella.onclick = () => {
      if (!this.juegoActivo) return;
      this.puntuacion++;
      this.puntuacionTexto.textContent = "Puntos: " + this.puntuacion;
    };
  }

  detenerJuego() {
    this.juegoActivo = false;
    this.estrella.style.display = "none";
  }

  salirJuego() {
    this.detenerJuego();
    this.puntuacionTexto.textContent = "Puntos: 0";
    alert("Gracias por jugar");
  }

  moverEstrella() {
    if (!this.juegoActivo) return;
    const x = Math.random() * (this.juegoArea.clientWidth - 30);
    const y = Math.random() * (this.juegoArea.clientHeight - 30);
    this.estrella.style.left = `${x}px`;
    this.estrella.style.top = `${y}px`;
    setTimeout(() => this.moverEstrella(), 1000);
  }
}

// Inicialización global
const juego = new Juego();

// Modales
document.getElementById("btnInfoTecnica").onclick = function () {
  document.getElementById("modalInfo").style.display = "block";
};
function mostrarDisenoUI() {
  document.getElementById('modalDisenoUI').style.display = 'block';
}
function cerrarDisenoUI() {
  document.getElementById('modalDisenoUI').style.display = 'none';
}
window.onclick = function (event) {
  const modal = document.getElementById("modalInfo");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
document.querySelectorAll(".cerrar").forEach(btn => {
  btn.onclick = () => {
    btn.closest(".modal").style.display = "none";
  };
});
