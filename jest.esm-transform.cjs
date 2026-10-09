// Compiles ESM-only node_modules (NestJS 12), dynamic import() included, to CommonJS, since Jest cannot
// require native ESM. CommonJS has no import.meta, so import.meta.url is inlined as the file's URL.
const { pathToFileURL } = require('node:url');
const babelJest = require('babel-jest').default;
const transformDynamicImport = require('@babel/plugin-transform-dynamic-import');
const transformModulesCommonjs = require('@babel/plugin-transform-modules-commonjs');

const inlineImportMetaUrl = ({ types: t }) => ({
  visitor: {
    MetaProperty(path, state) {
      const member = path.parentPath;
      if (member.isMemberExpression() && t.isIdentifier(member.node.property, { name: 'url' })) {
        member.replaceWith(t.stringLiteral(pathToFileURL(state.filename).href));
      }
    },
  },
});

module.exports = babelJest.createTransformer({
  babelrc: false,
  configFile: false,
  sourceType: 'unambiguous',
  plugins: [transformDynamicImport, transformModulesCommonjs, inlineImportMetaUrl],
});
