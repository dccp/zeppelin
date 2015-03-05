import ethereumJSON

class EthereumAPI:

    def __init__(self):
        self.json = ethereumJSON.EthereumJSON()

    def transact(self, code):
        return self.json.sendJSONRequest("eth_transact", json.dumps({"code":code}))

    # TODO: change to eth_compileSolidity
    def compileSolidity(self, contract):
        return self.json.sendJSONRequest("eth_solidity", contract)

eth = EthereumAPI()
source = open("WorkerDispatcher.sol", "r").read()
compiled = eth.compileSolidity(source)
print eth.transact(compiled)
