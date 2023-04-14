const mongoose = require('mongoose');



const Mechine = new mongoose.Schema({
    macA: String,
    freeMem: Number,
    totalMem: Number,
    usedMem: Number,
    osType: String,
    usedMemPrecentage: String,
    upTime: Number,
    cpuModel: String,
    numOfCores: Number,
    cpuSpeed: Number,
    cpuLoad: Number
})

module.exports = mongoose.model('Mechine', Mechine)