import { DomainValidationError } from '../errors/validation-error.js';

export interface TrainerProps {
  id: string;
  name: string;
  age: number;
  city: string;
  email: string;
}

export type CreateTrainerProps = Omit<TrainerProps, 'id'>;

export class Trainer {
  public readonly id: string;
  public readonly name: string;
  public readonly age: number;
  public readonly city: string;
  public readonly email: string;

  constructor(props: TrainerProps) {
    this.validateText(props.name, 'Nome');
    this.validateAge(props.age);
    this.validateText(props.city, 'Cidade');
    this.validateText(props.email, 'E-mail');

    this.id = props.id;
    this.name = props.name;
    this.age = props.age;
    this.city = props.city;
    this.email = props.email;
  }

  private validateText(value: string, field: string): void {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new DomainValidationError(
        `${field} deve ser uma string não vazia.`,
      );
    }
  }

  private validateAge(value: number): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new DomainValidationError(
        'Idade deve ser um número inteiro maior que zero.',
      );
    }
  }

  public toJSON(): TrainerProps {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      city: this.city,
      email: this.email,
    };
  }
}
