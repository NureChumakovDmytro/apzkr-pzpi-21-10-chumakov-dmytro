import network
import time
from machine import Pin
import dht
import ujson
from umqtt.simple import MQTTClient
import urequests  # Import the urequests library for HTTP/HTTPS requests

# MQTT Server Parameters
MQTT_CLIENT_ID = "climate-controller"
MQTT_BROKER    = "broker.mqttdashboard.com"
MQTT_USER      = ""
MQTT_PASSWORD  = ""
MQTT_TOPIC     = "climate"

# HTTPS Server URL (Replace with your actual server URL)
HTTPS_URL = "https://webhook.site/5454912f-98ae-41af-b4c7-2d4f9a0abf18"  # Replace with your actual server URL

# Initialize DHT22 sensor
sensor = dht.DHT22(Pin(15))

print("Connecting to WiFi...", end="")
sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
sta_if.connect('Wokwi-GUEST', '')
while not sta_if.isconnected():
    print(".", end="")
    time.sleep(0.1)
print(" Connected to WiFi!")

print("Connecting to MQTT server... ", end="")
client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, user=MQTT_USER, password=MQTT_PASSWORD)
client.connect()
print("Connected to MQTT server!")

prev_weather = ""

while True:
    print("Measuring pod climate conditions... ", end="")
    sensor.measure()

    temp = sensor.temperature()
    humidity = sensor.humidity()

    # Prepare the data message
    data = {
        "temperature": temp,
        "humidity": humidity,
        "status": "Monitoring",
    }
    message = ujson.dumps(data)

    if message != prev_weather:
        print("Climate updated!")
        print("Reporting to MQTT topic {}: {}".format(MQTT_TOPIC, message))
        client.publish(MQTT_TOPIC, message)
        
        # Send data to HTTPS server
        try:
            print("Sending data to HTTPS server...")
            response = urequests.post(HTTPS_URL, json=data, headers={"Content-Type": "application/json"})
            print("Response from HTTPS server:", response.text)
            response.close()
        except Exception as e:
            print("Failed to send data to HTTPS server:", e)

        prev_weather = message
    else:
        print("No change in climate")

    time.sleep(5)  # Wait before the next measurement
