const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/PerfData', { useNewUrlParser: true })
const Mechine = require('./models/mechine')


function socketMain(io, socket) {
    // console.log('A socket has connected!' + " socket:" + socket.id);
    let macA = ''
    socket.on('auth', (key) => {
        if (key === 'nodeAuthKey') {
            //valid node client
            socket.join('Clients')
        }
        else if (key === 'uiAuthKey') {
            //valit ui client
            socket.join('UI')
            console.log('react client has joined');
        } else {
            //Goodbye..not valid
            socket.disconnect(true)
        }

    })

    socket.on('perfData', (data) => {
        io.to('UI').emit('data', data)
    })
    socket.on('initPerfData', async (initPerfData) => {
        macA = initPerfData.macA
        //now go check mongoDB.
        let mongooseRes = await checkAndAdd(initPerfData)
        console.log(mongooseRes);
    })

}

function checkAndAdd(data) {
    return new Promise((resolve, reject) => {
        Mechine.findOne({ macA: data.macA }, function (err, result) {
            if (err) {
                reject(new Error(err))
            } else if (!result) {
                //handle new mechine
                let newMechine = new Mechine(data)
                newMechine.save()
                resolve('added')
            } else {
                //found it its in the db
                resolve('found')
            }
        })
    })



}


module.exports = socketMain