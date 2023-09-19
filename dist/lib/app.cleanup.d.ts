export default function AppCleanup(): {
    add: (name: string, action: () => void) => void;
    dispose: () => void;
};
