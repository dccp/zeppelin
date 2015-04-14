contract WorkAgreement {
    address client;
    address worker;
    mapping (address => bool) testers;
    uint price;
    uint end;
    // ip of worker
    bytes32 ip;
    // port for docker transfer
    uint dtport;
    // port for hosting
    uint port;

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

    function setWorkerIP(bytes32 _ip, uint _dtport) {
        if (msg.sender == worker) {
            ip = _ip;
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
        uint maxLength;
        uint price;
        address agreement;
    }
    mapping (address => Worker) public workersInfo;
    uint public numWorkers;
    mapping (uint => address) public workerList;

    function buyContract(address worker, uint redundancy, uint length)
                returns (address addr) {
        if (msg.value < length * workersInfo[worker].price &&
            workersInfo[worker].name == "" &&
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

    function registerWorker(uint maxLength, uint price, bytes32 name) {
        if (workersInfo[msg.sender].name == "") {
            workerList[numWorkers++] = msg.sender;
        }
        Worker w = workersInfo[msg.sender];
        w.name = name;
        w.maxLength = maxLength;
        w.price = price;
        w.agreement = 0;
    }

    function changeWorkerPrice(uint newPrice) {
        workersInfo[msg.sender].price = newPrice;
    }
}

