const fs = require("fs");

const SteamServer = require("./generatePlayerList/SteamServer");

let wreckfestServer = new SteamServer("194.147.120.82", 29137); // Manteln event

const cycle = async (fileName) => {
  await wreckfestServer.requestInfo();
  await wreckfestServer.requestPlayer();

  if (!wreckfestServer.playersList) {
    cycle();
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

const generatePlayerList = async (fileName) => {
  await wreckfestServer.init();
  await cycle(fileName);
};

module.exports = generatePlayerList;
