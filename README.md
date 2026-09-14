# GIAP — Gerenciador de Ativos

Sistema de gestão patrimonial com cadastro e movimentação de bens, categorias, locais, notas fiscais, comodatos, etiquetas, auditoria imutável e controle de usuários.

## Tecnologias

- Backend: Java 21, Spring Boot, Spring Security, MySQL e immudb.
- Frontend: Angular 20 e TypeScript.
- Infraestrutura: Docker Compose, Caddy e GitHub Actions.

## Execução local

### 1. Configure o backend

Copie `backend/.env.example` para `backend/.env` e substitua todos os valores de exemplo. Gere segredos independentes, por exemplo:

```bash
openssl rand -hex 32
openssl rand -base64 32
```

Use o primeiro valor em `JWT_SECRET` e o segundo em `DATA_ENCRYPTION_KEY_BASE64`.

Para criar o primeiro administrador, defina temporariamente:

```dotenv
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@exemplo.com
BOOTSTRAP_ADMIN_PASSWORD=uma-senha-forte-com-12-ou-mais-caracteres
```

Depois da primeira inicialização, altere `BOOTSTRAP_ADMIN_ENABLED` para `false`.

### 2. Suba o backend

Na primeira execução, o Docker Compose cria automaticamente o servidor MySQL, o banco
`sgp`, o usuário configurado e as tabelas da aplicação. Os dados são preservados no
volume nomeado `mysql-data`.

```bash
cd backend
docker compose up -d --build
```

O backend fica em `http://localhost:8080`.

### 3. Suba o frontend

```bash
cd frontend
npm ci
npm start
```

Abra `http://localhost:4200`.

## Testes e build

```bash
cd backend
mvn test

cd ../frontend
npm ci
npm run build
```

A CI executa esses passos em todo push e pull request para `main`.

## Segurança

- O cadastro direto de usuários exige perfil `ADMIN`.
- Não existe administrador ou senha padrão no código.
- JWT, banco, immudb e integrações exigem segredos externos ao repositório.
- Tokens de convite e recuperação são armazenados como hash SHA-256.
- Certificado PFX e senha são criptografados com AES-256-GCM antes de serem salvos.
- Upload de certificado e documentação OpenAPI são restritos a administradores.
- Erros internos não expõem detalhes de implementação ao cliente.

Ao atualizar uma instalação antiga, redefina a senha do administrador conhecido, invalide convites/recuperações pendentes e reenvie o certificado fiscal para que ele seja criptografado no novo formato.
