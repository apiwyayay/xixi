const PI2 = Math.PI * 2;

const random = (min, max) => (Math.random() * (max - min + 1) + min) | 0;

const timestamp = () => new Date().getTime();

class Birthday {
  constructor() {
    this.resize();
    this.fireworks = [];
    this.counter = 0;
  }

  resize() {
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    const center = (this.width / 2) | 0;
    this.spawnA = (center - center / 4) | 0;
    this.spawnB = (center + center / 4) | 0;
    this.spawnC = this.height * 0.1;
    this.spawnD = this.height * 0.5;
  }

  onClick(evt) {
    const x = evt.clientX || evt.touches?.[0].pageX;
    const y = evt.clientY || evt.touches?.[0].pageY;
    const count = random(3, 5);
    for (let i = 0; i < count; i++) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          x,
          y,
          random(0, 260),
          random(30, 110)
        )
      );
    }
    this.counter = -1;
    // Autoplay audio and loop
    const music = document.getElementById("music");
    if (music.paused) {
      music.play();
      music.loop = true;
    }
  }

  update(delta) {
    ctx.globalCompositeOperation = "hard-light";
    ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = "lighter";
    this.fireworks.forEach((firework) => firework.update(delta));
    this.counter += delta * 3;
    if (this.counter >= 1) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          random(0, this.width),
          random(this.spawnC, this.spawnD),
          random(0, 360),
          random(30, 110)
        )
      );
      this.counter = 0;
    }
    this.fireworks = this.fireworks.filter((firework) => !firework.dead);
  }
}

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings) {
    this.dead = false;
    this.offsprings = offsprings;
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.shade = shade;
    this.history = [];
  }

  update(delta) {
    if (this.dead) return;
    const xDiff = this.targetX - this.x;
    const yDiff = this.targetY - this.y;
    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
      this.x += xDiff * 2 * delta;
      this.y += yDiff * 2 * delta;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 20) this.history.shift();
    } else {
      if (this.offsprings && !this.madeChilds) {
        const babies = this.offsprings / 2;
        for (let i = 0; i < babies; i++) {
          const targetX =
            (this.x + this.offsprings * Math.cos((PI2 * i) / babies)) | 0;
          const targetY =
            (this.y + this.offsprings * Math.sin((PI2 * i) / babies)) | 0;
          birthday.fireworks.push(
            new Firework(this.x, this.y, targetX, targetY, this.shade, 0)
          );
        }
      }
      this.madeChilds = true;
      this.history.shift();
    }
    if (this.history.length === 0) this.dead = true;
    else if (this.offsprings) {
      this.history.forEach((point, i) => {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.shade},100%,${i}%)`;
        ctx.arc(point.x, point.y, 1, 0, PI2, false);
        ctx.fill();
      });
    } else {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${this.shade},100%,50%)`;
      ctx.arc(this.x, this.y, 1, 0, PI2, false);
      ctx.fill();
    }
  }
}

const canvas = document.getElementById("birthday");
const ctx = canvas.getContext("2d");
let then = timestamp();
const birthday = new Birthday();

window.onresize = () => birthday.resize();
document.onclick = (evt) => birthday.onClick(evt);
document.ontouchstart = (evt) => birthday.onClick(evt);

(function loop() {
  requestAnimationFrame(loop);
  const now = timestamp();
  const delta = (now - then) / 1000;
  then = now;
  birthday.update(delta);
})();
