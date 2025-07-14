let textures = [];
let layers = [];
let clearButton;
let hoveredIndex = -1;

function preload() {
  for (let i = 12; i <= 22; i++) {
    let filename = 'tex' + i + '.jpeg';
    loadImage(
      filename,
      img => {
        textures.push(img);
        console.log('✅ Cargada:', filename);
      },
      err => console.log('❌ No se pudo cargar:', filename)
    );
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noStroke();
  background(0);

  // Botón limpiar en esquina superior derecha
  clearButton = createButton('🗑️ Limpiar');
  clearButton.position(width - 85, 10);
  clearButton.size(75, 25);
  clearButton.style('font-size', '12px');
  clearButton.mousePressed(clearAll);
}

function draw() {
  // Suave oscurecimiento para rastros
  fill(0, 10);
  rect(0, 0, width, height);

  // Dibujar capas con blendMode elegido por cada Layer
  for (let l of layers) {
    l.update();
    l.display();
  }

  drawPalette();
}

function drawPalette() {
  let size = 60;
  let margin = 10;

  // Verificar hover
  hoveredIndex = -1;
  for (let i = 0; i < textures.length; i++) {
    let x = margin + i * (size + margin);
    let y = height - size - margin;
    if (mouseX > x && mouseX < x + size && mouseY > y && mouseY < y + size) {
      hoveredIndex = i;
    }
  }

  // Dibujar miniaturas con efecto hover
  for (let i = 0; i < textures.length; i++) {
    let x = margin + i * (size + margin);
    let y = height - size - margin;

    let displaySize = (hoveredIndex === i) ? size * 1.12 : size;

    fill(50);
    rect(x - 2, y - 2, displaySize + 4, displaySize + 4);
    image(textures[i], x + displaySize / 2, y + displaySize / 2, displaySize, displaySize);
  }
}

function mousePressed() {
  let size = 60;
  let margin = 10;

  // Click solo en la paleta inferior → agrega capas
  for (let i = 0; i < textures.length; i++) {
    let x = margin + i * (size + margin);
    let y = height - size - margin;
    if (mouseX > x && mouseX < x + size && mouseY > y && mouseY < y + size) {
      addLayersRandomPositions(textures[i]);
      return;
    }
  }

  // Click en la pantalla negra → NO hace nada
}

function addLayersRandomPositions(img) {
  let numLayers = int(random(3, 6));
  for (let i = 0; i < numLayers; i++) {
    let posX = random(width);
    let posY = random(height - 100);
    layers.push(new DynamicLayer(img, posX, posY));
  }
}

function clearAll() {
  layers = [];
  background(0);
}

class DynamicLayer {
  constructor(img, x, y) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.baseAlpha = 150;
    this.alpha = this.baseAlpha;
    this.scale = random(0.5, 1.5);
    this.rotation = random(TWO_PI);
    this.life = 1000;

    this.noiseX = random(1000);
    this.noiseY = random(1000);
    this.noiseSpeed = random(0.001, 0.004);

    // BlendModes que NO queman en blanco
    this.blendModes = [MULTIPLY, OVERLAY, BLEND, DARKEST, LIGHTEST, DIFFERENCE];
    this.mode = random(this.blendModes);
  }

  update() {
    this.x += map(noise(this.noiseX), 0, 1, -0.3, 0.3);
    this.y += map(noise(this.noiseY), 0, 1, -0.3, 0.3);
    this.noiseX += this.noiseSpeed;
    this.noiseY += this.noiseSpeed;

    this.alpha = this.baseAlpha * (0.7 + 0.3 * sin(frameCount * 0.02 + this.noiseX));
    this.life--;
  }

  display() {
    if (this.life <= 0) return;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    scale(this.scale);
    blendMode(this.mode);
    tint(255, this.alpha);
    image(this.img, 0, 0, 250, 250);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clearButton.position(width - 85, 10);
}