const { override, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const fs = require('fs');

module.exports = override(
  (config) => {
    // Disable CSS minification completely to avoid build errors
    if (config.optimization && config.optimization.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer) => {
          // Remove both CSS and JS minifiers that might cause issues
          return minimizer.constructor.name !== 'CssMinimizerPlugin' && 
                 minimizer.constructor.name !== 'OptimizeCssAssetsWebpackPlugin';
        }
      );
    }
    
    // Also disable CSS optimization
    if (config.optimization) {
      config.optimization.minimize = false;
    }
    
    // Ensure setupProxy.js is loaded
    // react-app-rewired v2+ should auto-load setupProxy.js from src/
    // But we manually ensure it's loaded using setupMiddlewares
    if (config.devServer) {
      const setupProxyPath = path.resolve(__dirname, 'src', 'setupProxy.js');
      
      if (!fs.existsSync(setupProxyPath)) {
        console.warn('[Config] ⚠️ setupProxy.js not found at:', setupProxyPath);
        return config;
      }
      
      console.log('[Config] 📍 Found setupProxy.js at:', setupProxyPath);
      
      // Use setupMiddlewares to ensure proxy is loaded
      const originalSetupMiddlewares = config.devServer.setupMiddlewares;
      
      config.devServer.setupMiddlewares = function(middlewares, devServer) {
        console.log('[Config] 🔧 setupMiddlewares called');
        
        // Call original setupMiddlewares first (react-app-rewired may have loaded setupProxy)
        if (originalSetupMiddlewares) {
          try {
            middlewares = originalSetupMiddlewares(middlewares, devServer);
            console.log('[Config] ✅ Original setupMiddlewares called');
          } catch (error) {
            console.warn('[Config] ⚠️ Error in original setupMiddlewares:', error.message);
          }
        }
        
        // Force load setupProxy to ensure it's registered
        if (devServer && devServer.app) {
          try {
            console.log('[Config] 🔄 Loading setupProxy.js...');
            
            // Clear require cache to force reload
            const cachedPath = require.resolve(setupProxyPath);
            if (require.cache[cachedPath]) {
              delete require.cache[cachedPath];
              console.log('[Config] 🗑️  Cleared cache for setupProxy.js');
            }
            
            // Require and call setupProxy
            const setupProxy = require(setupProxyPath);
            
            if (typeof setupProxy === 'function') {
              setupProxy(devServer.app);
              console.log('[Config] ✅✅✅ setupProxy.js loaded and registered successfully!');
              console.log('[Config] 📡 Proxy configured: /api -> http://localhost:5000');
            } else {
              console.error('[Config] ❌ setupProxy.js does not export a function');
            }
          } catch (error) {
            console.error('[Config] ❌❌❌ Error loading setupProxy.js:');
            console.error('[Config]    Message:', error.message);
            console.error('[Config]    Stack:', error.stack);
          }
        } else {
          console.warn('[Config] ⚠️ devServer.app is not available');
        }
        
        return middlewares;
      };
      
      console.log('[Config] ✅ setupMiddlewares configured to load setupProxy');
    } else {
      console.warn('[Config] ⚠️ config.devServer is not available');
    }
    
    return config;
  }
);