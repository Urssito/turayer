const users = require("../models/users");
const publications = require("../models/publications");
const path = require('path');
const updateEnv = require('update-dotenv');

const userData = JSON.stringify(users.schema.obj);
const pubData = JSON.stringify(publications.schema.obj);
updateModels(users, userData);
updateModels(publications, pubData);

async function updateModels(schema,schemaString){
    let rawData = schemaString.split('":');
    let schemaKeys = [];
    let objUpdated = [];
    let schemaName = "PUB_SCHEMA"
    if(schema.schema.obj.password){
        schemaName = "USER_SCHEMA"
    }
    let schemaUpdated = [];

    rawData.forEach(key => {
        if(key.indexOf("required") === -1 && key.indexOf("default") === -1){
            schemaKeys.push(key.split('"').pop());
        }
    });
    schemaKeys = schemaKeys.slice(0, schemaKeys.length-1)

    if(schemaKeys.length < JSON.parse(process.env[schemaName]).length){

        await schema.find((err,results)=>{
            if(err) console.error;
            else{
                
                let objString = JSON.stringify(results[0]).split('":');
                let keys = []

                objString.forEach(a => {
                    keys.push(a.split('"').pop())
                });
                keys = keys.slice(0, keys.length-1)

                results.map((result, i) => {
                    objUpdated.push(JSON.parse(JSON.stringify(result)));
                    keys.map(key => {
                        if(key !== '_id' && key !== '__v'){
                            let found = schemaKeys.includes(key);
                            if(!found){
                                delete objUpdated[i][key];
                            }else{
                                if(!schemaUpdated.includes(key)){
                                    schemaUpdated.push(key)
                                }
                            }
                        }
                    });
                });

            }
        }).clone();
        
        objUpdated.map((obj) => {
            users.findOneAndReplace({_id: obj._id}, obj,{new: true}, (err, success) => {
                if(err) console.error(err);
            });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
        });
        process.env[schemaName] = schemaUpdated;
        updateEnv({
            [schemaName]: JSON.stringify(schemaUpdated)
        }).then((done) => console.log('listo: ', done))
        console.log("database updated!\n", process.env[schemaName].split(','))
    }
}