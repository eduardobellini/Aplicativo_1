import { Address } from '../types';

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export async function lookupCep(cep: string): Promise<Partial<Address>> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!response.ok) throw new Error('CEP não encontrado.');
  const data: ViaCepResponse = await response.json();
  if (data.erro) throw new Error('CEP não encontrado.');
  return {
    street: data.logradouro ?? '',
    district: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}
