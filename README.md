# KurumaTracker
Session/Logs Tracker for Assetto Corsa Servers

### Features
- View session logs in a web UI
- View driver Steam profile
- Extensive log details
- Support for multiple server logs

### Todo
- [x] Session logs
- [ ] Live server information
- [ ] Filter logs by driver name/GUID
- [ ] Add more details to session logs

### Requirements
> This script requires [ac-server-wrapper](https://github.com/gro-ove/ac-server-wrapper) to be running on your Assetto Corsa server.
- Webserver & Assetto Corsa server:
    - [NodeJS](https://nodejs.org/) (recommended: > v15.4.0) and [NPM (Node Package Manager)](https://www.npmjs.com/)
    - [NGINX](https://nginx.org/) (preferred) or [Apache2](https://httpd.apache.org/) to reverse-proxy the web interface (**OPTIONAL BUT RECOMMENDED**)
- Assetto Corsa server:
    - [ac-server-wrapper](https://github.com/gro-ove/ac-server-wrapper)

### Installation & Usage
1. Download the .zip file and extract the contents of **frontend** to a directory in your webserver and extract the contents of **backend-api** to a directory in your machine running the Assetto Corsa server.
2. In the directory where you extracted the files, run: `npm ci`
3. Open the `config.json` of **frontend** and **backend-api** and change or add the values of each option. (Refer to the [configuration](#configuration) section)
    > Note that `express.port` is the port that the web interface will run on.
    > Note that `servers.<SERVER_ID>` must have a key that is a unique JSON and URL-friendly string (preferably a character length of 12)
4. Run the **frontend** and **backend-api** applications using `node app.js` in the directory that you extracted the files to.

5. **IF USING NGINX AS A REVERSE-PROXY:**
    1. Create or edit a configuration file in `/etc/nginx/sites-available`
    2. Inside a `server` block, add a `location` block pointing to `/` and inside add the following:
        - `proxy_pass` A valid [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL) pointing to the URL of the web interface. (ex: "http://localhost:8000")
        - `proxy_http_version` = `"1.1"`
        - `proxy_set_header` = `Upgrade $http_upgrade`
        - `proxy_set_header` = `Connection 'upgrade'`
        - `proxy_set_header` = `Host $host`
        - `proxy_cache_bypass` = `$http_upgrade`

        **RAW CODE:**
        ```
        location / {
            proxy_pass "http://localhost:8000";
            proxy_http_version "1.1";
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        ```
        Reference: [NGINX proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)

### Configuration
For **frontend**:
- `name` Server name
- `url` A valid [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL) that's used as the canonical for the web interface
- `servers.UNIQUE_ID = ["SERVER_NAME", "BACKEND_API_URL", "SERVER_IP:WRAPPER_PORT"]`
    - `UNIQUE_ID` A unique JSON and URL-friendly string used to identify the server,
    - `SERVER_NAME` A string used as the name/identifier the server. (ex: "My cool server")
    - `BACKEND_API_URL` A valid [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL) string that points to the **backend-api**'s URL.
    - `SERVER_IP` The IP of the Assetto Corsa server
    - `WRAPPER_PORT` The port of the [ac-server-wrapper](https://github.com/gro-ove/ac-server-wrapper) in: `cm_wrapper_params.json > "port"`
- `express`
    - `port` The port that the web interface will run on.

For **backend-api**:
- `name` Server name
- `servers.UNIQUE_ID = ["SERVER_NAME", "BACKEND_API_URL", "SERVER_IP:WRAPPER_PORT"]`
    - `UNIQUE_ID` A unique JSON and URL-friendly string used to identify the server,
    - `SERVER_NAME` A string used as the name/identifier the server. (ex: "My cool server")
    - `ABSOLUTE_FILE_PATH` The file path of the Assetto Corsa server that has `acServer` or `acServer.exe` file. (ex: "/etc/server_files/my_ac_server")
    - `SERVER_IP` The IP of the Assetto Corsa server
    - `WRAPPER_PORT` The port of the [ac-server-wrapper](https://github.com/gro-ove/ac-server-wrapper) in: `cm_wrapper_params.json > "port"`
- `express`
    - `port` The port that the backend API will run on.


Example `config.json` file for **frontend**:
```json
{
    "name": "YOUR SERVER NAME",
    "url": "YOUR WEBSITE URL",
    "servers": {
        "UNIQUE_ID": ["SERVER_NAME", "BACKEND_API_URL", "SERVER_IP:WRAPPER_PORT"],
        "45d4c4922a5c": ["My cool server", "http://86.191.101.79:8080", "86.191.101.79:80"]
    },
    "express": {
        "port": 8000
    }
}
```

Example `config.json` file for **backend-api**:
```json
{
    "name": "YOUR SERVER NAME",
    "url": "YOUR WEBSITE URL",
    "servers": {
        "UNIQUE_ID": ["SERVER_NAME", "ABSOLUTE_FILE_PATH"],
        "45d4c4922a5c": ["My cool server", "/etc/server_files/my_ac_server"]
    },
    "express": {
        "port": 8000
    }
}
```
