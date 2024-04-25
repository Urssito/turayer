var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config({path: './.env'})

module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },
  mode: "production",
  module: {
    rules: [
      {
        test:/\.js$|jsx/, use: {
          loader:'babel-loader',
            options:{
                presets: ['@babel/preset-react','@babel/preset-env'],
            }
        } , exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
      filename: path.join(__dirname, 'public', 'index.html')
      //inject: false
    })
  ],
  devServer: {
    port: 3000,
    proxy: {
      '/api': "http://localhost:8080",
      '/uploads': "http://localhost:8080"
    },
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
    },
    headers: [
      {
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }
    ],
    historyApiFallback: true,
    hot: true,
  },
  devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map'
};