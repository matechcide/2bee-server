const { MongoClient } = require('mongodb');
var db
const xp = 500

MongoClient.connect('mongodb://localhost:27017/', {useNewUrlParser: true}, (err, client) => {
  db = client.db('contact')
});

global.existDB = async function existDB(email){
  return await new Promise(async (resolve) => {
    if(await db.collection("user").find({"email": email}).count() > 0){
      resolve(true)
    }
    else{
      resolve(false)
    }
  })
}

global.writeDB = async function writeDB(email, info){
  if(await existDB(email)){
    await db.collection("user").replaceOne({"email": email}, info);
  }
  else{
    await db.collection("user").insertOne(info);
  }
  let id = await db.collection("user").findOne(
    {
      "email": email
    }, 
    {
      projection:{
        _id: 1
      }
    }
  );
  return `${id._id}`
}

global.deleteDB = async function deleteDB(email){
  if(await existDB(email)){
    await db.collection("user").deleteOne({"email": email})
  }
  return
}

global.readDB = async function readDB(email){
  if(await existDB(email)){
    return await db.collection("user").findOne({"email": email});
  }
  return false
}

global.getProfileDB = async function getProfileDB(email){
  return await db.collection("profile").findOne({"email": email});
}

global.setProfileDB = async function setProfileDB(email, info){
  if(await getProfileDB(email)){
    return await db.collection("profile").replaceOne({"email": email}, info);
  }
  return await db.collection("profile").insertOne(info);
}

global.updateConv = async function updateConv(message, user1, user2){
  const info = await db.collection("conversation").findOne( 
    {[user1] : `${user1} ${user2}`}, 
    {projection:{
      "messages": 1, [user1 + " XP" ]: 1, [user2 + " XP" ]: 1, "lvl": 1, _id: 0}
    } 
  )
  if(info && info.messages ){
    if(message[0] != ""){
      info[user2 + " XP" ] = info[user2 + " XP" ] + message[0].length
      if(info[user2 + " XP" ] >= (300+info.lvl*xp) && info[user1 + " XP" ] >= (300+info.lvl*xp)){
        info.lvl++
        info[user1 + " XP" ] = 0
        info[user2 + " XP" ] = 0
      }
      info.messages.push(message)
      if(info.messages.length > 50){
        await db.collection("conversation").updateOne({[user1] : `${user1} ${user2}`}, {$pop: {"messages": -1}})
      }
      await db.collection("conversation").updateOne({[user1] : `${user1} ${user2}`}, {$push: {"messages": message}})
      await db.collection("conversation").updateOne({[user1] : `${user1} ${user2}`}, { $set: {
        "lvl": info.lvl, 
        [user2 + " XP" ]: info[user2 + " XP" ], 
        [user1 + " XP" ]: info[user1 + " XP" ]
      } });
      let convUser1 = await db.collection("profile").findOne({"id": user1}, {projection:{"conv": 1, _id: 0}})
      let convUser2 = await db.collection("profile").findOne({"id": user2}, {projection:{"conv": 1, _id: 0}})
      if(convUser1.conv.indexOf(user2) > -1 && convUser2.conv.indexOf(user1) > -1){
        await db.collection("profile").updateOne({"id": user1}, {$set: {["last." + user2]: message[2]}, $pullAll: {"conv": [user2]}})
        await db.collection("profile").updateOne({"id": user2}, {$set: {["last." + user1]: message[2]}, $pullAll: {"conv": [user1]}})
        await db.collection("profile").updateOne({"id": user1}, {$push: {"conv": user2}})
        await db.collection("profile").updateOne({"id": user2}, {$push: {"conv": user1}})
      }
    }
    return [info.lvl, [user2, info[user2 + " XP" ]], [user1, info[user1 + " XP" ]], message[2]]
  }
  else{
    return false
  }
}

global.updateReact = async function updateReact(react, user1, user2){
  const info = await db.collection("conversation").findOne( 
    {[user1] : `${user1} ${user2}`}, 
    {
      projection:{
        _id: 1
      }
    } 
  )
  if(info){
    await db.collection("conversation").updateOne(
      {
        [user1] : `${user1} ${user2}`
      }, 
      { 
        $set: { "messages.$[elem].3" : react[0] }
      },
      {
        arrayFilters: [{"elem.2": react[1]}],
        upsert: true
      })
      let convUser1 = await db.collection("profile").findOne({"id": user1}, {projection:{"conv": 1, _id: 0}})
      let convUser2 = await db.collection("profile").findOne({"id": user2}, {projection:{"conv": 1, _id: 0}})
      if(convUser1.conv.indexOf(user2) > -1 && convUser2.conv.indexOf(user1) > -1){
        await db.collection("profile").updateOne({"id": user1}, {$set: {["last." + user2]: "react" + react[1]}, $pullAll: {"conv": [user2]}})
        await db.collection("profile").updateOne({"id": user2}, {$set: {["last." + user1]: "react" + react[1]}, $pullAll: {"conv": [user1]}})
        await db.collection("profile").updateOne({"id": user1}, {$push: {"conv": user2}})
        await db.collection("profile").updateOne({"id": user2}, {$push: {"conv": user1}})
      }
    return true
  }
  else{
    return false
  }
}

global.createConv = async function createConv(user1, user2){
  if(await db.collection("conversation").findOne( {[user1] : `${user1} ${user2}`} )){
    return await db.collection("conversation").replaceOne({[user1] : `${user1} ${user2}`}, {
      [user1] : `${user1} ${user2}`, 
      [user2] : `${user2} ${user1}`, 
      "lvl": 0,
      [user1 + " XP"]: 0,
      [user2 + " XP"]: 0,
      "messages" : []
    });
  }
  return await db.collection("conversation").insertOne({
    [user1] : `${user1} ${user2}`, 
    [user2] : `${user2} ${user1}`,
    "lvl": 0,
    [user1 + " XP"]: 0,
    [user2 + " XP"]: 0,
    "messages" : []
  });
}

global.supConv = async function supConv(user1, user2){
  await db.collection("conversation").deleteOne({[user1] : `${user1} ${user2}`})
}

global.getInfo = async function getInfo(user1, user2){
  const infoLvl = await db.collection("conversation").findOne( 
    {[user1] : `${user1} ${user2}`}, 
    {projection:{
      "lvl": 1, _id: 0}
    }
  )
  const info = await db.collection("profile").findOne(
    {"id": user1}, 
    {projection:{
      "list": 1, _id: 0}
    }
  )
  info.list.splice(infoLvl.lvl, 21)
  return info.list
}

global.updateProfile = async function updateProfile(email, list){
  await db.collection("profile").updateOne({"email": email}, { $set: {
    "list": list
  } });
  return true
}

global.getCustom = async function getCustom(id, title){
  return await db.collection("profile").findOne(
    {
      "id": id
    }, 
    {
      projection:{
        "list": { $elemMatch: {"title": title} },
        _id: 0
      }
  })
}

global.getMessage = async function getMessage(user1, user2){
  return await db.collection("conversation").findOne({[user1] : `${user1} ${user2}`}, 
    {
      projection:{
        _id:0,
        "messages": 1,
        [user1 + " XP"]: 1,
        [user2 + " XP"]: 1,
        "lvl": 1
      }
    }
  );
}

global.newDeviceId = async function newDeviceId(email, newID){
  const info = await db.collection("user").findOne(
    {
      "email": email
    }, 
    {
      projection:{
        "deviceId": 1,
        _id: 0
      }
  })
  info.deviceId = [newID]
  await db.collection("user").updateOne({"email": email}, { $set: {
    "deviceId": info.deviceId
  } });
  return true
}

global.addPConv = async function addPConv(user1, user2){
  const info = await db.collection("profile").findOne(
    {
      "id": user1
    }, 
    {
      projection:{
        "conv": 1,
        _id: 0
      }
  })
  info.conv.push(user2)
  await db.collection("profile").updateOne({"id": user1}, { $set: {
    "conv": info.conv
  } });
  return true
}

global.supPConv = async function supPConv(user1, user2){
  const info = await db.collection("profile").findOne(
    {
      "id": user1
    }, 
    {
      projection:{
        "conv": 1,
        _id: 0
      }
  })
  if(info && info.conv.indexOf(user2) > -1){
    info.conv.splice(info.conv.indexOf(user2), 1)
    await db.collection("profile").updateOne({"id": user1}, { $set: {
      "conv": info.conv
    }});
  }
  return true
}

global.returnConv = async function returnConv(user){
  const info = await db.collection("profile").findOne(
    {
      "id": user
    }, 
    {
      projection:{
        "conv": 1,
        "last": 1,
        _id: 0
      }
  })
  if(info){
    return [info.conv, info.last]
  }
  return []
}

global.existBetaTest = async function existBetaTest(email){
  return await new Promise(async (resolve) => {
    if(await db.collection("waitlist").find({"email": email}).count() > 0){
      resolve(true)
    }
    else{
      resolve(false)
    }
  })
}

global.createBetaTest = async function createBetaTest(info){
  return await db.collection("waitlist").insertOne(info);
}

global.betaAccept = async function betaAccept(info){
  if(await existDB(info.email)) return
  await db.collection("waitlist").deleteOne({"email": info.email})
  const ID = await writeDB(info.email, {"email": info.email, "pwd": info.mdp, "beta": 1, "deviceId": []})
  await setProfileDB(info.email, {"email": info.email, "id": ID, "list": [
      {"title":"Pseudo","text":"pseudo"},
      {"title":"Votre devise","text":""},
      {"title":"Sports","text":""},
      {"title":"Etude/Profession","text":""},
      {"title":"Jeux vidéos","text":""},
      {"title":"Autres activités","text":""},
      {"title":"Films appréciés","text":""},
      {"title":"Séries appréciées","text":""},
      {"title":"Meilleur voyage","text":""},
      {"title":"Endroit à découvrir","text":""},
      {"title":"Chose à faire avant de mourrir","text":""},
      {"title":"Anecdote rigolotte","text":""},
      {"title":"Blague préférée","text":""},
      {"title":"Mes activitées de hors la loi","text":""},
      {"title":"Réseau le plus utilisé","text":""},
      {"title":"Mouvements soutenus","text":""},
      {"title":"Avis politique","text":""},
      {"title":"Age","text":info.age},
      {"title":"Sexe","text":""},
      {"title":"Prénom","text":info.name},
      {"title":"Genre","text":""}
  ],
  "conv": [],
  "last": {}
  })
  return
}

global.returnMail = async function returnMail(){
  return await db.collection("user").find(
    {
      "email": { "$exists": true }
    },
    {
      projection:{
        _id: 0,
        "email": 1
      }
    }
  )
  .toArray()
}

global.custom = async function custom(type, collectionName, searchParms, returnParms, lim){
  const collection = db.collection(collectionName)
  if(!lim) lim = 0;
  switch (type) {
    case "findOne":
      return await collection.findOne(searchParms, returnParms)

    case "find":
      return await collection.find(searchParms, returnParms).sort({ $natural: 1 }).limit(lim).toArray()

    case "count":
      return await collection.find(searchParms, returnParms).count()

    case "updateOne":
      return await collection.updateOne(searchParms, returnParms)

    case "delete":
      return await collection.deleteMany(searchParms, returnParms)

    case "insertOne":
      return await collection.insertOne(searchParms, returnParms)

    default:
      return false
  }
}

global.log = async function log(action, statut, info){
  await db.collection("log").insertOne({
    "action": action,
    "statut": statut,
    "date": Date.now(),
    "info": info
  });
}

// setTimeout(() => {
//   setProfileDB("test", {"email": "test", "list": []})
// }, 500);
