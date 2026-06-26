// ============================================================
// CLASE DisneyCharacter (Programación Orientada a Objetos)
// ------------------------------------------------------------
// Una clase sirve como plano constructivo para crear objetos consistentes.
// ============================================================
class DisneyCharacter {
  // El constructor se ejecuta automáticamente cuando hacemos "new DisneyCharacter({...})"
  constructor({ _id, name, imageUrl, films, parkAttractions }) {
    this._id = _id; // Guardamos el _id de Disney
    this.name = name; // Guardamos el nombre
    this.imageUrl = imageUrl || ""; // Foto
    
    // Nos aseguramos de que las películas y atracciones sean arreglos para evitar errores de código
    this.films = Array.isArray(films) ? films : [];
    this.parkAttractions = Array.isArray(parkAttractions) ? parkAttractions : [];
    
    this.savedAt = new Date(); // Guardamos una marca de tiempo con la hora exacta de guardado
  }

  // GETTER: funciona como una propiedad simulada (character.label) pero ejecuta lógica interna
  get label() {
    return `[ID: #${this._id}] ${this.name}`;
  }

  // MÉTODO PERSONALIZADO (OPCIÓN B): Formatea el texto exacto que se va a pintar en la terminal
  describe() {
    // Si el arreglo tiene elementos los une por comas, de lo contrario escribe "Ninguna"
    const movies = this.films.length > 0 ? this.films.join(", ") : "Ninguna";
    const attractions = this.parkAttractions.length > 0 ? this.parkAttractions.join(", ") : "Ninguna";
    
    // Devuelve el string estructurado bajo los requisitos de la Opción B elegida
    return `${this.name} | Películas: [${movies}] | Atracciones: [${attractions}]`;
  }

  // Método que limpia y devuelve los datos planos al transformarse en JSON de respuesta
  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      imageUrl: this.imageUrl,
      films: this.films,
      parkAttractions: this.parkAttractions,
      savedAt: this.savedAt.toISOString()
    };
  }
}

// Exportamos el modelo para que pueda ser utilizado en otros archivos del backend
module.exports = DisneyCharacter;