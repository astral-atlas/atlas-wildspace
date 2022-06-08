// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */

import { createCRUDConstructors, defaultOptions } from '../meta.js';
import { gameAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from 'uuid';

export const createMonsterRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameCRUDRoutes} = createCRUDConstructors(services);

  const monsterRoutes = createGameCRUDRoutes(gameAPI["/games/monsters"], {
    name: 'monster',
    idName: 'monsterId',
    gameUpdateType: 'monsters',
    async create({ game, body: { monster: { name }} }) {
      const monster = {
        id: uuid(),
        gameId: game.id,
        iconURL: null,
        initiativeIconAssetId: null,
        maxHitpoints: 0,
        shortDescription: '',
        name,
      };
      await services.data.monsters.set(game.id, monster.id, monster)
      return monster;
    },
    async update({ game, query: { monsterId }, body: { monster }}) {
      const nextMonster = {
        ...monster,
        id: monsterId,
        gameId: game.id,
      }
      await services.data.monsters.set(game.id, monsterId, nextMonster);
      return nextMonster;
    },
    async read({ game }) {
      const { result } = await services.data.monsters.query(game.id);
      return result;
    },
    async destroy({ game, query: { monsterId }}) {
      await services.data.monsters.set(game.id, monsterId, null);
    },
  })
  const monsterActorRoutes = createGameCRUDRoutes(gameAPI["/games/monsters/actors"], {
    name: 'monsterActor',
    idName: 'monsterActorId',
    gameUpdateType: 'monsterActors',
    async create({ game, body: { monsterActor: { name, monsterId }} }) {
      const monsterActor = {
        id: uuid(),
        monsterId,
        
        hitpoints: 0,
        name,
        secretName: '',
        conditions: [],
      };
      await services.data.gameData.monsterActors.set(game.id, monsterActor.id, monsterActor)
      return monsterActor;
    },
    async update({ game, query: { monsterActorId }, body: { monsterActor: { conditions = null, hitpoints = null, name = null, secretName = null} }}) {
      const { result: prev } = await services.data.gameData.monsterActors.get(game.id, monsterActorId);
      if (!prev)
        throw new Error();
      const nextMonsterActor = {
        ...prev,
        conditions: conditions === null ? prev.conditions : conditions,
        hitpoints: hitpoints === null ? prev.hitpoints : hitpoints,
        name: name === null ? prev.name : name,
        secretName: conditions === null ? prev.secretName : secretName,
      }
      await services.data.gameData.monsterActors.set(game.id, monsterActorId, nextMonsterActor);
      return nextMonsterActor;
    },
    async read({ game }) {
      const { result } = await services.data.gameData.monsterActors.query(game.id);
      return result;
    },
    async destroy({ game, query: { monsterActorId }}) {
      await services.data.gameData.monsterActors.set(game.id, monsterActorId, null);
    },
  })

  const http = [
    ...monsterRoutes,
    ...monsterActorRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
