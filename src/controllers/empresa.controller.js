const empresaService = require("../services/empresa.service");

class EmpresaController {
  async listarEmpresas(req, res, next) {
    try {
      const empresas = await empresaService.listar();

      res.status(200).json(empresas);
    } catch (err) {
      next(err);
    }
  }

  async obtenerEmpresa(req, res, next) {
    try {
      const empresa = await empresaService.obtenerPorId(req.params.id);

      res.status(200).json(empresa);
    } catch (err) {
      next(err);
    }
  }

  async crearEmpresa(req, res, next) {
    try {
      const empresa = await empresaService.crear(req.body);

      res.status(201).json(empresa);
    } catch (err) {
      next(err);
    }
  }

  async actualizarEmpresa(req, res, next) {
    try {
      const empresa = await empresaService.actualizar(req.params.id, req.body);

      res.status(200).json(empresa);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EmpresaController();
