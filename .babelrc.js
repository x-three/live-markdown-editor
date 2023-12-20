module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: process.env.BABEL_ENV === 'esm' ? false : 'auto',
                targets: {
                    esmodules: true,
                },
            },
        ],
        '@babel/preset-react',
        '@babel/preset-typescript',
    ],
    plugins: ['@babel/plugin-proposal-class-properties'],
    ignore: ['**/*.d.ts'],
};
