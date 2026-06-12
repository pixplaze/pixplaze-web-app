import autoprefixer from 'autoprefixer';
import postcssNesting from 'postcss-nesting';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

export default {
    plugins: [
        postcssNesting(),
        postcssGlobalData({
            files: ['src/lib/style/global.var.css'] // путь к вашему файлу
        }),
        postcssCustomMedia(),
        autoprefixer({
            overrideBrowserslist: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead']
        })
    ]
};