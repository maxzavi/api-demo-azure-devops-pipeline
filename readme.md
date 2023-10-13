# Node Api using express, pipeline in Azure Devops to GCP Cloud Run

Create project:

```command
npm init -y
``````

Add module express with npm

```cmd
npm install express
```

Add index.js

```js
const express = require('express');
const app = express();

app.use(express.json());

//Routes
app.get('/', (rq,rs)=>{
    const result={
        "message":"Hello world!!!"
    };
    rs.json(result);
})

//Listener
app.listen(3000, ()=>{
    console.log("Listen in port 3000");
});
```

## Nodemon

Add nodemon as a development dependency:

```cmd
npm i -D nodemon
```

Add npm run command in package.json file:

```json
  "scripts": {


    "nodemon": "nodemon index"
  },
```

Run watch:

```cmd
npm run nodemon
```

## Dotenv

Add dotenv dependency:

```
npm i dotenv
```

Add file .env in path with environments variables



## Docker

Add Dockerfile:

```docker
FROM --platform=linux/x86_64 node:lts-alpine
WORKDIR /usr/src/app
COPY "package.json" .
RUN npm install --production --silent && mv node_modules ../
COPY index.js .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
```

Create image in local

```cmd
docker build -t mzavaletav/abc:0.1 .
```

Run docker in local

```cmd
docker run -p 3000:3000 mzavaletav/abc:0.1
```

Add info from host in index.js

```js
//Routes
app.get('/', (rq,rs)=>{
    const result={
        "message":"Hello world!!!",
        "hostname": require('os').hostname()
    };
    rs.json(result);
});
```
## Docker Hub

Publish docker image in registry: dockerhub

```cmd
docker push mzavaletav/abc:0.1
```

Publish image in GCP Container Registry:

Login, using file.json key

```cmd
docker login -u _json_key --password-stdin https://gcr.io < /Users/maxzavaleta/Downloads/temporal-283603-553de9da79ad.json
```

Tag image for GCP

```cmd
docker tag mzavaletav/abc:0.1 gcr.io/temporal-283603/abc:0.1
docker push gcr.io/temporal-283603/abc:0.1
```

## GCP - Cloud Run

In GCP console change tag for GCP registry, optional
```cmd
docker tag mzavaletav/abc:0.1 gcr.io/temporal-283603/abc:0
docker push gcr.io/temporal-283603/abc:0
``` 

## Pipeline CI

In GCP, set variable PROD_PROJECT_ID with Project ID:

```cmd
PROJECT_ID=temporal-283603
```
Create service account in GCP Project uses to publish images
```cmd
gcloud iam service-accounts create azure-pipelines-publisher \
    --display-name="Azure Pipelines Publisher" \
    --project=$PROJECT_ID
```

Grant the Storage Admin IAM role (roles/storage.admin) to the service account to allow Azure Pipelines to push to Container Registry:

```cmd
AZURE_PIPELINES_PUBLISHER=azure-pipelines-publisher@$PROJECT_ID.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member serviceAccount:$AZURE_PIPELINES_PUBLISHER \
    --role roles/storage.admin \
    --project=$PROJECT_ID
```

Generate a service account key:
```cmd
gcloud iam service-accounts keys create azure-pipelines-publisher.json \
    --iam-account $AZURE_PIPELINES_PUBLISHER \
    --project=$PROJECT_ID

tr -d '\n' < azure-pipelines-publisher.json > azure-pipelines-publisher-oneline.json
```
View the content of the service account key file:
```cmd
echo $(<azure-pipelines-publisher-oneline.json)
```

### CI Azure devops
In Azure Devops: create a service connection for Container Registry, select Docker Registry:

Registry type: Others Docker Registry: https://gcr.io/temporal-283603 , Docker ID: _json_key Password: Paste the content of azure-pipelines-publisher-oneline.json.

Create pipeline, type Docker Buildandpush, select container regisitry created, in container repository created in service connection.

### Repository

Create repo in Azure Devops, and push source code

Create pipeline CI, using container registry, **in repository, include GCP project-id**

## Pipeline CD
Set IAM grants, in GCP console:
```cmd
PROJECT_ID=temporal-283603
AZURE_PIPELINES_PUBLISHER=azure-pipelines-publisher@$PROJECT_ID.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member serviceAccount:$AZURE_PIPELINES_PUBLISHER \
    --role roles/run.admin

gcloud iam service-accounts create cloud-runner \
    --display-name="Cloud Runner" \
    --project=$PROJECT_ID

CLOUD_RUNNER=cloud-runner@$PROJECT_ID.iam.gserviceaccount.com

gcloud iam service-accounts add-iam-policy-binding \
    $CLOUD_RUNNER \
    --member=serviceAccount:$AZURE_PIPELINES_PUBLISHER \
    --role="roles/iam.serviceAccountUser" \
    --project=$PROJECT_ID
```

In Azure Devops create release, add job: Command Line Script
```cmd
gcloud auth activate-service-account \
    --quiet \
    --key-file <(echo $(ServiceAccountKey) | base64 -d) && \
gcloud run deploy abc \
    --quiet \
    --service-account=cloud-runner@$(CloudRun.ProjectId).iam.gserviceaccount.com \
    --allow-unauthenticated \
    --image=gcr.io/$(ContainerRegistry.ProjectId)/abc:$BUILD_BUILDID \
    --platform=managed \
    --region=$(CloudRun.Region) \
    --project=$(CloudRun.ProjectId)
```

Set variables:

ServiceAccountKey: execute and pase values (secret), in GCP console
```cmd
cat azure-pipelines-publisher.json | base64 -w 0
```
or in local:

```cmd
cat /Users/maxzavaleta/Downloads/temporal-283603-553de9da79ad.json|base64
```
ServiceAccountKey = *Result last command*

CloudRun.ProjectId = project_id

ContainerRegistry.ProjectId = project_id

CloudRun.Region = region projects

If use Secrets:
```cmd
SECRET_NAME=scrt-name
ROLE_SECRET_ACCESSOR=roles/secretmanager.secretAccessor
AZURE_PIPELINES_PUBLISHER=azure-pipelines-publisher@$PROJECT_ID.iam.gserviceaccount.com
gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --member="serviceAccount:$AZURE_PIPELINES_PUBLISHER" \
    --role=$ROLE_SECRET_ACCESSOR \
    --project=$PROJECT_ID
```

Test CI/CD add post method

```js
const revision="2";

...
app.post('/', (rq,rs)=>{
    const name = (rq.body.name)?rq.body.name:"nn"
    const result={
        "message":"Hello " + name,
        "revision": revision,
        "hostname": require('os').hostname()
    };
    rs.json(result);
});
```
