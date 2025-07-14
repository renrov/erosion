// Arreglo para almacenar las texturas cargadas.
let textures = [];
// Arreglo para almacenar las capas dinámicas que se dibujarán en el lienzo.
let layers = [];
// Botón para limpiar el lienzo.
let clearButton;
// Índice de la textura sobre la que el cursor está actualmente. -1 significa que ninguna está siendo "hovered".
let hoveredIndex = -1;
// La textura actualmente seleccionada por el usuario de la paleta.
let selectedTexture = null;
// Tamaño constante para cada elemento de la paleta de texturas.
const PALETTE_SIZE = 60;
// Margen constante entre los elementos de la paleta y los bordes.
const PALETTE_MARGIN = 10;
// Arreglo para almacenar las posiciones (x, y) de cada elemento en la paleta.
let palettePositions = [];
/**
 * Función que se ejecuta antes de que comience el programa.
 * Se usa para cargar archivos multimedia como imágenes.
 */
function preload() {
  // Carga texturas numeradas del 12 al 22, saltando la 20.
  for (let i = 12; i <= 22; i++) {
    if (i === 20) continue; // Omite 'tex20.jpeg'
    let filename = 'tex' + i + '.jpeg';
    loadImage(
      filename,
      img => {
        textures.push(img);
        console.log(':white_tick: Cargada:', filename);
      },
      err => console.log(':x: No se pudo cargar:', filename)
    );
  }
}
/**
 * Función de configuración inicial que se ejecuta una vez cuando se inicia el programa.
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER); // Las imágenes se dibujarán desde su centro.
  noStroke(); // No dibuja bordes para las formas.
  background(0); // Establece el fondo en negro.
  // Inicializa el botón de limpiar.
  clearButton = createButton(':rubbish_bin: Limpiar');
  clearButton.position(width - 85, 10); // Posiciona el botón.
  clearButton.size(75, 25); // Establece el tamaño del botón.
  clearButton.style('font-size', '12px'); // Aplica estilos CSS.
  clearButton.mousePressed(clearAll); // Asigna la función clearAll al evento de clic.
  calculatePalettePositions(); // Calcula las posiciones iniciales de la paleta.
}
/**
 * Calcula y almacena las posiciones (x, y) para cada elemento de la paleta de texturas.
 */
function calculatePalettePositions() {
  palettePositions = []; // Reinicia el arreglo de posiciones.
  for (let i = 0; i < textures.length; i++) {
    let x = PALETTE_MARGIN + i * (PALETTE_SIZE + PALETTE_MARGIN);
    let y = height - PALETTE_SIZE - PALETTE_MARGIN;
    palettePositions.push({ x, y }); // Guarda la posición.
  }
}
/**
 * Función principal de dibujo que se ejecuta continuamente en un bucle.
 */
function draw() {
  fill(0, 10); // Relleno semitransparente para un efecto de rastro.
  rect(0, 0, width, height); // Dibuja un rectángulo para el efecto de rastro.
  // Actualiza y muestra cada capa dinámica.
  for (let l of layers) {
    l.update();
    l.display();
  }
  // Filtra las capas, eliminando aquellas con vida <= 0.
  layers = layers.filter(l => l.life > 0);
  drawPalette(); // Dibuja la paleta de texturas.
  // Si hay una textura seleccionada, la dibuja siguiendo el cursor.
  if (selectedTexture) {
    tint(255, 200); // Aplica un tinte semitransparente.
    image(selectedTexture, mouseX, mouseY, PALETTE_SIZE, PALETTE_SIZE);
    noTint(); // Elimina el tinte.
  }
}
/**
 * Dibuja la paleta de texturas en la parte inferior de la pantalla.
 */
function drawPalette() {
  hoveredIndex = -1; // Reinicia el índice de "hover".
  // Determina qué textura está siendo "hovered".
  for (let i = 0; i < textures.length; i++) {
    const pos = palettePositions[i];
    if (mouseX > pos.x && mouseX < pos.x + PALETTE_SIZE &&
        mouseY > pos.y && mouseY < pos.y + PALETTE_SIZE) {
      hoveredIndex = i;
    }
  }
  // Dibuja cada textura en la paleta.
  for (let i = 0; i < textures.length; i++) {
    const pos = palettePositions[i];
    // Aumenta el tamaño si la textura está siendo "hovered".
    const displaySize = (hoveredIndex === i) ? PALETTE_SIZE * 1.12 : PALETTE_SIZE;
    fill(50); // Color de fondo para el recuadro.
    rect(pos.x - 2, pos.y - 2, displaySize + 4, displaySize + 4, 5); // Dibuja el recuadro.
    image(textures[i], pos.x + displaySize / 2, pos.y + displaySize / 2, displaySize, displaySize); // Dibuja la imagen.
    // Dibuja un borde si la textura está seleccionada.
    if (selectedTexture === textures[i]) {
      noFill();
      stroke(255, 200, 0); // Color del borde.
      strokeWeight(3); // Grosor del borde.
      rect(pos.x - 4, pos.y - 4, displaySize + 8, displaySize + 8, 5); // Dibuja el borde.
      noStroke(); // Elimina el borde.
    }
  }
}
/**
 * Función que se ejecuta cuando se presiona el botón del ratón.
 */
function mousePressed() {
  // Comprueba si se hizo clic en una textura de la paleta.
  for (let i = 0; i < textures.length; i++) {
    const pos = palettePositions[i];
    if (mouseX > pos.x && mouseX < pos.x + PALETTE_SIZE &&
        mouseY > pos.y && mouseY < pos.y + PALETTE_SIZE) {
      selectedTexture = textures[i]; // Selecciona la textura.
      return; // Sale de la función.
    }
  }
  // Si hay una textura seleccionada, añade capas en la posición del ratón.
  if (selectedTexture) {
    addLayersAtPosition(selectedTexture, mouseX, mouseY);
    selectedTexture = null; // Deselecciona la textura después de añadir las capas.
  }
}
/**
 * Añade múltiples capas dinámicas en una posición dada usando una imagen.
 * @param {p5.Image} img La imagen a usar para las capas.
 * @param {number} x La coordenada X donde se añadirán las capas.
 * @param {number} y La coordenada Y donde se añadirán las capas.
 */
function addLayersAtPosition(img, x, y) {
  const numLayers = int(random(3, 6)); // Número aleatorio de capas a añadir.
  for (let i = 0; i < numLayers; i++) {
    let offsetX = random(-50, 50); // Desplazamiento aleatorio en X.
    let offsetY = random(-50, 50); // Desplazamiento aleatorio en Y.
    layers.push(new DynamicLayer(img, x + offsetX, y + offsetY)); // Crea y añade una nueva capa.
  }
}
/**
 * Limpia todas las capas del lienzo y lo vuelve a pintar de negro.
 */
function clearAll() {
  layers = []; // Vacía el arreglo de capas.
  background(0); // Pinta el fondo de negro.
}
/**
 * Clase que representa una capa dinámica con propiedades de animación.
 */
class DynamicLayer {
  /**
   * Constructor de la clase DynamicLayer.
   * @param {p5.Image} img La imagen para la capa.
   * @param {number} x La posición inicial X de la capa.
   * @param {number} y La posición inicial Y de la capa.
   */
  constructor(img, x, y) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.baseAlpha = 150; // Transparencia base.
    this.alpha = this.baseAlpha; // Transparencia actual.
    this.scale = random(0.5, 1.5); // Escala aleatoria.
    this.rotation = random(TWO_PI); // Rotación inicial aleatoria.
    this.life = 1000; // Vida útil de la capa.
    this.noiseX = random(1000); // Semilla de ruido para el movimiento en X.
    this.noiseY = random(1000); // Semilla de ruido para el movimiento en Y.
    this.noiseSpeed = random(0.001, 0.004); // Velocidad del ruido.
    // Modos de mezcla disponibles para la capa.
    this.blendModes = [MULTIPLY, OVERLAY, BLEND, DARKEST, LIGHTEST, DIFFERENCE];
    this.mode = random(this.blendModes); // Modo de mezcla aleatorio.
  }
  /**
   * Actualiza el estado de la capa (posición, transparencia, vida).
   */
  update() {
    // Mueve la capa usando ruido Perlin.
    this.x += map(noise(this.noiseX), 0, 1, -0.3, 0.3);
    this.y += map(noise(this.noiseY), 0, 1, -0.3, 0.3);
    this.noiseX += this.noiseSpeed;
    this.noiseY += this.noiseSpeed;
    // Ajusta la transparencia con un efecto de pulsación.
    this.alpha = this.baseAlpha * (0.7 + 0.3 * sin(frameCount * 0.02 + this.noiseX));
    this.life--; // Decrementa la vida útil.
  }
  /**
   * Muestra la capa en el lienzo.
   */
  display() {
    if (this.life <= 0) return; // No muestra la capa si su vida útil ha terminado.
    push(); // Guarda el estado actual de dibujo.
    translate(this.x, this.y); // Mueve el origen al centro de la capa.
    rotate(this.rotation); // Rota la capa.
    scale(this.scale); // Escala la capa.
    blendMode(this.mode); // Aplica el modo de mezcla.
    tint(255, this.alpha); // Aplica el tinte y la transparencia.
    image(this.img, 0, 0, 250, 250); // Dibuja la imagen de la capa.
    pop(); // Restaura el estado de dibujo anterior.
  }
}
/**
 * Función que se llama automáticamente cuando se redimensiona la ventana del navegador.
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Redimensiona el lienzo.
  clearButton.position(width - 85, 10); // Reposiciona el botón de limpiar.
  calculatePalettePositions(); // Recalcula las posiciones de la paleta.
}