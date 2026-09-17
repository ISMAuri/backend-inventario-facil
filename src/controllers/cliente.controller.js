const clienteService = require("../services/cliente.service");

class ClienteController {
  async listarClientes(req, res, next) {
    try {
      const { estado, busqueda } = req.query;

      const filtros = {
        busqueda,
      };

      if (estado !== undefined) {
        filtros.estado = estado === "true";
      }

      const clientes = await clienteService.listar(filtros);

      res.status(200).json(clientes);
    } catch (err) {
      next(err);
    }
  }

  async obtenerCliente(req, res, next) {
    try {
      const cliente = await clienteService.obtenerPorId(req.params.id);

      res.status(200).json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async crearCliente(req, res, next) {
    try {
      const cliente = await clienteService.crear(req.body);

      res.status(201).json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async actualizarCliente(req, res, next) {
    try {
      const cliente = await clienteService.actualizar(req.params.id, req.body);

      res.status(200).json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async eliminarCliente(req, res, next) {
    try {
      const cliente = await clienteService.eliminar(req.params.id);

      res.status(200).json({
        message: "Cliente desactivado correctamente",
        cliente,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClienteController();
