const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

// Auto-detect module configuration
const getModuleConfig = () => {
  const cwd = process.cwd();
  const moduleName = path.basename(cwd);
  
  // Auto-assign port based on module name
  const portMap = {
    'grade': 3106,
    'grade_v2': 3106
  };
  
  const port = process.env.PORT || portMap[moduleName] || portMap.default;
  
  return {
    moduleName,
    port,
    entryPoint: "./src/app/mount.js",
    outputPath: "./dist"
  };
};

module.exports = (env, argv) => {
  const config = getModuleConfig();
  
  console.log(`🚀 Building module: ${config.moduleName} on port ${config.port}`);
  console.log(`📁 Entry: ${config.entryPoint}`);
  console.log(`📁 Output: ${config.outputPath}`);
  
  // Use local webpack from the module directory
  const { ModuleFederationPlugin } = require(path.join(process.cwd(), "node_modules/webpack")).container;
  
  return {
    entry: config.entryPoint,
    mode: process.env.NODE_ENV || "development",
    devtool: "source-map",
    output: { 
      path: path.resolve(__dirname, "..", config.outputPath), 
      publicPath: "auto" 
    },
    resolve: {
      extensions: [".js", ".jsx"],
      fallback: { events: require.resolve("events/") }
    },
    devServer: {
      port: config.port,
      historyApiFallback: true,
      headers: { "Access-Control-Allow-Origin": "*" },
      client: { overlay: false },
      hot: false,
      liveReload: false
    },
    module: { 
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource'
        }
      ] 
    },
    plugins: [
      new HtmlWebpackPlugin({ 
        template: "./public/index.html" 
      }),
      new ModuleFederationPlugin({
        name: config.moduleName,
        filename: "remoteEntry.js",
        exposes: { "./mount": "./src/app/mount" },
        shared: { 
          react: { 
            singleton: true, 
            requiredVersion: false, 
            eager: false,
            strictVersion: false,
            import: false
          }, 
          "react-dom": { 
            singleton: true, 
            requiredVersion: false, 
            eager: false,
            strictVersion: false,
            import: false
          },
                           // Removed now-design-theme from shared modules due to React version conflict
                 // Remote modules will handle Design System packages locally
        }
      })
    ]
  };
};
