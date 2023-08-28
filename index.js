const express = require('express');

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
    console.log("Listen in port 3000");
});
