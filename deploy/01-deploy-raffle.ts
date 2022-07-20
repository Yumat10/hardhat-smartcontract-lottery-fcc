import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { VRFCoordinatorV2Mock } from "../typechain-types/@chainlink/contracts/src/v0.8/mocks"
import verify from "../utils/verify"

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

const deployRaffle: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId || -1

    let vrfCoordinatorV2Address, subscriptionId

    log("---deployRaffle---")

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock =
            await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse =
            await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events
            ? transactionReceipt.events[0].args?.subId
            : ""
        // Fund the subscription
        await vrfCoordinatorV2Mock.fundSubscription(
            subscriptionId,
            VRF_SUB_FUND_AMOUNT
        )
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    const entranceFee = networkConfig[chainId].raffleEntranceFee
    const gasLane = networkConfig[chainId].gasLane
    const callbackGaslimit = networkConfig[chainId].callbackGaslimit
    const interval = networkConfig[chainId].keepersUpdateInterval

    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGaslimit,
        interval,
    ]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : networkConfig[network.config.chainId!].blockConfirmations

    const raffle = await deploy("Raffle", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("Vetifying...")
        await verify(raffle.address, args)
        log("-------------------------------")
    }
}

export default deployRaffle
deployRaffle.tags = ["all", "raffle"]
