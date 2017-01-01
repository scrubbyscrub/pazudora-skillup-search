module.exports = {
	entry: {
		javascript: __dirname + '/server.js'
	},
	output: {
 		filename: 'server.js',
		path: __dirname + '/dist',
 	},
	module: {
		loaders: [
			{
				test: /.js?$/,
				exclude: /node_modules/,
				loaders: ['babel-loader']
			},
			{
				test: /.html$/,
				loader: 'file?name=[name].[ext]'
			},
			{
				test: /\.css$/,
				exclude: /\.useable\.css$/,
				loader: 'style-loader!css-loader',
				// include: /flexboxgrid/,
			}
		]
	},
	resolveLoader: {
        root: __dirname + '/node_modules'
    },
	devtool: 'cheap-eval-source-map'
}
