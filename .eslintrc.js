module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "script"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "root": true,
  "ignorePatterns": ["node_modules/", "*.js"],
  "rules": {
    // formatting rules,
    // typescript-eslint documentation strongly recommends not using formatting linter rules
    // and instead use a dedicated formatter such as Prettier
    "brace-style": "off",
    "@typescript-eslint/brace-style": [
      "warn",
      "1tbs",
      { "allowSingleLine": true }
    ],
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": "warn",
    "indent": "off",
    "@typescript-eslint/indent": [
      "warn",
      2,
      {
        "SwitchCase": 1,
        "CallExpression": {
          "arguments": "first"
        },
        "FunctionDeclaration": {
          "parameters": "first"
        },
        "FunctionExpression": {
          "parameters": "first"
        }
      }
    ],
    "@typescript-eslint/member-delimiter-style": "warn",
    "semi": "off",
    "@typescript-eslint/semi": "warn",

    // logical and stylistic rules
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        "allowExpressions": true
      }
    ],
    "@typescript-eslint/explicit-member-accessibility": "warn",
    "@typescript-eslint/member-ordering": [
      "warn",
      {
        "classes": [
          // Fields
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "#private-static-field",

          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "#private-instance-field",

          "public-abstract-field",
          "protected-abstract-field",

          // Constructors
          "public-constructor",
          "protected-constructor",
          "private-constructor",

          // Static methods
          "public-static-method",
          "protected-static-method",
          "private-static-method",
          "#private-static-method",

          // Accessors
          ["public-static-get", "public-static-set"],
          ["protected-static-get", "protected-static-set"],
          ["private-static-get", "private-static-set"],
          ["#private-static-get", "#private-static-set"],

          ["public-instance-get", "public-instance-set"],
          ["protected-instance-get", "protected-instance-set"],
          ["private-instance-get", "private-instance-set"],
          ["#private-instance-get", "#private-instance-set"],

          // Instance methods
          "public-instance-method",
          "protected-instance-method",
          "private-instance-method",
          "#private-instance-method",

          "public-abstract-method",
          "protected-abstract-method"
        ]
      }
    ],
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        "selector": ["classProperty", "classMethod", "accessor"],
        "format": [
          "camelCase"
        ]
      },
      {
        "selector": ["classProperty", "classMethod"],
        "modifiers": ["static"],
        "format": [
          "camelCase",
          "UPPER_CASE"
        ]
      },
      {
        "selector": ["variable", "function"],
        "format": [
          "camelCase",
          "UPPER_CASE"
        ]
      },
      {
        "selector": "parameter",
        "format": [
          "camelCase"
        ],
        "filter": { // "this" is allowed without leading underscore to use in decorator functions
          "regex": "^this$",
          "match": false
        },
        "leadingUnderscore": "require"
      },
      {
        "selector": ["enum", "enumMember"],
        "format": [
          "UPPER_CASE"
        ]
      },
      {
        "selector": ["interface", "class"],
        "format": [
          "PascalCase"
        ]
      }
    ],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "warn",
    "quotes": "off",
    "@typescript-eslint/quotes": [
      "warn",
      "double"
    ],
    "@typescript-eslint/type-annotation-spacing": "warn",
    "@typescript-eslint/typedef": [
      "warn",
      {
        "parameter": true,
        // "arrowParameter": true, // types in arrow functions makes some arrow functions really hard to read... 
        "propertyDeclaration": true,
        "variableDeclaration": true,
        "variableDeclarationIgnoreFunction": true,
        "memberVariableDeclaration": true
      }
    ],
    "no-cond-assign": "warn",
    "no-empty": "warn",
    "no-eval": "warn",
    "no-new-wrappers": "warn",
    "no-redeclare": "warn",
    "no-unused-labels": "warn"
  }
};
