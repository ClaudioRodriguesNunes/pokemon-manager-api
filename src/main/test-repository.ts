import { IPokemon, PokemonType, Rarity } from '../domain/entities/pokemon.js';

import { MockPokemonRepository } from '../infrastructure/database/in-memory/mock-pokemon-repository.js';

const pikachu: IPokemon = {
  id: '25',
  name: 'Pikachu',
  type: PokemonType.ELECTRIC,
  hp: 35,
  rarity: Rarity.COMMON,
};

const mewtwo: IPokemon = {
  id: '150',
  name: 'Mewtwo',
  type: PokemonType.PSYCHIC,
  hp: 106,
  rarity: Rarity.LEGENDARY,
  nickname: 'Experimento',
};

async function testRepository(): Promise<void> {
  const repository = new MockPokemonRepository();

  await repository.save(pikachu);
  await repository.save(mewtwo);

  const allPokemons = await repository.findAll();

  console.log('Todos os Pokémons:');
  console.log(allPokemons);

  const foundPokemon = await repository.findById('150');

  console.log('Pokémon encontrado:');
  console.log(foundPokemon);
}

testRepository();
