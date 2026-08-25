const { Router } = require('express');
const authRoutes = require('./auth.routes');
<<<<<<< HEAD
const categoriaRoutes = require('./categoria.routes');
=======
>>>>>>> b996d5d195564e29ea4d0c15440f7588e903be79

const router = Router();

// A medida que avancemos semanas, aquí se van sumando:
// router.use('/users', userRoutes);
// router.use('/services', serviceRoutes);
// router.use('/requests', requestRoutes);
router.use('/auth', authRoutes);
<<<<<<< HEAD
router.use('/categorias', categoriaRoutes);
=======
>>>>>>> b996d5d195564e29ea4d0c15440f7588e903be79

module.exports = router;
