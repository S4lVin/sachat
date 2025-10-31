import 'dotenv/config'
import { server } from './http/server.js'

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Server running on port ${port}`))
