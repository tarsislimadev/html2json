
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const DATA_ROOT = process.argv[2]

// FIXME: use glob
const getFiles = () =>
  fs.readdirSync(DATA_ROOT)
    .reduce((arr, dir) => arr.concat([path.join(DATA_ROOT, dir)]), [])
    .reduce((arr, outter) => arr.concat(fs.readdirSync(outter).map(inner => path.join(outter, inner))), [])

const saveFile = (name, obj) => fs.writeFileSync(name, JSON.stringify(obj, null, 4))

const getChildren = (root) =>
  Array.from((typeof root.children === 'function' ? root.children() : root.children) || [])

const nodes = (root) => ({
  type: root.type,
  name: root.name,
  data: root.data?.toString().replace(/\n+/, ' ').replace(/\s+/, ' '),
  children: getChildren(root)
    .filter((node) => ['tag', 'text'].indexOf(node.type) != -1)
    .map(nodes)
})

const loadHTML = (filename) => cheerio.load(fs.readFileSync(filename).toString()).root()

getFiles()
  .forEach(oldname => saveFile(oldname.replace('.html', '.json'), nodes(loadHTML(oldname))))
