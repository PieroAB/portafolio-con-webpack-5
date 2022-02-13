const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const ProgressPlugin = require("progress-webpack-plugin");

/** @type {import('webpack').Configuration} */
/* autocompletado para nuestro archivo de webpack */

module.exports = {
  mode: "development", // LE INDICO EL MODO EXPLICITAMENTE
  entry: "./src/index.js", // el punto de entrada de mi aplicación
  output: {
    // Esta es la salida de mi bundle
    path: path.resolve(__dirname, "dist"),
    // resolve lo que hace es darnos la ruta absoluta de el S.O hasta nuestro archivo
    // para no tener conflictos entre Linux, Windows, etc
    filename: "[name].[contenthash].js",
    // EL NOMBRE DEL ARCHIVO FINAL,
    /*EJM : 98dw84jde.png -> NO SE AGREGA EL PUNTO ANTES DE LA [EXT], ES AUTOMATICO.  */
    //Puede configurar la salida den el loader o en el output.
    assetModuleFilename: "assets/images/[contenthash][ext][query]",

    // Webpack ahora tiene un flag clean que permite limpiar el output directory por cada vezque ejecutemos el comando
    // Ya no seria necesario el plugin CleanWebpackPlugin(),
    //clean: true,
  },

  //DESPUES DE LA COMPILACION WEBPACK SEGUIRÁ OBSERVANDO LOS CAMBIOS EN CUALQUIERA DE LOS ARCHIVOS
  //watch: true,

  resolve: {
    extensions: [".js"], // ARCHIVOS QUE WEBPACK VA A LEER
    alias: {
      // AL HACER LOS IMPORT EVITAMOS EL USO DE RUTAS RELATIVAS EJM : ./../image.png
      // de -> import Utility from '../../images/instagram';
      // a  -> import Utility from '@images/instagram'
      "@utils": path.resolve(__dirname, "src/utils/"),
      "@templates": path.resolve(__dirname, "src/templates/"),
      "@styles": path.resolve(__dirname, "src/styles/"),
      "@images": path.resolve(__dirname, "src/assets/images/"),
    },
  },
  module: {
    // REGLAS PARA TRABAJAR CON WEBPACK
    rules: [
      {
        test: /\.m?js$/, // LEE LOS ARCHIVOS CON EXTENSION .JS,
        exclude: /node_modules/, // IGNORA LOS MODULOS DE LA CARPETA
        loader: "babel-loader",
        options: {
          presets: [
            [
              /* PERMITE USAR JAVASCRIPT MODERMO O MAS RECIENTE SIN TRANSFORMACIONES DE SINTAXIS */
              "@babel/preset-env",
              {
                targets: {
                  chrome: "58", // MIN VERSION 58 CHROME EN ADELANTE
                  ie: "11", // MIN INTERNET EXPLORER 11
                  esmodules: true, // MODULOS ECMASCRIPT
                },
              },
            ],
          ],

          /*COMPLEMENTO QUE AYUDA A REUTILIZAR CODIGO DE AYUDA DE BABEL PARA AHORRAR TAMAÑO DE CODIGO */
          plugins: ["@babel/plugin-transform-runtime"],
        },
        /*CUANDO SON VARIOS LOADERS USAR USE Y UN ARRAY DE OBJETOS */
        /*use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-transform-runtime"],
            },
          },
          {},
          {},...]*/
      },

      {
        test: /\.css|.styl$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
      },

      {
        test: /\.png/, // REGLA PARA ACEPTAR IMAGENES .PNG
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name].[contenthash][ext][query]", // Directorio de salida
        },
      },

      /*Nueva forma de importar fuentes en webpack 5 */
      {
        test: /\.(woff|woff2)$/i, // Tipos de fuentes a incluir
        type: "asset/resource", // Tipo de módulo a usar (este mismo puede ser usado para archivos de imágenes)
        generator: {
          filename: "assets/fonts/[name].[contenthash][ext][query]", // Directorio de salida
        },
      },
      /* Forma antigua en webpack 4 o inferior */
      /*{
        test: /\.(woff|woff2)$/, // REGLA PARA ARCHIVOS WOFF | WOFF2
        use: {
          loader: "url-loader", // NOMBRE DEL LOADER
          options: {
            limit: false, // O LE PASAMOS UN NUMERO
            // Habilita o deshabilita la transformación de archivos en base64.
            mimetype: "aplication/font-woff",
            // Especifica el tipo MIME con el que se alineará el archivo.
            // Los MIME Types (Multipurpose Internet Mail Extensions)
            // son la manera standard de mandar contenido a través de la red.
            name: "[name].[contenthash].[ext]",
            // EL NOMBRE INICIAL DEL PROYECTO + SU EXTENSIÓN
            // PUEDES AGREGARLE [name]hola.[ext] y el output del archivo seria
            // ubuntu-regularhola.woff
            outputPath: "./assets/fonts/",
            // EL DIRECTORIO DE SALIDA (SIN COMPLICACIONES)
            publicPath: "./assets/fonts/",
            // EL DIRECTORIO PUBLICO (SIN COMPLICACIONES)
            esModule: false,
          },
        },
      },*/
    ],
  },
  // SECCION DE PLUGINS
  plugins: [
    new HtmlWebpackPlugin({
      // CONFIGURACIÓN DEL PLUGIN
      inject: true, // INYECTA EL BUNDLE AL TEMPLATE HTML
      template: "./public/index.html", // LA RUTA AL TEMPLATE HTML
      filename: "./index.html", // NOMBRE FINAL DEL ARCHIVO
    }),

    new MiniCssExtractPlugin({
      //SALIDA DE ARCHIVOS CSS
      filename: "assets/css/[name].[contenthash].css",
    }),

    // INSTANCIAMOS EL PLUGIN
    new CopyPlugin({
      // CONFIGURACIÓN DEL COPY PLUGIN
      patterns: [
        {
          from: path.resolve(__dirname, "src", "assets/images"), // CARPETA A MOVER AL DIST
          to: "assets/images", // RUTA FINAL DEL DIST
        },
      ],
    }),
    // COMO TAL, REEMPLAZA EL TEXTO EN EL PAQUETE RESULTANTE PARA CUALQUIER INSTANCIA DE PROCESS.ENV.
    new Dotenv({
      // PASARLE LA UBICACIÓN DE ARCHIVO .ENV
      path: path.resolve(__dirname, ".env-example"),
    }),

    //UN COMPLEMENTO DE PAQUETE WEB PARA ELIMINAR/LIMPIAR SUS CARPETAS DE COMPILACIÓN
    new CleanWebpackPlugin(),

    // COMPLEMENTO WEBPACK SIMPLE QUE MUESTRA UN BUEN PROGRESO CUANDO SE CONSTRUYE.
    new ProgressPlugin(true),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      // OPTIMIZAR Y MINIMIZAR SU ARCHIVOS CSS.
      new CssMinimizerPlugin(),

      // ESTE COMPLEMENTO USA TERSER PARA MINIMIZAR/MINIMIZAR SU ARCHIVOS JAVASCRIPT.
      new TerserPlugin({
        // NO SE CREAR EL ARCHIVO LICENSE.TXT CON LOS COMENTARIOS
        extractComments: false,
      }),
    ],
  },
};
