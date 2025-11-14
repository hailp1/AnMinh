const { override } = require('customize-cra');

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
    
    return config;
  }
);