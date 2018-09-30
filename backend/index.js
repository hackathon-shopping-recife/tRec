const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const cors = require('cors')
var timeout = require('connect-timeout')
const uuidv1 = require('uuid/v1');
var reservadb = require("./face-bd");
var FileUtils = require('./FileUtils');


var Kairos = require('kairos-api');
var client = new Kairos('c262452e', 'cb6026e22c8e924676956eae1a3326bc');


const app = express()

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit:"10mb"}));
app.use(cors())
app.use(timeout('60s'))

app.post('/filter', (req, res) => {
  let query = req.body.query;

  reservadb.listFilter(query, function(err, data){
    res.send(data)
  })

})

app.post('/compareFile', (req, res) => {


    let image = req.body.image;
    let location = req.body.location;
    let message = "";

    let params ={
      image,
      gallery_name:"shopping-recife"
    }
    client.recognize(params).then(response => {

      let uuid = uuidv1();

      let paramsEnroll = {
        image,
        subject_id: uuid,
        gallery_name:"shopping-recife"
      }
      console.log("response", JSON.stringify(response));
      let justEnroll = false;
      // detectou face mais  nao esta na base
      if(response.body.Errors){

        if(response.body.Errors[0].ErrCode === 5004){
          console.log("GALERRY NOT FOUNDq");
          justEnroll = true
        }else if(response.body.Errors[0].ErrCode ===5002){
          console.log("NO FACE FAUND");
          res.send({
            status: "NENHUMA FACE DETECTADA"
          })
        }
        else{
          console.log("Nenhuma face detectada");
          message = "NENHUMA FACE DETECTADA"
          res.send({
            status: "NENHUMA FACE DETECTADA"
          })
        }
       
      }

      console.log("body", response.body);

      if(justEnroll || response.body.images[0].transaction.message){
        console.log("FACE ENCONTRADA NAO CADASTRADA");

        console.log("CADASTRO NO KAIROS");
        client.enroll(paramsEnroll).then(response2 => {

          const keys3 = 'user-faces/'+uuid
          FileUtils.inserir({
              binary: image,
              key: keys3
          }).then((data)=>{
              console.log("data S3 = "+JSON.stringify(data));
          })

          console.log("response2", JSON.stringify(response2));
          console.log("FACE CADASTRADA");
        }).then(rep3 => {
          // getmetadata
          let paramsDetect ={
            image
          }
          console.log("BUSCANDO META DADOS");
          client.detect(paramsDetect).then(resp4 => {

            console.log("METADADOS COM SUCESSO");
            console.log("INSERINDO BD");
            inserirDB(resp4, uuid, function(err, data){
              
              console.log("RESP",);
              if(err) console.log("ERRRO", err);
              res.send({
                status: "FACE NOVA",
                id: uuid.split("-")[0],
                attr: resp4.body.images[0].faces[0].attributes
              })
            })
            
          })
          
        })
        .catch(function(err) { 
          console.log("err", err);
        });
      }else{
        // detectou faca ja cadastrada
        let id = response.body.images[0].candidates[0].subject_id;
        console.log("ID: "+id);
        console.log("LOCATION: "+location);
        let event = {
          id
        }

        console.log("procurando id na base")
        reservadb.listFilter(event, function(err, data){
          if(err) console.log("Erro ao listar eventos", err);
          console.log("data", data)
          console.log("is Array", Array.isArray(data))
          console.log("is Array", data.length)
          if(data.length > 0){
            console.log("Ja existe inserir log")
            
            let evloc ={
              ...event,
              location
            }

            inserirLog(evloc, function(err, data){
              if(err) console.log("Erro", err);

              res.send({
                status: "FACE JA CADASTRADA",
                id: id.split("-")[0],
                attr: data.attributes
              })
            })
          }else{
            let paramsDetect ={
              image
            }
            console.log("Nao existe na base")
            console.log("BUSCANDO META DADOS");
          client.detect(paramsDetect).then(resp4 => {

            console.log("METADADOS COM SUCESSO");
            console.log("INSERINDO BD");
            inserirDB(resp4, id, function(err, data){
              
              if(err) console.log("ERRRO", err);
              res.send({
                status: "FACE NOVA",
                id: id.split("-")[0],
                attr: resp4.body.images[0].faces[0].attributes
              })
            })
            
          })
          }
        })
      }
    })
    .catch(function(err) { 
      console.log("err", err);
    });
})

function inserirDB(obj, uuid, callback){

  console.log("METADATA j", JSON.stringify(obj));

  let attributes = obj.body.images[0].faces[0].attributes

  let gender  = attributes.gender.type
  attributes.gender["tipo"] = gender
  let face ={
    id: uuid,
    attributes


  }
  console.log("FACE", face);
  reservadb.save(face, function(err, reserva){
    if (err) {
      callback(err);
    } else {
      callback(null, reserva);
    }
})
}

function inserirLog(obj, callback){

  reservadb.logEntry(obj, function(err, reserva){
    if (err) {
      callback(err);
    } else {
      callback(null, reserva);
    }
})

}

app.listen(PORT) // <-- comment this line out from your app