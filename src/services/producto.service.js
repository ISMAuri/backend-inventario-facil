const sequelize = require("../config/database");

const productoRepository = require("../repositories/producto.repository");
const categoriaRepository = require("../repositories/categoria.repository");
const movimientoRepository = require("../repositories/movimiento_inventario.repository");

class ProductoService {
  async listar({ estado, id_categoria, busqueda } = {}) {
    return productoRepository.findAll({
      estado,
      id_categoria,
      busqueda,
    });
  }

  async obtenerPorId(id) {
    const producto = await productoRepository.findById(id);

    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return producto;
  }

  async crear(
    {
      id_categoria,
      nombre_producto,
      descripcion,
      codigo_producto,
      precio_compra,
      precio_venta,
      stock_actual,
      unidad_medida,
      tasa_impuesto,
    },
    id_usuario,
  ) {
    await this._validarCategoria(id_categoria);

    if (codigo_producto) {
      const existente = await productoRepository.findByCodigo(codigo_producto);

      if (existente) {
        const error = new Error("Ya existe un producto con ese código");
        error.statusCode = 409;
        throw error;
      }
    }

    const stockInicial = Number(stock_actual ?? 0);

    try {
      return await sequelize.transaction(async (transaction) => {
        const producto = await productoRepository.create(
          {
            id_categoria,
            nombre_producto,
            descripcion,
            codigo_producto: codigo_producto || null,
            precio_compra,
            precio_venta,
            stock_actual: stockInicial,
            unidad_medida,
            tasa_impuesto,
          },
          transaction,
        );

        // Registra el stock inicial
        if (stockInicial > 0) {
          await movimientoRepository.create(
            {
              id_producto: producto.id_producto,
              id_usuario,
              tipo_movimiento: "entrada",
              cantidad: stockInicial,
              motivo: "Carga inicial de inventario al registrar el producto",
            },
            transaction,
          );
        }

        return producto;
      });
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async actualizar(
    id,
    {
      id_categoria,
      nombre_producto,
      descripcion,
      codigo_producto,
      precio_compra,
      precio_venta,
      stock_actual,
      unidad_medida,
      tasa_impuesto,
      estado,
    },
    id_usuario,
  ) {
    const producto = await this.obtenerPorId(id);

    if (id_categoria !== undefined) {
      await this._validarCategoria(id_categoria);
    }

    if (codigo_producto) {
      const duplicado = await productoRepository.findByCodigoExcluyendoId(
        codigo_producto,
        id,
      );

      if (duplicado) {
        const error = new Error("Ya existe otro producto con ese código");
        error.statusCode = 409;
        throw error;
      }
    }

    const stockAnterior = Number(producto.stock_actual);
    const stockNuevo =
      stock_actual !== undefined ? Number(stock_actual) : stockAnterior;

    const cambios = {};

    if (id_categoria !== undefined) cambios.id_categoria = id_categoria;

    if (nombre_producto !== undefined) {
      cambios.nombre_producto = nombre_producto;
    }

    if (descripcion !== undefined) cambios.descripcion = descripcion;

    if (codigo_producto !== undefined) {
      cambios.codigo_producto = codigo_producto || null;
    }

    if (precio_compra !== undefined) {
      cambios.precio_compra = precio_compra;
    }

    if (precio_venta !== undefined) {
      cambios.precio_venta = precio_venta;
    }

    if (stock_actual !== undefined) {
      cambios.stock_actual = stockNuevo;
    }

    if (unidad_medida !== undefined) {
      cambios.unidad_medida = unidad_medida;
    }

    if (tasa_impuesto !== undefined) {
      cambios.tasa_impuesto = tasa_impuesto;
    }

    if (estado !== undefined) {
      cambios.estado = estado;
    }

    try {
      return await sequelize.transaction(async (transaction) => {
        const productoActualizado = await productoRepository.update(
          producto,
          cambios,
          transaction,
        );

        if (stock_actual !== undefined) {
          const diferencia = stockNuevo - stockAnterior;

          if (diferencia !== 0) {
            await movimientoRepository.create(
              {
                id_producto: producto.id_producto,
                id_usuario,
                tipo_movimiento: diferencia > 0 ? "entrada" : "salida",
                cantidad: Math.abs(diferencia),
                motivo: `Ajuste manual de inventario: ${stockAnterior} → ${stockNuevo}`,
              },
              transaction,
            );
          }
        }

        return productoActualizado;
      });
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async eliminar(id) {
    const producto = await this.obtenerPorId(id);

    return productoRepository.softDelete(producto);
  }

  async _validarCategoria(id_categoria) {
    const categoria = await categoriaRepository.findById(id_categoria);

    if (!categoria) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (!categoria.activo) {
      const error = new Error("No se puede usar una categoría inactiva");
      error.statusCode = 400;
      throw error;
    }
  }

  _traducirErrorSequelize(err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      const mensaje = err.errors?.[0]?.message || "Datos de producto inválidos";

      const error = new Error(mensaje);
      error.statusCode = 400;

      return error;
    }

    return err;
  }
}

module.exports = new ProductoService();
