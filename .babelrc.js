module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
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
