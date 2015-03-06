var pageLoad = function () {
    generateMethodForms();
}

var generateMethodForms = function() {
    var structureScript = document.createElement("script");
    structureScript.setAttribute("src", "js/contractStructure.js");
    document.head.appendChild(structureScript);

    setTimeout(function() {
        for (var i=0; i<contractStructure.length; i++) {
            item = contractStructure[i];
            if (item["type"] === "function" && !item["constant"]) {
                var form = document.createElement("form");
                form.setAttribute("onsubmit", "event.preventDefault(); return parseForm(this);");
                var h1 = document.createElement("h1");
                h1.innerText = item["name"];
                form.appendChild(h1);
                for (var j=0; j<item["inputs"].length; j++) {
                    param = item["inputs"][j];
                    var description = document.createElement("span");
                    description.innerText = param["name"] + " :: " + param["type"];
                    form.appendChild(description);
                    form.appendChild(document.createElement("br"));
                    var input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("name", param["name"]);
                    form.appendChild(input);
                    form.appendChild(document.createElement("br"));
                }
                var submit = document.createElement("input");
                submit.setAttribute("type", "submit");
                form.appendChild(submit);
                document.getElementById("methods").appendChild(form);
            }
        }

        document.head.removeChild(structureScript);
    }, 1);
};

var parseForm = function(form) {
    var method = form.getElementsByTagName("h1")[0].innerText;
    method = method.substring(0, method.indexOf("("));
    var params = [];
    var inputs = form.getElementsByTagName("input");
    for (var i=0; i<inputs.length; i++) {
        if (inputs[i].getAttribute("type") !== "submit") {
            params[params.length] = inputs[i].value;
        }
    }
    sendToContract(method, params);
    return false;
}

var sendToContract = function(method, params) {
    var addressScript = document.createElement("script");
    var structureScript = document.createElement("script");
    addressScript.setAttribute("src", "js/contractAddress.js");
    structureScript.setAttribute("src", "js/contractStructure.js");
    document.head.appendChild(addressScript);
    document.head.appendChild(structureScript);
    setTimeout(function() {
        var contract = web3.eth.contract(contractAddress, contractStructure);
        document.head.removeChild(addressScript);
        document.head.removeChild(structureScript);

        var paramsString = "";
        for (var i=0; i<params.length; i++) {
            paramsString += ",\"" + params[i] + "\"";
        }
        paramsString = paramsString.substring(1);

        eval("contract." + method + "(" + paramsString + ");");
    }, 1);
}

