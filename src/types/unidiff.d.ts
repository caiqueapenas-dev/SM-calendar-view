declare module "unidiff" {
  interface DiffObject {
    [key: string]: any;
  }

  interface FormatOptions {
    context?: number;
  }

  export function diffLines(oldStr: string, newStr: string): DiffObject;
  export function formatLines(
    diff: DiffObject,
    options?: FormatOptions
  ): string;
}
