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

export type UpdatePokemonProps = Omit<PokemonProps, 'id'>;

export class Pokemon {
  public readonly id: string;

  private _name: string;
  private _type: PokemonType;
  private _hp: number;
  private _attack: number;
  private _defense: number;

  constructor(props: PokemonProps) {
    this.id = props.id;

    this.validateName(props.name);
    this.validateType(props.type);
    this.validateHp(props.hp);
    this.validateAttack(props.attack);
    this.validateDefense(props.defense);

    this._name = props.name;
    this._type = props.type;
    this._hp = props.hp;
    this._attack = props.attack;
    this._defense = props.defense;
  }

  public get name(): string {
    return this._name;
  }

  public get type(): PokemonType {
    return this._type;
  }

  public get hp(): number {
    return this._hp;
  }

  public get attack(): number {
    return this._attack;
  }

  public get defense(): number {
    return this._defense;
  }

  public update(props: UpdatePokemonProps): void {
    this.validateName(props.name);
    this.validateType(props.type);
    this.validateHp(props.hp);
    this.validateAttack(props.attack);
    this.validateDefense(props.defense);

    this._name = props.name;
    this._type = props.type;
    this._hp = props.hp;
    this._attack = props.attack;
    this._defense = props.defense;
  }

  private validateName(value: string): void {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('Nome deve ser uma string não vazia.');
    }
  }

  private validateType(value: PokemonType): void {
    if (!Object.values(PokemonType).includes(value)) {
      throw new Error('Tipo de Pokémon inválido.');
    }
  }

  private validateHp(value: number): void {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error('HP deve ser um número maior que zero.');
    }
  }

  private validateAttack(value: number): void {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error('Ataque deve ser um número maior que zero.');
    }
  }

  private validateDefense(value: number): void {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error('Defesa deve ser um número maior que zero.');
    }
  }

  public toJSON(): PokemonProps {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      hp: this.hp,
      attack: this.attack,
      defense: this.defense,
    };
  }
}
