const path = require("path");
const fs = require("fs");

// 📦 ENVIRONMENT VARIABLE SUPPORT
const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return acc;
    }

    const delimiterIndex = trimmed.indexOf("=");

    if (delimiterIndex === -1) {
      return acc;
    }

    const key = trimmed.slice(0, delimiterIndex).trim();
    let value = trimmed.slice(delimiterIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    acc[key] = value;
    return acc;
  }, {});
};

const getClientEnvDefinitions = () => {
  const cwd = process.cwd();
  const envFromFile = parseEnvFile(path.join(cwd, ".env"));
  const allowedKeys = new Set(
    Object.keys({
      ...envFromFile,
      ...process.env
    }).filter(
      (key) => key === "NODE_ENV" || key.startsWith("REACT_APP_")
    )
  );

  const resolvedEnv = {};
  allowedKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(envFromFile, key)) {
      resolvedEnv[key] = envFromFile[key];
    } else if (process.env[key]) {
      resolvedEnv[key] = process.env[key];
    }
  });
  if (!resolvedEnv.NODE_ENV) {
    resolvedEnv.NODE_ENV = process.env.NODE_ENV || "development";
  }

  const definitions = {
    "process.env": JSON.stringify(resolvedEnv)
  };

  Object.entries(resolvedEnv).forEach(([key, value]) => {
    definitions[`process.env.${key}`] = JSON.stringify(value);
  });

  return definitions;
};

// 🚀 SMART MODULE DISCOVERY SYSTEM
const discoverModules = () => {
  const appsDir = path.resolve(__dirname, '..', 'apps');
  
  if (!fs.existsSync(appsDir)) {
    console.log("❌ apps/ directory not found");
    return [];
  }

  const modules = fs.readdirSync(appsDir)
    .filter(dir => {
      const modulePath = path.join(appsDir, dir);
      const packageJsonPath = path.join(modulePath, 'package.json');
      return fs.statSync(modulePath).isDirectory() && fs.existsSync(packageJsonPath);
    })
    .map(moduleName => {
      const modulePath = path.join(appsDir, moduleName);
      const packageJsonPath = path.join(modulePath, 'package.json');
      
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return {
          name: moduleName,
          path: modulePath,
          packageJson,
          hasValidStructure: fs.existsSync(path.join(modulePath, 'app', 'mount.js'))
        };
      } catch (error) {
        console.log(`⚠️  Error reading package.json for ${moduleName}:`, error.message);
        return null;
      }
    })
    .filter(Boolean);

  console.log(`🔍 Discovered ${modules.length} modules:`, modules.map(m => m.name));
  return modules;
};

// 🎯 SMART PORT ASSIGNMENT SYSTEM
const assignPorts = (modules) => {
  const basePort = 3105;
  const portMap = {};
  
  modules.forEach((module, index) => {
    let port = basePort + index;
    
    // Find next available port if current is occupied
    while (isPortInUse(port)) {
      console.log(`⚠️  Port ${port} is occupied, trying next port...`);
      port++;
    }
    
    portMap[module.name] = port;
    console.log(`📍 ${module.name} assigned to port ${port}`);
  });
  
  return portMap;
};

// Check if port is actually in use
const isPortInUse = (port) => {
  try {
    const { execSync } = require('child_process');
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch (error) {
    return false; // Port is free
  }
};

// 🔧 GET CURRENT MODULE CONFIGURATION
const getCurrentModuleConfig = () => {
  const cwd = process.cwd();
  const moduleName = path.basename(cwd);
  
  // Debug logging
  console.log('🔍 Webpack Config Debug:');
  console.log('  - Current working directory:', cwd);
  console.log('  - Detected module name:', moduleName);
  console.log('  - Package.json exists:', fs.existsSync(path.join(cwd, 'package.json')));
  console.log('  - app/mount.js exists:', fs.existsSync(path.join(cwd, 'app', 'mount.js')));
  
  // Check if we're in a module directory
  const isModule = fs.existsSync(path.join(cwd, 'package.json')) && 
                   fs.existsSync(path.join(cwd, 'app', 'mount.js'));
  
  if (!isModule) {
    throw new Error(`❌ Not in a valid module directory: ${cwd}`);
  }
  
  // Get all modules for port assignment
  const allModules = discoverModules();
  const portMap = assignPorts(allModules);
  
  // Get current module's port
  const port = portMap[moduleName] || process.env.PORT || 3107;
  
  console.log(`🚀 Building module: ${moduleName} on port ${port}`);
  console.log(`📁 Entry: ${path.resolve(cwd, "app/mount.js")}`);
  console.log(`📁 Output: ${path.resolve(cwd, "dist")}`);
  console.log(`🔗 Module Federation name: ${moduleName}`);
  console.log(`🔗 Remote entry will be: ${moduleName}@http://localhost:${port}/remoteEntry.js`);
  
  return {
    moduleName,
    port,
    entryPoint: path.resolve(cwd, "app/mount.js"),
    publicDir: path.resolve(cwd, "public"),
    outputPath: path.resolve(cwd, "dist"),
    allModules,
    portMap
  };
};

// 🎯 MAIN WEBPACK CONFIGURATION
module.exports = (env, argv) => {
  const config = getCurrentModuleConfig();

  // Dynamically load webpack and plugins from local module's node_modules
  const webpackInstance = require(path.join(process.cwd(), "node_modules/webpack"));
  const { ModuleFederationPlugin } = webpackInstance.container;
  const { DefinePlugin } = webpackInstance;
  const HtmlWebpackPlugin = require(path.join(process.cwd(), "node_modules/html-webpack-plugin"));
  const envDefinitions = getClientEnvDefinitions();

  return {
    entry: config.entryPoint,
    mode: process.env.NODE_ENV || "development",
    devtool: "source-map",
    output: {
      path: config.outputPath,
      publicPath: "auto"
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      modules: [
        path.join(process.cwd(), "node_modules"),
        path.join(__dirname, "..", "node_modules"),
        "node_modules"
      ],
      fallback: {
        events: path.join(process.cwd(), "node_modules/events/")
      },
      symlinks: true  // Enable symlink resolution for yarn link
    },
    devServer: {
      port: config.port,
      historyApiFallback: true,
      headers: { "Access-Control-Allow-Origin": "*" },
      client: { overlay: false },
      hot: false,
      liveReload: false,
      onListening: (devServer) => {
        if (!devServer) return;
        const port = devServer.server.address().port;
        console.log(`✅ Module ${config.moduleName} running on http://localhost:${port}`);
        console.log(`🔗 Remote entry: http://localhost:${port}/remoteEntry.js`);
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: require.resolve('style-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                esModule: false
              }
            },
            {
              loader: require.resolve('css-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                esModule: false
              }
            },
            {
              loader: require.resolve('postcss-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                postcssOptions: {
                  config: path.resolve(process.cwd(), 'postcss.config.js')
                }
              }
            }
          ]
        },
        {
          test: /\.(scss|sass)$/,
          use: [
            {
              loader: require.resolve('style-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                esModule: false
              }
            },
            {
              loader: require.resolve('css-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                esModule: false
              }
            },
            {
              loader: require.resolve('postcss-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                postcssOptions: {
                  config: path.resolve(process.cwd(), 'postcss.config.js')
                }
              }
            },
            {
              loader: require.resolve('sass-loader', { paths: [path.join(process.cwd(), 'node_modules')] }),
              options: {
                implementation: require(path.join(process.cwd(), 'node_modules', 'sass'))
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(config.publicDir, "index.html")
      }),
      new ModuleFederationPlugin({
        name: config.moduleName,
        filename: "remoteEntry.js",
        exposes: { "./mount": "./app/mount" },
        shared: {
          react: {
            singleton: true,
            eager: true,
            requiredVersion: false
          },
          "react-dom": {
            singleton: true,
            eager: true,
            requiredVersion: false
          }
        }
      }),
      new DefinePlugin(envDefinitions)
    ]
  };
};
