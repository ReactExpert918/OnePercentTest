import React, { useState, useEffect } from "react";
import { Button, TextField, Box } from "@mui/material";
import Web3 from "web3";
import contract_abi from "../../details/contract.json";
import token_abi from "../../details/MCO2.json";

let selectedAccount = null;
let contract = null;
const CONTRACT_ADDRESS = "0x89c4f07d187162fb189b1213aa6fdf42e83b35ec";
const TOKEN_ADDRESS = "0xfc98e825a2264d890f9a1e68ed50e1526abccacd";

const Dashboard = () => {
  const [balance, setBalance] = useState("NOT Connected");
  const [connected, setConnected] = useState(false);
  let value = { carbon: "", receipt: "", behalf: "" };

  useEffect(() => {
    async function checkConnected() {
      let provider = window.ethereum;
      const web3 = new Web3(provider);
      let accounts = await web3.eth.getAccounts();
      if (accounts[0] != null) {
        selectedAccount = accounts[0];
        setConnected(true);
        getBalance();

        window.ethereum.on("accountsChanged", function (accounts) {
          if (accounts.length > 0) {
            selectedAccount = accounts[0];
            console.log("Selected Account change is" + selectedAccount);
          } else {
            setConnected(false);
            setBalance("NOT Connected");
            console.error("No account is found");
          }
        });
      }
    }
    checkConnected();
  }, []);

  const connect = () => {
    let provider = window.ethereum;
    if (typeof provider !== "undefined") {
      provider
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          selectedAccount = accounts[0];
          setConnected(true);
          getBalance();
          console.log("Selected Account is " + selectedAccount);
        })
        .catch((err) => {
          setConnected(false);
          console.log(err);
        });

      window.ethereum.on("chainChanged", function () {
        window.location.reload();
      });

      window.ethereum.on("accountsChanged", function (accounts) {
        if (accounts.length > 0) {
          selectedAccount = accounts[0];
          console.log("Selected Account change is" + selectedAccount);
        } else {
          setConnected(false);
          setBalance("NOT Connected");
          console.error("No account is found");
        }
      });

      window.ethereum.on("message", function (message) {
        console.log(message);
      });

      window.ethereum.on("connect", function (info) {
        console.log("Connected to network " + info);
      });

      window.ethereum.on("disconnect", function (error) {
        setConnected(false);
        setBalance("NOT Connected");
        console.log("Disconnected from network " + error);
      });
    } else {
      alert("Please install metamask");
    }
  };

  const getBalance = async () => {
    let provider = window.ethereum;
    const web3 = new Web3(provider);
    let tokenInstance = new web3.eth.Contract(token_abi, TOKEN_ADDRESS);

    setBalance("Getting value");
    tokenInstance.methods
      .balanceOf(selectedAccount)
      .call()
      .then((bal) => {
        setBalance(bal);
      })
      .catch((err) => {
        console.log(err);
        setBalance("Error occured");
      });
  };

  const handleChange = (e) => {
    value[e.target.name] = e.target.value;
  };
  const offsetTransaction = async (e) => {
    e.preventDefault();
    let provider = window.ethereum;
    const web3 = new Web3(provider);
    let accounts = await web3.eth.getAccounts();
    if (accounts[0] == null) {
      alert("Please connect metamask");
    } else {
      contract = new web3.eth.Contract(contract_abi, CONTRACT_ADDRESS);
      contract.methods
        .offsetTransaction(value.carbon, value.receipt, value.behalf)
        .send({ from: selectedAccount, cost: 100000000000 });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "50px",
        "& .MuiTextField-root": { width: "50ch" },
      }}
    >
      <Button
        variant="contained"
        onClick={connect}
        disabled={connected && true}
      >
        {!connected ? "Connect Wallet" : "CONNECTED"}
      </Button>
      <div>MCO2 Balance: {balance}</div>
      <form
        onSubmit={offsetTransaction}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TextField
          label="_carbonTon"
          name="carbon"
          variant="standard"
          type="number"
          onChange={handleChange}
          margin="normal"
          required
        />{" "}
        <TextField
          label="_receiptId"
          name="receipt"
          variant="standard"
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          label="_onBehalfOf"
          name="behalf"
          variant="standard"
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button variant="contained" type="submit">
          Offset Transaction
        </Button>
      </form>
    </Box>
  );
};

export default Dashboard;
