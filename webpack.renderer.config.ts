import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({ /* opções do plugin */ }),
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
