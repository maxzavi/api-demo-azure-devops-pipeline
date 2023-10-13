const express = require('express');
require('dotenv').config()


const app = express();

app.use(express.json());

const revision="2";

//Routes
app.get('/', (rq,rs)=>{
    const result={
        "message":"Hello world from get!!!",
        "revision": revision,
        "hostname": require('os').hostname()
    };
    rs.json(result);
});

app.post('/', (rq,rs)=>{
    const name = (rq.body.name)?rq.body.name:"nn"
    const result={
        "message":"Hello " + name,
        "revision": revision,
        "hostname": require('os').hostname()
    };
    rs.json(result);
});

//Listener
app.listen(3000, ()=>{
    console.log(`Conected to db: ${process.env.DB_USER}@${process.env.DB_HOST}ç`);
    console.log("Listen in port 3000");
});
