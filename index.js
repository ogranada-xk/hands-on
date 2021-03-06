
const express = require('express');
const IO = require('socket.io')
const path = require('path')
const http = require('http')
const fs = require('fs')

const app = express();
const server = http.createServer(app);
const io = IO(server);

let current = 0;
let ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'assets', 'problems.json')).toString('utf-8'));
let generalInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'assets', 'general.json')).toString('utf-8'));

app.use(express.static(path.join(__dirname, 'public')))


function getTemplate(name) {
    return fs.readFileSync(path.join(__dirname, 'templates', `${name}.html`)).toString('utf-8');
}

app.get('/', (req, res)=>{
    res.send( getTemplate('index') );
});

app.get('/current', (req, res)=>{
    res.json(ex[current]);
});

app.get('/general', (req, res)=>{
    res.json(generalInfo);
});

app.get('/agenda', (req, res)=>{
    let agenda = {
        current: ex[current].cathegory,
        list: ex.reduce( (acc, x) => {
            if(acc.indexOf(x.cathegory)===-1){
                acc.push(x.cathegory);
            }
            return acc;
        }, [])
    }
    res.json(agenda);
});

app.post('/next', (req, res)=>{
    if((current+1) <= (ex.length-1)){
        current++;
    } else {
        current = 0;
    }
    io.emit('next');
    res.json({status: 'ok', current: current});
});

app.post('/reload', (req, res)=>{
    ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'assets', 'problems.json')).toString('utf-8'));
    res.json({status: 'ok'});
});

server.listen(3001, ()=>{
    const serverInfo = server.address();
    const port = serverInfo.port;
    console.log('Listening at %s', port);
});
