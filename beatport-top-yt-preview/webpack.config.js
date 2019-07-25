const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './beatport-top-yt-preview/webapp/javascripts/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/public'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './beatport-top-yt-preview/webapp/index.html',
      inject: 'head'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: '/images',
              publicPath: '/public/images'
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/webfonts',
              publicPath: '/public/webfonts'
            }
          }
        ]
      }
    ],
  },
};