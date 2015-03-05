import ethereumJSON

class EthereumAPI:

    def __init__(self):
        self.json = ethereumJSON.EthereumJSON()

    # TODO: change to eth_sendTransaction
    def sendTransaction(self, code):
        return self.json.sendJSONRequest("eth_transact", {"code":code})

    # TODO: change to eth_compileSolidity
    def compileSolidity(self, contract):
        return self.json.sendJSONRequest("eth_solidity", contract)

eth = EthereumAPI()
source = open("contracts/WorkerDispatcher.sol", "r").read()
compiled = eth.compileSolidity(source)
eth.sendTransaction(compiled)
