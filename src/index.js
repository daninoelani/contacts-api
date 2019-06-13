// module.exports = async () => {
//   return 'Hello, world'
// }
const micro = require('micro')
const { send, json } = require('micro')
const { router, get, post, put, del } = require('microrouter')
const cors = require('micro-cors')()

const hello = (req, res) => send(res, 200, `Hello ${req.params.who}`)

const notfound = (req, res) => send(res, 404, 'Not found route')

const Datastore = require('nedb-promise')
const db = new Datastore({
  filename: __dirname + '/contacts.db',
  autoload: true
});


const server = micro(cors(router(
  get('/hello/:who', hello),
  post('/', async (req, res) => {
    const js = await json(req)
    const inserted = await db.insert(js)
    return inserted
  }),
  get('/', async (req, res) => {
    return await db.find({})
  }),
  put('/:id', async (req, res) => {
    console.log(req.params.id)
    const js = await json(req)
    await db.update({ _id: req.params.id }, { ...js })
    console.log(js)
    return await db.findOne({ _id: req.params.id })
  }),
  del('/:id', async (req, res) => {
    await db.remove({ _id: req.params.id })
    return { ok: true }
  }),
  get('/:id', async (req, res) => {
    return await db.findOne({ _id: req.params.id })
  }),
  get('/*', notfound)
)))

const PORT = process.env.PORT || 3000
server.listen(PORT)