// Simple clsx utility without external dependency
export function clsx(...classes: (string | number | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
