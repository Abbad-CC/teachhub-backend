import express from 'express';

const router = express.Router();

console.log('✅ health.routes.ts loaded');

// Add middleware to log all requests to this router
router.use((req, res, next) => {
  console.log(`🔍Router - Incoming request: ${req.method} ${req.path}`);
  next();
});

router.get('/health', (req, res) => {
  console.log('✅ Health route hit!');
  res.status(200).json({
    success: true,
    message: 'Backend is working! ✅',
  });
});



export default router;