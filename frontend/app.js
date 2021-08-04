const fs = require("fs"), path = require("path"), color = require("colors/safe"), fetch = require("node-fetch"), express = require("express"), ejs = require("ejs"), version = "0.01", config = require("./config.json"), app = express();
app.engine(`ejs`, ejs.renderFile);
app.set(`view engine`, `ejs`);
app.use(express.static(`public`));

app.get(`/`, (req, res)=>{
    res.render(`index`, {
        version: version,
        config: config,
        ac_func: ac_func,
        server_data: config.servers
    });
});

/* log to file: ./logs */
fs.mkdir('./logs', ()=>{return});
const session = new Date().getTime(),
log = {
    err: (data) => {
        return new Promise((resolve, reject)=>{
            let res = [`\[ERROR\]\<${new Date().toJSON()}\>: ${data.replaceAll("\n", " ")}\n`, color.red(`\[ERROR\]`) + ' ' + color.bgGray(`\<${new Date().toJSON()}\>`) + ' ' + data];
            fs.appendFile(`./logs/error_${session}.txt`, res[0], "utf8", err => !!err ? reject(err) : resolve(res[1]));
        });
    },
    warn: (data) => {
        return new Promise((resolve, reject)=>{
            let res = [`\[WARN\]\<${new Date().toJSON()}\>: ${data.replaceAll("\n", " ")}\n`, color.red(`\[WARN\]`) + ' ' + color.bgGray(`\<${new Date().toJSON()}\>`) + ' ' + data];
            fs.appendFile(`./logs/log_${session}.txt`, res[0], "utf8", err => !!err ? reject(err) : resolve(res[1]));
        });
    },
    info: (data) => {
        return new Promise((resolve, reject)=>{
            let res = [`\[LOG\]\<${new Date().toJSON()}\>: ${data.replaceAll("\n", " ")}\n`, `\[LOG\] <${new Date().toJSON()}\> ${data}`];
            fs.appendFile(`./logs/log_${session}.txt`, res[0], "utf8", err => !!err ? reject(err) : resolve(res[1]));
        });
    }
},
checkIfOnline = (url_input) => {
    let http = require("http");
    return new Promise((resolve, reject)=>{
        let url = new URL(url_input), options = {
            hostname: url.hostname,
            port: url.port ? url.port : (url.protocol == "http:" ? 80 : 443),
            path: url.pathname,
            method: "HEAD"
        }
        req = http.request(options, (res) => resolve(!!res));
        req.on("error", (res) => log.err(msg = `Unexpected error "${res.code}" (${res.errno})\nThere could be a misconfiguration in '${path.resolve("./config.json")}'`).then((err)=>{console.error(err); reject("An error occured, please try again later or view the error logs.")}))
        req.end();
    });
}

app.get(`/server/:serverId`, (req, res)=>{
    const error = (code, error) => !!error ? res.status(code).send(error) : res.sendStatus(code);
    if(!config.servers[req.params.serverId]) error(404);
    else{
        let api = config.servers[req.params.serverId][1] + '/' + req.params.serverId + '/';
        checkIfOnline(api).then((isOnline)=>{
            if(isOnline == true){
                fetch(api).then((cmVz)=>{
                    cmVz.json().then((server_data)=>{
                        fetch(api + 'logs_data').then((cmVzMg)=>{
                            cmVzMg.json().then((log_list)=>{
                                var car_list = {}, track_list = {};
                                for(a = 0; a < Object.keys(log_list.logs).length; a++){
                                    let logData = Object.values(log_list.logs)[a];
                                    track_list[a] = require(`./public/assets/d1c4bc5da1eb2c8a80600ef7c890c761/tracks/${logData.TrackName.replace(`csp/0/../`, ``)}/${logData.TrackConfig}/ui_track.json`);

                                    for(b = 0; b < Object.keys(Object.values(log_list.logs)[a].Cars).length; b++){
                                        let carData = Object.values(log_list.logs)[a].Cars[b];
                                        car_list[carData.Model] = require(`./public/assets/d1c4bc5da1eb2c8a80600ef7c890c761/cars/${carData.Model}/ui_car.json`);
                                    }
                                }
                                try{
                                    let api = new URL(`http://${config.servers[req.params.serverId][2]}/api/details`);
                                    fetch(api.toString()).then((cmVzMw)=>{
                                        cmVzMw.json().then((acs_data)=>{
                                            var current_track = require(`./public/assets/d1c4bc5da1eb2c8a80600ef7c890c761/tracks/_unknown_/ui_track.json`);
                                            try{
                                                current_track = require(`./public/assets/d1c4bc5da1eb2c8a80600ef7c890c761/tracks/${acs_data.track.replace(`csp/0/../`, ``).replace(`-`, `/`)}/ui_track.json`);
                                            }
                                            catch(err){
                                                console.log(`[track]`, `"${acs_data.track.replace(`csp/0/../`, ``).replace(`-`, `/`)}" not found`)
                                            }
                                            res.render(`server`, {
                                                version: version,
                                                config: config,
                                                ac_func: ac_func,
                                                server_data: [server_data, acs_data],
                                                log_list: log_list,
                                                car_list: car_list,
                                                track_list: [track_list],
                                                current_track: current_track,
                                                missing_track: current_track.tags[0] == "unknown_track" ? true : false
                                            });
                                        });
                                    });
                                }
                                catch(err){
                                    error(500, err);
                                }
                            });
                        });
                    });
                });
            }
            else error(500);
        }).catch((err)=>error(500, err));
    }
});
app.listen(config.express.port, log.info(`KurumaTracker v${version} Started (http://localhost:${config.express.port})`).then(console.log));

/* useful assetto corsa functions */
const ac_func = {
    calculateSunAngleByTime: (time = "13:00") => {
        let totalHours = parseInt(time.replace(`:`, ``), 10);
        if(isNaN(totalHours) || totalHours < 800 || totalHours > 1800){ this.sun_angle = 0; return; }
        let timeParts = time.split(`:`), hours = parseInt(timeParts[0], 10), minutes = parseInt(timeParts[1], 10), totalMinutes = (hours * 60 + minutes) - 780;
        this.sun_angle = Math.floor(totalMinutes / 30) * 8;
    },
    calculateTimeBySunAngle: (sun_angle = "0") => {
        let totalHours = ((sun_angle / 8) * 30 + 780) / 60, hrs = totalHours.toString();
        return Math.floor(totalHours).toString() + `:` + (hrs[hrs.length - 1] === `5` ? `30` : `00`);
    }
}
