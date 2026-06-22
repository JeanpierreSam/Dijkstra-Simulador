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
        let operaciones = 0; // 👈 CONTADOR DE OPERACIONES
        
        // Inicializar distancias al infinito
        this.nodos.forEach(nodo => {
            distancias[nodo.id] = Infinity;
            visitados[nodo.id] = false;
            previos[nodo.id] = null;
            operaciones++; // 👈 Contar cada inicialización
        });
        
        distancias[nodoInicialId] = 0;
        //Bucle Principal V
        for (let i = 0; i < this.nodos.length; i++) {
            operaciones++; // 👈 Contar cada iteración del bucle principal
            
            // Buscar el nodo no visitado con la distancia mínima
            let nodoActual = this.obtenerNodoMinimaDistancia(distancias, visitados);
            operaciones += this.nodos.length; // 👈 Contar las comparaciones en obtenerNodoMinimaDistancia
            
            if (nodoActual === null) break;
            
            visitados[nodoActual] = true;

            // Actualizar las distancias de los vecinos
            let vecinos = this.aristas.filter(a => a.origen === nodoActual);
            operaciones += this.aristas.length; // 👈 Contar el filtro de aristas
            
            vecinos.forEach(arista => {
                operaciones++; // 👈 Contar cada vecino procesado
                let vecinoId = arista.destino;
                
                if (!visitados[vecinoId]) {
                    let nuevaDistancia = distancias[nodoActual] + arista.peso;
                    if (nuevaDistancia < distancias[vecinoId]) {
                        distancias[vecinoId] = nuevaDistancia;
                        previos[vecinoId] = nodoActual;
                    }
                }
            });
        }
        return { distancias, previos, operaciones }; // 👈 Retornar el contador
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
        let operaciones = 0; // 👈 CONTADOR DE OPERACIONES

        // Inicializar matrices
        this.nodos.forEach(u => {
            dist[u.id] = {};
            next[u.id] = {};
            this.nodos.forEach(v => {
                operaciones++; // 👈 Contar cada inicialización
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
            operaciones++; // 👈 Contar cada arista procesada
            dist[a.origen][a.destino] = a.peso;
            next[a.origen][a.destino] = a.destino;
        });

        // Triple bucle de Floyd-Warshall O(n^3)
        this.nodos.forEach(k => { //Nodo Intermedio
            this.nodos.forEach(i => { //Nodo origen
                this.nodos.forEach(j => { //Nodo final
                    operaciones++; // 👈 Contar cada iteración del triple bucle
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
            return { costo: Infinity, rutaStr: "No hay camino", operaciones };
        }

        if (costo !== Infinity) {
            let u = origenId;
            ruta.push(`${u}`);
            while (u !== destinoId && next[u][destinoId] !== null) {
                operaciones++; // 👈 Contar la reconstrucción de ruta
                u = next[u][destinoId];
                ruta.push(`${u}`);
            }
        }

        return { costo: costo, rutaStr: ruta.join(' → '), operaciones }; // 👈 Retornar el contador
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
