if(typeof(Contracts)==="undefined") var Contracts={};
(function(module, Contracts) {
    var data={
        address: "0x0a0e0ec98a6aae0c7a14fbee3a5f7bdd0512a8ff",
        network: "rinkeby",
        endpoint: "https://rinkeby.infura.io/",
        abi: crypteriumWarsABI
    };
    Contracts["CrypteriumWars"]=data;
    module.exports=data;
})((typeof(module)==="undefined"?{}:module), Contracts);

(function (Contract) {
    var web3_instance;
    var instance;

    function init(cb) {
        web3_instance = new Web3(
            (window.web3 && window.web3.currentProvider) ||
            new Web3.providers.HttpProvider(Contract.endpoint));

        var contract_interface = web3_instance.eth.contract(Contract.abi);
        instance = contract_interface.at(Contract.address);
        cb();
    }

    function displayMyCommander() {
        // Issue: web3 does not find account...hard coded for now
        instance.getCommanderId("0x8f614CdB61E37B6f18d9705942c93FA86B04D711", function (error, result) {
            if (error) {
                alert(error);
            } else {
                if (result > 0) {
                    let commanderId = result - 1;
                    var commanderName;
                    instance.getCommanderName(commanderId, function (error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            commanderName = result;
                        }
                    });
                    instance.getCommanderDetails(commanderId, function (error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            let details = result;
                            $("#mycommander").empty();
                            $("#no-commander").css("visibility", "hidden");
                            $("#commander-name").css("visibility", "hidden");
                            $("#create-commander").css("visibility", "hidden");
                            $("#mycommander-text").css("visibility", "visible");
                            $("#mycommander").append(
                                `<div style="text-align: left">
                                    <span>Name: ${commanderName}</span>
                                    <br/>
                                    <span>Owner: ${details[0]}</span>
                                    <br/>
                                    <span>Crypterium: ${details[1]}</span>
                                    <br/>
                                    <span>HarvestReadyTime: ${details[2]}</span>
                                    <br/>
                                    <span>InfantryCount: ${details[3]}</span>
                                    <br/>
                                    <span>VehicleCount: ${details[4]}</span>
                                    <br/>
                                    <span>AircraftCount: ${details[5]}</span>
                                    <br/>
                                    <span>AttackReadyTime: ${details[6]}</span>
                                </div>`
                            );
                        }
                    });
                }
            }
        });
    }

    function displayAllCommanders() {
        $("#allcommanders").empty();
        instance.getCommanderCount(function (error, result) {
            if (error) {
                alert(error);
            } else {
                var commanderCount = result;
                for (var commanderId = 0; commanderId < commanderCount; commanderId++) {
                    var commanderName;
                    instance.getCommanderName(commanderId, function (error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            commanderName = result;
                        }
                    });
                    instance.getCommanderDetails(commanderId, function (error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            let details = result;
                            $("#allcommanders").append(
                                `<div style="text-align: left; border:1px solid black; margin-bottom: 15px;">
                                    <span>Name: ${commanderName}</span>
                                    <br/>
                                    <span>Owner: ${details[0]}</span>
                                    <br/>
                                    <span>Crypterium: ${details[1]}</span>
                                    <br/>
                                    <span>HarvestReadyTime: ${details[2]}</span>
                                    <br/>
                                    <span>InfantryCount: ${details[3]}</span>
                                    <br/>
                                    <span>VehicleCount: ${details[4]}</span>
                                    <br/>
                                    <span>AircraftCount: ${details[5]}</span>
                                    <br/>
                                    <span>AttackReadyTime: ${details[6]}</span>
                                </div>`
                            );
                        }
                    });
                }
            }
        });
    }

    function waitForReceipt(txHash, cb) {
        web3_instance.eth.getTransactionReceipt(txHash, function (error, receipt) {
            if (error) {
                alert(error);
            } else if (receipt != null) {
                cb(receipt);
            } else {
                window.setTimeout(function () {
                    waitForReceipt(txHash, cb);
                }, 1000);
            }
        });
    }

    function createCommander() {
        let name = $("#commander-name").val();
        if (name) {
            instance.createCommander.sendTransaction(name, {from: web3.eth.accounts[0], gas: 3000000}, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#create-commander").css("visibility", "hidden");
                    $("#commander-name").css("visibility", "hidden");
                    $("#no-commander").css("visibility", "hidden");
                    $("#create-commander-result").html("Creating your Commander...");
                    waitForReceipt(txHash, function (receipt) {
                        if (receipt.status === "0x1")  {
                            $("#create-commander-result").empty();
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#create-commander").css("visibility", "visible");
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Please input a name!");
        }
    }

    function harvestCrypterium() {
        instance.harvestCrypterium.sendTransaction({from: web3.eth.accounts[0], gas: 3000000}, function(error, txHash) {
            if (error) {
                alert(error);
            } else {
                $("#harvesting").css("visibility", "visible");
                waitForReceipt(txHash, function (receipt) {
                    if (receipt.status === "0x1")  {
                        alert("Harvesting was successfull!");
                        $("#harvesting").css("visibility", "hidden");
                        displayMyCommander();
                        displayAllCommanders();
                    } else {
                        $("#harvesting").css("visibility", "hidden")
                        alert("Receipt status fail!");
                    }
                });
            }
        });
    }

    function buyCrypterium() {
        let amount = parseInt($("#buy-amount").val())
        let val = amount * 100000000000000;
        if (amount && amount > 0) {
            instance.buyCrypterium.sendTransaction(amount, {from: web3.eth.accounts[0], gas: 3000000, value: val}, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#buy-successfull").css("visibility", "visible");
                    waitForReceipt(txHash, function (receipt) {
                        if (receipt.status === "0x1")  {
                            alert("Your purchase of " + amount + " Crypterium was successfull!");
                            $("#buy-successfull").css("visibility", "hidden");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#buy-successfull").css("visibility", "hidden")
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Input amount!")
        }

    }

    function produceInfantry() {
        let amount = parseInt($("#infantry-amount").val())
        if (amount && amount > 0) {
            instance.produceInfantry.sendTransaction(amount, {from: web3.eth.accounts[0], gas: 3000000}, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#producing-infantry").css("visibility", "visible");
                    waitForReceipt(txHash, function (receipt) {
                        if (receipt.status === "0x1")  {
                            alert("Production of " + amount + " Infantry units was successfull!");
                            $("#producing-infantry").css("visibility", "hidden");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#producing-infantry").css("visibility", "hidden")
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Input amount!")
        }
    }

    function produceVehicle() {
        let amount = parseInt($("#vehicle-amount").val())
        if (amount && amount > 0) {
            instance.produceVehicle.sendTransaction(amount, {from: web3.eth.accounts[0], gas: 3000000}, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#producing-vehicle").css("visibility", "visible");
                    waitForReceipt(txHash, function (receipt) {
                        if (receipt.status === "0x1")  {
                            alert("Production of " + amount + " Vehicle units was successfull!");
                            $("#producing-vehicle").css("visibility", "hidden");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#producing-vehicle").css("visibility", "hidden")
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Input amount!")
        }
    }

    function produceAircraft() {
        let amount = parseInt($("#aircraft-amount").val())
        if (amount && amount > 0) {
            instance.produceAircraft.sendTransaction(amount, {from: web3.eth.accounts[0], gas: 3000000}, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#producing-aircraft").css("visibility", "visible");
                    waitForReceipt(txHash, function (receipt) {
                        if (receipt.status === "0x1")  {
                            alert("Production of " + amount + " Aircraft units was successfull!");
                            $("#producing-aircraft").css("visibility", "hidden");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#producing-aircraft").css("visibility", "hidden")
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Input amount!")
        }
    }

    function attack() {
        let address = $("#attack-address").val();
        let amount = parseInt($("#attack-amount").val())
        if (address && amount && amount > 0) {
            instance.attack.sendTransaction(address, amount, {from: web3.eth.accounts[0], gas: 3000000}, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#attack-successfull").css("visibility", "visible");
                    waitForReceipt(txHash, function (receipt) {
                        if (receipt.status === "0x1")  {
                            alert("Battle for " + amount + " Crypterium has finished!");
                            $("#attack-successfull").css("visibility", "hidden");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#attack-successfull").css("visibility", "hidden")
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Input amount!")
        }
    }

    $(document).ready(function () {
        init(function () {
            displayMyCommander();
            displayAllCommanders();
        });
        $("#create-commander").click(function () {
            createCommander();
            $("#commander-name").val("");
        });
        $("#harvest").click(function () {
            harvestCrypterium();
        });
        $("#buy").click(function () {
            buyCrypterium();
            $("#buy-amount").val("");
        });
        $("#infantry").click(function () {
            produceInfantry();
            $("#infantry-amount").val("");
        });
        $("#vehicle").click(function () {
            produceVehicle();
            $("#vehicle-amount").val("");
        });
        $("#aircraft").click(function () {
            produceAircraft();
            $("#aircraft-amount").val("");
        });
        $("#attack").click(function () {
            attack();
            $("#attack-address").val("");
            $("#attack-amount").val("");
        });
    });
})(Contracts['CrypteriumWars']);
