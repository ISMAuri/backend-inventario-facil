const { Router } = require('express');
const authRoutes = require('./auth.routes');
const categoriaRoutes = require('./categoria.routes');
const clienteRoutes = require('./cliente.routes');
const productoRoutes = require('./producto.routes');
const ventaRoutes = require('./venta.routes');
const detalleVentaRoutes = require('./detalle_venta.routes');
const autorizacionFacturaRoutes = require('./autorizacion_factura.routes');
const empresaRoutes = require('./empresa.routes');
const movimientoInventarioRoutes = require('./movimiento_inventario.routes');


const router = Router();

// A medida que avancemos semanas, aquí se van sumando:
// router.use('/users', userRoutes);
// router.use('/services', serviceRoutes);
// router.use('/requests', requestRoutes);
router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);
router.use('/detalle-ventas', detalleVentaRoutes);
router.use('/autorizacion-facturas', autorizacionFacturaRoutes);
router.use('/empresas', empresaRoutes);
router.use('/movimientos-inventario', movimientoInventarioRoutes);



module.exports = router;
