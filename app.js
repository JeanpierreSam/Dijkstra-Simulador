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

let arrastrandoNodo = null;
let offsetMouseX = 0;
let offsetMouseY = 0;

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
    actualizarMatrizAdyacencia();
}

// Instanciamos la clase Grafo de tu logica.js
const grafo = new Grafo(); 

function resaltarRutaEnCanvas(ruta, color = '#10b981') {
    // ruta es un array de IDs: [1, 3, 5]
    for (let i = 0; i < ruta.length - 1; i++) {
        const origen = nodos.find(n => n.id === ruta[i]);
        const destino = nodos.find(n => n.id === ruta[i + 1]);
        
        if (origen && destino) {
            // Dibujar línea gruesa y de color
            ctx.beginPath();
            ctx.moveTo(origen.x, origen.y);
            ctx.lineTo(destino.x, destino.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 5;
            ctx.stroke();
            
            // Dibujar flecha más grande
            const angulo = Math.atan2(destino.y - origen.y, destino.x - origen.x);
            const flechaX = destino.x - 20 * Math.cos(angulo);
            const flechaY = destino.y - 20 * Math.sin(angulo);
            
            ctx.beginPath();
            ctx.moveTo(flechaX, flechaY);
            ctx.lineTo(flechaX - 15 * Math.cos(angulo - Math.PI / 6), flechaY - 15 * Math.sin(angulo - Math.PI / 6));
            ctx.lineTo(flechaX - 15 * Math.cos(angulo + Math.PI / 6), flechaY - 15 * Math.sin(angulo + Math.PI / 6));
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
}

function mostrarResultadosEnCanvas(rutaStr, costo, algoritmo) {
    const padding = 15;
    const x = 10;
    const y = 10;
    const ancho = 350;
    const alto = 80;
    
    // Fondo semitransparente
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(x, y, ancho, alto);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, ancho, alto);
    
    // Texto
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🏆 Algoritmo: ${algoritmo}`, x + padding, y + 25);
    
    ctx.font = '13px Arial';
    ctx.fillText(`Ruta: ${rutaStr}`, x + padding, y + 45);
    ctx.fillText(`Costo total: ${costo}`, x + padding, y + 65);
}

// Función para actualizar el selector de nodos para Dijkstra
function actualizarSelectNodos() {
    const selectInicial = document.getElementById('selectNodoInicial');
    const selectFinal = document.getElementById('selectNodoFinal');
    
    // Guardamos los valores actuales por si el usuario ya había elegido uno
    const valInicial = selectInicial.value;
    const valFinal = selectFinal.value;

    selectInicial.innerHTML = ''; 
    selectFinal.innerHTML = ''; 

    nodos.forEach(nodo => {
        // Opción para origen
        const opt1 = document.createElement('option');
        opt1.value = nodo.id;
        opt1.textContent = `Nodo A${nodo.id}`;
        selectInicial.appendChild(opt1);

        // Opción para destino
        const opt2 = document.createElement('option');
        opt2.value = nodo.id;
        opt2.textContent = `Nodo A${nodo.id}`;
        selectFinal.appendChild(opt2);
    });

    // Restauramos valores si es posible
    if (valInicial) selectInicial.value = valInicial;
    if (valFinal) selectFinal.value = valFinal;
}



// Escuchar clics en el lienzo
canvas.addEventListener('mousedown', (evento) => {
    const rect = canvas.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    if (modoActual === 'agregar_nodo') {
        nodos.push({ id: contadorNodos, x: x, y: y });
        contadorNodos++;
        renderizar();
    } 
    else if (modoActual === 'seleccionar') {
        // Primero verificar si se hizo clic en una arista
        const aristaClickeada = encontrarAristaEnClic(x, y);
        
        if (aristaClickeada) {
            editarPesoArista(aristaClickeada);
            return; 
        }
        
        // Verificar si se hizo clic en un nodo
        nodoSeleccionado = null;
        for (let nodo of nodos) {
            const distancia = Math.hypot(nodo.x - x, nodo.y - y);
            if (distancia <= 20) {
                nodoSeleccionado = nodo;
                arrastrandoNodo = nodo; // 👈 Iniciar arrastre
                offsetMouseX = x - nodo.x; 
                offsetMouseY = y - nodo.y;
                break;
            }
        }
        renderizar();
    }
});

canvas.addEventListener('mousemove', (evento) => {
    const rect = canvas.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;
    
    // Mover nodo si está siendo arrastrado
    if (arrastrandoNodo) {
        arrastrandoNodo.x = x - offsetMouseX;
        arrastrandoNodo.y = y - offsetMouseY;
        renderizar();
        return; // No procesar hover si está arrastrando
    }
    
    // Hover effect para aristas
    const aristaBajoMouse = encontrarAristaEnClic(x, y);
    
    if (aristaBajoMouse && modoActual === 'seleccionar') {
        canvas.style.cursor = 'pointer';
    } else if (modoActual === 'agregar_nodo') {
        canvas.style.cursor = 'crosshair';
    } else {
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mouseup', () => {
    arrastrandoNodo = null; // 👈 Detener arrastre
    actualizarSelectNodos();
});

// Evento: Agregar Arco (Con validación de duplicados)
document.getElementById('btnAgregarArco').addEventListener('click', () => {
    const origen = parseInt(document.getElementById('arcoOrigen').value);
    const destino = parseInt(document.getElementById('arcoDestino').value);
    const peso = parseInt(document.getElementById('arcoPeso').value);

    if (origen && destino && peso) {
        const existeOrigen = nodos.some(n => n.id === origen);
        const existeDestino = nodos.some(n => n.id === destino);
        
        if(existeOrigen && existeDestino) {
            // Buscamos si ya existe un arco en ESA dirección exacta
            const indiceArcoExistente = aristas.findIndex(a => a.origen === origen && a.destino === destino);

            if (indiceArcoExistente !== -1) {
                // Si existe, solo actualizamos el peso (evita arcos duplicados)
                aristas[indiceArcoExistente].peso = peso;
                alert(`El arco de A${origen} a A${destino} ha sido actualizado con el nuevo peso de ${peso}.`);
            } else {
                // Si no existe, creamos uno nuevo
                aristas.push({ origen: origen, destino: destino, peso: peso });
            }
            
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
// --- ACTUALIZADO: Manejo de Algoritmos y Múltiples Caminos ---
document.getElementById('btnCalcularDijkstra').addEventListener('click', () => {
    const algoritmoSeleccionado = document.getElementById('selectAlgoritmo').value;
    const nodoInicial = parseInt(document.getElementById('selectNodoInicial').value);
    const nodoFinal = parseInt(document.getElementById('selectNodoFinal').value);
    
    if(nodoInicial && nodoFinal) {
        grafo.nodos = nodos;
        grafo.aristas = aristas;
        
        let distanciaAlDestino = Infinity;
        let rutaStr = "";
        let nombreAlgoritmo = "";

        // 1. Ejecutar el algoritmo elegido
        if (algoritmoSeleccionado === 'dijkstra') {
            nombreAlgoritmo = "Dijkstra";
            const resultado = grafo.calcularDijkstra(nodoInicial);
            distanciaAlDestino = resultado.distancias[nodoFinal];
            if (distanciaAlDestino !== Infinity) {
                rutaStr = reconstruirRuta(resultado.previos, nodoInicial, nodoFinal);
            }
        } else {
            nombreAlgoritmo = "Floyd-Warshall";
            const resultado = grafo.calcularFloydWarshall(nodoInicial, nodoFinal);
            distanciaAlDestino = resultado.costo;
            rutaStr = resultado.rutaStr;
        }

        // 2. Obtener TODAS las rutas posibles
        const todosLosCaminos = grafo.obtenerTodosLosCaminos(nodoInicial, nodoFinal);
        
        const modal = document.getElementById('modalSinRuta');
        const panelResultados = document.getElementById('panelResultados');
        const contenidoResultados = document.getElementById('contenidoResultados');
        
        if (distanciaAlDestino === Infinity) {
            panelResultados.style.display = 'none'; 
            modal.style.display = 'flex';           
        } else {
            contenidoResultados.innerHTML = ''; 
            
            // A. Mostrar el camino óptimo (calculado por el algoritmo elegido)
            const divOptimo = document.createElement('div');
            divOptimo.className = 'resultado-item';
            divOptimo.style.borderLeft = '4px solid #10b981'; // Borde verde para destacar
            divOptimo.innerHTML = `
                <div style="width: 100%;">
                    <strong style="color: #10b981;">Camino más corto (${nombreAlgoritmo})</strong><br>
                    <span style="font-size: 13px; color: #64748b;">Secuencia:</span> <strong>${rutaStr}</strong><br>
                    <span style="font-size: 13px; color: #64748b;">Valor total:</span> <strong style="font-size: 16px;">${distanciaAlDestino}</strong>
                </div>
            `;
            contenidoResultados.appendChild(divOptimo);

            // B. Listar los demás caminos
            if (todosLosCaminos.length > 1) {
                const tituloAlternativos = document.createElement('h4');
                tituloAlternativos.textContent = `Otros caminos posibles (${todosLosCaminos.length - 1}):`;
                tituloAlternativos.style.fontSize = '13px';
                tituloAlternativos.style.margin = '15px 0 5px 0';
                contenidoResultados.appendChild(tituloAlternativos);

                todosLosCaminos.forEach((camino, index) => {
                    // Evitamos imprimir de nuevo el camino más corto que ya mostramos arriba
                    if (camino.ruta !== rutaStr || camino.costo !== distanciaAlDestino) {
                        const divAlt = document.createElement('div');
                        divAlt.className = 'resultado-item';
                        divAlt.style.backgroundColor = '#f8fafc';
                        divAlt.innerHTML = `
                            <div style="width: 100%; font-size: 13px;">
                                <span style="color: #64748b;">Recorrido:</span> ${camino.ruta} <br>
                                <span style="color: #64748b;">Valor:</span> <strong>${camino.costo}</strong>
                            </div>
                        `;
                        contenidoResultados.appendChild(divAlt);
                    }
                });
            }
            
            
            const rutaArray = rutaStr.split(' → ').map(n => parseInt(n.replace('A', '')));
            resaltarRutaEnCanvas(rutaArray);
            mostrarResultadosEnCanvas(rutaStr, distanciaAlDestino, nombreAlgoritmo);

            panelResultados.style.display = 'block'; 
            modal.style.display = 'none';            
        }
    } else {
        alert("Por favor, selecciona origen y destino.");
    }
});

// --- Evento para cerrar la ventana modal ---
document.getElementById('btnCerrarModal').addEventListener('click', () => {
    document.getElementById('modalSinRuta').style.display = 'none';
});

// 1. Reconstruir la ruta exacta de nodos
function reconstruirRuta(previos, origen, destino) {
    if (origen === parseInt(destino)) return `A${origen}`;
    if (previos[destino] === null) return "Inalcanzable/No hay camino";
    
    let ruta = [];
    let actual = parseInt(destino);
    while (actual !== null) {
        ruta.unshift(`A${actual}`); // Usa el formato A1, A2, etc.
        actual = previos[actual];
    }
    return ruta.join(' → ');
}

// 2. Generar y dibujar la Matriz de Adyacencia
function actualizarMatrizAdyacencia() {
    const contenedor = document.getElementById('contenidoMatriz');
    const panel = document.getElementById('panelMatriz');
    
    if (nodos.length === 0) {
        panel.style.display = 'none';
        return;
    }

    let html = '<table class="tabla-matriz"><thead><tr><th>M[i,j]</th>';
    
    // Cabeceras de columnas (A1, A2, A3...)
    nodos.forEach(n => {
        html += `<th>A${n.id}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Filas de la matriz
    nodos.forEach(origen => {
        html += `<tr><th>A${origen.id}</th>`;
        nodos.forEach(destino => {
            if (origen.id === destino.id) {
                html += '<td>0</td>'; // Distancia a sí mismo es 0
            } else {
                // Buscamos si existe arista dirigida
                const arista = aristas.find(a => a.origen === origen.id && a.destino === destino.id);
                if (arista) {
                    html += `<td>${arista.peso}</td>`;
                } else {
                    html += '<td>-1</td>'; // Representa que no hay arista, según la guía
                }
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;
    panel.style.display = 'block';
}

// Función para calcular la distancia de un punto a un segmento de línea
function distanciaPuntoALinea(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) // Si los puntos no son iguales
        param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

// Función para encontrar la arista más cercana al clic
function encontrarAristaEnClic(x, y) {
    const umbral = 10; // Distancia máxima en píxeles para considerar que se hizo clic en la arista
    
    for (let arista of aristas) {
        const origen = nodos.find(n => n.id === arista.origen);
        const destino = nodos.find(n => n.id === arista.destino);
        
        if (origen && destino) {
            const distancia = distanciaPuntoALinea(x, y, origen.x, origen.y, destino.x, destino.y);
            
            if (distancia <= umbral) {
                return arista;
            }
        }
    }
    
    return null;
}

// Función para editar el peso de una arista
function editarPesoArista(arista) {
    const nuevoPeso = prompt(
        `Editar peso de la arista A${arista.origen} → A${arista.destino}\n\n` +
        `Peso actual: ${arista.peso}\n` +
        `Nuevo peso:`,
        arista.peso
    );
    
    if (nuevoPeso !== null && nuevoPeso.trim() !== '') {
        const pesoNum = parseInt(nuevoPeso);
        
        if (!isNaN(pesoNum) && pesoNum >= 0) {
            arista.peso = pesoNum;
            renderizar();
            alert(`Peso actualizado: A${arista.origen} → A${arista.destino} = ${pesoNum}`);
        } else {
            alert('Por favor, ingresa un número válido mayor o igual a 0.');
        }
    }
}

// Llamada inicial para asegurar que el lienzo esté limpio
renderizar();