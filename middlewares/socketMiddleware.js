const socketMiddleware = (io) => (req, res, next) => {
  req.io = io;
  console.log('req.io attached:', req.io);
  next();
  };
  
  module.exports = socketMiddleware;
  