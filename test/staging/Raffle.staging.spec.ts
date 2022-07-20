import { expect } from "chai"
import { assert } from "chai"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"
import { network, getNamedAccounts, deployments } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types"

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", function () {
          let raffle: Raffle
          let raffleEntranceFee: BigNumber
          let deployer: string

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fullfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, and chooses a random winner", async function () {
                  console.log("Setting up test...")
                  const accounts = await ethers.getSigners()
                  const startingTimestamp = await raffle.getLatestTimeStamp()

                  // Set up the listener since we have no control over the speed of the blockchain (could be super fast)
                  console.log("Setting up Listener...")
                  await new Promise<void>(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              const recentWinner =
                                  await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance =
                                  await ethers.provider.getBalance(deployer)
                              const endingTimeStamp =
                                  await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), deployer)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(raffleEntranceFee)
                                      .toString()
                              )
                              assert(endingTimeStamp > startingTimestamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })

                      // Enter the raffle
                      console.log("Entering Raffle...")
                      const tx = await raffle.enterRaffle({
                          value: raffleEntranceFee,
                      })
                      await tx.wait(1)
                      const winnerStartingBalance =
                          await accounts[0].getBalance()
                      console.log("Ok, time to wait...")
                  })

                  // Won't finish until promise resolves/rejects
                  // => Only happens when winner is chosen
              })
          })
      })
