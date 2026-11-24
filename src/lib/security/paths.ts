import path from "path";

export function safeJoin(root: string, ...parts: string[]) {
  if (parts.some((part) => part.includes("\0"))) {
    throw new Error("Invalid path");
  }
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(resolvedRoot, ...parts);
  if (target !== resolvedRoot && !target.startsWith(resolvedRoot + path.sep)) {
    throw new Error("Invalid path");
  }
  return target;
}

export function storageRoot() {
  return path.join(process.cwd(), "storage", "uploads");
}
