# Tesla PowerWall Dashboard

![Image of TeslaPowerDash](https://user-images.githubusercontent.com/1670791/76449727-f4bb7880-63a2-11ea-9b1f-94f0ef7a28a7.png)

Steps to build your own Tesla Powerwall Dashboard.  This guide assumes you have some knowledge of network, development and system administration skills.
If that scares you and/or you need to google "how to ssh into server". I suggest you spend some time learning how to do those first.

## Getting Started

First you will need to setup a dedicated server.  I recommend Ubuntu Server 18.04 as that was the cheapest option to setup for myself.

### Prerequisites

These are the tools you need to set up this dashboard for yourself:

* [Ubuntu Server 18.04 LTS](https://ubuntu.com/download/server) - The server used to grab, store and display the PowerWall Data
* [InfluxDB](https://www.influxdata.com/) - The time based database used to store the historical data
* [Telegraf](https://portal.influxdata.com/downloads/) - Plugin for InfluxDB to capture API data streams
* [Grafana](https://grafana.com/grafana/download) - Dashboard to visually Display PowerWall Data
* [Tesla PowerWall](https://www.tesla.com/energy) - Tesla Powerwall and/or Solar generation from Tesla

### Installing

Once Ubuntu is up and running, you'll want to SSH into the server

```
mycomputer:~ username$ ssh <username here>@<ip address of server>
```

Once you are logged in, you should run an update script to make sure your server is up to date and the dependencies are all up to date.

```
sudo apt-get update
```

Then

```
sudo apt-get upgrade
```

Okay, now thats out of the way, lets start by installing InfluxDB on the server (one line at a time and these are for Ubuntu 15.04+):

```
sudo apt-get update && sudo apt-get install influxdb
sudo systemctl unmask influxdb.service
sudo systemctl start influxdb
```

Next is to setup Telegraf:

```
sudo apt-get update && sudo apt-get install telegraf
sudo systemctl start telegraf
```

And then finally Grafana:

```
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
```
```
curl https://packages.grafana.com/gpg.key | sudo apt-key add -
```
```
sudo apt-get update && sudo apt-get install grafana
sudo systemctl enable grafana-server.service
```
Just note the default login and password for grafana is admin/ admin

## Configuring everything to work together

Now that we have everything installed, we need to setup all the config files for each process.

### Powerwall API access

As of now, on your local network, the Tesla installed gateway to the powerwalls and/or solar is open to view.  All you need to do here is know what the IP address is.

If you thought ahead, you might have already had Tesla set the gateway as a static Ip address on your network but if you didn't, there are ways to find that out.  By either using your home network router to view the DHCP tables and find the IP address of your system.  If it's getting the Ip address from the router via DHCP, I would suggest you copy down the MAC address and add a rule to your router that assigns a static Ip address to the Gateway to make your life 100 times easier.  

Each router is different here and I cannot cover every option that might be available.  With some knowledge of networking and the suggestions I give here, you should be able to get this setup with ease.  

Once you have the IP address to the Tesla Gateway, type the following into your web browser:

```
https://{tesla gateway IP address}/api/system_status/soe

example: https://192.168.1.220/api/system_status/soe
```

If you get back something like this:

```
{
    "percentage": 94.85294117647058
}
```

Then you are able to see the raw data from the Gateway's API!

Here are the API endpoints you will need for adding into Telegraf:

```
https://{tesla gateway IP address}/api/meters/aggregates
https://{tesla gateway IP address}/api/system_status/soe
```

### InfluxDB Config edit

You will need to open the InfluxDB config file in an editor like so:
(using nano here but you could use `vi` if thats's more to your liking)

```
sudo nano /etc/influxdb/influxdb.conf
```

Once you have the config file open, you'll want to scroll down to the section that's titled `[http]` and edit these lines to reflect as shown below:
Note: I have edited out some of the comments from the config file here for ease of reading.  be sure you find these lines and and edit them, don't just copy/paste what I have here.

```
[http]
  enabled = true
  bind-address = "{your servers ip address}:8086"
  auth-enabled = false
  log-enabled = true
#  write-tracing = false
#  pprof-enabled = false
#  https-enabled = false
#  https-certificate = "/etc/ssl/influxdb.pem"
```

Once that's done, just hit `ctrl + X` to exit and when prompted, type `y` to save your edits.

### Telegraf Config edit

Now well do something similar to the Telegraf config file.

```
sudo nano /etc/telegraf/telegraf.conf
```

This file is HUGE with a Lot of stuff commented out.  You will need to find two sections to edit.

The first section is the output (connection) to influxDB.  Edit the `[outputs.influxdb]` as so:

```
[[outputs.influxdb]]
  urls = ["http://{influxdb IP address or localhost}:{port influxDB is listening on}"]
  database = "powerData" # or whatever you want to name the DB
  skip_database_creation = false
  # retention_policy = ""
  # write_consistency = "any"
  # timeout = "5s"
  # username = "telegraf"
  # password = "metricsmetricsmetricsmetrics"
  # user_agent = "telegraf"
  # udp_payload = "512B"
  # tls_ca = "/etc/telegraf/ca.pem"
  # tls_cert = "/etc/telegraf/cert.pem"
  # tls_key = "/etc/telegraf/key.pem"
  # insecure_skip_verify = false
  # http_headers = {"X-Special-Header" = "Special-Value"}
  # content_encoding = "identity"
  # influx_uint_support = false
```

Now we must add in the API inputs for Telegraf to listen to and send to InfluxDB.  Just uncomment out the lines you need in the config and edit them as so:

```
 [[inputs.http]]
   urls = [
     "https://{Tesla Gateway IP address}/api/meters/aggregates",
     "https://{Tesla Gateway IP address}/api/system_status/soe",
     "Any other JSON API you want really"
   ]
    method = "GET"
    insecure_skip_verify = true
    timeout = "5s"
    data_format = "json"
```
Once that's done, just hit `ctrl + X` to exit and when prompted, type `y` to save your edits.

Now, once those edits are made we need to restart the services to pick up the changes.  
(Be sure you restart influxDB first otherwise telegraf might fail out for influxDB not accepting the connection.)

```
sudo systemctl restart influxdb
sudo systemctl restart telegraf
```

Now lets access all the other fun Tesla API bits....

## Load up the Middleware NodeJS Gateway

If you have a Tesla Car, or want to access other data Tesla is storing on your account, you'll need to setup the NodeJS Middleware server to be able to create an oAuth token.  This is my own custom oAuth server, written and tested by me.  So if things go wrong, let me know.  

Ideally on the same server you have the Grafana dashboard on (but not a requirement) you need to load up the nodeJS middleware.  To do this you will need to have NPM and NodeJS installed on the server hosting the middleware.  There are instructions for setting up both these on the [NodeJS website](https://nodejs.org/).

Once Node and NPM are installed, you will need to clone this repository.

```
git clone https://github.com/rhodesman/teslaPowerDash
```
And navigate into that directory (assuming you just cloned the repo to your current folder)

```
cd teslaPowerDash
```
From within this folder, navigate to the middleware folder
```
cd middleware
```
Then you'll need to install the dependencies:
```
npm install
```
Hopefully you don't get any errors while installing but one error I did encounter was with libcurl.  If you see an error with libcurl installing, run this command inside the middleware folder after the initial install:
```
npm install node-libcurl --build-from-source --curl_static_build=true --save
```
Now you should be able to run the middleware software.
```
npm start
```
The middleware should spit out an ip address that you can now load in a browser.

```
middleware jrhodes$ npm start

> PWDashboard@1.0.0 start /teslaPowerDash/middleware
> nodemon app.js

[nodemon] 1.18.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node app.js`
Server running at http://192.168.1.100:3301
```
Note that any changes you make to the site will cause the server to reload itself (which is a good thing!!).

Going to the website NodeJS is reporting will present you with a very basic settings page.  Mainly you'll need to enter the addresses for the influxDB, nodeJS API server (this middleware server) and your Tesla username and password.  Once you submit that form, a json file will be created in your `middleware/setup` folder called `pwSettings.json`.

### Get your Tesla oAuth token

Once your settings are inputted, you will receive your personalized Tesla oAuth Token DO NOT SHARE THIS!

You will also receive the product ID for your Powerwalls and Solar (if you have solar).  You will need to test to be sure, but the URL the settings page builds for you should have the Product ID of your powerwalls in it.   

Copy the API URL the settings page returns and add it to your telegraf settings where your URLs are defined in `[[inputs.http]]`

## Setup Grafana

Once telegraf is setup and capturing the data from the API, you can move to creating a dashboard in Grafana.  To do this, you will need to navigate to the grafana setup on your server.  (The default port for grafana is 3000):
```
http://{your server ipaddress}:3000/
ex: http://192.168.0.220:3000
```
I have included two dashboards that I setup for myself in the folder `grafana templates` within this repo.  You will need to search through the json files and replace the server addresses for your influx and tesla middleware API addresses where needed but then you can import the dashboard to your grafana and see the dashboard for youself.  

There is extensive documentation on how to setup Grafana on their site (grafana docs)[https://grafana.com/docs/].  

## Donate

If you enjoy this setup and want to help pay for my kids college, feel free to "buy me a coffee" or whatever the kids call it these days.
[Buy me a Coffee](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L82DPCD9CCTP2&currency_code=USD&source=url)

## Authors

* **Jason Rhodes** - *Initial work* - [Rhodesman](https://github.com/rhodesman)
