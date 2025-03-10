import { Address } from "@ton/core";
import { Example } from "../wrappers/SomethingBeyond";
import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    const JETTON_MASTER_ADDRESS = Address.parse("EQBIG1wzMEn98Z0g50NnjPxCngm_2I3ml-tvUG6eD52z_0BG");
    const jettonWallet = provider.open(Example.fromAddress(JETTON_MASTER_ADDRESS));
    
    const jettonWalletAddress = await jettonWallet.getGetMyJettonWalletAddress();
    
    console.log('Jetton Wallet Address:', jettonWalletAddress?.toString() ?? 'null');
}