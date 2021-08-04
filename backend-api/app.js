const express = require("express"), fs = require("fs"), config = require("./config.json"), app = express();
app.get(`/`, (req, res)=>{
    let data = {index: {}}, servers = Object.keys(config.servers);
    for(i = 0; i < servers.length; i++) data.index[servers[i]] = config.servers[servers[i]][0];
    res.set({"Content-Type": "application/json"}).send(data);
});

app.get(`/:serverId/(:getType)?`, (req, res)=>{
    const respond = (data) => res.set({"Content-Type": "application/json"}).send(data), error = (code) => res.sendStatus(code);
    let serverId = req.params.serverId, getType = req.params.getType, serverInfo = config.servers[serverId];
    if(!!config.servers[serverId]){
        switch(getType){
            case "logs": {
                fs.readdir(config.servers[serverId][1] + '/results', (err, fs_res)=>{
                    respond(data = {
                        id: serverId,
                        index: fs_res
                    });
                });
                break;
            }
            case "logs_data": {
                fs.readdir(config.servers[serverId][1] + '/results', (err, fs_res)=>{
                    data = {id: serverId, index: fs_res, logs: {}}
                    for(i = 0; i < fs_res.length; i++) data.logs[fs_res[i].replace(`.json`, ``)] = require(`${config.servers[serverId][1]}/results/${fs_res[i]}`);
                    respond(data);
                });
                break;
            }
            case "log": {
                let logName = req.query.n;
                if(!!require(config.servers[serverId][1] + '/results' + logName)){
                    respond(data = {
                        id: serverId,
                        log: require(`${config.servers[serverId][1]}/results/${logName}`)
                    });
                }
                else error(404);
            }
            default: {
                respond(data = {
                    id: serverId,
                    metadata: {
                        name: serverInfo
                    }
                });
                break;
            }
        }
    }
    else error(404);
});

app.listen(config.express.port, ()=>{
    console.log(`App listening on http://localhost:${config.express.port}`);
});