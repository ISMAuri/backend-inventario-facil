const productoService = require("../services/producto.service");

class ProductoController {
  async listarProductos(req, res, next) {
    try {
      const { estado, id_categoria, busqueda } = req.query;

      const filtros = {
        busqueda,
      };

      if (estado !== undefined) {
        filtros.estado = estado === "true";
      }

      if (id_categoria !== undefined) {
        filtros.id_categoria = id_categoria;
      }

      const productos = await productoService.listar(filtros);

      res.status(200).json(productos);
    } catch (err) {
      next(err);
    }
  }

  async obtenerProducto(req, res, next) {
    try {
      const producto = await productoService.obtenerPorId(req.params.id);

      res.status(200).json(producto);
    } catch (err) {
      next(err);
    }
  }

  async crearProducto(req, res, next) {
    try {
      const producto = await productoService.crear(req.body);

      res.status(201).json(producto);
    } catch (err) {
      next(err);
    }
  }

  async actualizarProducto(req, res, next) {
    try {
      const producto = await productoService.actualizar(
        req.params.id,
        req.body,
      );

      res.status(200).json(producto);
    } catch (err) {
      next(err);
    }
  }

  async eliminarProducto(req, res, next) {
    try {
      const producto = await productoService.eliminar(req.params.id);

      res.status(200).json({
        message: "Producto desactivado correctamente",
        producto,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductoController();
