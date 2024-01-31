import { Connector } from '@wagmi/core';
import { UserRejectedRequestError, createWalletClient, custom, getAddress } from 'viem';
export class ParticleAuthConnector extends Connector {
    constructor({ chains, options, loginOptions, }) {
        super({
            chains,
            options,
        });
        this.id = 'particleAuth';
        this.name = 'Particle Auth';
        this.ready = true;
        this.onAccountsChanged = (accounts) => {
            if (accounts.length === 0)
                this.emit('disconnect');
            else
                this.emit('change', { account: getAddress(accounts[0]) });
        };
        this.onChainChanged = (chainId) => {
            const id = Number(chainId);
            const unsupported = this.isChainUnsupported(id);
            this.emit('change', { chain: { id, unsupported } });
        };
        this.onDisconnect = () => {
            this.emit('disconnect');
        };
        this.loginOptions = loginOptions;
    }
    async connect({ chainId } = {}) {
        var _a, _b;
        try {
            const provider = await this.getProvider();
            provider.on('accountsChanged', this.onAccountsChanged);
            provider.on('chainChanged', this.onChainChanged);
            provider.on('disconnect', this.onDisconnect);
            this.emit('message', { type: 'connecting' });
            // Switch to chain if provided
            let id = await this.getChainId();
            let unsupported = this.isChainUnsupported(id);
            if (chainId && id !== chainId) {
                const chain = await this.switchChain(chainId);
                id = chain.id;
                unsupported = this.isChainUnsupported(id);
            }
            if (!((_a = this.client) === null || _a === void 0 ? void 0 : _a.auth.isLogin())) {
                await ((_b = this.client) === null || _b === void 0 ? void 0 : _b.auth.login(this.loginOptions));
            }
            const account = await this.getAccount();
            return {
                account,
                chain: { id, unsupported },
            };
        }
        catch (error) {
            if (error.code === 4011)
                throw new UserRejectedRequestError(error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.provider)
            return;
        const provider = await this.getProvider();
        provider.removeListener('accountsChanged', this.onAccountsChanged);
        provider.removeListener('chainChanged', this.onChainChanged);
        provider.removeListener('disconnect', this.onDisconnect);
        provider.disconnect();
    }
    async getAccount() {
        const provider = await this.getProvider();
        const accounts = await provider.request({
            method: 'eth_accounts',
        });
        // return checksum address
        return getAddress(accounts[0]);
    }
    async getChainId() {
        const provider = await this.getProvider();
        const chainId = await provider.request({ method: 'eth_chainId' });
        return Number(chainId);
    }
    async getProvider() {
        if (!this.provider) {
            const [{ ParticleNetwork }, { ParticleProvider }] = await Promise.all([
                import('@particle-network/auth'),
                import('@particle-network/provider'),
            ]);
            this.client = new ParticleNetwork(this.options);
            this.provider = new ParticleProvider(this.client.auth);
        }
        return this.provider;
    }
    async getWalletClient({ chainId } = {}) {
        const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()]);
        const chain = this.chains.find((x) => x.id === chainId);
        if (!provider)
            throw new Error('provider is required.');
        return createWalletClient({
            account,
            chain,
            transport: custom(provider),
        });
    }
    async isAuthorized() {
        try {
            await this.getProvider();
            return this.client.auth.isLogin() && this.client.auth.walletExist();
        }
        catch (_a) {
            return false;
        }
    }
    async switchChain(chainId) {
        var _a;
        const provider = await this.getProvider();
        const id = `0x${chainId.toString(16)}`;
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: id }],
        });
        return ((_a = this.chains.find((x) => x.id === chainId)) !== null && _a !== void 0 ? _a : {
            id: chainId,
            name: `Chain ${id}`,
            network: `${id}`,
            nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
            rpcUrls: { default: { http: [''] }, public: { http: [''] } },
        });
    }
}
