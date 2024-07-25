import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import secretaryRoutes from './routes/secretaryRoutes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/secretary', secretaryRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/your-database', {})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB', error));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
