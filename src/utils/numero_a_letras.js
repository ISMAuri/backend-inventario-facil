const { toCardinal } = require("n2words/es-ES");

function convertirTotalALetras(total) {
  // Validar que el total sea un número válido
  const valor = Number(total);

  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error("El total debe ser un número válido");
  }

  // Convertir el total a centavos
  const totalCentavos = Math.round(valor * 100);

  // Separar la parte entera y los centavos
  const entero = Math.floor(totalCentavos / 100);
  const centavos = totalCentavos % 100;

  // Convertir la parte entera a letras
  let letras = toCardinal(entero);
  letras = _ajustarUno(letras);

  const moneda = entero === 1 ? "LEMPIRA" : "LEMPIRAS";

  return `${letras.toUpperCase()} ${moneda} CON ${String(centavos).padStart(
    2,
    "0",
  )}/100`;
}

// Ajustar la palabra "uno" a "un" cuando sea necesario
function _ajustarUno(texto) {
  if (texto === "uno") {
    return "un";
  }

  return texto
    .replace(/veintiuno$/i, "veintiún")
    .replace(/ y uno$/i, " y un")
    .replace(/ uno$/i, " un");
}

module.exports = {
  convertirTotalALetras,
};
