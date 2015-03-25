#!/usr/bin/env python3

import json
import requests
import locale
import subprocess


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


def gen_contract_structures(filename):
    encoding = locale.getdefaultlocale()[1]
    output = subprocess.check_output(["solc " + filename +
                                      " --json-abi stdout"], shell=True)
    result = ""
    for row in output.decode(encoding):
        result += row.strip(' ').strip('\n')
    result = result.split('=======')[1:]

    struct = "let contractStructure = {}\n"
    for i in range(len(result)):
            if not i % 2:
                struct += "contractStructure." + result[i] + " = "
                struct += result[i+1].strip('ContractJSONABI') + '\n'
    struct += "\nexport default contractStructure;"

    structFile = open("src/fixtures/contractStructure.js", "w")
    structFile.write(struct)
    structFile.close()


def gen_contract_address(filename):
    eth_json = EthereumJSON()
    source = open(filename, "r").read()
    compiled = compile_solidity(eth_json, source)
    address = send_transaction(eth_json, compiled)
    addressFile = open("src/fixtures/contractAddress.js", "w")
    print(address)
    addressFile.write("let contractAddress = \"" + address + "\";"
                      "\n\nexport default contractAddress")
    addressFile.close()

filename = "contracts/WorkerDispatcher.sol"
gen_contract_address(filename)
gen_contract_structures(filename)

