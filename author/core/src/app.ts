import express from 'express';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(requestLogger);

app.use(router);

app.use(errorHandler);

export default app;
