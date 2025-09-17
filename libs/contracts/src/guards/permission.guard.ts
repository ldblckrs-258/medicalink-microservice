import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayloadDto } from '../dtos/auth.dto';
import {
  PERMISSIONS_KEY,
  PermissionRequirement,
} from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export interface PermissionContext {
  userId?: string;
  doctorId?: string;
  locationId?: string;
  appointmentId?: string;
  [key: string]: any;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionRequirement[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      // No permissions required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayloadDto;

    if (!user) {
      this.logger.warn('No user found in request - JWT guard should run first');
      throw new ForbiddenException('Authentication required');
    }

    // Get permission service from request context
    // This will be injected by a separate service in the API Gateway
    const permissionService = request['permissionService'];

    if (!permissionService) {
      this.logger.error('PermissionService not found in request context');
      throw new ForbiddenException('Permission service unavailable');
    }

    try {
      // Build permission context from request
      const permissionContext = this.buildPermissionContext(request, user);

      // Check all required permissions
      for (const requirement of requiredPermissions) {
        const hasPermission = await permissionService.hasPermission(
          user,
          requirement.resource,
          requirement.action,
          requirement.context
            ? { ...permissionContext, ...requirement.context }
            : permissionContext,
        );

        if (!hasPermission) {
          this.logger.warn(
            `User ${user.email} denied access - missing permission: ${requirement.resource}:${requirement.action}`,
          );
          throw new ForbiddenException(
            `Insufficient permissions. Required: ${requirement.resource}:${requirement.action}`,
          );
        }
      }

      this.logger.debug(
        `User ${user.email} granted access - all required permissions satisfied`,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('Error checking permissions:', error);
      throw new ForbiddenException('Permission check failed');
    }
  }

  private buildPermissionContext(
    request: Request,
    user: JwtPayloadDto,
  ): PermissionContext {
    const context: PermissionContext = {
      userId: user.sub,
    };

    // Extract context from route parameters
    const params = request.params;
    if (params) {
      if (params.id) {
        // Generic ID parameter
        context.resourceId = params.id;
      }
      if (params.userId) {
        context.targetUserId = params.userId;
      }
      if (params.doctorId) {
        context.doctorId = params.doctorId;
      }
      if (params.locationId) {
        context.locationId = params.locationId;
      }
      if (params.appointmentId) {
        context.appointmentId = params.appointmentId;
      }
      if (params.patientId) {
        context.patientId = params.patientId;
      }
    }

    // Extract context from query parameters
    const query = request.query;
    if (query) {
      if (query.locationId) {
        context.locationId = query.locationId as string;
      }
      if (query.doctorId) {
        context.doctorId = query.doctorId as string;
      }
    }

    // Extract context from request body for POST/PUT requests
    const body = request.body;
    if (body && typeof body === 'object') {
      if (body.locationId) {
        context.locationId = body.locationId;
      }
      if (body.doctorId) {
        context.doctorId = body.doctorId;
      }
    }

    return context;
  }
}
