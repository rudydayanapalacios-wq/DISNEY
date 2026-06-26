// Importamos la clase modelo que acabamos de comentar arriba
const DisneyCharacter = require("../models/DisneyCharacter");

// ============================================================
// CLASE DisneyStore (Almacén de datos temporal en RAM)
// ============================================================
class DisneyStore {
  constructor() {
    // Creamos un objeto vacío que servirá como diccionario (clave -> valor)
    // Donde la clave será el _id y el valor será la instancia completa del personaje
    this.characters = {};
  }

  // Guarda o actualiza un personaje a partir de datos planos recibidos del frontend
  save(data) {
    // Instanciamos el modelo aplicando Programación Orientada a Objetos (POO)
    const character = new DisneyCharacter(data);
    
    // Verificamos si NO existía previamente analizando si su llave está vacía en el objeto
    const isNew = !this.characters[character._id];
    
    // Lo guardamos o sobreescribimos en nuestro diccionario utilizando su _id
    this.characters[character._id] = character;
    
    // Devolvemos el personaje creado y la bandera de si es nuevo para que el servidor lo use
    return { character, isNew };
  }

  // Verifica si un ID específico ya existe en la memoria
  has(id) {
    return Boolean(this.characters[id]);
  }

  // Obtiene un personaje por su ID, si no existe devuelve null
  get(id) {
    return this.characters[id] || null;
  }

  // Convierte el diccionario de objetos en un arreglo plano ideal para enviarlo en listas
  list() {
    return Object.values(this.characters);
  }

  // Un getter rápido para medir cuántos personajes hay guardados en total
  get size() {
    return Object.keys(this.characters).length;
  }
}

// Exportamos la clase de almacenamiento
module.exports = DisneyStore;