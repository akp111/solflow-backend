const solanaWeb3 = require("@solana/web3.js");
const solpay = require("@solana/pay");
const BigNumber = require("bignumber.js");
require("dotenv").config();
const fs = require("fs");
const schedule = require("node-schedule");

// To read data from a file based on filename passed
// for now using file for storage but later it will be replaced with db
const readData = (filename) => {
  try {
    const fileData = fs.readFileSync(`${__dirname}/${filename}`, "utf8");
    const JsonData = JSON.parse(fileData);
    return JsonData;
  } catch (error) {
    console.log(error);
  }
};

// write data to a json file
const writeToFile = (key, data, filename) => {
  console.log(key);
  console.log(data);
  try {
    let JsonData = readData(filename);
    JsonData[key] = data;
    fs.writeFileSync(`${__dirname}/${filename}`, JSON.stringify(JsonData));
  } catch (error) {
    console.log(error);
  }
};

// function that registers a user's details which includes
// the user who wants to send fund
// the user to whom the user wants to send fund
// the amount of SOL that needs to be transferred
// the time interval (in days) the payment should be done
exports.Register = async (req, res, next) => {
  try {
    // extract data from the body
    const user = req.body.user;
    const recipient = req.body.recipient;
    const amount = req.body.amount;
    const time = req.body.time;

    // get data from file
    const storedData = readData("data.json");
    // if user already exists
    if (storedData && storedData[user]) {
      let userDetails = storedData[user];
      userDetails.recipient.push(recipient);
      userDetails.amount.push(amount);
      userDetails.time.push(time);
      console.log(userDetails);
      // store it in the file
      writeToFile(user, userDetails, "data.json");
      // start the cron task to make a encodedurl
      this.startCron(user, recipient, amount, time);
      return res.send("New recipient added");
    } else {
      // create a new user if user already exists
      const newUserObject = {
        recipient: [recipient],
        amount: [amount],
        time: [time],
      };
      writeToFile(user, newUserObject, "data.json");
      this.startCron(user, recipient, amount, time);
      return res.send("Hooray!! You are all set");
    }
  } catch (error) {
    console.log("error %o", error);
    return res.status(500);
  }
};

// function that starts the cron task
exports.startCron = async (user, recipientAddress, solAmount, time) => {
  try {
    console.log("starting cron task");

    let encodedUrl = "";
    const recipient = new solanaWeb3.PublicKey(recipientAddress);
    const amount = new BigNumber(solAmount);
    const label = "Your timely donation time";
    const message = "Your timely donation time";
    const memo = `SOLFLOW#`;
    // start the cron task based on time
    const job = schedule.scheduleJob(`*/5 * * * *`, async function () {
      let data = readData("pending.json");
      let reference = new solanaWeb3.Keypair().publicKey;
      console.log(data);
      if (!data[user]) {
        data[user] = [];
      }
      console.log(data[user]);
      encodedUrl = solpay.encodeURL({
        recipient,
        amount,
        reference,
        label,
        message,
        memo,
      });
      console.log(encodedUrl);
      const taskName = startCronToCheckTransaction(user, reference, recipient, amount);
      data[user].push({ encodedUrl, reference, taskName, recipient, amount });
      writeToFile(user, data[user], "pending.json");
    });
    // this will create the current payment link
    let data = readData("pending.json");
    if (!data[user]) {
      data[user] = [];
    }
    console.log(data);
    let reference = new solanaWeb3.Keypair().publicKey;
    encodedUrl = await solpay.encodeURL({
      recipient,
      amount,
      reference,
      label,
      message,
      memo,
    });
    const taskName = await startCronToCheckTransaction(
      user,
      reference,
      recipient,
      amount
    );
    console.log("task name");
    console.log(taskName);
    let newData = data[user];
    newData.push({ encodedUrl, reference, taskName, recipient, amount });
    writeToFile(user, newData, "pending.json");
  } catch (error) {
    console.log(error);
  }
};

// a cron task that checks for a transaction and based on validation it removes the entry from pending.json
const startCronToCheckTransaction = async (
  user,
  reference,
  recipient,
  amount
) => {
  const job = schedule.scheduleJob(`*/1 * * * *`, async function (cronData) {
    try {
      const connection = new solanaWeb3.Connection(
        "https://api.devnet.solana.com"
      );
      let data = readData("pending.json");
      console.count("Checking for transaction...");
      try {
        console.log(
          "Trying to get transaction info for reference: %s",
          reference
        );
        signatureInfo = await solpay.findReference(connection, reference, {
          finality: "confirmed",
        });
        console.log(signatureInfo);
        console.log("\n 🖌  Signature found: ", signatureInfo.signature);
        if (signatureInfo.signature) {
          try {
            await solpay.validateTransfer(connection, signatureInfo.signature, {
              recipient,
              amount,
            });
            let data = readData("pending.json");
            let userData = data[user];
            let toBeDletedCron = userData.filter(function (obj) {
              return obj.reference == reference;
            });
            console.log("to be deleted");
            console.log(toBeDletedCron[0]);
            let newUserData = userData.filter(function (obj) {
              return obj.reference != reference;
            });
            console.log("updated data");
            console.log(newUserData);
            let current_job =
              schedule.scheduledJobs[toBeDletedCron[0].taskName];
            console.log(current_job);
            current_job.cancel();
            writeToFile(user, newUserData, "pending.json");
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log("error: %o", error);
      }
    } catch (error) {
      console.log("error: %o", error);
    }
  });
  return job.name;
};

// function return the pending payment for a specific wallet address
exports.getPendingPayments = async (req, res, next) => {
  try {
    console.log("calling pending data");
    let data = readData("pending.json");
    if (data && data[req.body.user]) {
      return res.json({ res: data[req.body.user] });
    } else {
      return res.json({ res: null });
    }
  } catch (error) {
    console.log("error: %o", error);
    return res.status(500);
  }
};
