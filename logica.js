class Grafo {
    constructor() {
        this.nodos = []; // Almacena {id, x, y} para dibujar
        this.aristas = []; // Almacena {origen, destino, peso}
    }

    // Traduciendo la lógica de la matriz de la guía
    calcularDijkstra(nodoInicialId) {
        let distancias = {};
        let visitados = {};
        let previos = {};
        
        // Inicializar distancias al infinito, emulando Int32.MaxValue
        this.nodos.forEach(nodo => {
            distancias[nodo.id] = Infinity;
            visitados[nodo.id] = false;
            previos[nodo.id] = null;
        });
        
        distancias[nodoInicialId] = 0;

        for (let i = 0; i < this.nodos.length; i++) {
            // Buscar el nodo no visitado con la distancia mínima
            let nodoActual = this.obtenerNodoMinimaDistancia(distancias, visitados);
            if (nodoActual === null) break;
            
            visitados[nodoActual] = true;

            // Actualizar las distancias de los vecinos
           let vecinos = this.aristas.filter(a => a.origen === nodoActual);
            
            vecinos.forEach(arista => {
                let vecinoId = arista.destino; // El destino siempre será el vecino en un grafo dirigido
                
                if (!visitados[vecinoId]) {
                    let nuevaDistancia = distancias[nodoActual] + arista.peso;
                    if (nuevaDistancia < distancias[vecinoId]) {
                        distancias[vecinoId] = nuevaDistancia;
                        previos[vecinoId] = nodoActual;
                    }
                }
            });
        }
        return { distancias, previos };
    }

    obtenerNodoMinimaDistancia(distancias, visitados) {
        let minValor = Infinity;
        let minNodo = null;

        for (let id in distancias) {
            if (!visitados[id] && distancias[id] < minValor) {
                minValor = distancias[id];
                minNodo = parseInt(id);
            }
        }
        return minNodo;
    }
}
