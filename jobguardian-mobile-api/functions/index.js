/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Fungsi Firebase HTTP
exports.myHttpFunction = onRequest((request, response) => {
  // Menyimpan informasi ke log menggunakan logger
  logger.info("Permintaan HTTP diterima!");

  // Mengirim respons ke permintaan HTTP
  response.send("Hello from Firebase!");
});

const functions = require("firebase-functions");

const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)});

const express = require("express");
const cors = require("cors");

// main app //
const app = express();
app.use(cors({origin: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// database reference //
const db = admin.firestore();


// generate custom UID //
// eslint-disable-next-line require-jsdoc
function generateCustomUID(length) {
  // eslint-disable-next-line max-len
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


// add data or post data //
app.post("/api/add", (req, res) => {
  (async () => {
    try {
      const customId = generateCustomUID(20);
      const currentJobData = {
        jobId: customId,
        title: req.body.title,
        location: req.body.location,
        department: req.body.department,
        salaryRange: req.body.salaryRange,
        companyProfile: req.body.companyProfile,
        description: req.body.description,
        requirements: req.body.requirements,
        benefits: req.body.benefits,
        status: "Unverified",
      };
      await db.collection("workCollection").doc(customId).set(currentJobData);

      // eslint-disable-next-line max-len
      return res.status(200).send({status: "Success", msg: "Data Saved", jobId: customId});
    } catch (error) {
      console.log(error);
      return res.status(500).send({status: "Failed", msg: error});
    }
  })();
});


// get single data from firestore document collection with specific id //
app.get("/api/get/:jobId", (req, res) => {
  (async () => {
    try {
      const jobId = req.params.jobId;
      const reqDoc = db.collection("workCollection").doc(jobId);
      const workCollection = await reqDoc.get();
      const response = workCollection.data();

      return res.status(200).send({status: "Success", data: response});
    } catch (error) {
      console.log(error);
      return res.status(500).send({status: "Failed", msg: error});
    }
  })();
});


// get all data from workCollection on firestore
app.get("/api/getAll", (req, res) => {
  (async () => {
    try {
      const query = db.collection("workCollection");
      const response = [];

      await query.get().then((data) => {
        const docs = data.docs;

        docs.map((doc) => {
          const selectedItem = {
            title: doc.data().title,
            location: doc.data().location,
            department: doc.data().department,
            salaryRange: doc.data().salaryRange,
            companyProfile: doc.data().companyProfile,
            description: doc.data().description,
            requirements: doc.data().requirements,
            benefits: doc.data().benefits,
            status: doc.data().status,
          };
          response.push(selectedItem);
        });
        return response;
      });

      return res.status(200).send({status: "Success", data: response});
    } catch (error) {
      console.log(error);
      return res.status(500).send({status: "Failed", msg: error});
    }
  })();
});


// update status data on workCollection with specific id //
app.put("/api/update/:jobId", (req, res) => {
  (async () => {
    try {
      const jobId = req.params.jobId;
      const updatedStatus = req.body.status;

      // update status pada Firestore di document berdasarkan jobID //
      // eslint-disable-next-line max-len
      await db.collection("workCollection").doc(jobId).update({status: updatedStatus});

      // eslint-disable-next-line max-len
      return res.status(200).send({status: "Success", msg: "Data Updated", jobId: jobId});
    } catch (error) {
      console.log(error);
      return res.status(500).send({status: "Failed", msg: error});
    }
  })();
});


// exports api to firebase cloud function //
exports.app = functions.https.onRequest(app);
