import { Address, toNano, Cell, beginCell, storeStateInit } from "@ton/core";
import { Example } from "../wrappers/SomethingBeyond"; // Ensure this import matches your actual wrapper path
import { NetworkProvider } from "@ton/blueprint";
import fs from "fs"; // For reading the .boc file

// Function to calculate jetton wallet address (mirrors the logic in the Tact contract)
function calculateJettonWalletAddress(
    ownerAddress: Address,
    jettonMasterAddress: Address,
    jettonWalletCode: Cell
): Address {
    // Create data cell similar to JettonWalletData in the contract
    const dataCell = beginCell()
        .storeCoins(0) // balance: 0
        .storeAddress(ownerAddress) // ownerAddress
        .storeAddress(jettonMasterAddress) // jettonMasterAddress
        .storeRef(jettonWalletCode) // jettonWalletCode
        .endCell();
    
    // Create state init similar to the contract's calculation
    const stateInit = beginCell()
        .store(storeStateInit({ code: jettonWalletCode, data: dataCell }))
        .endCell();
    
    // Calculate contract address from state init
    return contractAddress(0, stateInit);
}

// Helper function to calculate contract address from state init
function contractAddress(workchain: number, stateInit: Cell): Address {
    // Hash the state init to get the address
    const hash = stateInit.hash();
    return new Address(workchain, hash);
}

export async function run(provider: NetworkProvider) {
    // Jetton Master contract address
    const JETTON_MASTER_ADDRESS = Address.parse("kQCKhnGsFYlQ0jyTLhyxA5fB_VpxzKHx9dYZJY_hTT6qJYfv");

    // Load Jetton Wallet code from the .boc file
    const jettonWalletCode = Cell.fromBoc(
        fs.readFileSync("./WC/tact_JettonDefaultWallet.code.boc")
    )[0]; // Ensure the path is correct

    console.log("Jetton Wallet Code loaded from .boc file");

    // Initialize Example contract with required parameters
    const example = provider.open(
        await Example.fromInit(jettonWalletCode, JETTON_MASTER_ADDRESS)
    );

    // Get the contract address
    const contractAddress = example.address.toString();
    console.log("Contract deployment address:", contractAddress);

    // Calculate the jetton wallet address using our function
    // This should match exactly what the contract calculates during init
    const jettonWalletAddress = calculateJettonWalletAddress(
        example.address, // The contract's own address as the owner
        JETTON_MASTER_ADDRESS,
        jettonWalletCode
    );
    
    // Deploy the contract
    console.log("Deploying...");    
    await example.send(
        provider.sender(),
        {
            value: toNano("0.5"), // Adjust gas fees as needed
        },
        {
            $$type: "Deploy",
            queryId: 0n
        }
    );
    
    console.log("Contract deployed successfully!");
    
    // Print detailed instructions with the calculated jetton wallet address
    console.log("\n=== JETTON FUNDING INSTRUCTIONS ===");
    console.log(`To fund this contract with Jettons, send them to:`);
    console.log(`Jetton Wallet Address: ${jettonWalletAddress.toString()}`);
    console.log("\nAfter sending Jettons to this address, you can:");
    console.log("1. Use the contract to withdraw Jettons up to your balance");
    console.log("2. Send a Withdraw message with the amount you wish to withdraw");
}