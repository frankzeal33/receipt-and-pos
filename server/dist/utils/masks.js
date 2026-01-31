export function maskIDLog(id) {
    return id.replace(/(.{7}).+(.{7})/, "$1***$2");
}
