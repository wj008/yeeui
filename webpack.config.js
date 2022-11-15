const path = require('path');
module.exports = {
    //mode: "development",
    mode: "production",
    entry: "./src/yee.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "yee.js"
    }
};
