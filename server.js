require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets/socket');

const server = http.createServer(app);

global.io =  initSocket(server);
const PORT = process.env.PORT || 5000;
server.get('/', (req, res) => res.send('Server is running'));
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
