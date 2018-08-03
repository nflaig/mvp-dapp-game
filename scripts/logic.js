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
            window.web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    alert(error);
                } else {
                    if (accounts.length == 0) {
                        alert("Please unlock your MetaMask Accounts!");
                    } else if (accounts[0] !== currentAccount) {
                        currentAccount = accounts[0];
                        displayMyCommander();
                        displayMission();
                    }
                }
            });
        }, 250);
    }

    function displayMyCommander() {
        window.web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                alert(error);
            } else {
                if (accounts.length != 0) {
                    instance.getCommanderId(accounts[0], function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            if (result > 0) {
                                let commanderId = result - 1;
                                let commanderName;
                                instance.getCommanderName(commanderId, function(error, result) {
                                    if (error) {
                                        alert(error);
                                    } else {
                                        commanderName = result;
                                    }
                                });
                                let missionReadyTime;
                                instance.getMissionDetails(commanderId, function(error, result) {
                                    if (error) {
                                        alert(error);
                                    } else {
                                        missionReadyTime = result[1];
                                    }
                                });
                                instance.getCommanderDetails(commanderId, function(error, result) {
                                    if (error) {
                                        alert(error);
                                    } else {
                                        setTimeout(function() {
                                            $("#mycommander").empty();
                                            $("#no-commander").css("display", "none");
                                            $("#commander-name").css("display", "none");
                                            $("#create-commander").css("display", "none");
                                            $("#mycommander-name").text("Commander " + commanderName);
                                            $("#mycommander-name").css("display", "inline");
                                            $("#mycommander").append(
                                                `<span>Owner: ${result[0]}</span>
                                                <br/>
                                                <span>Crypterium: ${result[1]}</span>
                                                <br/>
                                                <span>Next harvest: ${timeConverter(result[2])}</span>
                                                <br/>
                                                <span>Infantry units: ${result[3]}</span>
                                                <br/>
                                                <span>Vehicle units: ${result[4]}</span>
                                                <br/>
                                                <span>Aircraft units: ${result[5]}</span>
                                                <br/>
                                                <span>Next attack: ${timeConverter(result[6])}</span>
                                                <br/>
                                                <span>Next mission: ${timeConverter(missionReadyTime)}</span>`
                                            );
                                        }, 100);
                                    }
                                });
                            } else {
                                $("#mycommander").empty();
                                $("#no-commander").css("display", "block");
                                $("#commander-name").css("display", "inline");
                                $("#create-commander").css("display", "inline");
                                $("#mycommander-name").css("display", "none");
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
                alert(error);
            } else {
                let commanderCount = result;
                for (var commanderId = 0; commanderId < commanderCount; commanderId++) {
                    let commanderName;
                    instance.getCommanderName(commanderId, function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            commanderName = $('<div/>').text(result).html();
                        }
                    });
                    let missionReadyTime;
                    instance.getMissionDetails(commanderId, function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            missionReadyTime = result[1];
                        }
                    });
                    instance.getCommanderDetails(commanderId, function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            setTimeout(function() {
                                $("#allcommanders").append(
                                    `<div class="allcommanders-commander">
                                        <span>Commander ${commanderName}</span>
                                        <br/>
                                        <span>Owner: ${result[0]}</span>
                                        <br/>
                                        <span>Crypterium: ${result[1]}</span>
                                        <br/>
                                        <span>Next harvest: ${timeConverter(result[2])}</span>
                                        <br/>
                                        <span>Infantry units: ${result[3]}</span>
                                        <br/>
                                        <span>Vehicle units: ${result[4]}</span>
                                        <br/>
                                        <span>Aircraft units: ${result[5]}</span>
                                        <br/>
                                        <span>Next attack: ${timeConverter(result[6])}</span>
                                        <br/>
                                        <span>Next mission: ${timeConverter(missionReadyTime)}</span>
                                    </div>`
                                );
                            }, 100);
                        }
                    });
                }
            }
        });
    }

    function displayMission() {
        window.web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                alert(error);
            } else {
                if (accounts.length != 0) {
                    instance.getCommanderId(accounts[0], function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            if (result > 0) {
                                let commanderId = result - 1;
                                instance.getMissionDetails(commanderId, function(error, result) {
                                    if (error) {
                                        alert(error);
                                    } else {
                                        $("#start-mission").html("Start Mission " + result[0]);
                                    }
                                });
                            } else {
                                $("#start-mission").html("Start Mission");
                            }
                        }
                    });
                }
            }
        });
    }

    function createCommander() {
        let name = $("#commander-name").val();
        if (name) {
            instance.createCommander.sendTransaction(name, {
                from: currentAccount
            }, function(error, txHash) {
                if (error) {
                    alert(error);
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
                            displayMission();
                        } else {
                            $("#commander-name").val("");
                            $("#no-commander").css("display", "block");
                            $("#commander-name").css("display", "inline");
                            $("#create-commander").css("display", "inline");
                            alert("Receipt status error!");
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
            from: currentAccount
        }, function(error, txHash) {
            if (error) {
                alert(error);
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
                        alert("Receipt status error!");
                    }
                });
            }
        });
    }

    function buyCrypterium() {
        let amount = parseInt($("#buy-amount").val())
        let val = amount * 1000000000000000;
        if (amount && amount > 0) {
            instance.buyCrypterium.sendTransaction(amount, {
                from: currentAccount,
                value: val
            }, function(error, txHash) {
                if (error) {
                    alert(error);
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
                            alert("Receipt status error!");
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
                from: currentAccount
            }, function(error, txHash) {
                if (error) {
                    alert(error);
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
                            alert("Receipt status error!");
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
                from: currentAccount
            }, function(error, txHash) {
                if (error) {
                    alert(error);
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
                            alert("Receipt status error!");
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
                from: currentAccount
            }, function(error, txHash) {
                if (error) {
                    alert(error);
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
                            alert("Receipt status error!");
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
                from: currentAccount
            }, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#attack-address").css("display", "none");
                    $("#attack-amount").css("display", "none");
                    $("#attack").css("display", "none");
                    $("#attack-launched").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            getLastAttackResult(currentAccount, amount);
                        } else {
                            $("#attack-address").val("");
                            $("#attack-amount").val("");
                            $("#attack-launched").css("display", "none");
                            $("#attack-address").css("display", "inline");
                            $("#attack-amount").css("display", "inline");
                            $("#attack").css("display", "inline");
                            alert("Receipt status error!");
                        }
                    });
                }
            });
        } else {
            alert("Invalid input!");
        }
    }

    function getLastAttackResult(attacker, amount) {
        let timeoutDuration = 30000;
        if (Contract.network == "local") timeoutDuration = 3000;
        setTimeout(function() {
            window.web3.eth.getBlockNumber(function(error, latestBlock) {
                if (error) {
                    alert(error);
                } else {
                    let fromBlockNumber;
                    if (latestBlock - 10 < 0) {
                        fromBlockNumber = 0;
                    } else {
                        fromBlockNumber = latestBlock - 10;
                    }
                    let attackerWon = instance.AttackerWon({
                        '_attacker': attacker
                    }, {
                        fromBlock: fromBlockNumber,
                        toBlock: latestBlock
                    });
                    attackerWon.watch(function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            $("#attack-address").val("");
                            $("#attack-amount").val("");
                            $("#attack-launched").css("display", "none");
                            $("#attack-address").css("display", "inline");
                            $("#attack-amount").css("display", "inline");
                            $("#attack").css("display", "inline");
                            alert("You won the Battle and gained " + amount + " Crypterium!");
                            displayMyCommander();
                            displayAllCommanders();
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
                            alert(error);
                        } else {
                            $("#attack-address").val("");
                            $("#attack-amount").val("");
                            $("#attack-launched").css("display", "none");
                            $("#attack-address").css("display", "inline");
                            $("#attack-amount").css("display", "inline");
                            $("#attack").css("display", "inline");
                            alert("The Defender won the Battle! You lost " + amount + " Crypterium!");
                            displayMyCommander();
                            displayAllCommanders();
                        }
                    });
                }
            });
        }, timeoutDuration);
    }

    function changeCommanderName() {
        let name = $("#new-commander-name").val();
        if (name) {
            instance.changeCommanderName.sendTransaction(name, {
                from: currentAccount
            }, function(error, txHash) {
                if (error) {
                    alert(error);
                } else {
                    $("#new-commander-name").css("display", "none");
                    $("#change-name").css("display", "none");
                    $("#changing-name").css("display", "inline");
                    waitForReceipt(txHash, function(receipt) {
                        if (receipt.status === "0x1") {
                            $("#new-commander-name").val("");
                            $("#changing-name").css("display", "none");
                            $("#new-commander-name").css("display", "inline");
                            $("#change-name").css("display", "inline");
                            alert("Changed name of Commander to " + name);
                            displayMyCommander();
                            displayAllCommanders();
                        } else {
                            $("#new-commander-name").val("");
                            $("#changing-name").css("display", "none");
                            $("#new-commander-name").css("display", "inline");
                            $("#change-name").css("display", "inline");
                            alert("Receipt status error!");
                        }
                    });
                }
            });
        } else {
            alert("Please input a name!");
        }
    }

    function startMission() {
        instance.startMission.sendTransaction({
            from: currentAccount
        }, function(error, txHash) {
            if (error) {
                alert(error);
            } else {
                $("#start-mission").css("display", "none");
                $("#started-mission").css("display", "inline");
                waitForReceipt(txHash, function(receipt) {
                    if (receipt.status === "0x1") {
                        getMissionResult(currentAccount);
                    } else {
                        $("#started-mission").css("display", "none");
                        $("#start-mission").css("display", "inline");
                        alert("Receipt status error!");
                    }
                });
            }
        });
    }

    function getMissionResult(commanderOwner) {
        let timeoutDuration = 30000;
        if (Contract.network == "local") timeoutDuration = 3000;
        setTimeout(function() {
            let missionLevel = parseInt($("#start-mission").text().slice(-1));
            window.web3.eth.getBlockNumber(function(error, latestBlock) {
                if (error) {
                    alert(error);
                } else {
                    let fromBlockNumber;
                    if (latestBlock - 10 < 0) {
                        fromBlockNumber = 0;
                    } else {
                        fromBlockNumber = latestBlock - 10;
                    }
                    let missionSucceeded = instance.MissionSucceeded({
                        '_missionLevel': missionLevel,
                        '_owner': commanderOwner
                    }, {
                        fromBlock: fromBlockNumber,
                        toBlock: latestBlock
                    });
                    missionSucceeded.watch(function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            $("#started-mission").css("display", "none");
                            $("#start-mission").css("display", "inline");
                            alert("Mission was successfull!");
                            displayMyCommander();
                            displayAllCommanders();
                            displayMission();
                        }
                    });

                    let missionFailed = instance.MissionFailed({
                        '_missionLevel': missionLevel,
                        '_owner': commanderOwner
                    }, {
                        fromBlock: fromBlockNumber,
                        toBlock: latestBlock
                    });
                    missionFailed.watch(function(error, result) {
                        if (error) {
                            alert(error);
                        } else {
                            $("#started-mission").css("display", "none");
                            $("#start-mission").css("display", "inline");
                            alert("Mission failed!");
                            displayMyCommander();
                            displayAllCommanders();
                            displayMission();
                        }
                    });
                }
            });
        }, timeoutDuration);
    }

    function waitForReceipt(txHash, cb) {
        let timeoutDuration = 0;
        if (Contract.network == "local") timeoutDuration = 7000;
        setTimeout(function() {
            web3_instance.eth.getTransactionReceipt(txHash, function(error, receipt) {
                if (error) {
                    alert(error);
                } else if (receipt != null) {
                    cb(receipt);
                } else {
                    window.setTimeout(function() {
                        waitForReceipt(txHash, cb);
                    }, 250);
                }
            });
        }, timeoutDuration);
    }

    function timeConverter(UNIX_timestamp) {
        var date = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = date.getFullYear();
        var month = months[date.getMonth()];
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        var time = day + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    $(document).ready(function() {
        init(function() {
            checkAccount();
            displayMyCommander();
            displayAllCommanders();
            displayMission();
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
        $("#change-name").click(function() {
            changeCommanderName();
        });
        $("#start-mission").click(function() {
            startMission();
        });
    });
})(Contracts['CrypteriumWars']);
