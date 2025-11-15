import express from 'express';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  express.raw({
    type: '*/*', // Accept all content types
    limit: '50mb', // Adjust limit based on your needs
  }),
);

app.use(router);

app.use(errorHandler);

export default app;
