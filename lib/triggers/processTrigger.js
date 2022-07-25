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

      log.info("host :"+properties.host);
      log.info("port :"+properties.port);
      log.info("username :"+properties.username);
      log.info("password :"+properties.password);
      log.info("path :"+properties.path);
      log.info("file :"+properties.file);
      log.info("key :"+properties.key);


        if(properties.key){
          log.info("Hay llave....");
          data = await ftp.connect({
            host:properties.host,
            port:properties.port,
            username:properties.username//,
            //privateKey:fs.readFileSync(properties.key)
          })
          .then(() => {
            log.info("Ya se conecto....");
            try{
                if(properties.file){
                  log.info("Hay nombre de archivo y llave....");
                  ftp.on('ready', function() {
                    ftp.get(properties.file, function(err, stream) {
                        var content = '';
                        stream.on('data', function(chunk) {
                            content += chunk.toString();
                        });
                        stream.on('end', function() {
                          log.info("regresando base 64....");
                            return (content);
                        });
                    })
                });
                }
                else{
                  log.info("No hay nombre de archivo....");
                  ftp.on('ready', function() {log.info("Ya se conecto....");
                    ftp.list(function(err, list) {
                      if (err) throw err;
                      log.info("Regresando lista....");
                      return (list);
                    });
                  });
                }
            }
            catch(err){
              return ({"error":err});
            }
          })
          .catch((error) => {
            return ({"error":err});
        })
        }

        else{
          log.info("Hay contraseña....");
          data = await ftp.connect({
            host:properties.host,
            port:properties.port,
            username:properties.username,
            password:properties.password
          })
          .then(() => {
            log.info("Ya se conecto....");
            try{
                if(properties.file){
                  log.info("Hay nombre de archivo y contraseña....");
                  ftp.on('ready', function() {
                    ftp.get(properties.file, function(err, stream) {
                        var content = '';
                        stream.on('data', function(chunk) {
                            content += chunk.toString();
                        });
                        stream.on('end', function() {
                            log.info("Regresando base 64....");
                            return (content);
                        });
                    })
                });
                }
                else{
                  log.info("Ya se conecto....");
                  ftp.on('ready', function() {
                    ftp.list(function(err, list) {
                      if (err) throw err;
                      log.info("regresando la lista....");
                      return (list);
                    });
                  });
                }
            }
            catch(err){
              return ({"error":err});
            }
          })
          .catch((error) => {
            return ({"error":err});
        });
        }

        if(properties.file){
          log.info("Se va a armar al JSon respuesta con base 64....");
          const myBuffer = Buffer.from(data, 'utf-8');
          const myBase64File = myBuffer.toString('base64');

          log.info("Archivo: " + properties.file);
          log.info("Nombre del archivo disponible: " + properties.file);

          this.emit('data', {data: {"file":properties.file, "content":myBase64File}});
          console.log("respuesta: ",data);
        }

        else{
          log.info("Se va a regresar la lista en JSON....");

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
