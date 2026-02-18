import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LoggingMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, body, query } = req;

        this.logger.log(`[DEBUG] ${method} ${originalUrl}`);
        if (Object.keys(query).length > 0) {
            this.logger.debug(`Query: ${JSON.stringify(query)}`);
        }
        if (method !== 'GET' && body && Object.keys(body).length > 0) {
            // Be careful not to log sensitive data like passwords in production, 
            // but for debug mode it's usually what we want.
            this.logger.debug(`Body: ${JSON.stringify(body)}`);
        }

        next();
    }
}
