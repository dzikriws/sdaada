import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        let message = 'Request successful';

        const entityId = data?.id || data?.userId || data?.productId || null;
        const entityName = data?.username || data?.name || null;
        const uniqueId = request.params?.id;

        if (
          data === null ||
          data === undefined ||
          (Array.isArray(data) && data.length === 0)
        ) {
          response.status(404);
          return {
            success: false,
            message: `Cannot find data with ID ${uniqueId} in ${path.replace('/', '').split('/')[0]}`,
          };
        }

        switch (method) {
          case 'POST':
            message = `Created ${path.replace('/', ' ')} ${entityName ? `"${entityName}"` : ''} ${
              entityId ? `with ID ${entityId}` : ' '
            }`;
            break;
          case 'PUT':
            message = `Updated ${path.replace('/', ' ')} ${entityName ? `"${entityName}"` : ''} ${
              entityId ? `with ID ${entityId}` : ''
            }`;
            break;
          case 'DELETE':
            message = `Deleted ${path.replace('/', '')} ${entityId ? `with ID ${entityId}` : ''}`;
            break;
          case 'GET':
          default:
            message = uniqueId
              ? `Fetched ID ${uniqueId} in ${path.replace('/', '').split('/')[0]} successfully`
              : `Fetched all data in ${path.replace('/', '').split('/')[0]} successfully`;
        }

        return {
          success: true,
          message: message.trim(),
          data,
        };
      }),
    );
  }
}
