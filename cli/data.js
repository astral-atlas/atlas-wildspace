// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { CompositeTable } from "../data/sources/table";

*/
import { loadConfigFromFile } from "./config.js";

import { promises } from "fs";
import { createFileData, createDynamoDBData, createAWSS3Data } from "@astral-atlas/wildspace-data";

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { S3 } from "@aws-sdk/client-s3";
const { mkdir } = promises;

// wildspace data init -c api/dev.config.json5

const handleInitCommand = async (extras) => {
  const options = Object.fromEntries(extras.map((e, i, a) => [e, a[i + 1]]).filter((e, i) => i % 2 === 0))
  const config = await loadConfigFromFile(options['-c'] || options['-config']);
  const dataConfig = config.data;
  if (dataConfig.type === 'file') {
    const { dirs } = createFileData(dataConfig.directory)
    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
      console.log(`Created Directory: ${dir}`)
    }
  }
};

const migrate = async (sourceData, targetData) => {
  const { result: games } = await sourceData.game.scan();
  for (const game of games)
    await targetData.game.set(game.id, game);

  const { result: gameParticipation, keys } = await sourceData.gameParticipation.scan();
  for (let i = 0; i < gameParticipation.length; i++) {
    await targetData.gameParticipation.set(keys[i].partition, keys[i].sort, gameParticipation[i]);
  }
  const { result: gamePlayers, keys: gamePlayersKeys } = await sourceData.gamePlayers.scan();
  for (let i = 0; i < gamePlayers.length; i++) {
    await targetData.gamePlayers.set(gamePlayersKeys[i].partition, gamePlayersKeys[i].sort, gamePlayers[i]);
  }

  const { result: rooms } = await sourceData.room.scan();
  for (const room of rooms)
    await targetData.room.set(room.gameId, room.id, room);
  
  const { result: assets } = await sourceData.assets.scan();
  for (const assset of assets)
    await targetData.assets.set(assset.id, assset);


  const { result: characters } = await sourceData.characters.scan();
  for (const character of characters)
    await targetData.characters.set(character.gameId, character.id, character);

  const { result: playlists } = await sourceData.playlists.scan();
  for (const playlist of playlists)
    await targetData.playlists.set(playlist.gameId, playlist.id, playlist);

  const { result: tracks } = await sourceData.tracks.scan();
  for (const track of tracks)
    await targetData.tracks.set(track.gameId, track.id, track);

  const { result: locations, keys: locationKeys } = await sourceData.gameData.locations.scan();
  for (let i = 0; i < locations.length; i++) {
    await targetData.gameData.locations.set(locationKeys[i].partition, locationKeys[i].sort, locations[i]);
  }

  console.log('Migration Complete');
}

const handleMigrateCommand = () => {
  const tableName = 'wildspace-data-slightly-supposedly-cute-sawfly';
  const bucketName = 'test2-wildspace-data-20211023083057885700000001';

  const db = new DynamoDB({ region: 'ap-southeast-2' });
  const s3 = new S3({ region: 'ap-southeast-2' });

  const dbData = createDynamoDBData(db, tableName);
  const { data: s3Data } = createAWSS3Data(s3, bucketName, '/wildspace');

  migrate(s3Data, dbData);
}

export const handleDataCommand = async (command/*: string*/, ...extras/*: string[]*/)/*: Promise<void>*/ => {
  switch (command) {
    case 'init':
      return handleInitCommand(extras)
    case 'migrate':
      return handleMigrateCommand();
  }
}