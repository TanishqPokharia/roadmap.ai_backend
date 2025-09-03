declare namespace Express {
    interface Request {
        token?: string;
        useragent?: any;
    }
}