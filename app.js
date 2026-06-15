// Referencias al DOM
const canvas = document.getElementById('lienzoGrafos');
const ctx = canvas.getContext('2d'); // El contexto 2D es nuestra "herramienta de dibujo"

// Estado global del grafo
let nodos = [];
let aristas = [];
let contadorNodos = 1; // Para asignar IDs automáticamente (1, 2, 3...)

// Estado de la interfaz
let modoActual = 'agregar_nodo'; // Puede ser: 'agregar_nodo', 'seleccionar'
let nodoSeleccionado = null;     // Para saber a qué nodo le hicimos clic

// Escuchar clics en el lienzo
canvas.addEventListener('mousedown', (evento) => {
    // getBoundingClientRect() nos da la posición exacta del canvas en la pantalla
    const rect = canvas.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    if (modoActual === 'agregar_nodo') {
        // Guardamos las coordenadas y el ID del nuevo nodo
        nodos.push({ id: contadorNodos, x: x, y: y });
        contadorNodos++;
        
        // Cada vez que modificamos los datos, redibujamos todo
        renderizar();
    } 
    else if (modoActual === 'seleccionar') {
        // Lógica para detectar si hicimos clic dentro del radio de un nodo existente
        nodoSeleccionado = null;
        for (let nodo of nodos) {
            // Fórmula de distancia entre dos puntos para saber si el clic tocó el círculo
            const distancia = Math.hypot(nodo.x - x, nodo.y - y);
            if (distancia <= 20) { // 20 es el radio que le daremos a los nodos
                nodoSeleccionado = nodo;
                break;
            }
        }
        renderizar(); // Redibujar para mostrar el nodo resaltado
    }
});

// Configurar los botones del panel para cambiar de modo
document.getElementById('btnAgregarNodo').addEventListener('click', () => {
    modoActual = 'agregar_nodo';
});

document.getElementById('btnSeleccionar').addEventListener('click', () => {
    modoActual = 'seleccionar';
});

// Función principal de dibujo
function renderizar() {
    // 1. Limpiar todo el lienzo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Dibujar las aristas primero (para que las líneas queden detrás de los nodos)
    aristas.forEach(arista => {
        const origen = nodos.find(n => n.id === arista.origen);
        const destino = nodos.find(n => n.id === arista.destino);
        
        if (origen && destino) {
            // Dibujar la línea
            ctx.beginPath();
            ctx.moveTo(origen.x, origen.y);
            ctx.lineTo(destino.x, destino.y);
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.stroke();

            const angulo = Math.atan2(destino.y - origen.y, destino.x - origen.x);
            
            // Calculamos dónde dibujar la flecha (restando 20px del radio del nodo destino para que no quede debajo del círculo)
            const flechaX = destino.x - 20 * Math.cos(angulo);
            const flechaY = destino.y - 20 * Math.sin(angulo);
            
            ctx.beginPath();
            ctx.moveTo(flechaX, flechaY);
            ctx.lineTo(flechaX - 10 * Math.cos(angulo - Math.PI / 6), flechaY - 10 * Math.sin(angulo - Math.PI / 6));
            ctx.lineTo(flechaX - 10 * Math.cos(angulo + Math.PI / 6), flechaY - 10 * Math.sin(angulo + Math.PI / 6));
            ctx.fillStyle = '#555';
            ctx.fill();

            // Dibujar el peso de la arista en el punto medio de la línea
            const medioX = (origen.x + destino.x) / 2;
            const medioY = (origen.y + destino.y) / 2;
            
            // Fondo blanco para que el número sea legible
            ctx.fillStyle = 'white';
            ctx.fillRect(medioX - 10, medioY - 10, 20, 20);
            
            // Texto del peso
            ctx.fillStyle = '#d32f2f'; // Rojo oscuro
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(arista.peso, medioX, medioY);
        }
    });

    // 3. Dibujar los nodos
    nodos.forEach(nodo => {
        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, 20, 0, Math.PI * 2); // 20 es el radio
        
        // Cambiar el color si el nodo está seleccionado
        if (nodoSeleccionado && nodoSeleccionado.id === nodo.id) {
            ctx.fillStyle = '#f39c12'; // Naranja para nodo seleccionado
        } else {
            ctx.fillStyle = '#4a90e2'; // Azul para nodos normales
        }
        
        ctx.fill();
        ctx.strokeStyle = '#2c3e50'; // Borde oscuro
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Dibujar el ID del nodo en el centro
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nodo.id, nodo.x, nodo.y);
    });
}


// Instanciamos la clase Grafo de tu logica.js
const grafo = new Grafo(); 

// Función para actualizar el selector de nodos para Dijkstra
function actualizarSelectNodos() {
    const select = document.getElementById('selectNodoInicial');
    select.innerHTML = ''; // Limpiar opciones
    nodos.forEach(nodo => {
        const option = document.createElement('option');
        option.value = nodo.id;
        option.textContent = `Nodo ${nodo.id}`;
        select.appendChild(option);
    });
}

// Modificar el evento del canvas para actualizar el select cuando agregas un nodo
canvas.addEventListener('mouseup', () => {
    actualizarSelectNodos(); // Actualiza la lista desplegable cada vez que dibujas
});

// Evento: Agregar Arco
document.getElementById('btnAgregarArco').addEventListener('click', () => {
    const origen = parseInt(document.getElementById('arcoOrigen').value);
    const destino = parseInt(document.getElementById('arcoDestino').value);
    const peso = parseInt(document.getElementById('arcoPeso').value);

    // Validar que los campos tengan datos y que los nodos existan
    if (origen && destino && peso) {
        const existeOrigen = nodos.some(n => n.id === origen);
        const existeDestino = nodos.some(n => n.id === destino);
        
        if(existeOrigen && existeDestino) {
            aristas.push({ origen: origen, destino: destino, peso: peso });
            renderizar();
            
            // Limpiar inputs
            document.getElementById('arcoOrigen').value = '';
            document.getElementById('arcoDestino').value = '';
            document.getElementById('arcoPeso').value = '';
        } else {
            alert('Asegúrate de que los nodos origen y destino existan en el lienzo.');
        }
    } else {
        alert('Por favor, llena todos los campos del arco.');
    }
});

// Evento: Eliminar Nodo
document.getElementById('btnEliminarNodo').addEventListener('click', () => {
    const idEliminar = parseInt(document.getElementById('inputEliminarNodo').value);
    
    if(idEliminar) {
        // Filtrar (eliminar) el nodo del arreglo
        nodos = nodos.filter(nodo => nodo.id !== idEliminar);
        
        // Eliminar también cualquier arco que estuviera conectado a este nodo
        aristas = aristas.filter(arista => arista.origen !== idEliminar && arista.destino !== idEliminar);
        
        actualizarSelectNodos();
        renderizar();
        document.getElementById('inputEliminarNodo').value = '';
    }
});

// Evento: Calcular Dijkstra (Conexión final con logica.js)
document.getElementById('btnCalcularDijkstra').addEventListener('click', () => {
    const nodoInicial = parseInt(document.getElementById('selectNodoInicial').value);
    
    if(nodoInicial) {
        // Sincronizar los datos visuales con la clase de lógica
        grafo.nodos = nodos;
        grafo.aristas = aristas;
        
        // Ejecutar el cálculo
        const resultado = grafo.calcularDijkstra(nodoInicial);
        
        // --- NUEVO: Mostrar resultados en el HTML ---
        const panelResultados = document.getElementById('panelResultados');
        const contenidoResultados = document.getElementById('contenidoResultados');
        
        // Limpiar resultados anteriores
        contenidoResultados.innerHTML = ''; 
        
        // Recorrer las distancias calculadas y crear un div por cada una
        for (const idNodoDestino in resultado.distancias) {
            const distancia = resultado.distancias[idNodoDestino];
            const div = document.createElement('div');
            div.className = 'resultado-item';
            
            // Si la distancia es Infinity, significa que no hay ruta posible
            if (distancia === Infinity) {
                div.innerHTML = `<strong>A Nodo ${idNodoDestino}:</strong> Inalcanzable`;
            } else if (parseInt(idNodoDestino) === nodoInicial) {
                div.innerHTML = `<strong>A Nodo ${idNodoDestino}:</strong> 0 (Origen)`;
            } else {
                div.innerHTML = `<strong>A Nodo ${idNodoDestino}:</strong> Distancia ${distancia}`;
            }
            
            contenidoResultados.appendChild(div);
        }
        
        // Hacer visible el panel de resultados
        panelResultados.style.display = 'flex';
        // ---------------------------------------------
    } else {
        alert("Por favor, selecciona un nodo inicial.");
    }
});

// Llamada inicial para asegurar que el lienzo esté limpio
renderizar();