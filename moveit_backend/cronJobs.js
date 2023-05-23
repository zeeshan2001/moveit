const exec = require("child_process").exec;
const moment = require("moment");
const fs = require("fs");
var FtpDeploy = require("ftp-deploy");

exports.dbBackup = function () {
  let dirPath = "/home/dbbkps/";
  let folderName = "dump_" + moment().format("DD-MM-YYYY");
  let folderPath = dirPath + folderName;
  exec("mongodump --db=moveit --out=" + folderPath, (err, stdout, stderr) => {
    if (!err) {
      var ftpDeploy = new FtpDeploy();
      var config = {
        user: "547362-moveit",
        password: "zg5sW#n=s2Fq",
        host: "ftp.bieneit.de",
        port: 21,
        localRoot: folderPath,
        remoteRoot: folderName,
        deleteRemote: false,
        forcePasv: true,
        include: ["*", "**/*"],
      };

      ftpDeploy
        .deploy(config)
        .then(res => console.log("finished:", res))
        .catch(err => console.log(err));
    }
  })
};
