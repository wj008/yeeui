const path = require('path');
module.exports = {
    mode: 'production',
  //  mode: 'development',
    entry: './src/yee.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'yee.js'
    },
    externals: {
        jquery: 'jQuery',
        layer: 'layer'
    },
    performance: {
        hints: false
    }
};