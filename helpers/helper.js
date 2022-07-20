var Client = require('ftp');

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

module.exports={FTPServerConnection}