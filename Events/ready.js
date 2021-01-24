const Discord = require('discord.js');
const logger = require("../Configs/logger");


  module.exports = (client) => {
    const status = require("../Configs/config.js").status;
    let i = 0;
    setInterval(function(){
        client.user.setActivity(status[parseInt(i, 10)].name, {type: status[parseInt(i, 10)].type, url: status[parseInt(i, 10)].url});
        if(status[parseInt(i+1, 10)]) i++
        else i = 0;
    }, 20000);
  }