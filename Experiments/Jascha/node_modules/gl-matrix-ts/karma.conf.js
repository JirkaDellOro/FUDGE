module.exports = function(config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/**/*.[jt]s" },
            { pattern: "spec/**/!(*.d).[jt]s" }
        ],
        preprocessors: {
            "src/**/*.[jt]s": ["karma-typescript"],
            "spec/**/*.[jt]s": ["karma-typescript"]
        },
        karmaTypescriptConfig: {
            bundlerOptions: {
                transforms: [require("karma-typescript-es6-transform")()]
            },
            compilerOptions: {
                module: "commonjs"
            },
            coverageOptions: {
                exclude: [/\.(d|spec|test)\.(ts)$/i, /\/spec\//i]
            },
            reports: {
                html: "coverage",
                text: ""
            },
            tsconfig: "./tsconfig.json"
        },
        reporters: ["spec", "karma-typescript"],
        specReporter: {
            maxLogLines: 5,
            suppressErrorSummary: false,
            suppressPassed: true
        },
        browsers: ["jsdom"],
        jsdomLauncher: {
            jsdom: {
                userAgent: "jsdom"
            }
        }
    })
}
