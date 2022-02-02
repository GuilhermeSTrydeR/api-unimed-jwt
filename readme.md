para gerar um token que possa ser validade nessa API, utilizar a rota /login com usuario e senha, sera retornado um token e essa token devera ser incluido no cabecalho da rota /query, utilizando 'x-access-token'

o arquivo 'dbconfig.js' caso nao exista, abaixo segue modelo, arquivo responsavel pela conexao com o banco 
const config = {
    user: "user",
    password: "pass",
    server: "ip do server",
    database: "table",
    options: {
      trustedconnection: true,
      enableArithAbort: true,
      instancename: "",
    },
    port: porta
  };
   
  module.exports = config;
  


cabecalho da rota /query
_______________________________________

header          |    value
Content-Type    |    application/json
x-access-token  |    [token_gerado]
_______________________________________


cabecalho da rota /logout
_______________________________________

header          |    value
x-access-token  |    [token_gerado]
_______________________________________
