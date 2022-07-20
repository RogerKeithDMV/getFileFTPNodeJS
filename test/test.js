var Client = require('ftp');
const express = require('express');
const { request } = require('express');

const app = express();
app.use(express.json());

var hostReq="";
var portReq="";
var usernameReq="";
var passwordReq="";
var pathReq="";
var fileReq="";
var boolFile=false;
var jsonFile="";

app.post('/', async(req, res)=>{
    hostReq=req.body.host;
    portReq=req.body.port;
    usernameReq=req.body.username;
    passwordReq=req.body.password;
    pathReq=req.body.path;
    fileReq=req.body.file;
  
    try{
      const result = await FTPServerConnection();
  
      if(boolFile){
        res.json({filename:fileReq, text:result.toString()});
      }
      else{
        res.json(result);
      }
    }
    catch(err){
      res.status(500).json(err);
    }
  })

  app.listen(3000, ()=>{});
  

  async function FTPServerConnection(){
    return new Promise(function(resolve, reject) {
        var c = new Client();
        var listFiles = "";
        try{
          c.connect({ host: hostReq, port: portReq, user: usernameReq, password: 'admin1'});

          if(fileReq){
            boolFile=true;
            c.on('ready', function() {
              c.get(fileReq, function(err, stream) {
                   var content = '';
                   stream.on('data', function(chunk) {
                       content += chunk.toString();
                   });
                   stream.on('end', function() {
                       resolve(content);
                       c.end();
                   });
              })
          });
          }
          else{
            boolFile=false;
            c.on('ready', function() {
              c.list(function(err, list) {
                if (err) throw err;
                resolve(list);
                c.end();
              });
            });
          }
        
       
      }
      catch(err){
        reject(err);
      }
    });
  }