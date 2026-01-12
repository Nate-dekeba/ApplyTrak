import express from 'express';
import cors from 'cors';
import {apiRouter} from './Routes/apiRoutes.js';
import {authRouter} from './Routes/AuthRouter.js';

const app = express();


// Middleware
app.use(cors());
app.use(express.json()); // Parse json request bodies

// Routes
app.use('/api/jobs', apiRouter);
app.use('/api/auth', authRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({message: 'Endpoint not found'});
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});