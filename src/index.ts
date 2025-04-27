import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const app = new Hono()

// --- OpenAPI ファイルを読み込み、パース ---
// openapi.yaml ファイルへの絶対パスを取得 (実行時のカレントディレクトリからの相対パスに注意)
// この例では、src ディレクトリと同じ階層にある tsp-output ディレクトリを想定
const openApiPath = path.resolve(process.cwd(), 'tsp-output/schema/openapi.yaml')

let openApiSpec: object | undefined
try {
  // 同期的にファイルの内容を UTF-8 文字列として読み込む
  const fileContents = fs.readFileSync(openApiPath, 'utf8')
  // YAML 文字列を JavaScript オブジェクトに変換
  openApiSpec = yaml.load(fileContents) as object
  console.log(`Successfully loaded and parsed: ${openApiPath}`)
} catch (e) {
  console.error(`Failed to load or parse ${openApiPath}:`, e)
  // エラー処理: ファイルが読めない場合やパースに失敗した場合
  // 必要に応じてデフォルトの spec を設定したり、エラーレスポンスを返す処理を追加
}
// --- ここまで ---

// Swagger UI の設定
if (openApiSpec) {
  app.get('/ui', swaggerUI({
    urls: [],
    spec: openApiSpec,
  }))
} else {
  // spec が読み込めなかった場合のエラー表示
  app.get('/ui', (c) => c.text('Failed to load OpenAPI specification.', 500))
}

// --- 他のAPIエンドポイントなど ---
app.get('/', (c) => c.text('Hello World'))
// ---

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`) // Listening on http://localhost:3000
})

export default app


