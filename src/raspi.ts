
import type { Cluster } from 'model';
import type { ScheduledTask } from 'node-cron';
import type { OpenVPNProvider, VPN } from 'vpn';

import { spawn } from 'child_process';
import cron from 'node-cron';
import { buildId } from 'utils/ids';

const RASPI_OPENVPN_CLIENT_CONFIG = '/etc/openvpn/client/client.conf';
const RASPI_OPENVPN_CLIENT_LOGIN = '/etc/openvpn/client/login.conf';

class Raspi implements VPN {
    #provider: OpenVPNProvider;
    #connection: Cluster | null;
    #interface: string

    #cronTask: ScheduledTask;

    constructor(provider: OpenVPNProvider, networkInterface: string) {
        this.#provider = provider;
        this.#connection = null;
        this.#interface = networkInterface;

        this.#cronTask = cron.schedule('*/1 * * * *', () => {
            this.#checkIfVPNIsRunning();
        });
    }

    async connect(cluster: Cluster) {
        const configFile = await this.#provider.configuration(cluster);
        const authFile = await this.#provider.authentication();

        await this.#sudo('cp', [authFile, RASPI_OPENVPN_CLIENT_LOGIN]);
        await this.#sudo('/etc/raspap/openvpn/configauth.sh', [configFile, '1', this.#interface]);
        await this.#sudo('cp', [configFile, RASPI_OPENVPN_CLIENT_CONFIG]);
        await this.#sudo('/bin/systemctl', ['start', 'openvpn-client@client']);
        await this.#sudo('/bin/systemctl', ['enable', 'openvpn-client@client']);

        const isRunning = await this.#checkIfVPNIsRunning();
        if (!isRunning) {
            const id = buildId('Cluster', cluster.id);
            throw `Failed to connect to cluster ${id}`;
        }
        this.#connection = cluster;
    }
    
    async connected() {
        return this.#connection;
    }

    async clusters() {
        return await this.#provider.clusters();
    }

    async search(query: string) {
        return await this.#provider.search(query);
    }

    async disconnect() {
        if (this.#connection != null) {
            await this.#sudo('/bin/systemctl', ['stop', 'openvpn-client@client']);
            await this.#sudo('/bin/systemctl', ['disable', 'openvpn-client@client']);
            this.#connection = null;
        }
    }

    async dispose() {
        this.#cronTask.destroy();
        await this.disconnect();
        await this.#provider.dispose();
    }

    async #checkIfVPNIsRunning() {
        const pid = await this.#runCommand('pidof', ['openvpn']);
        const matches = pid.match(/^\s*[0-9]+\s*$/);
        const isRunning = matches != null && matches.length > 0;
        if (!isRunning) {
            this.#connection = null;
        }
        return isRunning;
    }

    async #sudo(command: string, args: string[] = []) {
        return await this.#runCommand('sudo', [command, ...args]);
    }

    #runCommand(command: string, args: string[] = []) {
        return new Promise<string>((resolve, reject) => {
            const output: string[] = [];
            const process = spawn(command, args);

            process.stdout.on('data', data => {
                output.push(data.toString());
            });
            process.on('exit', code => {
                if (code != null && code !== 0) {
                    reject(`Failed to run ${command} ${args.join(' ')}`);
                } else {
                    resolve(output.join('\n'));
                }
            });
        });
    }
}

export default Raspi;
