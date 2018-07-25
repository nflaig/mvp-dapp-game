if (typeof(Contracts) === "undefined") var Contracts = {};
(function(module, Contracts) {
    var data = {
        address: "YOUR_CONTRACT_ADDRESS",
        network: "local",
        endpoint: "http://127.0.0.1:8545/",
        abi: crypteriumWarsABI
    };
    Contracts["CrypteriumWars"] = data;
    module.exports = data;
})((typeof(module) === "undefined" ? {} : module), Contracts);

(function(Contract) {
    var web3_instance;
    var instance;
    var currentAccount;

    function init(cb) {
        window.addEventListener('load', function() {
            // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            if (typeof web3 !== 'undefined') {
                // Use the browser's ethereum provider
                web3_instance = new Web3(
                    (window.web3 && window.web3.currentProvider) ||
                    new Web3.providers.HttpProvider(Contract.endpoint));

                var contract_interface = web3_instance.eth.contract(Contract.abi);
                instance = contract_interface.at(Contract.address);
                cb();
            } else {
                alert("No Web3? You should consider trying MetaMask!");
                window.location.reload();
            }
        });
    }

    function checkAccount() {
        setInterval(function() {
            web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.log(error);
                } else {
                    if (accounts.length == 0) {
                        alert("Please unlock your MetaMask Accounts!");
                        checkAccount();
                    } else if (accounts[0] !== currentAccount) {
                        currentAccount = accounts[0];
                        displayMyCommander();
                    }
                }
            });
        }, 500);
    }

    function displayMyCommander() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            } else {
                if (accounts.length != 0) {
                    instance.getCommanderId(accounts[0], function(error, result) {
                        if (error) {
                            console.log(error);
                        } else {
                            if (result > 0) {
                                let commanderId = result - 1;
                                let commanderName;
                                instance.getCommanderName(commanderId, function(error, result) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        commanderName = result;
                                    }
                                });
                                instance.getCommanderDetails(commanderId, function(error, result) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        $("#mycommander").empty();
                                        $("#no-commander").css("display", "none");
                                        $("#commander-name").css("display", "none");
                                        $("#create-commander").css("display", "none");
                                        $("#mycommander-text").css("display", "inline");
                                        $("#mycommander").append(
                                            `<span>Name: ${commanderName}</span>
                                            <br/>
                                            <span>Owner: ${result[0]}</span>
                                            <br/>
                                            <span>Crypterium: ${result[1]}</span>
                                            <br/>
                                            <span>HarvestReadyTime: ${result[2]}</span>
                                            <br/>
                                            <span>InfantryCount: ${result[3]}</span>
                                            <br/>
                                            <span>VehicleCount: ${result[4]}</span>
                                            <br/>
                                            <span>AircraftCount: ${result[5]}</span>
                                            <br/>
                                            <span>AttackReadyTime: ${result[6]}</span>`
                                        );
                                    }
                                });
                            } else {
                                $("#mycommander").empty();
                                $("#no-commander").css("display", "block");
                                $("#commander-name").css("display", "inline");
                                $("#create-commander").css("display", "inline");
                                $("#mycommander-text").css("display", "none");
                            }
                        }
                    });
                }
            }
        });
    }

    function displayAllCommanders() {
        $("#allcommanders").empty();
        instance.getCommanderCount(function(error, result) {
            if (error) {
                console.log(error);
            } else {
                let commanderCount = result;
                for (var commanderId = 0; commanderId < commanderCount; commanderId++) {
                    let commanderName;
                    instance.getCommanderName(commanderId, function(error, result) {
                        if (error) {
                            console.log(error);
                        } else {
                            commanderName = result;
                        }
                    });
                    instance.getCommanderDetails(commanderId, function(error, result) {
                        if (error) {
                            console.log(error);
                        } else {
                            $("#allcommanders").append(
                                `<div style="text-align: left; border:1px solid black; margin-bottom: 15px;">
                                    <span>Name: ${commanderName}</span>
                                    <br/>
                                    <span>Owner: ${result[0]}</span>
                                    <br/>
                                    <span>Crypterium: ${result[1]}</span>
                                    <br/>
                                    <span>HarvestReadyTime: ${result[2]}</span>
                                    <br/>
                                    <span>InfantryCount: ${result[3]}</span>
                                    <br/>
                                    <span>VehicleCount: ${result[4]}</span>
                                    <br/>
                                    <span>AircraftCount: ${result[5]}</span>
                                    <br/>
                                    <span>AttackReadyTime: ${result[6]}</span>
                                </div>`
                            );
                        }
                    });
                }
            }
        });
    }

    function waitForReceipt(txHash, cb) {
        web3_instance.eth.getTransactionReceipt(txHash, function(error, receipt) {
            if (error) {
                console.log(error);
            } else if (receipt != null) {
                cb(receipt);
            } else {
                window.setTimeout(function() {
                    waitForReceipt(txHash, cb);
                }, 1000);
            }
        });
    }

    function createCommander() {
        let name = $("#commander-name").val();
        if (name) {
            instance.createCommander.sendTransaction(name, {
                from: currentAccount,
                gas: 3000000
            }, function(error, txHash) {
                if (error) {
                    console.log(error);
                } else {
                    $("#no-commander").css("display", "none");
                    $("#commander-name").css("display", "none");
                    $("#create-commander").css("display", "none");
                    $("#create-commander-result").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            $("#commander-name").val("");
                            $("#create-commander-result").css("display", "none");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#commander-name").val("");
                            $("#no-commander").css("display", "block");
                            $("#commander-name").css("display", "inline");
                            $("#create-commander").css("display", "inline");
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
        instance.harvestCrypterium.sendTransaction({
            from: currentAccount,
            gas: 3000000
        }, function(error, txHash) {
            if (error) {
                console.log(error);
            } else {
                $("#harvest").css("display", "none");
                $("#harvesting").css("display", "inline");
                waitForReceipt(txHash, function(receipt) {
                    if (receipt.status === "0x1") {
                        $("#harvesting").css("display", "none");
                        $("#harvest").css("display", "inline");
                        alert("Harvesting was successfull!");
                        displayMyCommander();
                        displayAllCommanders();
                    } else {
                        $("#harvesting").css("display", "none");
                        $("#harvest").css("display", "inline");
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
            instance.buyCrypterium.sendTransaction(amount, {
                from: currentAccount,
                gas: 3000000,
                value: val
            }, function(error, txHash) {
                if (error) {
                    console.log(error);
                } else {
                    $("#buy-amount").css("display", "none");
                    $("#buy").css("display", "none");
                    $("#buy-successfull").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            $("#buy-amount").val("");
                            $("#buy-successfull").css("display", "none");
                            $("#buy-amount").css("display", "inline");
                            $("#buy").css("display", "inline");
                            alert("Your purchase of " + amount + " Crypterium was successfull!");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#buy-amount").val("");
                            $("#buy-successfull").css("display", "none");
                            $("#buy-amount").css("display", "inline");
                            $("#buy").css("display", "inline");
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
            instance.produceInfantry.sendTransaction(amount, {
                from: currentAccount,
                gas: 3000000
            }, function(error, txHash) {
                if (error) {
                    console.log(error);
                } else {
                    $("#infantry-amount").css("display", "none");
                    $("#infantry").css("display", "none");
                    $("#producing-infantry").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            $("#infantry-amount").val("");
                            $("#producing-infantry").css("display", "none");
                            $("#infantry-amount").css("display", "inline");
                            $("#infantry").css("display", "inline");
                            alert("Production of " + amount + " Infantry units was successfull!");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#infantry-amount").val("");
                            $("#producing-infantry").css("display", "none");
                            $("#infantry-amount").css("display", "inline");
                            $("#infantry").css("display", "inline");
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
            instance.produceVehicle.sendTransaction(amount, {
                from: currentAccount,
                gas: 3000000
            }, function(error, txHash) {
                if (error) {
                    console.log(error);
                } else {
                    $("#vehicle-amount").css("display", "none");
                    $("#vehicle").css("display", "none");
                    $("#producing-vehicle").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            $("#vehicle-amount").val("");
                            $("#producing-vehicle").css("display", "none");
                            $("#vehicle-amount").css("display", "inline");
                            $("#vehicle").css("display", "inline");
                            alert("Production of " + amount + " Vehicle units was successfull!");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#vehicle-amount").val("");
                            $("#producing-vehicle").css("display", "none");
                            $("#vehicle-amount").css("display", "inline");
                            $("#vehicle").css("display", "inline");
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
            instance.produceAircraft.sendTransaction(amount, {
                from: currentAccount,
                gas: 3000000
            }, function(error, txHash) {
                if (error) {
                    console.log(error);
                } else {
                    $("#aircraft-amount").css("display", "none");
                    $("#aircraft").css("display", "none");
                    $("#producing-aircraft").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            $("#aircraft-amount").val("");
                            $("#producing-aircraft").css("display", "none");
                            $("#aircraft-amount").css("display", "inline");
                            $("#aircraft").css("display", "inline");
                            alert("Production of " + amount + " Aircraft units was successfull!");
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#aircraft-amount").val("");
                            $("#producing-aircraft").css("display", "none");
                            $("#aircraft-amount").css("display", "inline");
                            $("#aircraft").css("display", "inline");
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
            instance.attack.sendTransaction(address, amount, {
                from: currentAccount,
                gas: 3000000
            }, function(error, txHash) {
                if (error) {
                    console.log(error);
                } else {
                    $("#attack-address").css("display", "none");
                    $("#attack-amount").css("display", "none");
                    $("#attack").css("display", "none");
                    $("#attack-launched").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            setTimeout(function() {
                                $("#attack-address").val("");
                                $("#attack-amount").val("");
                                $("#attack-launched").css("display", "none");
                                $("#attack-address").css("display", "inline");
                                $("#attack-amount").css("display", "inline");
                                $("#attack").css("display", "inline");
                                displayMyCommander();
                                displayAllCommanders();
                                getLastAttackResult(currentAccount, amount);
                            }, 30000);
                        } else {
                            $("#attack-address").val("");
                            $("#attack-amount").val("");
                            $("#attack-launched").css("display", "none");
                            $("#attack-address").css("display", "inline");
                            $("#attack-amount").css("display", "inline");
                            $("#attack").css("display", "inline");
                            alert("Receipt status fail!");
                        }
                    });
                }
            });
        } else {
            alert("Invalid input!");
        }
    }

    function getLastAttackResult(attacker, amount) {
        web3.eth.getBlockNumber(function(error, latestBlock) {
            if (error) {
                console.log(error);
            } else {
                let fromBlockNumber;
                if (latestBlock - 100 < 0) {
                    fromBlockNumber = 0;
                } else {
                    fromBlockNumber = latestBlock - 100;
                }
                let attackerWon = instance.AttackerWon({
                    '_attacker': attacker
                }, {
                    fromBlock: fromBlockNumber,
                    toBlock: latestBlock
                });
                attackerWon.watch(function(error, result) {
                    if (error) {
                        console.log(error);
                    } else {
                        alert("You won the Battle and gained " + amount + " Crypterium!");
                    }
                });

                let defenderWon = instance.DefenderWon({
                    '_attacker': attacker
                }, {
                    fromBlock: fromBlockNumber,
                    toBlock: latestBlock
                });
                defenderWon.watch(function(error, result) {
                    if (error) {
                        console.log(error);
                    } else {
                        alert("The Defender won the Battle! You lost " + amount + " Crypterium!");
                    }
                });
            }
        });
    }

    $(document).ready(function() {
        init(function() {
            checkAccount();
            displayMyCommander();
            displayAllCommanders();
        });
        $("#create-commander").click(function() {
            createCommander();
        });
        $("#harvest").click(function() {
            harvestCrypterium();
        });
        $("#buy").click(function() {
            buyCrypterium();
        });
        $("#infantry").click(function() {
            produceInfantry();
        });
        $("#vehicle").click(function() {
            produceVehicle();
        });
        $("#aircraft").click(function() {
            produceAircraft();
        });
        $("#attack").click(function() {
            attack();
        });
    });
})(Contracts['CrypteriumWars']);
