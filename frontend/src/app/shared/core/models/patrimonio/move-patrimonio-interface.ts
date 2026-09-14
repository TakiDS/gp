export interface MovePatrimonioData {
  uuid: string;
  numPatrimonio: string;
  descricao: string;
  localAtual: {
    uuid: string;
    nome: string;
  };
  statusAtual: {
    value: string;
    label: string;
  };
}
