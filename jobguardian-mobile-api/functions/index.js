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
  credential: admin.credential.cert(serviceAccount),
});

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

// bagian API input job dari user //

// API add data or post data //
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
        telecommuting: req.body.telecommuting,
        hasCompanyLog: req.body.hasCompanyLog,
        hasQuestions: req.body.hasQuestions,
        employmentType: req.body.employmentType,
        requiredExperience: req.body.requiredExperience,
        requiredEducation: req.body.requiredEducation,
        industry: req.body.industry,
        jobfunction: req.body.jobfunction,
        fraudulent: req.body.fraudulent,
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

// API mengambil data dengan specific id //
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

// API mengambil seluruh data dari workCollection on firestore //
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
            telecommuting: doc.data().telecommuting,
            hasCompanyLog: doc.data().hasCompanyLog,
            hasQuestions: doc.data().hasQuestions,
            employmentType: doc.data().employmentType,
            requiredExperience: doc.data().requiredExperience,
            requiredEducation: doc.data().requiredEducation,
            industry: doc.data().industry,
            functionjo: doc.data().functionjob,
            fraudulent: doc.data().fraudulent,
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

// API update status verification job dengan specific id //
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

// bagian API untuk login dan registrasi user //

// API register user
app.post("/api/registerUser", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({ status: "Failed", msg: "Username, email, and password are required." });
    }

    const usersRef = db.collection("usersCollection");

    // Check if email or username already exists
    const usernameSnapshot = await usersRef.where("username", "==", username).get();
    const emailSnapshot = await usersRef.where("email", "==", email).get();

    if (!emailSnapshot.empty) {
      return res.status(400).send({ status: "Failed", msg: "Email already exists." });
    }

    if (!usernameSnapshot.empty) {
      return res.status(400).send({ status: "Failed", msg: "Username already exists." });
    }

    const newUser = {
      username: username,
      email: email,
      password: password,
    };

    await usersRef.add(newUser);

    return res.status(201).send({ status: "Success", msg: "User registered successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: "Failed", msg: error });
  }
});

// Endpoint untuk melakukan login user
// API login user
app.post("/api/loginUser", (req, res) => {
  (async () => {
    try {
      const {email, password} = req.body;

      if (!email || !password) {
        // eslint-disable-next-line max-len
        return res.status(400).send({status: "Failed", msg: "Email and password are required."});
      }

      const usersRef = db.collection("usersCollection");
      // eslint-disable-next-line max-len
      const snapshot = await usersRef.where("email", "==", email).where("password", "==", password).get();

      if (snapshot.empty) {
        // eslint-disable-next-line max-len
        return res.status(404).send({status: "Failed", msg: "Invalid email or password."});
      }

      // eslint-disable-next-line max-len
      // jika login berhasil, ambil ID dari dokumen yang cocok dengan email dan password
      let userId;
      snapshot.forEach((doc) => {
        userId = doc.id;
      });

      // eslint-disable-next-line max-len
      return res.status(200).send({status: "Success", msg: "Login successful.", userId: userId});
    } catch (error) {
      console.log(error);
      return res.status(500).send({status: "Failed", msg: error});
    }
  })();
});

// API get data User //
app.put("/api/updateBiodataUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const {fullName, birthDate, contact} = req.body;

    res.status(200).json({ userId, message: 'User profile retrieved' });

    if (!userId) {
      throw new Error("UserId is required");
    }

    // Pastikan minimal salah satu informasi yang akan diperbarui ada
    if (!fullName && !contact && !birthDate) {
      // eslint-disable-next-line max-len
      throw new Error("At least one field (fullName, contact, or birthDate) is required for update");
    }

    const updateData = {};

    if (fullName) {
      updateData.fullName = fullName;
    }

    if (birthDate) {
      updateData.birthDate = birthDate;
    }

    if (contact) {
      updateData.contact = contact;
    }

    // eslint-disable-next-line max-len
    await admin.firestore().collection("usersCollection").doc(userId).update(updateData);

    // eslint-disable-next-line max-len
    res.status(200).send({message: "Biodata updated successfully", updatedFields: updateData});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({error: error.message});
  }
});

// API update status verification job dengan specific id //
app.put("/api/updateUserProfile/:userId", (req, res) => {
  (async () => {
    try {
      const userId = req.params.userId;
      const updatedfullName = req.body.status;
      const birthDate = req.body.birthDate;
      const contact = req.body.contact;

      res.status(200).json({ userId, message: 'User profile retrieved' });

      if (!userId) {
        throw new Error("User ID Not Found");
      }

      // Pastikan minimal salah satu informasi yang akan diperbarui ada
      if (!updatedfullName && !contact && !birthDate) {
      // eslint-disable-next-line max-len
        throw new Error("Nothing is Updated");
      }

      // update status pada Firestore di document berdasarkan userID //
      // eslint-disable-next-line max-len
      await db.collection("usersCollection").doc(userId).update({status: updatedfullName, birthDate, contact});

      // eslint-disable-next-line max-len
      return res.status(200).send({status: "Success", msg: "Data Updated", userId: userId});
    } catch (error) {
      console.log(error);
      return res.status(500).send({status: "Failed", msg: error});
    }
  })();
});

// API get user profile //
app.get("/api/getUserProfile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      throw new Error("UserId is required");
    }

    const userSnapshot = await admin.firestore().collection("usersCollection").doc(userId).get();

    if (!userSnapshot.exists) {
      throw new Error("User not found");
    }

    const userData = userSnapshot.data();

    res.status(200).send({ userProfile: userData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: error.message });
  }
});

// exports api to firebase cloud function //
exports.app = functions.https.onRequest(app);
