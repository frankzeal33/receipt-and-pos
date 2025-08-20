export function maskIDLog(id: string) {
  return id.replace(/(.{7}).+(.{7})/, "$1***$2");
}