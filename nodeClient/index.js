const os = require('os')
const { io } = require("socket.io-client");
const socket = io.connect('http://127.0.0.1:8181')


socket.on('connect', () => {
    // console.log('i connected to the server');
    const nI = os.networkInterfaces();
    let macA;

    //loop through the 
    for (let key in nI) {
        if (!nI[key][0].internal) {
            macA = nI[key][0].mac
            break;
        }
    }

    socket.emit('auth', 'nodeAuthKey')

    performanceData().then((allPerfData) => {
        allPerfData.macA = macA
        socket.emit('initPerfData', allPerfData)
    })

    let perfDataInteval = setInterval(() => {
        performanceData().then((allPerfData) => {
            allPerfData.macA = macA
            socket.emit('perfData', allPerfData)
        })
    }, 1000)

    socket.on('disconnect', () => {
        clearInterval(perfDataInteval);
    })
})

function performanceData() {
    return new Promise(async (resolve, reject) => {
        const cpus = os.cpus()
        // what do we need from node?
        // CPU load (corrent)
        // memory useage:
        // free
        const freeMem = os.freemem()
        // total
        const totalMem = os.totalmem()
        const usedMem = totalMem - freeMem
        const usedMemPrecentage = ((usedMem / totalMem) * 100).toFixed(2)
        // const test = Math.floor(usedMem / totalMem * 100) / 100
        // console.log(usedMemPrecentage + '%');
        // console.log(test);
        //OS type
        const osType = os.type() == 'Windows_NT' ? 'Windows' : os.type()
        // uptime
        const upTime = os.uptime()
        //CPU info
        const cpuModel = cpus[0].model
        // Type
        // Number of Cores
        const numOfCores = cpus.length
        // Clock speed
        const cpuSpeed = cpus[0].speed
        //cpu load
        const cpuLoad = await getCpuLoad()
        resolve({
            freeMem,
            totalMem,
            usedMem,
            osType,
            usedMemPrecentage,
            upTime,
            cpuModel,
            numOfCores,
            cpuSpeed,
            cpuLoad
        })
    })
}

//CPU is all cores.
// we need to get the average of thhe cores which will give us the cpu average.

function getCPUsAverage() {
    const cpus = os.cpus()
    //get ms in each mode, but this number is since reboot
    // so get it now and get it in 100 ms and compare.
    let idelMs = 0;
    let totalMs = 0;
    //loop through each core.
    cpus.forEach((aCore) => {
        for (type in aCore.times) {
            totalMs += aCore.times[type]
        }
        idelMs += aCore.times.idle
    })
    return {
        idle: idelMs / cpus.length,
        total: totalMs / cpus.length
    }
}



function getCpuLoad() {
    return new Promise((resolve, rejects) => {
        const start = getCPUsAverage()
        setTimeout(() => {
            const end = getCPUsAverage()
            const ideDiff = end.idle - start.idle
            const totalDiff = end.total - start.total
            // console.log(ideDiff, totalDiff)
            //calc the % cpu useage
            const precentageCpu = 100 - Math.floor(100 * ideDiff / totalDiff)
            resolve(precentageCpu);
        }, 100)
    })
}

performanceData().then((allData) => {
    console.log(allData);
})