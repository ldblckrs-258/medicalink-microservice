import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BlogCompositeService } from '../read-composition/blog-composite/blog-composite.service';
import { ORCHESTRATOR_EVENTS } from '@app/contracts/patterns';

/**
 * Event handler for blog events
 * Automatically invalidates cache when blog changes
 */
@Controller()
export class BlogEventHandler {
  private readonly logger = new Logger(BlogEventHandler.name);

  constructor(private readonly blogCompositeService: BlogCompositeService) {}

  // Helper to unwrap enveloped payloads
  private unwrapPayload<T>(payload: unknown): T {
    if (
      payload &&
      typeof payload === 'object' &&
      'timestamp' in (payload as any) &&
      'data' in (payload as any)
    ) {
      return (payload as any).data as T;
    }
    return payload as T;
  }

  /**
   * Handle blog created event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.BLOG_CREATED)
  async handleBlogCreated(@Payload() payload: unknown) {
    try {
      const data = this.unwrapPayload<{ blogId: string }>(payload);
      // Invalidate blog cache
      await this.blogCompositeService.invalidateBlogCache(data.blogId);
      await this.blogCompositeService.invalidateAllCache();

      this.logger.log(
        `Successfully invalidated cache for blog: ${data.blogId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle blog created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle blog updated event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.BLOG_UPDATED)
  async handleBlogUpdated(@Payload() payload: unknown) {
    try {
      const data = this.unwrapPayload<{ blogId: string }>(payload);

      // Invalidate blog cache
      await this.blogCompositeService.invalidateBlogCache(data.blogId);
      await this.blogCompositeService.invalidateAllCache();

      this.logger.log(
        `Successfully invalidated cache for blog: ${data.blogId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle blog updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle blog deleted event
   */
  @EventPattern(ORCHESTRATOR_EVENTS.BLOG_DELETED)
  async handleBlogDeleted(@Payload() payload: unknown) {
    try {
      const data = this.unwrapPayload<{ blogId: string }>(payload);

      // Invalidate blog cache
      await this.blogCompositeService.invalidateBlogCache(data.blogId);
      await this.blogCompositeService.invalidateAllCache();

      this.logger.log(
        `Successfully invalidated cache for blog: ${data.blogId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle blog deleted event: ${error.message}`,
        error.stack,
      );
    }
  }
}
