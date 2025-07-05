import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import startDB from './config/db.js';
import processError from './src/middlewares/processError.middleware.js';

dotenv.config();
const app = express();
await startDB().then();

app.use(
  cors({
    origin: '*',
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Central error processing middleware
app.use(processError);

// Index Route
app.get('/', (request,response)=>{
  response.status(200).json({
    message: 'Weather App API Running'
});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('API server running', PORT);
});

export default app;