/* eslint-disable no-console */
import mongoose from 'mongoose';
import config, { IConfig } from './config';

const db = config(process.env.NODE_ENV as keyof IConfig);

const initDB = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(db?.DATABASE || '')
    .then(() => {
      console.log('Successfully connect to database.');
    })
    .catch(() => {
      console.log('Can not connect to database');
      process.exit();
    });

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to db...');
  });

  mongoose.connection.on('error', err => {
    console.log(`${err.message}...`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection is disconnected...');
  });
};

export const conn = mongoose.connection;

export default initDB;
