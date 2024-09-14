const listaCompleta = ["HTML", "CSS", "JAVASCRIPT", "CODIGO", "WEB", "FRONTEND", "BACKEND", "REACT", "ANGULAR", "VUE",
    "NODE", "EXPRESS", "DATABASE", "API", "FUNCTION", "VARIABLE", "OBJECT", "ARRAY", "LOOP", "CONDITION", "DEBUG", "FRAMEWORK",
    "LIBRARY", "GIT", "VERSION", "CONTROL", "DEPLOY", "SERVER", "CLIENT", "CACHE", "ASYNC", "PROMISE", "AJAX", "JQUERY", "SASS",
    "LESS", "JSON", "XML", "REST", "SOAP", "GRAPHQL", "WEBPACK", "BABEL"];

const numPalabras = 10; // Número de palabras a mostrar
const gridSize = 15;
const sopaContainer = document.getElementById("sopa_letras");
const palabrasLista = document.getElementById("lista_palabras");
const mensaje = document.getElementById("mensaje");

let seleccion = [];
let palabrasEncontradas = [];
let palabras = [];

function obtenerPalabrasAleatorias(lista, cantidad) {
    const copia = [...lista];
    const seleccionadas = [];
    for (let i = 0; i < cantidad; i++) {
        if (copia.length === 0) break;
        const indice = Math.floor(Math.random() * copia.length);
        seleccionadas.push(copia.splice(indice, 1)[0]);
    }
    return seleccionadas;
}

function generarSopaDeLetras() {
    palabras = obtenerPalabrasAleatorias(listaCompleta, numPalabras);
    const grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = "";
        }
    }

    palabras.forEach(palabra => {
        let colocada = false;
        while (!colocada) {
            const direccion = Math.floor(Math.random() * 8); // 0-7 para todas las direcciones
            const fila = Math.floor(Math.random() * gridSize);
            const columna = Math.floor(Math.random() * gridSize);

            if (colocarPalabraEnGrid(grid, palabra, fila, columna, direccion)) {
                colocada = true;
            }
        }
    });

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === "") {
                const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                grid[i][j] = randomChar;
            }
        }
    }

    return grid;
}

function colocarPalabraEnGrid(grid, palabra, fila, columna, direccion) {
    const directions = [
        { dFila: 0, dColumna: 1 }, // Horizontal derecha
        { dFila: 0, dColumna: -1 }, // Horizontal izquierda
        { dFila: 1, dColumna: 0 }, // Vertical abajo
        { dFila: -1, dColumna: 0 }, // Vertical arriba
        { dFila: 1, dColumna: 1 }, // Diagonal abajo derecha
        { dFila: -1, dColumna: -1 },// Diagonal arriba izquierda
        { dFila: 1, dColumna: -1 }, // Diagonal abajo izquierda
        { dFila: -1, dColumna: 1 } // Diagonal arriba derecha
    ];

    const { dFila, dColumna } = directions[direccion];
    let filaActual = fila;
    let columnaActual = columna;

    // Verificar si la palabra cabe en la cuadrícula
    for (let i = 0; i < palabra.length; i++) {
        if (filaActual < 0 || filaActual >= gridSize || columnaActual < 0 || columnaActual >= gridSize) {
            return false;
        }
        if (grid[filaActual][columnaActual] !== "" && grid[filaActual][columnaActual] !== palabra[i]) {
            return false;
        }
        filaActual += dFila;
        columnaActual += dColumna;
    }

    // Colocar la palabra en la cuadrícula
    filaActual = fila;
    columnaActual = columna;
    for (let i = 0; i < palabra.length; i++) {
        grid[filaActual][columnaActual] = palabra[i];
        filaActual += dFila;
        columnaActual += dColumna;
    }

    return true;
}

function renderizarSopaDeLetras(grid) {
    sopaContainer.innerHTML = "";
    grid.forEach((fila, i) => {
        fila.forEach((letra, j) => {
            const cell = document.createElement("div");
            cell.textContent = letra;
            cell.dataset.fila = i;
            cell.dataset.columna = j;
            cell.addEventListener("click", seleccionarLetra);
            sopaContainer.appendChild(cell);
        });
    });
}

function renderizarPalabras() {
    palabrasLista.innerHTML = "";
    palabras.forEach(palabra => {
        const li = document.createElement("li");
        li.textContent = palabra;
        palabrasLista.appendChild(li);
    });
}

function seleccionarLetra(event) {
    const cell = event.target;
    const fila = parseInt(cell.dataset.fila);
    const columna = parseInt(cell.dataset.columna);

    if (cell.classList.contains("selected")) {
        cell.classList.remove("selected");
        seleccion = seleccion.filter(sel => !(sel.fila === fila && sel.columna === columna));
    } else {
        cell.classList.add("selected");
        seleccion.push({ fila, columna, letra: cell.textContent });
    }

    verificarSeleccion();
}

function verificarSeleccion() {
    if (seleccion.length < 2) return; // Necesitamos al menos dos letras para formar una palabra

    const filas = seleccion.map(s => s.fila);
    const columnas = seleccion.map(s => s.columna);

    const esHorizontal = filas.every(fila => fila === filas[0]);
    const esVertical = columnas.every(columna => columna === columnas[0]);
    const esDiagonal = filas.length === columnas.length && (
        filas[0] - filas[1] === columnas[0] - columnas[1] ||
        filas[1] - filas[0] === columnas[0] - columnas[1]
    );

    if (!esHorizontal && !esVertical && !esDiagonal) return; // No es una palabra válida si no es horizontal, vertical o diagonal

    const palabraSeleccionada = seleccion.map(s => s.letra).join("");
    const palabraSeleccionadaReversa = seleccion.map(s => s.letra).reverse().join("");

    if (palabras.includes(palabraSeleccionada) || palabras.includes(palabraSeleccionadaReversa)) {
        seleccion.forEach(sel => {
            const cell = sopaContainer.querySelector(`[data-fila="${sel.fila}"][data-columna="${sel.columna}"]`);
            cell.classList.add("found");
            cell.classList.remove("selected");
        });

        palabrasEncontradas.push(palabraSeleccionada);
        actualizarListaPalabras(palabraSeleccionada);
        seleccion = [];
        verificarVictoria();
    }
}

function actualizarListaPalabras(palabra) {
    const items = palabrasLista.querySelectorAll("li");
    items.forEach(item => {
        if (item.textContent === palabra || item.textContent === palabra.split('').reverse().join('')) {
            item.classList.add("encontrada");
            item.style.textDecoration = "line-through"; // Agregar línea tachada
        }
    });
}

function verificarVictoria() {
    if (palabrasEncontradas.length === palabras.length) {
        mensaje.textContent = "¡Felicidades! Has encontrado todas las palabras.";
    }
}

const sopaGrid = generarSopaDeLetras();
renderizarSopaDeLetras(sopaGrid);
renderizarPalabras();