// @flow strict
import parser from 'flow-parser';
import path from "path";
import fs from 'fs';
const { readFile } = fs.promises;

/*::
export type RollupPlugin = {
  name: string,
  resolveId(id: string, importer: string): ?string;
  load(id: string):?string;
}
*/

console.log('PLUGIN LOAD')

export function identify()/*: RollupPlugin*/ {
  return {
    name: '@lukekaalim/identify',
    resolveId ( source, importer ) {
      if (source.startsWith('flow:')) {
        const [prefix, fileSource] = source.split(':')
        return `flow:${path.resolve(path.dirname(importer), fileSource)}`;
      }
      return null; // other ids should be handled as usually
    },
    async load ( id, oh ) {
      if (id.startsWith('flow:')) {
        console.log(oh);
        const [prefix, absoluteSource] = id.split(':')
        const sourceCode = await readFile(absoluteSource, { encoding: 'utf8' })
        const ast = parser.parse(sourceCode, {});
        const typeImportDeclarations = ast.body.filter(statement =>
          statement.type === 'ImportDeclaration'
          && statement.importKind === 'type')

        typeImportDeclarations.map(importDeclaration =>
          context.load(importDeclaration.source.value))
        

        return `export default ${JSON.stringify(ast)}`; // the source code for "virtual-module"
      }
      return null; // other ids should be handled as usually
    }
  }
}
