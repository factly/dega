export function maker(string: string): string {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export const checker: RegExp = new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$");
