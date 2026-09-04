export enum PokemonType {
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  PSYCHIC = 'Psychic',
}

export interface PokemonProps {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  attack: number;
  defense: number;
}

export class Pokemon {
  public readonly id: string;
  public name: string;
  public type: PokemonType;
  public hp: number;
  public attack: number;
  public defense: number;

  constructor(props: PokemonProps) {
    if (props.hp <= 0) {
      throw new Error('HP deve ser maior que zero.');
    }

    if (props.attack <= 0) {
      throw new Error('Ataque deve ser maior que zero.');
    }

    if (props.defense <= 0) {
      throw new Error('Defesa deve ser maior que zero.');
    }

    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.hp = props.hp;
    this.attack = props.attack;
    this.defense = props.defense;
  }
}
