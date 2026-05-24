export const TOPIC_CATEGORIES = [
  'javascript',
  'react',
  'node',
  'system-design',
  'communication',
] as const

export const JS_TOPICS = [
  'Event Loop & Concurrency',
  'Closures & Lexical Scope',
  'Prototypal Inheritance',
  'Promises & Async/Await',
  'DOM Manipulation',
  'ES6+ Features',
  'Type Coercion & Equality',
  'this Keyword Context',
  'Modules (CJS/ESM)'
] as const;

export const REACT_TOPICS = [
  'Hooks (useState, useEffect)',
  'Context API',
  'Component Lifecycle',
  'Performance Optimization (memo, useMemo)',
  'Server Components',
  'State Management',
  'Routing'
] as const;

export type JSTopic = typeof JS_TOPICS[number];
export type ReactTopic = typeof REACT_TOPICS[number];
