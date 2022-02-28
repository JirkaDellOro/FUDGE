# Fudge Net
## Compile
Envoke "CustomTask: Compile All". This starts the following procedure
- compiles message.ts and adjusts the output to be used as a module for the server
- compiles FudgeServer
- compiles FudgeClient together with messages.ts into a single file
## Run
See Test/Net for a working minimal implementation 
- start the server locally or on a remote machine
- start clients in a browser and connect them to the server
- send websocket-messages via the server or
- use the messages ConnectHost or CreateMesh to have the clients connect directly via WebRTC
## Firewall
Disable the public firewall on your computer to be able to work with WebRTC