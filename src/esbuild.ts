import type { PluginBuild } from 'esbuild'
import { build, context } from 'esbuild'
import { fileURLToPath } from 'url'
import fs from 'node:fs/promises'
import path, { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const entry = path.resolve(__dirname, '../example-esbuild/app.js')

const resolveIdMap = new Map()

const collect = args => {
  if (resolveIdMap.has(args.path)) {
    resolveIdMap.set(args.path, [...resolveIdMap.get(args.path), args.importer])
  } else {
    resolveIdMap.set(args.path, [args.importer])
  }
}
const scanPlugin = {
  name: 'scanPlugin',
  setup(build: PluginBuild) {
    build.onResolve(
      {
        filter: /app.js/
      },
      args => {
        console.log('resolve...')
        collect(args)
        return {
          external: false
        }
      }
    )
    build.onResolve(
      {
        filter: /!(app.js)/
      },
      args => {
        collect(args)
        return {
          external: true
        }
      }
    )
    build.onLoad({ filter: /\.*$/ }, async args => {
      console.log('load...')
      const contents = await fs.readFile(path.resolve(entry, args.path), 'utf8')
      return {
        contents,
        loader: 'js'
      }
    })
  }
}

await build({
  entryPoints: [entry],
  bundle: true,
  outfile: 'out.js',
  plugins: [scanPlugin]
})

console.log(resolveIdMap)

// console.log(await context({ write: false }))
