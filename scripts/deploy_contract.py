#!/usr/bin/env python3

import json
import requests


class EthereumJSON:

    def __init__(self):
        self.id = 0

    def _get_id(self):
        self.id += 1
        return self.id

    def sendJSONRequest(self, method, *params):
        data = json.dumps({"jsonrpc": "2.0", "method": method,
                           "params": params, "id": self._get_id()})
        response = requests.post("http://localhost:8080", data=data)
        jsondata = response.json()
        if 'result' in jsondata:
            return jsondata['result']
        else:
            return jsondata['error']


def send_transaction(eth_json, code):
    return eth_json.sendJSONRequest("eth_sendTransaction", {"code": code})


def compile_solidity(eth_json, contract):
    return eth_json.sendJSONRequest("eth_compileSolidity", contract)

eth_json = EthereumJSON()
source = open("contracts/WorkerDispatcher.sol", "r").read()
compiled = compile_solidity(eth_json, source)
address = send_transaction(eth_json, compiled)
addressFile = open("src/fixtures/contractAddress.js", "w")
addressFile.write("let contractAddress = \"" + address + "\";"
                  "\n\nexport default contractAddress")

# TODO - parse output from:
# solc --input-file WorkerDispatcher.sol --json-abi stdout
# should be two variables, workerDispatcherStruct and workAgreementStruct

