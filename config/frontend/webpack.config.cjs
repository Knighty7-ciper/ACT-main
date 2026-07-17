const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/index.js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'jsx',
            target: 'es2015',
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'import.meta.env': JSON.stringify({
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://tjithxamxbcdagnszyfq.supabase.co',
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXRoeGFteGJjZGFnbnN6eWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkxNjksImV4cCI6MjA4MTYyNTE2OX0.M5KUns5NPyRQ2QdkAI3w6fvEp0RDSucgjGvtz7G9vvg',
        VITE_NEWS_API_KEY: process.env.VITE_NEWS_API_KEY || 'pub_32ad5529c94644bd84d27c9f0a69dc59',
      }),
      'importMetaEnv': JSON.stringify({
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://tjithxamxbcdagnszyfq.supabase.co',
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXRoeGFteGJjZGFnbnN6eWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkxNjksImV4cCI6MjA4MTYyNTE2OX0.M5KUns5NPyRQ2QdkAI3w6fvEp0RDSucgjGvtz7G9vvg',
        VITE_NEWS_API_KEY: process.env.VITE_NEWS_API_KEY || 'pub_32ad5529c94644bd84d27c9f0a69dc59',
      }),
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
  ],
  performance: {
    hints: false,
  },
};
