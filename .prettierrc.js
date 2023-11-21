module.exports = {
    arrowParens: 'always',
    printWidth: 120,
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    endOfLine: 'auto',
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    overrides: [
        {
            files: ['*.js', '*.ts', '*.jsx', '*.tsx'],
            options: {
                parser: 'typescript',
                tabWidth: 4,
            },
        },
        {
            files: ['*.md'],
            options: {
                parser: 'markdown',
            },
        },
        {
            files: ['*.json'],
            options: {
                parser: 'json',
                tabWidth: 4,
            },
        },
        {
            files: ['*.yml', '*.yaml'],
            options: {
                tabWidth: 4,
                singleQuote: false,
            },
        },
    ],
};
