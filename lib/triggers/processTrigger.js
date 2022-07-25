var Client = require('ftp');
const log = require('../../helpers/logger');
const rabbitmq = require('rabbitmqcg-nxg-oih');
let ftp = new Client();
const fs = require('fs');

const ERROR_PROPERTY = 'Error missing property';

module.exports.process = async function processTrigger(msg, cfg, snapshot = {}){
    try {

      log.info("Inside processTrigger()");
      log.info("Msg=" + JSON.stringify(msg));
      log.info("Config=" + JSON.stringify(cfg));
      log.info("Snapshot=" + JSON.stringify(snapshot));

      let properties = {
        host: null, 
        port: null, 
        username: null, 
        password: null, 
        path: null, 
        file: null,
        key: null
      };

      let{data}=msg;

        if(!data){
          this.emit('', '${ERROR_PROPERTY} data');
          throw new Error('${ERROR_PROPERTY} data');
        }

        Object.keys(properties).forEach((value) => {

          if (data.hasOwnProperty(value)) {

              properties[value] = data[value];

          } else if (cfg.hasOwnProperty(value)) {

              properties[value] = cfg[value];

          } else {

              log.error(`${ERROR_PROPERTY} ${value}`);

              throw new Error(`${ERROR_PROPERTY} ${value}`);

          }

      });


        if(properties.key){
          data = await ftp.connect({
            host:properties.host,
            port:properties.port,
            username:properties.username,
            privateKey:fs.readFileSync(properties.key)
          })
          .then(() => {
            try{
                if(properties.file){
                  ftp.on('ready', function() {
                    ftp.get(properties.file, function(err, stream) {
                        var content = '';
                        stream.on('data', function(chunk) {
                            content += chunk.toString();
                        });
                        stream.on('end', function() {
                            return (content);
                        });
                    })
                });
                }
                else{
                  ftp.on('ready', function() {
                    ftp.list(function(err, list) {
                      if (err) throw err;
                      return (list);
                    });
                  });
                }
            }
            catch(err){
              return ({"error":err});
            }
          });
        }

        else{
          data = await ftp.connect({
            host:properties.host,
            port:properties.port,
            username:properties.username,
            password:properties.password
          })
          .then(() => {
            try{
                if(properties.file){
                  ftp.on('ready', function() {
                    ftp.get(properties.file, function(err, stream) {
                        var content = '';
                        stream.on('data', function(chunk) {
                            content += chunk.toString();
                        });
                        stream.on('end', function() {
                            return (content);
                        });
                    })
                });
                }
                else{
                  ftp.on('ready', function() {
                    ftp.list(function(err, list) {
                      if (err) throw err;
                      return (list);
                    });
                  });
                }
            }
            catch(err){
              return ({"error":err});
            }
          });
        }

        if(properties.file){
          const myBuffer = Buffer.from(data, 'utf-8');
          const myBase64File = myBuffer.toString('base64');

          log.info("Archivo: " + properties.file);
          log.info("Nombre del archivo disponible: " + properties.file);

          this.emit('data', {data: {"file":properties.file, "content":myBase64File}});
          console.log("respuesta: ",data);
        }

        else{
          log.info("Archivo: " + properties.file);
          log.info("Nombre del archivo disponible: " + properties.file);

          this.emit('data', {data});
          console.log("respuesta: ",{data});
        }

        this.emit('snapshot', snapshot);

        log.info('Finished api execution');
        this.emit('end');
    } catch (e) {
        log.error(`ERROR: ${e}`);
        this.emit('error', e);
        await rabbitmq.producerMessage(msg.toString(), e.toString());
    }

    finally{
      ftp.end();
      console.log("Termina getlistadfileftpnodejs.");
    }
};
