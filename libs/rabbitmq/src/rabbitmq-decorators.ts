import { SetMetadata } from '@nestjs/common';
import { EVENT_TYPES, ROUTING_KEYS } from './rabbitmq-patterns';

// Metadata keys
export const RABBITMQ_EVENT_METADATA = 'rabbitmq:event';
export const RABBITMQ_PATTERN_METADATA = 'rabbitmq:pattern';
export const RABBITMQ_QUEUE_METADATA = 'rabbitmq:queue';

export function RabbitMQEvent(eventType: string) {
  return SetMetadata(RABBITMQ_EVENT_METADATA, eventType);
}

/**
 * Decorator để đánh dấu method là message pattern handler
 */
export function RabbitMQPattern(pattern: string) {
  return SetMetadata(RABBITMQ_PATTERN_METADATA, pattern);
}

/**
 * Decorator để đánh dấu class sử dụng queue cụ thể
 */
export function RabbitMQQueue(queueName: string) {
  return SetMetadata(RABBITMQ_QUEUE_METADATA, queueName);
}

/**
 * Decorator cho User Events
 */
export const UserEvent = (eventType: keyof typeof EVENT_TYPES) =>
  RabbitMQEvent(EVENT_TYPES[eventType]);

/**
 * Decorator cho Appointment Events
 */
export const AppointmentEvent = (eventType: keyof typeof EVENT_TYPES) =>
  RabbitMQEvent(EVENT_TYPES[eventType]);

/**
 * Decorator cho Content Events
 */
export const ContentEvent = (eventType: keyof typeof EVENT_TYPES) =>
  RabbitMQEvent(EVENT_TYPES[eventType]);

/**
 * Decorator cho Notification Events
 */
export const NotificationEvent = (eventType: keyof typeof EVENT_TYPES) =>
  RabbitMQEvent(EVENT_TYPES[eventType]);

/**
 * Decorator cho Routing Keys
 */
export const RoutingKey = (key: keyof typeof ROUTING_KEYS) =>
  SetMetadata('rabbitmq:routing-key', ROUTING_KEYS[key]);

/**
 * Decorator để đánh dấu method cần retry logic
 */
export function RabbitMQRetry(maxRetries: number = 3, delay: number = 1000) {
  return SetMetadata('rabbitmq:retry', { maxRetries, delay });
}

/**
 * Decorator để đánh dấu method có timeout
 */
export function RabbitMQTimeout(timeoutMs: number = 10000) {
  return SetMetadata('rabbitmq:timeout', timeoutMs);
}

/**
 * Decorator để đánh dấu method cần acknowledgment
 */
export function RabbitMQAck() {
  return SetMetadata('rabbitmq:ack', true);
}

/**
 * Decorator để đánh dấu method là dead letter handler
 */
export function RabbitMQDeadLetter() {
  return SetMetadata('rabbitmq:dead-letter', true);
}

/**
 * Decorator để đánh dấu method cần priority
 */
export function RabbitMQPriority(priority: number) {
  return SetMetadata('rabbitmq:priority', priority);
}

/**
 * Decorator để đánh dấu method cần correlation ID
 */
export function RabbitMQCorrelationId() {
  return SetMetadata('rabbitmq:correlation-id', true);
}
