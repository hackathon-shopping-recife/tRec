
var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: 'ACCESSKEY', secretAccessKey: 'SECRECKEY' });
const s3Bucket = new AWS.S3( { params: {Bucket: "shopping-recife"} } );


module.exports = {
    inserir: function (config) {
        return new Promise((resolve, reject)=>{

           // console.log("config.binary", config.binary);
            buf = new Buffer(config.binary.replace(/^data:image\/\w+;base64,/, ""),'base64')
            var data = {
                Key: config.key, 
                Body: buf, 
                ACL: 'public-read-write',
                ContentEncoding: 'base64',
                ContentType: 'image/png'
            };
            s3Bucket.putObject(data, function(err, data){
                if (err) { 
                    console.log(err);
                    console.log('Error uploading data: ', data);
                    reject(err)
                } else {
                    console.log('succesfully uploaded the image!');
                    resolve(data)
                }
            });
        })

    },
    get: function (id, callback) {
        console.log("id get = "+ id)
        Vendedor.findById(id)
            .exec(function (err, reserva) {
                if (err) {
                    return callback(err)
                } else if (!reserva) {
                    var err = new Error('cond not found.');
                    err.status = 401;
                    return callback(null, {status:"NOK", message:"PARCEIRO NAO ENCONTRADA"});
                }
                return callback(null, reserva)
            });
    },
    delete: function (id, callback) {
        console.log("id = "+ id);
        Vendedor.findByIdAndRemove(id)
            .exec(function (err, cond) {
            if (err) {
                return callback(err)
            } else if (!cond) {
                // var err = new Error('cond not found.');
                // err.status = 401;
                return callback(null, {status:"NOK", message : "PARCEIRO NAO ENCONTRADA"});
            }
            return callback(null, {status:"OK"})
        });
    },
    list: function (callback) {
        // TODO
        console.log('Listando Vendedors');

        Vendedor.find({}, function (err, cond) {
            if (err) return callback(err);
            callback(null,cond);
        })
    },
    listFilter: function (event, callback) {
        console.log('Listando Vendedors');
        Vendedor.find(event, function (err, cond) {
            if (err) return callback(err);
            callback(null,cond);
        })
    },
    update: function (event, callback) {
        // TODO
        console.log('Update parceiros');
        var query = { _id: event._id };
        
        Vendedor.findOneAndUpdate(query, event, function (err) {
            if (err) {
                console.log("errro = " + err);
                callback(null, {status:"NOK", message:"ERRO AO ATUALIZAR PARCEIROS", err:JSON.stringify(err)})
            } else {
                console.log("ok");
                callback(null, {status:"OK"});
            }
            
        })
    }
};