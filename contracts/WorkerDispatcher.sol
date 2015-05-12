contract WorkAgreement {
    address client;
    address worker;
    mapping (address => bool) testers;
    uint public price;
    uint public end;
    // port for docker transfer
    uint public dtport;
    // port for hosting
    uint public port;

    function WorkAgreement(address _client, address _worker, uint _price,
                           uint length) {
        client = _client;
        worker = _worker;
        price = _price;
        end = length;
    }

    function addTester(address tester) {
        testers[tester] = true;
    }

    function setWorkerDtPort(uint _dtport) {
        if (msg.sender == worker) {
            dtport = _dtport;
        }
    }

    function setWorkerPort(uint _port) {
        if (msg.sender == worker) {
            port = _port;
        }
    }
}

contract WorkerDispatcher {
    struct Worker {
        bytes32 name;
        bytes32 ip;
        uint maxLength;
        uint price;
        address agreement;
    }
    mapping (address => Worker) public workersInfo;
    uint public numWorkers;
    mapping (uint => address) public workerList;

    function buyContract(address worker, uint redundancy, uint length)
                returns (address addr) {
        if (workersInfo[worker].name == "" &&
            workersInfo[worker].maxLength < length) return msg.sender;
        WorkAgreement wa = new WorkAgreement(msg.sender, worker,
                                             workersInfo[worker].price,
                                             length);
        workersInfo[worker].agreement = wa;
        // TODO - create better way to asign testers
        /*
        for (uint i = 1; i < 3; i++) {
            uint n = uint(block.blockhash(block.number - i)) % numWorkers;
            if (workerList[n] == worker) continue;
            wa.addTester(workerList[n]);
        }*/
        return wa;
    }

    function registerWorker(uint maxLength, uint price,
                            bytes32 name, bytes32 ip) {
        if (workersInfo[msg.sender].name == "") {
            workerList[numWorkers++] = msg.sender;
        }
        Worker w = workersInfo[msg.sender];
        w.name = name;
        w.ip = ip;
        w.maxLength = maxLength;
        w.price = price;
        w.agreement = 0;
    }

    function changeWorkerPrice(uint newPrice) {
        workersInfo[msg.sender].price = newPrice;
    }
}

