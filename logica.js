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
    // --- NUEVO: Algoritmo de Floyd-Warshall ---
    calcularFloydWarshall(origenId, destinoId) {
        let dist = {};
        let next = {};

        // Inicializar matrices
        this.nodos.forEach(u => {
            dist[u.id] = {};
            next[u.id] = {};
            this.nodos.forEach(v => {
                if (u.id === v.id) {
                    dist[u.id][v.id] = 0;
                    next[u.id][v.id] = null;
                } else {
                    dist[u.id][v.id] = Infinity;
                    next[u.id][v.id] = null;
                }
            });
        });

        // Llenar con los pesos de las aristas existentes
        this.aristas.forEach(a => {
            dist[a.origen][a.destino] = a.peso;
            next[a.origen][a.destino] = a.destino;
        });

        // Triple bucle de Floyd-Warshall O(n^3)
        this.nodos.forEach(k => {
            this.nodos.forEach(i => {
                this.nodos.forEach(j => {
                    if (dist[i.id][k.id] !== Infinity && dist[k.id][j.id] !== Infinity) {
                        if (dist[i.id][j.id] > dist[i.id][k.id] + dist[k.id][j.id]) {
                            dist[i.id][j.id] = dist[i.id][k.id] + dist[k.id][j.id];
                            next[i.id][j.id] = next[i.id][k.id];
                        }
                    }
                });
            });
        });

        // Reconstruir la ruta específica de A a B
        let ruta = [];
        let costo = dist[origenId][destinoId];
        
        if (costo === Infinity) {
            return { costo: Infinity, rutaStr: "No hay camino" };
        }

        if (costo !== Infinity) {
            let u = origenId;
            ruta.push(`A${u}`);
            while (u !== destinoId && next[u][destinoId] !== null) {
                u = next[u][destinoId];
                ruta.push(`A${u}`);
            }
        }

        return { costo: costo, rutaStr: ruta.join(' → ') };
    }

    // --- NUEVO: Obtener el recorrido y valor de TODOS los caminos (DFS con Backtracking) ---
    obtenerTodosLosCaminos(origenId, destinoId) {
        let todosLosCaminos = [];
        let visitados = new Set();
        let rutaActual = [];

        // Función recursiva. Llevamos el costo acumulado para no perder la cuenta.
        const dfs = (nodoActual, costoAcumulado) => {
            rutaActual.push(`A${nodoActual}`);
            visitados.add(nodoActual);

            if (nodoActual === destinoId) {
                // Guardamos una copia de la ruta actual y su costo total
                todosLosCaminos.push({ 
                    ruta: [...rutaActual].join(' → '), 
                    costo: costoAcumulado 
                });
            } else {
                let vecinos = this.aristas.filter(a => a.origen === nodoActual);
                vecinos.forEach(arista => {
                    if (!visitados.has(arista.destino)) {
                        dfs(arista.destino, costoAcumulado + arista.peso);
                    }
                });
            }

            // Backtracking: retrocedemos un paso
            rutaActual.pop();
            visitados.delete(nodoActual);
        };

        dfs(origenId, 0);
        
        // Retornamos los caminos ordenados del más barato al más caro
        return todosLosCaminos.sort((a, b) => a.costo - b.costo);
    }
}
