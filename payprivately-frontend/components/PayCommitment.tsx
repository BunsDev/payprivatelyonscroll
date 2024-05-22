import { Button, Text, VStack, Input } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import LinkIsAlreadyPayed from "./LinkIsAlreadyPayed";
import { legacyToBuffer } from "@metamask/eth-sig-util/dist/utils";

const PayCommitment = (props: { commitment: BigNumber }) => {
  const [walletConnected, setWalletConnected] = useState<boolean>();

  const [approveLoading, setApproveLoading] = useState<boolean>();
  const [tokenApproved, setTokenApproved] = useState<boolean>();

  const [payLoading, setPayLoading] = useState<boolean>();
  const [payed, setPayed] = useState<boolean>();

  const [payedPreviously, setPayedPreviously] = useState<boolean>();

  const context = useContext(GlobalContext);
  const [inputValue, setInputValue] = useState("1");
  // console.log(typeof inputValue);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    console.log(event.target.value);
  };

  useEffect(() => {
    if (context.provider) {
      setWalletConnected(true);
    }
  }, [context.provider]);

  useEffect(() => {
    if (context.provider && context.privateLinkToken && context.privateLink) {
      const privateLink = context.privateLink;
      const token = context.privateLinkToken;
      context.provider
        .getSigner(0)
        .getAddress()
        .then((address) => {
          return token.allowance(address, privateLink.address);
        })
        .then((allowance) => {
          if (allowance.gte(ethers.utils.parseEther("1"))) {
            setTokenApproved(true);
          } else {
            setTokenApproved(false);
          }
        })
        .catch(console.log);
    }
  }, [context.provider, context.privateLinkToken, context.privateLink]);

  useEffect(() => {
    if (context.provider && context.privateLink) {
      context.privateLink
        .commitments(props.commitment)
        .then((payed: boolean) => {
          console.log("con", context);
          console.log(props.commitment);
          setPayedPreviously(payed);
        })
        .catch(console.log);
    }
  }, [context.provider, context.privateLink, props.commitment]);

  const connectWallet = async () => {
    await context.connect();
  };

  const approveToken = async () => {
    if (!context.privateLink) {
      console.log("No privateLink smart contract");
      return;
    }
    if (!context.privateLinkToken) {
      console.log("No privateLinkToken smart contract");
      return;
    }

    setApproveLoading(true);

    try {
      const transaction = await context.privateLinkToken.approve(
        context.privateLink.address,
        ethers.utils.parseEther(inputValue)
      );
      await transaction.wait(1);
    } finally {
      setApproveLoading(false);
    }
    setTokenApproved(true);
  };

  const payCommitment = async () => {
    if (!context.privateLink) {
      console.log("No privateLink smart contract");
      return;
    }

    setPayLoading(true);
    try {
      const transaction = await context.privateLink.deposit(props.commitment);
      await transaction.wait(1);
    } finally {
      setPayLoading(false);
    }

    setPayed(true);
  };

  return (
    <>
      {payedPreviously ? (
        <LinkIsAlreadyPayed />
      ) : (
        <VStack>
          <>
            <Text textColor="white" sx={{ fontFamily: "Montserrat" }}>
              First you need to connect your wallet:
            </Text>
            <Button
              isDisabled={walletConnected}
              onClick={connectWallet}
              sx={{
                my: 2,
                color: "white",
                display: "block",
                textTransform: "none",
                fontFamily: "Montserrat",
                fontSize: "1rem",
                py: 2,
                px: 8,
                borderRadius: "40px",
                backgroundImage: "linear-gradient(90deg, #BE14EC, #EF14A9)",
              }}
            >
              {walletConnected ? <CheckIcon /> : "Connect"}
            </Button>
          </>
          <>
            <VStack spacing={4}>
              <Input
                placeholder="Enter your value"
                value={inputValue}
                onChange={handleInputChange}
                type="number"
              />
            </VStack>
            <Text textColor="white" sx={{ fontFamily: "Montserrat" }}>
              Second you need to approve required amount of tokens:
            </Text>
            <Button
              isDisabled={!walletConnected || tokenApproved}
              onClick={approveToken}
              isLoading={approveLoading}
              sx={{
                my: 2,
                color: "white",
                display: "block",
                textTransform: "none",
                fontFamily: "Montserrat",
                fontSize: "1rem",
                py: 2,
                px: 8,
                borderRadius: "40px",
                backgroundImage: "linear-gradient(90deg, #BE14EC, #EF14A9)",
              }}
            >
              {tokenApproved ? <CheckIcon /> : "Approve"}
            </Button>
          </>
          <>
            <Text textColor="white" sx={{ fontFamily: "Montserrat" }}>
              And the last step is to pay:
            </Text>
            <Button
              isDisabled={!walletConnected || !tokenApproved || payed}
              onClick={payCommitment}
              isLoading={payLoading}
              sx={{
                my: 2,
                color: "white",
                display: "block",
                textTransform: "none",
                fontFamily: "Montserrat",
                fontSize: "1rem",
                py: 2,
                px: 8,
                borderRadius: "40px",
                backgroundImage: "linear-gradient(90deg, #BE14EC, #EF14A9)",
              }}
            >
              {payed ? <CheckIcon /> : "Pay"}
            </Button>
          </>
        </VStack>
      )}
    </>
  );
};

export default PayCommitment;
