const mqtt = require('mqtt')
const https = require('https')

const reqoptions = {
    hostname: 'api.bitpanda.com',
    port: 443,
    path: '/v1/ticker',
    method: 'GET'

}

const mqtt_hostname = 'localhost'
const mqtt_port = 1883

if (process.env.MQTT_HOST != undefined) {
    mqtt_hostname = process.env.MQTT_HOST
}
if (process.env.MQTT_PORT != undefined) {
    mqtt_port = process.env.MQTT_PORT
}

function getDataAndPublish()
{
    let req = https.request(reqoptions, res => {
        console.log('statusCode:' + res.statusCode)
        let receiveddata = ''
        res.on('data', d => {
            receiveddata = receiveddata + d
            
        })
        res.on('end', () => {
            if (res.complete)
            {
                let object = JSON.parse(receiveddata)
                console.log(receiveddata)
                var mqttclient = mqtt.connect({ host: mqtt_hostname, port: mqtt_port})
                mqttclient.on('connect', function() {
                    for (property in object)
                    {
                        mqttclient.publish("bitpanda/" + property, JSON.stringify(object[property]))
                    }
                    mqttclient.end()
                })
                mqttclient.on('error', e => {
                    console.log(e)
                })
            }
        })
    })

    req.on('error', error => {
        console.error(error)
    })
  
    req.end()
}

getDataAndPublish()
setInterval(getDataAndPublish, 60*1000);