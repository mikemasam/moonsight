export interface Logger {
    kernel: (...args: any[]) => void;
    job: (...args: any[]) => void;
    byType: (logType: string, ...args: any[]) => boolean;
    byTypes: (logType: string[], ...args: any[]) => void;
    panic: (e: any) => never;
    handledExeception: (e: any) => void;
}
declare const logger: Logger;
export default logger;
