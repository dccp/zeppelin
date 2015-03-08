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
                var method = document.createElement("input");
                method.setAttribute("type", "hidden");
                method.setAttribute("value", item["name"]);
                form.appendChild(method);
                for (var j=0; j<item["inputs"].length; j++) {
                    param = item["inputs"][j];
                    var label = document.createElement("label");
                    label.innerText = param["name"] + " :: " + param["type"];
                    form.appendChild(label);
                    form.appendChild(document.createElement("br"));
                    var input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("class", "form-control");
                    form.appendChild(input);
                    form.appendChild(document.createElement("br"));
                }
                var submit = document.createElement("input");
                submit.setAttribute("type", "submit");
                submit.setAttribute("class", "btn btn-default");
                form.appendChild(submit);
                var returnString = "";
                for (var j=0; j<item["outputs"].length; j++) {
                    returnString += ", " + item["outputs"][j]["name"] + " :: " + item["outputs"][j]["type"];
                }
                var returnString = "{" + returnString.substring(2) + "}";
                var title = item["name"] + " :: " + returnString;
                makeCollapsibleAndAppend(i, title, form);
            }
        }

        document.head.removeChild(structureScript);
    }, 10);
};

var makeCollapsibleAndAppend = function(id, title, content) {
    id = String.fromCharCode(97 + id);
    var heading = document.createElement("div");
    heading.setAttribute("class", "panel-heading");
    var h4 = document.createElement("h4");
    h4.setAttribute("class", "panel-title");
    var a = document.createElement("a");
    a.setAttribute("href", "#collapse" + id);
    a.setAttribute("data-toggle", "collapse");
    a.setAttribute("data-target", "#collapse" + id);
    a.setAttribute("class", "collapsed");
    a.innerText = title;
    h4.appendChild(a);
    heading.appendChild(h4);
    var collapse = document.createElement("div");
    collapse.setAttribute("id", "collapse" + id);
    collapse.setAttribute("class", "panel-collapse collapse");
    var body = document.createElement("div");
    body.setAttribute("class", "panel-body");
    body.appendChild(content);
    collapse.appendChild(body);
    document.getElementById("methods").appendChild(heading);
    document.getElementById("methods").appendChild(collapse);
}

var parseForm = function(form) {
    var method;
    var params = [];
    var inputs = form.getElementsByTagName("input");
    for (var i=0; i<inputs.length; i++) {
        if (inputs[i].getAttribute("type") === "hidden") {
            method = inputs[i].value;
        }
        else if (inputs[i].getAttribute("type") !== "submit") {
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
    }, 10);
}

