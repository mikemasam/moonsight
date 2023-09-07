import logger from "./logger";

export default function AppCleanup() {
  const cleanups: { name: string; action: () => void }[] = [];
  const add = (name: string, action: () => void) => {
    cleanups.push({ name, action });
  };
  const dispose = () => {
    for (let i = 0; i < cleanups.length; i++) {
      const cl = cleanups[i];
      Promise.resolve(cl.action())
        .then(() => {
          logger.kernel(`cleaning up ${cl.name}`);
        })
        .catch((er) => {
          logger.kernel(`cleaning up ${cl.name} - Error ${er}`);
        });
    }
  };
  return {
    add,
    dispose,
  };
}
