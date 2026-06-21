import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
