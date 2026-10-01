import express from 'express';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middlewares/requestLogger';
import config from './config/config';

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use(router);

app.use(errorHandler);

export default app;
