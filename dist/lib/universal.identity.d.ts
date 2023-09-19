declare function UID(): {
    basic: (size?: number) => string;
    uuid: () => string;
};
declare namespace UID {
    var uuid: () => string;
    var basic: (size?: number) => string;
    var entity: (_type: string, seq: string | undefined) => (string | boolean)[];
    var latestVersion: (version: any, minVersion: any) => boolean;
}
export default UID;
