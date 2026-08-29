import express from 'express';
import backendApp from './backend/server.js';

const app = backendApp || express();

export default app;
