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
    type: (req) => !req.headers['content-type']?.includes('application/json'),
    limit: '50mb',
  }),
);

app.use(router);

app.use(errorHandler);

export default app;
