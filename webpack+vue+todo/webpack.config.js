const path = require('path')//path是webpack所有文件的输出的路径，必须是绝对路径
const HTMLPlugin = require("html-webpack-plugin")
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin')
/*
 * nod中path模块的join和resolve的区别
 * 连接路径：path.join([path1],[path2],[...])
 * path.join()方法可以连接任意多个路径字符串要连接的多个路径可作为参数传入
 * path.join()方法在连接路径的同时也会对路径进行规范化
 * path.resolve([from...],to)
 * path.resolve()方法可以将多个路径解析为一个规范化的绝对路径。其处理方式类似于对这些路径逐一cd操作，
 * 与cd操作不同的是，这引起路径可以是文件，并且可不必实际存在(resolve()方法不会利用底层的文件系统判断路径是否存在，而只是进行路径字符串操作)
 */
let url = path.join(__dirname,'src/index.js')
const isDev = process.env.NODE_ENV === 'DEVELOPMENT'
console.log(url)
const config = {
	target:'web',
	entry: path.join(__dirname,'src/index.js'),//
	/*
	 * entry 入口七点指示webpack应该使用哪个模块，来作为构建其内部依赖图的开始，webpack会找出有哪些模块和library是入口
	 * 起点（间接和直接）依赖的
	 */
	//__dirname表示当前执行脚本所在的目录
	//__filename表示当前正在执行的脚本的文件名。它景输出文件所在位置的绝对路径，且和命令行参数所指定的文件名不一定相同。如果在模块中
	//返回的值是模块文件的路径
	output:{
		filename:'bundle.js',
		path:path.join(__dirname,'dist')
	},
	/*
	 * 输出output
	 * 配置output选项可以控制webpack如何想硬盘写入编译文件。注意，即使可以存在多个入口七点，但只能指定一个输出配置
	 * 在webpack中配置output属性的最低要求是，将它的值设置为一个对象，包括以下两点
	 * filename用于输出文件的文件名
	 * 目标输出目录path的绝对路径
	 */
	module:{
		rules:[
			{
				test:/\.vue$/,
				loader:'vue-loader'
			},
			{
				test:/\.jsx$/,
				loader:'babel-loader'
			},
			
			{
				test:/\.(gif|jpg|jpeg|png|svg)$/,
				use:[
						
						{
							loader:'url-loader',
							options:{
								limit:1024,
								name:'[name].[ext]'
							}
						}
				]
			}
		]
	},
	/*
	 * loader
	 * loader用于对模块的源代码进行转换。loadder可以使你在import或"加载"模块时预处理文件。因此
	 * loader类似于其它构建工具中的"任务(task)",病提供了处理前端构建不走的强大方法。loader可以将文件从不同的
	 * 语言(入typescript)转换成JavaScript，或将内联图像转换为data URL。loader甚至允许你直接在javascript模块中
	 * import CSS文件
	 * 使用loader
	 * 在你的应用程序中，有三种使用loader的方式
	 * 配置：在webpack.config.js文件中指定loader
	 * 内联：在每个import语句中显式指定loader
	 * CLI：在shell命令中指定他们
	 * 
	 * 
	 * 配置
	 * module.rules允许你在webpack配置中指定多个loader。这是展示loader的以中间名方式，并且有助于使代码变得
	 * 简洁。同时让你对各个loader有个全局概览
	 * 内联
	 * 可以在import语句或任何等效于"import"的方式中指定loader。使用!将资源中的loader分开。分开的每个部分都相对于当前目录解析
	 * CLI
	 * 也可以通过CLI使用loader:
	 * webpack --module-bind jade-loader --module-bind 'css=style-loader!css-loader'
	 * 这回对.jadewenjian shiyong jade-loader,对.css文件使用style-loader和css-loader
	 * loader特性
	 * loader支持链式传递，loader链中每个loader,都对前一个loader处理后的资源进行转换。loader链
	 * 会按照相反的顺序执行。第一个loader将(应用转换后的资源作为)返回结构传递给下一个loader，依次这样执行下去。最终，在
	 * 链中最后一个loader，返回webpack所预期的JavaScript
	 */
	plugins:[
		new webpack.DefinePlugin({
			'process.env':{
				NODE_ENV:isDev?'"development"':'"production"'
			}
		}),
		new HTMLPlugin()
	],
	devtool:false
}
if(isDev){
	config.entry = {
		app:path.join(__dirname,'src/index.js'),
		vendor:['vue']
	}
	config.module.rules.push(
		{
			test:/\.styl$/,
			use:[
				'style-loader',
				'css-loader',
				{
					loader:'postcss-loader',
					options:{
						sourceMap:true//直接使用前面已有的sourceMap来用
					}
				},
				"stylus-loader"
			],//只是处理了css文件
		}
	)
	config.devtool = "#cheap-module-eval-souce-map"
	config.devServer = {
		port:8000,//指定要监听请求的端口号
		host : "0.0.0.0",
		overlay:{
			errors:true
		},
//		open:true,//自动打开页面
		hot:true,//不刷新页面 只更新改变的数据
	}
	config.plugins.push(
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	)
}else{
	config.output.filename = '[name].[chunkhash:8].js'
	config.module.rules.push(
		{
			test:/\.styl$/,
			use:ExtractPlugin.extract({
				fallback:'style-loader',
				use:[
						'css-loader',
						{
							loader:'postcss-loader',
							options:{
								sourceMap:true,
							}
						},
						'stylus-loader'
					]
			})
		}
	)
	config.plugins.push(
		new ExtractPlugin('styles.[contentHash:8].css'),
		new webpack.optimize.CommonsChunkPlugin({
			name:'vendor'
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name:"runtime"
		})
	)
}
module.exports = config