import autoprefixer from 'autoprefixer';
import postcssNesting from 'postcss-nesting';

export default {
    plugins: [
        postcssNesting(),
        autoprefixer({
            overrideBrowserslist: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead']
        })
    ]
};