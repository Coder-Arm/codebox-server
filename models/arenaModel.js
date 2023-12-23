const mongoose = require('mongoose');

const arenaSchema = new mongoose.Schema({
    arenaName : {
        type : String,
        require : true
    },
    html : {
        type : String,
        require : true,
        default : ''
    },
    css : {
        type : String,
        require : true,
        default : ''
    },
    js : {
        type : String,
        require : true,
        default : ''
    },
    userId : {
        type : Object,
        require : true
    }
})

const arenaModel =  mongoose.model('arenas',arenaSchema);
module.exports = arenaModel;