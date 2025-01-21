export default class CancellationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CancellationError";
    }
}
