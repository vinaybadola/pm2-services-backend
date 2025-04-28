import express from 'express';
import pm2 from 'pm2';
import connectDB from './config/db-connect.js';
import { configDotenv } from 'dotenv';
import corsOptions from './config/cors-config.js';
const app = express();

configDotenv();
const port = process.env.PORT || 3000;

app.use(express.json());
corsOptions(app);
connectDB(); 

// Connect to PM2
pm2.connect((err) => {
    if (err) {
        console.error('Error connecting to PM2:', err);
        process.exit(1);
    }
    console.log('Connected to PM2');
});

// Routes
import dashboardRoutes from './src/routes/dashboard-route.js';
import authRoutes from './src/routes/auth-route.js';

app.get('/api/config', (req, res) => {
    res.json({ apiBaseUrl: process.env.WHATSAPP_API });
});

app.get("/", (req,res)=>{
    res.send("Hello World");
})

app.get('/', (req, res) => {
    return res.status(200).json({message: "Report Ok"})
});

app.use(express.static('public'));

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Disconnect from PM2 when the server stops
process.on('SIGINT', () => {
    pm2.disconnect();
    process.exit();
});

app.listen(port, () => {
    console.log(`PM2 Dashboard backend running on http://localhost:${port}`);
});