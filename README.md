<h1>BackEnd Services for JobGuardian Application</h1>

![Cloud Achitecture Job Guardian](https://storage.googleapis.com/jobguardian-app-storage/architecture/Cloud%20Architecture%20JobGuardian.png)

<h2>Steps on how to replicate the REST API for mobile and the FLASK API for model that we created in this project :</h2>

The creation of mobile API and model API in our project uses JS and Python. If you want to replicate it, please pay attention to the runtime version so that there are no packages that conflict with each other, especially in making API models.

Then, before creating the mobile API and API model, there are several things that need to be set in the project in GCP and in Firebase. These include cloud storage and firestore database, for configuration set according to project needs only.
<br>
      
<h3>1. Mobile API</h3>

We use cloud functions in firebase to deploy the API, then, these is step by step how to replicate the mobile API :

- Open command promt and create directory for your code.
- Open command promt and login with your firebase account.
  
        firebase login
  
- After you have successfully logged in, run the init command. Then type y if promted.

        firebase init
  
- You will be given several feature options, select

        Functions : configure a cloud functions directory and its files.
  
- You will be faced with several options, if you don't have a project you can create one or add one from an existing GCP project. If you already have a project in Firebase, choose Use an Existing Project. 
- Then, select the project where you will deploy the API later.
- You will be given two types of language choices in creating APIs using this cloud function, choose Javascript.
- Then you will be asked whether you want to use ESLint or not, please choose accordingly. But, in the creation of our API, we used it.
- Then, install dependencies using NPM by typing y.
- After a while, the installation of the dependencies is complete and write the following command to directly open your IDE to edit the source code

        code . 
  
- Open your terminal and change your directory to functions
  
        cd .\functions\
  
- After that you can install the package you need here with the command
  
        npm install your_package

- You need to generate a ServiceAccountKey.json on service account and assign it in index.js, so that we can get access to the firebase project. 
- Perform routing and handlers for each response in the API, so that when testing it can be seen whether the API can function properly or not.
- Once everything is ready and testing goes well, API can be deployed. But, before it we need to change the "lint" in package.json to
    
        "lint": "eslint"
  
- If it's done, save it and we'll move on to the command promt.
- On command promt, move to your directory that youmade before.
- Go to functions.
  
        cd .\functions\
  
- Then type this command
  
        firebase deploy
  
- It will take a while for the deployment process to complete.
- Go to your firebase console, click on functions and you can see your API with a base url that has the /app suffix. This base url that you can use for your API.
