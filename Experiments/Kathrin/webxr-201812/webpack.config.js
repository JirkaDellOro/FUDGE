const path = require("path");

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname)
	},
	watch: true,
	watchOptions: {
		aggregateTimeout: 600
	}
};
