// packages/thegrid/src/eda/events/event-bus.ts

/**
 * Simple in-memory event bus used throughout the Grid package. It allows
 * different modules to communicate via typed events without being directly
 * coupled to each other.
 */
import { EventType, EventPayloads } from "./types";

type Listener<T extends EventType> = (
  payload: EventPayloads[T]
) => void | Promise<void>;

type Listeners = {
  [K in EventType]?: Array<Listener<K>>;
};

/**
 * Creates a new event bus instance.
 *
 * @returns An object containing functions to subscribe to events, emit events
 * and introspect the bus.
 *
 * @example
 * ```ts
 * const bus = createEventBus();
 * bus.on('task.created', (payload) => {
 *   logger.info('Task created', payload);
 * });
 * bus.emit('task.created', { taskId: '1', taskName: 'Write docs', createdAt: new Date() });
 * ```
 */
export const createEventBus = () => {
  // Private state
  const listeners: Listeners = {};

  // Private methods
  const ensureEventExists = <T extends EventType>(event: T) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
  };

  // Public methods
  /**
   * Registers a listener for a specific event type.
   *
   * @param event - Event name to listen for
   * @param listener - Callback executed when the event is emitted
   *
   * @example
   * ```ts
   * bus.on('task.completed', payload => {
   *   logger.info(payload);
   * });
   * ```
   */
  const on = <T extends EventType>(event: T, listener: Listener<T>): void => {
    ensureEventExists(event);
    (listeners[event] as Array<Listener<T>>).push(listener);
  };

  /**
   * Emits an event to all registered listeners.
   *
   * @param event - Event name to emit
   * @param payload - Data associated with the event
   *
   * @example
   * ```ts
   * bus.emit('task.completed', { taskId: '1', taskName: 'Write docs', completedAt: new Date() });
   * ```
   */
  const emit = async <T extends EventType>(
    event: T,
    payload: EventPayloads[T]
  ): Promise<void> => {
    const eventListeners = listeners[event] as Array<Listener<T>> | undefined;

    if (!eventListeners?.length) return;

    await Promise.all(eventListeners.map((listener) => listener(payload)));
  };

  /**
   * Removes a previously registered listener from an event.
   *
   * @param event - Event name the listener was registered for
   * @param listener - The callback to remove
   */
  const off = <T extends EventType>(event: T, listener: Listener<T>): void => {
    const eventListeners = listeners[event] as Array<Listener<T>> | undefined;

    if (!eventListeners) return;

    listeners[event] = eventListeners.filter((l) => l !== listener) as any;
  };

  /**
   * Checks if any listeners are registered for an event.
   *
   * @param event - Event name
   */
  const hasListeners = <T extends EventType>(event: T): boolean => {
    return !!listeners[event]?.length;
  };

  // Debug helpers
  /**
   * Returns the number of listeners registered for an event.
   */
  const getListenerCount = <T extends EventType>(event: T): number => {
    return listeners[event]?.length || 0;
  };

  /**
   * Lists all events that currently have listeners registered.
   */
  const getAllRegisteredEvents = (): EventType[] => {
    return Object.keys(listeners) as EventType[];
  };

  // Return public interface
  return {
    on,
    emit,
    off,
    hasListeners,
    getListenerCount,
    getAllRegisteredEvents,
  };
};

// Create singleton instance
export const eventBus = createEventBus();
