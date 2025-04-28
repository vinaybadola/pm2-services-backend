import cors from "cors"
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const corsOptions = (app)=>{
    app.use(cors({
        origin: ["http://localhost:3000", "http://localhost:3001", "http://10.253.71.78:3007"], 
        methods: ["GET", "POST", "PUT"], 
        credentials: true,
        allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
        exposedHeaders: ["Authorization"]
    }));

    app.use(cookieParser());
    app.use(helmet());
    app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
};

export default corsOptions;