import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
	{
		files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // Apply to these file types
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
				// Add any other custom globals here
			},
		},
	},
	pluginJs.configs.recommended, // Equivalent to 'eslint:recommended'
	pluginReactConfig, // Equivalent to 'plugin:react/recommended'
	{
		rules: {
			indent: ['error', 4],
			'no-unused-vars': 'warn',
			// ... your custom rules
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
