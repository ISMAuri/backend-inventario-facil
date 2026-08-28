const sequelize = require("../config/database");
const movimientoRepository = require("../repositories/movimiento_inventario.repository");
const productoRepository = require("../repositories/producto.repository");
const userRepository = require("../repositories/user.repository");

class MovimientoInventarioService {
  async listar({ id_producto, id_usuario, tipo_movimiento } = {}) {
    return movimientoRepository.findAll({
      id_producto,
      id_usuario,
      tipo_movimiento,
    });
  }

  async obtenerPorId(id) {
    const movimiento = await movimientoRepository.findById(id);

    if (!movimiento) {
      const error = new Error("Movimiento de inventario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return movimiento;
  }

  async listarPorProducto(id_producto) {
    return movimientoRepository.findByProducto(id_producto);
  }

  async crear({ id_producto, id_usuario, tipo_movimiento, cantidad, motivo }) {
    const producto = await productoRepository.findById(id_producto);

    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const usuario = await userRepository.findById(id_usuario);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (tipo_movimiento !== "entrada" && tipo_movimiento !== "salida") {
      const error = new Error(
        "El tipo de movimiento debe ser entrada o salida",
      );
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0) {
      const error = new Error("La cantidad debe ser un entero mayor que cero");
      error.statusCode = 400;
      throw error;
    }

    const cantidadNumero = Number(cantidad);
    const stockActual = Number(producto.stock_actual);

    let nuevoStock;

    if (tipo_movimiento === "entrada") {
      nuevoStock = stockActual + cantidadNumero;
    } else {
      if (cantidadNumero > stockActual) {
        const error = new Error(
          "No hay suficiente stock para realizar la salida",
        );
        error.statusCode = 409;
        throw error;
      }

      nuevoStock = stockActual - cantidadNumero;
    }

    return sequelize.transaction(async (transaction) => {
      await productoRepository.update(
        producto,
        { stock_actual: nuevoStock },
        transaction,
      );

      return movimientoRepository.create(
        {
          id_producto,
          id_usuario,
          tipo_movimiento,
          cantidad: cantidadNumero,
          motivo,
        },
        transaction,
      );
    });
  }
}

module.exports = new MovimientoInventarioService();
