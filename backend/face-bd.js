
var Face = require('./faceModel.js')

module.exports = {
    save: function (event, callback) {
        console.log("EVENT SAVE", event);
        var notificacao = new Face(event);
        notificacao.save(function (err, data) {
            console.log("Adicionando FACE NOVA");
            if (err) {
                console.log("errro = " + err);
                callback(err);
            } else {
                console.log("inserido com sucesso", data);
                callback(null,{"status":"OK"});
            }
        });
    },
    get: function (id, callback) {
        console.log("id get = "+ id)
        Face.findById(id)
            .exec(function (err, reserva) {
                if (err) {
                    return callback(err)
                } else if (!reserva) {
                    var err = new Error('cond not found.');
                    err.status = 401;
                    return callback(null, {status:"NOK", message:"NOTIFICACAO NAO ENCONTRADA"});
                }
                return callback(null, reserva)
            });
    },
    logEntry: function (event, callback) {
        console.log("id log entry = "+ JSON.stringify(event.id));
        let location = event.location
        Face.findOneAndUpdate(
            {id: event.id},
            {$push: {logs: {location:location}}},
            {safe: true, upsert: true},
            function(err, model) {
                if (err) callback(err);

                callback(null, model)
            }
        );
        
    },
    list: function (callback) {
        // TODO
        console.log('Listando Reservas');

        Face.find({}, function (err, cond) {
            if (err) return callback(err);
            callback(null,cond);
        })
    },
    listFilter: function (event, callback) {
        console.log('Listando Reservas');
        Face.find(event, function (err, cond) {
            if (err) return callback(err);
            callback(null,cond);
        })
    },
    update: function (event, callback) {
        // TODO
        console.log('Update conds');
        var query = { _id: event._id };
        
        Face.findOneAndUpdate(query, event, function (err) {
            if (err) {
                console.log("errro = " + err);
                callback(null, {status:"NOK", message:"ERRO AO ATUALIZAR NOTIFICACAO", err:JSON.stringify(err)})
            } else {
                console.log("ok");
                callback(null, {status:"OK"});
            }
            
        })
    }
};