// @flow strict
import * as vite from 'vite';
import * as nodemon from 'nodemon';

export const startDevServers = async () => {
  nodemon()
  vite.createServer();
};


export const handleDevCommand = () => {
  
};