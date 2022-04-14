/* eslint-disable no-console */
import * as redis from 'redis';

const client = redis.createClient({
  socket: {
    port: 6379,
    host: '127.0.0.1'
  }
});

(async () => {
  await client.connect();
})();

client.on('connect', () => {
  console.log('Client connected to redis...');
});

client.on('ready', () => {
  console.log('Client connected to redis and ready to use...');
});

client.on('error', (err) => {
  console.log(JSON.parse(JSON.stringify(err)));
  console.log(err.message);
});

client.on('end', () => {
  console.log('Client disconnected from redis');
});

process.on('SIGINT', () => {
  client.quit();
});

export default client;
