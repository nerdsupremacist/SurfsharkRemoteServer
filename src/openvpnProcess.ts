
import type { ChildProcess } from 'child_process';

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export default class OpenVPNProcess {
    events: EventEmitter = new EventEmitter();
    #vpnAddress: string | null = null;
    #process: ChildProcess | null = null;

    constructor(private vpnOpts: string[], private executablePath?: string) {
    }

    private getExecutablePath(): string {
        return this.executablePath ? this.executablePath : 'openvpn';
    }

    static checkIP(data: string): RegExpMatchArray | null {
        return data.match(/(?:ifconfig ([0-9.]+) [0-9.]+)/);
    }

    connect() {
        this.#process = spawn('sudo', ['-S', this.getExecutablePath(), ...this.vpnOpts]);
        this.#process?.stdout?.on('data', (data: unknown[]) => {
            const output: string = data.toString();

            const results = OpenVPNProcess.checkIP(output);
            if (results != null && results.length > 2)
                this.#vpnAddress = results[1];

            this.events.emit('data', output);
            if (output.match('Initialization Sequence Completed'))
                this.events.emit('connected');
        });
        this.#process?.stdout?.on('close', () => this.events.emit('disconnected'));
    }

    disconnect() {
        const pid = this.#process?.pid;
        if (pid != null) {
            spawn('sudo', ['kill', pid.toString()]);
        }
    }
}
