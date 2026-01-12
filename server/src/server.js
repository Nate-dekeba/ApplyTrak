import express from 'express';
import cors from 'cors';
import {apiRouter} from './Routes/apiRoutes.js';
import {authRouter} from './Routes/AuthRouter.js';

const app = express();


// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // Parse json request bodies

// Routes
app.use('/api/jobs', apiRouter);
app.use('/api/auth', authRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({message: 'Endpoint not found'});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});