contract WorkAgreement {
    address client;
    address worker;
    mapping (address => bool) testers;
    uint price;
    uint end;

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
}

contract WorkerDispatcher {
    struct Worker {
        string32 name;
        uint maxLength;
        uint price;
    }
    mapping (address => Worker) public workersInfo;
    uint numWorkers;
    mapping (uint => address) workerList;

    function buyContract(address worker, uint redundancy, uint price,
                         uint lenght) returns (address addr) {
        if (msg.value < lenght * price) return;
        if (workersInfo[worker].name == "") return;
        WorkAgreement wa = new WorkAgreement(msg.sender, worker,
                                             price, lenght);
        return wa;
    }

    function registerWorker(uint maxLength, uint price, string32 name) {
        workerList[numWorkers++] = msg.sender;
        Worker w = workersInfo[msg.sender];
        w.name = name;
        w.maxLength = maxLength;
        w.price = price;
    }

    function changeWorkerPrice(uint newPrice) {
        workersInfo[msg.sender].price = newPrice;
    }
}

