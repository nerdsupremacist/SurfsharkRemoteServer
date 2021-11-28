
import process from 'process';

type InternalOptions = {
    cleanup: true,
} | {
    exit: true,
}

type Options = InternalOptions & {
    exitCode: number | undefined,
}

export default function handleExit(exitHandler: (options: Options) => Promise<void>) {
    process.stdin.resume();

    async function handlerWrapper(options: InternalOptions, exitCode: number | undefined) {
        await exitHandler({
            ...options,
            exitCode,
        });
    }

    process.on('beforeExit', handlerWrapper.bind(null, { cleanup: true }));
    process.on('exit', handlerWrapper.bind(null, { cleanup: true }));
    process.on('SIGINT', handlerWrapper.bind(null, { exit: true }));
    process.on('SIGUSR1', handlerWrapper.bind(null, { exit: true }));
    process.on('SIGUSR2', handlerWrapper.bind(null, { exit: true }));
    process.on('uncaughtException', handlerWrapper.bind(null, { exit: true }));
}
