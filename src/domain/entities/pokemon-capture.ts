import { PokeApiPokemonData } from '../gateways/poke-api-gateway.js';

export interface PokemonCaptureProps extends PokeApiPokemonData {
  id: string;
  trainerId: string;
  active: boolean;
}

export type CreatePokemonCaptureProps = Omit<
  PokemonCaptureProps,
  'id' | 'active'
>;

export class PokemonCapture {
  public readonly id: string;
  public readonly trainerId: string;
  public readonly pokeApiId: number;
  public readonly name: string;
  public readonly spriteUrl: string | null;
  public readonly types: string[];
  public readonly stats: PokemonCaptureProps['stats'];
  public readonly baseExperience: number | null;
  public readonly height: number | null;
  public readonly weight: number | null;
  private _active: boolean;

  constructor(props: PokemonCaptureProps) {
    this.id = props.id;
    this.trainerId = props.trainerId;
    this.pokeApiId = props.pokeApiId;
    this.name = props.name;
    this.spriteUrl = props.spriteUrl;
    this.types = [...props.types];
    this.stats = { ...props.stats };
    this.baseExperience = props.baseExperience;
    this.height = props.height;
    this.weight = props.weight;
    this._active = props.active;
  }

  public get active(): boolean {
    return this._active;
  }

  public release(): void {
    this._active = false;
  }

  public toJSON(): PokemonCaptureProps {
    return {
      id: this.id,
      trainerId: this.trainerId,
      pokeApiId: this.pokeApiId,
      name: this.name,
      spriteUrl: this.spriteUrl,
      types: [...this.types],
      stats: { ...this.stats },
      baseExperience: this.baseExperience,
      height: this.height,
      weight: this.weight,
      active: this.active,
    };
  }
}
