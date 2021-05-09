const fs = require("fs");

const SteamServer = require("./generatePlayerList/SteamServer");

let wreckfestServer = new SteamServer("194.147.120.78", 29137); // Manteln event

const generatePlayerList = async (fileName) => {
  await wreckfestServer.init();
  await wreckfestServer.requestInfo();
  await wreckfestServer.requestPlayer();

  if (!wreckfestServer.playersList) {
    generatePlayerList();
    return;
  }

  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
  }

  const playerData = wreckfestServer.getPlayers();

  playerData.playersList.forEach((p) => {
    const playerName = decodeURIComponent(p.encoded);
    fs.appendFileSync(fileName, playerName + "\n", (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });
};

module.exports = generatePlayerList;
