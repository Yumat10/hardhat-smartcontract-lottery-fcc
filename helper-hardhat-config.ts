// I. Get our subcription Id for Chainlink VRF
// II. Fund the Chainlink VRF subscription
// III. Deploy the contract
// IV. Register the contract with Chainlink VRF and its subscription Id
// V. Register the contract with Chainlink Keepers
// VI. Run staging tests

import { ethers } from "ethers"

export interface networkConfigItem {
    name?: string

    subscriptionId?: string
    gasLane?: string
    keepersUpdateInterval?: string
    raffleEntranceFee?: string
    callbackGaslimit?: string
    vrfCoordinatorV2?: string

    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        blockConfirmations: 6,
        raffleEntranceFee: ethers.utils.parseEther("0.01").toString(),
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "8891",
        callbackGaslimit: "500000",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "hardhat",
        raffleEntranceFee: ethers.utils.parseEther("0.01").toString(),
        callbackGaslimit: "500000",
        keepersUpdateInterval: "30",
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    },
}

export const developmentChains = ["hardhat", "localhost"]
